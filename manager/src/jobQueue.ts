import axios from 'axios'

import config from './config'
import { CrawlJob } from '../../types'
import { crawls } from './app'

const { HOST, PORT } = config
const callbackUrl = `http://${HOST}:${PORT}/crawl-result`

export const crawlPage = async (job: CrawlJob): Promise<void> => {
    const jobEncoded = encodeURIComponent(JSON.stringify(job))
    const url = `http://localhost:8082/crawl?job=${jobEncoded}&callbackUrl=${callbackUrl}`
    try {
        await axios.get(url)
    } catch {
        console.log('crawl job failed')
    }
}
let count = 0
export const jobQueue: CrawlJob[] = []
;(async function runQueue() {
    if (jobQueue.length > 0) {
        const nextJob = jobQueue.pop()
        console.log(`nextJob is ${nextJob?.pageUrl} with ${nextJob?.domain}`)
        nextJob && (await crawlPage(nextJob))
        count++
    } else {
        const crawl = crawls && crawls['https://www.lightningreach.org']
        if (crawl) {
            const { visited } = crawl
            console.log(`visited ${count} pages: `)
            count = 0
            const urls = [...visited.keys()]
            urls.map((v) => console.log(v))
        }
    }
    setTimeout(runQueue, 100)
})()

export const enqueueJob = (crawlJob: CrawlJob): void => {
    if (!crawlJob.domain) {
        throw Error(`no domain for ${crawlJob.pageUrl}`)
    }
    console.log(`enqueuing ${crawlJob.pageUrl}`)
    jobQueue.push(crawlJob)
}

export const isInQueue = (url: string): boolean =>
    jobQueue.some((j) => j.pageUrl === url)
