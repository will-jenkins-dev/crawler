import app from '../../src/app'
import request from 'supertest'
import * as packageJson from '../../package.json'
import config from '../../src/config'
import supertest from 'supertest'

// describe('testing-health-check', () => {
//     it('GET / - success', async () => {
//         const { status }: supertest.SuperTest<{ status }> = await request(
//             app
//         ).get('/')
//         expect(status).toEqual(200)
//         expect(packageJson.version).toBeDefined()
//         expect(text).toEqual(
//             `Hello from  ${config.SERVICE_NAME}}! (v` +
//                 packageJson.version +
//                 ')'
//         )
//     })
// })
