import app from '../../index'
import request from 'supertest'
import * as packageJson from '../../package.json'

// import config from '../../src/config'
// describe('testing-health-check', () => {
//     it('GET / - success', async () => {
//         const { status, text }: Express.Response = await request(app).get(path)
//         expect(status).toEqual(200)
//         expect(packageJson.version).toBeDefined()
//         expect(text).toEqual(
//             `Hello from  ${config.SERVICE_NAME}}! (v` +
//                 packageJson.version +
//                 ')'
//         )
//     })
// })
