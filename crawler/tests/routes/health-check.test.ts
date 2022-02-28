import app from '../../index'
import request from 'supertest'
import '@types/jest'

import config from '../../src/config'
describe('testing-health-check', () => {
    it('GET / - success', async () => {
        const response: Express.Response = await request(app).get('./')
        expect(response).toEqual(200)
        // expect(packageJson.version).toBeDefined()
        // expect(text).toEqual(
        //     `Hello from  ${config.SERVICE_NAME}}! (v` +
        //         packageJson.version +
        //         ')'
        // )
    })
})
