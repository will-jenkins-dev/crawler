import { collectAssets, findAssets } from './pageParsing'
import { JSDOM } from 'jsdom'

const page = `<html>
    <body>
    <a href="/relative">a link</a>
    <a href="http://www.myabsolutelink.me/">another link</a>
    <form id="find-me"></form>
    </body>
    </html>`

describe('find assets', () => {
    const {
        window: { document: doc },
    } = new JSDOM(page)

    it('finds links if they exist', () => {
        const result = findAssets('links', doc)
        expect(result).toEqual(['/relative', 'http://www.myabsolutelink.me/'])
    })
    it('finds forms if they exist', () => {
        const result = findAssets('forms', doc)
        expect(result).toEqual(['find-me'])
    })
    it('does not find videos if they do not exist', () => {
        const result = findAssets('video', doc)
        expect(result).toEqual([])
    })
})

describe('collect assets', () => {
    it('finds links if they exist', () => {
        const result = collectAssets(page, ['links', 'forms', 'video'])
        const expected = {
            forms: ['find-me'],
            links: ['/relative', 'http://www.myabsolutelink.me/'],
            video: [],
        }
        expect(result).toEqual(expected)
    })
})
