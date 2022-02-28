import { Crawl, CrawlJob } from '../../../types'
import { hasCapacity, incrementJobCount } from './jobCounter'
import { crawlPage, getCrawl, updateLastCrawlTime } from '../crawls/crawls'

let queueHandle: NodeJS.Timeout | undefined

export const jobQueue: CrawlJob[] = []

const crawlDelayHasElapsed = ({
    lastCrawlTime,
    crawlDelayMsec,
}: Crawl): boolean => lastCrawlTime + crawlDelayMsec <= Date.now()

export const stopQueue = (): void => queueHandle && clearTimeout(queueHandle)

async function runQueue() {
    if (hasCapacity() && jobQueue.length > 0) {
        const nextJob = jobQueue[0]
        const { domain } = nextJob
        const crawl = getCrawl(domain)
        if (crawl && crawlDelayHasElapsed(crawl)) {
            incrementJobCount()
            const job = jobQueue.shift()
            job && (await crawlPage(job))
            updateLastCrawlTime(domain)
        }
    }

    queueHandle = setTimeout(runQueue, 50)
}

export const enqueueJob = (crawlJob: CrawlJob): void => {
    if (!crawlJob.domain) {
        throw Error(`no domain for ${crawlJob.pageUrl}`)
    }
    jobQueue.push(crawlJob)
}

export const isInQueue = (url: string): boolean =>
    jobQueue.some((j) => j.pageUrl === url)

runQueue()
