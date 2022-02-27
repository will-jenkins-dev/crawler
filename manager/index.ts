import app from './src/app'
import config from './src/config'

const { PORT, HOST, SERVICE_NAME, SERVICE_VERSION } = config

app.listen(PORT as number, HOST as string)
console.log(
    `${SERVICE_NAME} (${SERVICE_VERSION}) is running on http://${HOST}:${PORT}`
)
