import * as packageJson from '../package.json'
import { UtilTypes } from '@rnwl/package-api-utils'
import _ from 'lodash'

const config: UtilTypes.CommonConfig = {
    SERVICE_NAME: 'Webcrawler',
    SERVICE_VERSION: packageJson.version,
    SERVICE_ID: packageJson.name,
    PORT: (process.env.SERVICE_PORT ?? 80) as number,
    HOST: process.env.SERVICE_HOST ?? '0.0.0.0',
    // Database specific config can use a shared configuration, or be set
    // Specifically for this service.
    DB_HOST: process.env.SERVICE_BACKEND_SHARING_DB_HOST ?? process.env.DB_HOST,
    DB_NAME: process.env.SERVICE_BACKEND_SHARING_DB_NAME ?? process.env.DB_NAME,
    DB_USERNAME:
        process.env.SERVICE_BACKEND_SHARING_DB_USERNAME ??
        process.env.DB_USERNAME,
    DB_PASSWORD:
        process.env.SERVICE_BACKEND_SHARING_DB_PASSWORD ??
        process.env.DB_PASSWORD,
    MIGRATION_TABLE_NAME:
        process.env.SERVICE_BACKEND_SHARING_MIGRATION_TABLE_NAME || '',
    // COPILOT provides 'prod', 'staging' or 'test' for ENV. In dev set to 'local'.
    ENV: process.env.COPILOT_ENVIRONMENT_NAME,
}
if (config.MIGRATION_TABLE_NAME === '') {
    // Will default to "SequelizeSERVICE_ID" e.g. SequelizeServiceBackendAccount
    config.MIGRATION_TABLE_NAME =
        'Sequelize' + _.startCase(config.SERVICE_ID).replace(/\s/g, '')
}

export default config
