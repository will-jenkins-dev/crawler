import * as packageJson from '../package.json'

const config: Record<string, string | number> = {
    SERVICE_NAME: 'Cloud Function',
    SERVICE_VERSION: packageJson.version,
    SERVICE_ID: packageJson.name,
    PORT: (process.env.SERVICE_PORT ?? 80) as number,
    HOST: process.env.SERVICE_HOST ?? 'localhost',
    ENV: process.env.ENVIRONMENT_NAME || 'dev',
}

export default config
