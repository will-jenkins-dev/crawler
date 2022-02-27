const isValidProtocol = (url: URL) =>
    url.protocol === 'http:' || url.protocol === 'https:'
export const shouldFollowLink = ({
    pageUrl,
    linkUrl,
}: {
    pageUrl: string
    linkUrl: URL
}): boolean => {
    try {
        const url = new URL(pageUrl)
        return isValidProtocol(linkUrl) && linkUrl.host === url.host
    } catch {
        return false
    }
}
const formatUrl = (link: string, domain: string): string | null => {
    try {
        const url = new URL(link, domain)
        return url.href
    } catch {
        return null
    }
}

export const cleanLinks = (links: string[], domain: string): string[] => {
    const linksFiltered = links
        .map((link) => formatUrl(link, domain))
        .filter((l): l is string => typeof l === 'string')
    const urlsUnique = [...new Set(linksFiltered)]
    return urlsUnique
}
