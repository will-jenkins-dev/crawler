import express, { Response, Request } from 'express'
import axios from 'axios'
import * as logger from './utils/logger'

import { CrawlJob, CrawlJobRequest, CrawlResult, PageAssets } from '../../types'
import { collectAssets, isValidUrl } from './parsing/pageParsing'

import config from './config'

export const app = express()

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})

app.get('/crawl', async (req: CrawlJobRequest, res: Response) => {
    const { job: jobString, callbackUrl } = req.query

    if (!jobString || !callbackUrl) {
        return res.sendStatus(400)
    }

    const job: CrawlJob = JSON.parse(decodeURIComponent(jobString))
    const { pageUrl: url, domain, depth, targetAssets } = job

    if (isValidUrl(url)) {
        res.sendStatus(200)
        let crawlResult: CrawlResult | undefined
        try {
            const { status, data } = await axios.get(url)

            if (status === 200) {
                const assets: PageAssets = collectAssets(data, targetAssets)

                crawlResult = { domain, url, assets, depth, info: { status } }
            } else {
                crawlResult = { domain, url, depth, info: { status: status } }
            }
        } catch (e) {
            logger.logError(e)
            crawlResult = { domain, url, depth, info: { status: 500 } }
        }
        try {
            await axios.post(callbackUrl, crawlResult)
        } catch (e) {
            logger.logError(e)
        }
    }
})
