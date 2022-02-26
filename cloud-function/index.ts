import express, { Request, Response } from 'express'
import config from './src/config'
import axios from 'axios'
import { JSDOM } from 'jsdom'

// import { getDb, initDb } from './src/db/dbManagement'
// import { migrateUp } from './src/db/migration/migrate'

const { PORT, HOST, SERVICE_NAME, SERVICE_VERSION } = config
const app = express()
app.listen(PORT, HOST)

console.log(
    `${SERVICE_NAME} (${SERVICE_VERSION}) is running on http://${HOST}:${PORT}`
)

app.get('/', (req: Request, res: Response) => {
    res.send(`Hello from ${config.SERVICE_NAME}! (v${config.SERVICE_VERSION})`)
})

type CrawlRequest = express.Request & {
    query: {
        url: string
        depth: string
    }
}

app.get('/crawl', async (req: CrawlRequest, res: Response) => {
    const url = req.query.page || ''
    const depth = req.query.depth ? parseInt(req.query.depth) : 0
    console.log('called with', url)
    if (typeof url === 'string') {
        let crawlResult
        try {
            const { status, data } = await axios.get(url)
            if (status === 200) {
                const jsdom = new JSDOM(data)
                const links = [
                    ...jsdom.window.document.querySelectorAll('a'),
                ].map((l) => l.href)
                crawlResult = { url, links, depth, info: { status } }
            } else {
                crawlResult = { url, depth, info: { status: status } }
            }
        } catch (e) {
            console.log(e)
            crawlResult = { url, depth, info: { status: 500 } }
        }
        await axios.post('http://0.0.0.0:8081/crawlResult', crawlResult)
    }

    res.send(`OK`)
})

export default app
