export const log = (message: string): void =>
    console.log(`${new Date().toLocaleString()} - ${message}`)

export const logError = (e: unknown): void => {
    if (e instanceof Error) {
        log(`*** ERROR *** ${e.message}`)
    } else {
        log('`*** ERROR *** Unknown error')
    }
}
