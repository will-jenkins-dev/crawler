import { findAssets } from './page-parsing'
import { JSDOM } from 'jsdom'

const page = `<html>
    <body>
    <a href="/relative">a link</a>
    </body>
    </html>`

const {
    window: { document: doc },
} = new JSDOM(page)

describe('find assets', () => {
    it('finds links', () => {
        const result = findAssets('links', doc)
        expect(result).toEqual(['/relative'])
    })
})
