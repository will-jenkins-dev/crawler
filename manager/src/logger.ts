export const log = (message: string): void =>
    console.log(`${new Date().toLocaleString()} - ${message}`)

export const logError = (errorMessage: string): void => {
    log(`*** ERROR *** ${errorMessage}`)
}
