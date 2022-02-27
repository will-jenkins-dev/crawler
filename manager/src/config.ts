import * as packageJson from '../package.json'

const config: Record<string, string | number> = {
    SERVICE_NAME: 'Crawl Manager',
    SERVICE_VERSION: packageJson.version,
    SERVICE_ID: packageJson.name,
    PORT: (process.env.SERVICE_PORT ?? 8081) as number,
    HOST: process.env.SERVICE_HOST ?? 'localhost',
    ENV: process.env.ENVIRONMENT_NAME || 'local',
    CRAWLER_HOST: process.env.CRAWLER_HOST ?? 'localhost',
    CRAWLER_PORT: (process.env.CRAWLER_PORT ?? 8082) as number,
}

export default config
