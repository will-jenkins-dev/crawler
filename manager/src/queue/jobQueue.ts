import axios from 'axios'

import { Crawl, CrawlJob } from '../../../types'
import { buildCrawlerUrl } from '../utils/url'

export const crawls: Record<string, Crawl> = {}

export const crawlPage = async (job: CrawlJob): Promise<void> => {
    console.log(`job is ${job}`)
    const url = buildCrawlerUrl(job)

    try {
        await axios.get(url)
    } catch {
        console.log('crawl job failed')
    }
}
export const jobQueue: CrawlJob[] = []
;(async function runQueue() {
    if (jobQueue.length > 0) {
        console.log('yes some jobs')
        const nextJob = jobQueue[0]
        const { domain } = nextJob
        const crawl = crawls[domain]
        const { lastCrawlTime, crawlDelayMsec } = crawl
        console.log(`tims is ${lastCrawlTime + crawlDelayMsec}`)
        if (lastCrawlTime + crawlDelayMsec <= Date.now()) {
            const job = jobQueue.shift()
            console.log('enqueueing job')
            job && (await crawlPage(job))
        }
    }

    setTimeout(runQueue, 100)
})()

export const enqueueJob = (crawlJob: CrawlJob): void => {
    if (!crawlJob.domain) {
        throw Error(`no domain for ${crawlJob.pageUrl}`)
    }
    jobQueue.push(crawlJob)
}

export const isInQueue = (url: string): boolean =>
    jobQueue.some((j) => j.pageUrl === url)
