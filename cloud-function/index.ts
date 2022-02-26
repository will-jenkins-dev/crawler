import express, { Request, Response } from 'express'
import config from './src/config'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import {
    AssetType,
    CrawlJob,
    CrawlJobRequest,
    CrawlResult,
    PageAssets,
} from '../types'

// import { getDb, initDb } from './src/db/dbManagement'
// import { migrateUp } from './src/db/migration/migrate'

const { PORT, HOST, SERVICE_NAME, SERVICE_VERSION } = config
const app = express()

app.listen(PORT as number, HOST as string)

console.log(
    `${SERVICE_NAME} (${SERVICE_VERSION}) is running on http://${HOST}:${PORT}`
)

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})
const linkIsValid = (l: string) =>
    l && !l.startsWith('#') && !l.startsWith('about:blank') && l.length > 0
const findAssets = (assetType: AssetType, doc: Document): string[] => {
    switch (assetType) {
        case 'links':
            return [...doc.querySelectorAll('a')]
                .map((l) => l.href)
                .filter(linkIsValid)
        case 'images':
            return [...doc.querySelectorAll('img')].map((im) => im.src)
        default:
            throw Error('unkown tag type')
    }
}

app.get('/crawl', async (req: CrawlJobRequest, res: Response) => {
    const { job: jobString, callbackUrl } = req.query
    if (!jobString || !callbackUrl) {
        return res.status(400)
    }

    const job: CrawlJob = JSON.parse(decodeURIComponent(jobString))
    const { pageUrl: url, domain, depth, targetAssets } = job
    if (typeof url === 'string') {
        let crawlResult: CrawlResult | undefined
        try {
            const { status, data } = await axios.get(url)

            if (status === 200) {
                const jsdom = new JSDOM(data)
                const doc = jsdom.window.document
                console.log(
                    targetAssets.map((assetType) => [
                        assetType,
                        findAssets(assetType, doc),
                    ])
                )
                const assets: PageAssets = Object.fromEntries(
                    targetAssets.map((assetType) => [
                        assetType,
                        findAssets(assetType, doc),
                    ])
                )

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

export default app
