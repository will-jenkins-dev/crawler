import express, { Response, Request } from 'express'
import axios from 'axios'
import { CrawlJob, CrawlJobRequest, CrawlResult, PageAssets } from '../../types'

import config from './config'
import { collectAssets, isValidUrl } from './parsing'

export const app = express()

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})

app.get('/crawl', async (req: CrawlJobRequest, res: Response) => {
    const { job: jobString, callbackUrl } = req.query
    console.log(`received ${jobString}`)
    if (!jobString || !callbackUrl) {
        return res.sendStatus(400)
    }

    const job: CrawlJob = JSON.parse(decodeURIComponent(jobString))
    const { pageUrl: url, domain, depth, targetAssets } = job

    if (isValidUrl(url)) {
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
            console.log(e)
            crawlResult = { domain, url, depth, info: { status: 500 } }
        }

        await axios.post(callbackUrl, crawlResult)
    }

    res.send(`OK`)
})
