/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number
    delay: number
    onRetry?: (error: Error, attempt: number) => void
  },
): Promise<T> {
  const { retries, delay, onRetry } = options

  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }

    if (onRetry) {
      onRetry(error as Error, retries)
    }

    await new Promise((resolve) => setTimeout(resolve, delay))

    return retry(fn, {
      retries: retries - 1,
      delay: delay * 2, // Exponential backoff
      onRetry,
    })
  }
}
