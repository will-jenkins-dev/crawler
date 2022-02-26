import axios from 'axios'

export type CrawlJob = {
    pageUrl: string
    depth: number
}

export const crawlPage = async (job: CrawlJob): Promise<void> =>
    await axios.get(
        `http://0.0.0.0:8082/crawl?page=${job.pageUrl}&depth=${job.depth}`
    )

const jobQueue: CrawlJob[] = []

;(async function checkQueue() {
    if (jobQueue.length > 0) {
        const nextJob = jobQueue.pop()
        nextJob && (await crawlPage(nextJob))
    }
    setTimeout(checkQueue, 10)
})()

export const enqueueJob = (crawlJob: CrawlJob): void => {
    jobQueue.push(crawlJob)
}
