import express, { Request, Response } from 'express'
import * as logger from './utils/logger'

import { enqueueJob, isInQueue } from './jobs/jobQueue'
import {
    CrawlResult,
    CrawlStartRequest,
    CrawlStatustRequest,
} from '../../types'
import { cleanLinks, shouldFollowLink } from './utils/links'
import { targetAssetsDefault } from './constants'
import { decrementJobCount } from './jobs/jobCounter'

import config from './config'
import { addCrawl, getCrawl } from './crawls/crawls'

const app = express()
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})

app.get('/start-crawl', async (req: CrawlStartRequest, res: Response) => {
    const startPage = req.query.url
    let domain
    try {
        const { origin, href } = new URL(startPage)
        domain = origin
        const existingCrawl = getCrawl(domain)
        if (existingCrawl) {
            logger.log(`already crawling ${domain}`)
            return res.send(`already crawling ${domain}`)
        }

        //todo: fetch robots -  behave

        // start new crawl
        const newCrawl = {
            visited: new Map(),
            crawlDelayMsec: 100,
            lastCrawlTime: 0,
            crawlStartTime: Date.now(),
        }
        addCrawl(newCrawl, domain)
        enqueueJob({
            domain,
            pageUrl: href,
            depth: 0,
            targetAssets: targetAssetsDefault,
        })
    } catch (e) {
        logger.logError(e)
        return res.send(`Erk, unable to start a crawl of ${domain}`)
    }
    res.send(
        `ok, crawling ${domain}, <a href="/crawl-status?url=${domain}">view status</a>`
    )
})

app.get('/crawl-status', async (req: CrawlStatustRequest, res: Response) => {
    const crawlUrl = req.query.url
    let domain
    try {
        const { origin: domain } = new URL(crawlUrl)
        const existingCrawl = getCrawl(domain)
        if (!existingCrawl) {
            const message = `unknown crawl: ${domain}`
            logger.log(message)
            res.status(404)
            return res.send(message)
        }
        const results = Object.fromEntries(existingCrawl.visited.entries())
        res.json(results)
    } catch (e) {
        logger.logError(e)
        return res.send(`Erk, unable to start a crawl of ${domain}`)
    }
})

app.post(
    '/crawl-result',
    (req: Request<unknown, unknown, CrawlResult>, res: Response) => {
        const crawlResult = req.body
        try {
            const { depth, assets = {}, url: crawledUrl, domain } = crawlResult
            const currentCrawl = getCrawl(domain)
            if (!currentCrawl) {
                throw Error(`No crawl found for domain ${domain}`)
            }

            currentCrawl.visited.set(crawledUrl, assets)
            decrementJobCount()
            if (assets.links && depth < 20) {
                const urls = cleanLinks(assets.links, domain)
                urls.forEach((url) => {
                    const hasVisited = currentCrawl.visited.has(url)
                    const shouldFollow = shouldFollowLink({
                        pageUrl: crawledUrl,
                        linkUrl: new URL(url),
                    })
                    if (!hasVisited && shouldFollow && !isInQueue(url)) {
                        enqueueJob({
                            domain,
                            pageUrl: url,
                            depth: depth + 1,
                            targetAssets: targetAssetsDefault,
                        })
                    }
                })
            } else {
                logger.log(
                    'no links on page or depth limit reached, not adding more jobs'
                )
            }
        } catch (e) {
            logger.logError(e)
        }

        res.sendStatus(200)
    }
)
export default app
