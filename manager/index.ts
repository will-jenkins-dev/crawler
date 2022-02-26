import app from './src/app'
import config from './src/config'
// import { getDb, initDb } from './src/db/dbManagement'
// import { migrateUp } from './src/db/migration/migrate'

const { PORT, HOST, SERVICE_NAME, SERVICE_VERSION } = config

// // Initialise the sequelize object in the app
// // And run any available database migration
// initDb().then((isDbConnected) => {
//     console.log(
//         'DB Connection status: ' +
//             (isDbConnected ? 'connected' : 'not connected')
//     )
//     migrateUp(getDb())
// })

app.listen(PORT, HOST)
console.log(
    `${SERVICE_NAME} (${SERVICE_VERSION}) is running on http://${HOST}:${PORT}`
)
