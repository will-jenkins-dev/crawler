import * as packageJson from '../package.json'

const config: Record<string, string | number> = {
    SERVICE_NAME: 'Page Crawler',
    SERVICE_VERSION: packageJson.version,
    SERVICE_ID: packageJson.name,
    PORT: (process.env.SERVICE_PORT ?? 8082) as number,
    HOST: process.env.SERVICE_HOST ?? 'localhost',
    ENV: process.env.ENVIRONMENT_NAME || 'local',
}

export default config
