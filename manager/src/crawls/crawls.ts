import axios from 'axios'
import * as logger from './../utils/logger'

import { Crawl, CrawlJob } from '../../../types'
import { buildCrawlerUrl } from '../utils/url'

const crawls: Record<string, Crawl> = {}

export const addCrawl = (crawl: Crawl, domain: string): void => {
    crawls[domain] = crawl
}
export const getCrawl = (domain: string): Crawl | undefined => crawls[domain]

export const updateLastCrawlTime = (domain: string): void => {
    const crawl = getCrawl(domain)
    if (crawl) {
        crawl.lastCrawlTime = Date.now()
    }
}

export const crawlPage = async (job: CrawlJob): Promise<void> => {
    const url = buildCrawlerUrl(job)
    try {
        await axios.get(url)
    } catch {
        logger.log('crawl job failed')
    }
}
