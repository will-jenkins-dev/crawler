import app from '../../index'
import request from 'supertest'
import * as packageJson from '../../package.json'
import { TestResponse } from '@rnwl/package-api-dev-utils'
import { Contracts } from '@rnwl/package-api-utils'
import config from '../../src/config'

type SuccessResponse =
    Contracts.ServiceBackendVehicle.API.HealthCheck.ResponsePayloads.Success
const path = Contracts.ServiceBackendVehicle.API.HealthCheck.path

describe('testing-health-check', () => {
    it('GET / - success', async () => {
        const { status, text }: TestResponse<SuccessResponse> = await request(
            app
        ).get(path)
        expect(status).toEqual(200)
        expect(packageJson.version).toBeDefined()
        expect(text).toEqual(
            `Hello from  ${config.SERVICE_NAME}}! (v` +
                packageJson.version +
                ')'
        )
    })
})
