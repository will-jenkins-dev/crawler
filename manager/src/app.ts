import express, { Request, Response } from 'express'

import config from './config'
import { crawls, enqueueJob, isInQueue } from './queue/jobQueue'
import * as logger from './utils/logger'
import {
    CrawlResult,
    CrawlStartRequest,
    CrawlStatustRequest,
} from '../../types'
import { cleanLinks, shouldFollowLink } from './utils/links'
import { targetAssetsDefault } from './constants'

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
        const existingCrawl = crawls[domain]
        if (existingCrawl) {
            logger.log(`already crawling ${domain}`)
            return res.send(`already crawling ${domain}`)
        }

        //todo: fetch robots, first behave

        // start new crawl
        crawls[domain] = {
            visited: new Map(),
            crawlDelayMsec: 250,
            lastCrawlTime: 0,
        }
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
        const { origin, href } = new URL(crawlUrl)
        domain = origin
        const existingCrawl = crawls[domain]
        if (!existingCrawl) {
            const message = `unknown crawl: ${domain}`
            logger.log(message)
            res.status(400)
            return res.send(message)
        }

        //todo: fetch robots, first behave

        // start new crawl
        const crawl = crawls[domain]
        const results = Object.fromEntries(crawl.visited.entries())
        res.json(results)
    } catch (e) {
        logger.logError(e)
        return res.send(`Erk, unable to start a crawl of ${domain}`)
    }
    // res.send(`ok, crawling ${domain}`)
})

app.post(
    '/crawl-result',
    (req: Request<unknown, unknown, CrawlResult>, res: Response) => {
        const crawlResult = req.body
        try {
            const { depth, assets = {}, url: crawledUrl, domain } = crawlResult
            const currentCrawl = crawls[domain]
            if (!currentCrawl) {
                throw Error(`No crawl found for domain ${domain}`)
            }

            currentCrawl.visited.set(crawledUrl, assets)

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
                console.log('depth limit reached, not adding more jobs')
            }
        } catch (e) {
            logger.logError(e)
        }

        res.sendStatus(200)
    }
)
export default app
