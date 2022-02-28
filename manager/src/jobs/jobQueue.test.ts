import { CrawlJob } from '../../../types'
import { enqueueJob, jobQueue, stopQueue } from './jobQueue'

jest.mock('axios')

describe('jobQueue', () => {
    describe('enqueueJob', () => {
        it('enqueues new jobs', async () => {
            const newJob: CrawlJob = {
                pageUrl: 'http://page-to-crawl.com/page',
                depth: 0,
                domain: 'http://page-to-crawl.com',
                targetAssets: ['links'],
            }
            //axios.get.mockResolvedValueOnce(users)
            enqueueJob(newJob)
            stopQueue()
            expect(jobQueue.length).toEqual(1)
        })
    })
})
