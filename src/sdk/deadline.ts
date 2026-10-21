import { StackPrismError } from './types.js'

export class DetectionDeadline {
  readonly startedAt = performance.now()
  private readonly endsAt: number
  private readonly expiration: Promise<never>
  private readonly timer: ReturnType<typeof setTimeout>
  private failure?: StackPrismError
  private readonly abort: () => void
  private rejectExpiration!: (error: StackPrismError) => void

  constructor(
    timeoutMs = 30_000,
    private readonly signal?: AbortSignal,
    private readonly onFailure?: () => void
  ) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) {
      throw new StackPrismError('INVALID_ARGUMENT', 'timeoutMs must be an integer between 1 and 120000')
    }
    if (signal !== undefined && !(signal instanceof AbortSignal)) {
      throw new StackPrismError('INVALID_ARGUMENT', 'signal must be an AbortSignal')
    }
    this.endsAt = this.startedAt + timeoutMs
    this.expiration = new Promise<never>((_, reject) => {
      this.rejectExpiration = reject
    })
    // Cancellation may arrive between operations; it must not create an unhandled rejection.
    void this.expiration.catch(() => {})
    this.timer = setTimeout(() => this.interrupt(new StackPrismError('TIMEOUT', 'Detection deadline exceeded')), timeoutMs)
    this.abort = () => this.interrupt(new StackPrismError('ABORTED', 'Detection cancelled'))
    signal?.addEventListener('abort', this.abort, { once: true })
    if (signal?.aborted) this.abort()
  }

  interrupt(error: StackPrismError): void {
    if (this.failure) return
    this.failure = error
    this.rejectExpiration(error)
    this.onFailure?.()
  }

  remaining(): number {
    if (this.failure) throw this.failure
    const remaining = Math.ceil(this.endsAt - performance.now())
    if (remaining <= 0) {
      this.interrupt(new StackPrismError('TIMEOUT', 'Detection deadline exceeded'))
      throw this.failure
    }
    return remaining
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    this.remaining()
    return Promise.race([operation(), this.expiration])
  }

  async wait(milliseconds: number): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await this.run(
        () =>
          new Promise<void>(resolve => {
            timer = setTimeout(resolve, milliseconds)
          })
      )
    } finally {
      clearTimeout(timer)
    }
  }

  dispose(): void {
    clearTimeout(this.timer)
    this.signal?.removeEventListener('abort', this.abort)
  }
}
