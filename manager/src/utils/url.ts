import { CrawlJob } from '../../../types'
import config from '../config'

const { HOST, PORT, CRAWLER_HOST, CRAWLER_PORT } = config

const getCallbackUrl = (): string => `http://${HOST}:${PORT}/crawl-result`

export const buildCrawlerUrl = (job: CrawlJob): string => {
    const jobEncoded = encodeURIComponent(JSON.stringify(job))
    return `http://${CRAWLER_HOST}:${CRAWLER_PORT}/crawl?job=${jobEncoded}&callbackUrl=${getCallbackUrl()}`
}
