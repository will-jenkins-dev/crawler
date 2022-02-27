import express, { Request, Response } from 'express'

import config from './config'
import { enqueueJob, isInQueue } from './jobQueue'
import * as logger from './logger'
import { AssetType, Crawl, CrawlResult, CrawlStartRequest } from '../../types'

const app = express()
app.use(express.json())

export const crawls: Record<string, Crawl> = {}
const targetAssetsDefault: AssetType[] = ['links', 'images']

const isValidProtocol = (url: URL) =>
    url.protocol === 'http:' || url.protocol === 'https:'
const shouldFollowLink = ({
    pageUrl,
    linkUrl,
}: {
    pageUrl: string
    linkUrl: URL
}) => {
    const url = new URL(pageUrl)
    return isValidProtocol(linkUrl) && linkUrl.host === url.host
}
const formatUrl = (link: string, domain: string): string | null => {
    try {
        const url = new URL(link, domain)
        return url.href
    } catch {
        return null
    }
}

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})

app.get('/start-crawl', async (req: CrawlStartRequest, res: Response) => {
    const startPage = req.query.url
    let domain
    try {
        const { origin, href } = new URL(startPage)
        domain = origin
        const existingCrawl = crawls[domain]
        if (existingCrawl) {
            logger.log(`already crawling ${domain}`)
            return res.send(`already crawling ${domain}`)
        } else {
            // start new crawl

            //todo: fetch robots, first behave

            crawls[domain] = {
                visited: new Map(),
                crawlDelay: 100,
                startedAtTime: new Date(),
            }
        }
        if (href.length > 0) {
            enqueueJob({
                domain,
                pageUrl: href,
                depth: 0,
                targetAssets: targetAssetsDefault,
            })
        }
    } catch (e) {
        console.log(e)
        return res.sendStatus(400)
    }
    res.send(`ok, crawling ${domain}`)
})

app.post(
    '/crawl-result',
    (req: Request<unknown, unknown, CrawlResult>, res: Response) => {
        const crawlResult = req.body
        try {
            const { depth, assets, url: crawledUrl, domain } = crawlResult
            const crawl = crawls[domain]
            if (!crawl) {
                throw Error(`No crawl found for domain ${domain}`)
            }

            crawl.visited.set(crawledUrl, assets || {})

            if (assets && assets.links && depth < 20) {
                const urls = assets.links
                    .map((link) => formatUrl(link, domain))
                    .filter((l): l is string => typeof l === 'string')
                const urlsUnique = [...new Set(urls)]
                urlsUnique.map((url) => {
                    const hasVisited = crawl.visited.has(url)
                    const shouldFollow = shouldFollowLink({
                        pageUrl: crawledUrl,
                        linkUrl: new URL(url),
                    })
                    if (url && !hasVisited && shouldFollow && !isInQueue(url)) {
                        console.log(`enqueing job ${url}`)
                        const visited = [...crawl.visited.keys()]
                        console.log(visited)
                        enqueueJob({
                            domain,
                            pageUrl: url,
                            depth: depth + 1,
                            targetAssets: targetAssetsDefault,
                        })
                    }
                })
            } else {
                console.log('depth limit reached, not adding more jobs')
            }
        } catch (e) {
            if (e instanceof Error) {
                logger.logError(e.message)
            } else {
                logger.logError('Unknown error')
            }
        }

        res.sendStatus(200)
    }
)
export default app
