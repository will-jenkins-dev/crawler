import { CONCURRENT_JOBS_COUNT_MAX } from '../constants'

let concurrentJobCount = 0

export const hasCapacity = (): boolean =>
    concurrentJobCount < CONCURRENT_JOBS_COUNT_MAX

export const incrementJobCount = (): void => {
    concurrentJobCount++
}

export const decrementJobCount = (): void => {
    concurrentJobCount--
}

export const currentJobCount = (): number => concurrentJobCount
