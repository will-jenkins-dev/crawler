import { JSDOM } from 'jsdom'
import { AssetType, PageAssets } from '../../types'

const linkIsValid = (l: string) =>
    l && !l.startsWith('#') && !l.startsWith('about:blank') && l.length > 0

const findAssets = (assetType: AssetType, doc: Document): string[] => {
    switch (assetType) {
        case 'links':
            return [...doc.querySelectorAll('a')]
                .map((l) => l.href)
                .filter(linkIsValid)
        case 'images':
            return [...doc.querySelectorAll('img')].map((im) => im.src)
        case 'form':
            return [...doc.querySelectorAll('form')].map(
                (f) => f.id || 'unknown id'
            )
        case 'video':
            return [...doc.querySelectorAll('video')].map((v) => v.src)
        case 'audio':
            return [...doc.querySelectorAll('audio')].map((a) => a.src)
        default:
            throw Error('unkown tag type')
    }
}

export const collectAssets = (
    data: string,
    targetAssets: AssetType[]
): PageAssets => {
    const jsdom = new JSDOM(data)
    const doc = jsdom.window.document
    const assets: PageAssets = Object.fromEntries(
        targetAssets.map((assetType) => [assetType, findAssets(assetType, doc)])
    )
    return assets
}

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}
