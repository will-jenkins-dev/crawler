const assetType = ['links', 'images'] as const
export type AssetType = typeof assetType[number]
export type PageAssets = { [K in AssetType]?: string[] }
export type CrawlResult = {
    domain: string
    url: string
    assets?: PageAssets
    depth: number
    info: unknown
}

export type CrawlStartRequest = Express.Request & {
    query: {
        url: string
    }
}

export type CrawlJob = {
    domain: string
    pageUrl: string
    depth: number
    targetAssets: AssetType[]
}

export type CrawlJobRequest = Express.Request & {
    query: {
        job: string
        callbackUrl: string
    }
}

export type Crawl = {
    visited: Map<string, PageAssets>
    crawlDelay: number
    startedAtTime: Date
}
