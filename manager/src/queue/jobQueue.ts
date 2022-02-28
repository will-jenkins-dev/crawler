import axios from 'axios'

import { Crawl, CrawlJob } from '../../../types'
import { buildCrawlerUrl } from '../utils/url'
import { currentJobCount, hasCapacity, incrementJobCount } from './jobCounter'

export const crawls: Record<string, Crawl> = {}

export const crawlPage = async (job: CrawlJob): Promise<void> => {
    const url = buildCrawlerUrl(job)

    try {
        await axios.get(url)
    } catch {
        console.log('crawl job failed')
    }
}
export const jobQueue: CrawlJob[] = []
;(async function runQueue() {
    if (hasCapacity() && jobQueue.length > 0) {
        const nextJob = jobQueue[0]
        const { domain } = nextJob
        const crawl = crawls[domain]
        const { lastCrawlTime, crawlDelayMsec } = crawl
        if (lastCrawlTime + crawlDelayMsec <= Date.now()) {
            incrementJobCount()
            const job = jobQueue.shift()
            job && (await crawlPage(job))
            crawl.lastCrawlTime = Date.now()
        }
        // const elapsedSec = (Date.now() - crawl.crawlStartTime) / 1000
        // console.log(`rate is ${crawl.visited.size / elapsedSec} pages/sec`)
    }

    setTimeout(runQueue, 50)
})()

export const enqueueJob = (crawlJob: CrawlJob): void => {
    if (!crawlJob.domain) {
        throw Error(`no domain for ${crawlJob.pageUrl}`)
    }
    jobQueue.push(crawlJob)
}

export const isInQueue = (url: string): boolean =>
    jobQueue.some((j) => j.pageUrl === url)
