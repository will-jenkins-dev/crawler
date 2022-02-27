import config from './src/config'
import { app } from './src/crawler'

const { PORT, HOST, SERVICE_NAME, SERVICE_VERSION } = config

app.listen(PORT as number, HOST as string)

console.log(
    `${SERVICE_NAME} (${SERVICE_VERSION}) is running on http://${HOST}:${PORT}`
)

export default app
