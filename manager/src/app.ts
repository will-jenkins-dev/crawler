import express, { Request, Response } from 'express'
import axios from 'axios'

import config from './config'
import { crawlPage, enqueueJob } from './jobQueue'

// Set Express and bodyParser
const app = express()
app.use(express.json())

// Health check

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})

app.get('/crawl', async (req: Request, res: Response) => {
    const domain = req.query.domain // query
    // call cloudfunction
    if (typeof domain === 'string' && domain.length > 0) {
        enqueueJob({ pageUrl: domain, depth: 0 })
    }

    res.send('ok')
})

type PageUrl = string

type CrawlResult = {
    url: PageUrl
    links: PageUrl[]
    depth: number
    info: unknown
}

const tryParseLink = (link: string, pageUrl: PageUrl): URL | null => {
    try {
        const { origin } = new URL(pageUrl)
        const url = new URL(link, origin)
        return url
    } catch (e) {
        console.log(e)
        return null
    }
}
const isValidProtocol = (url: URL) =>
    url.protocol === 'http:' || url.protocol === 'https:'
const shouldFollowLink = ({
    page,
    link,
    depth,
}: {
    page: PageUrl
    link: PageUrl
    depth: number
}) => {
    if (depth > 1) {
        return false
    } else {
        const linkUrl = tryParseLink(link, page)
        const pageUrl = new URL(page)
        return (
            linkUrl && isValidProtocol(linkUrl) && linkUrl.host === pageUrl.host
        )
    }
}

app.post(
    '/crawlResult',
    (req: Request<unknown, unknown, CrawlResult>, res: Response) => {
        const crawlResult = req.body
        // call cloudfunction
        console.log('crawled', crawlResult.url)
        try {
            const { depth, links, url } = crawlResult
            if (depth < 1) {
                links.map(
                    (link) =>
                        shouldFollowLink({ page: url, link, depth }) &&
                        enqueueJob({ pageUrl: link, depth: depth + 1 })
                )
            }
        } catch {}

        res.send(200)
    }
)
export default app
