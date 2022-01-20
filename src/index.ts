interface Task {
  context: any
  resolve: (value: any) => void
  reject: (reason?: any) => void
  args: any[]
}

/**
 * Makes a function atomic.
 *
 * @param signalClosure A function that receives the signal object
 *  from an AbortController and returns the function to become atomic.
 * @param maxTimeMs Time in milliseconds to timeout the operation. Will also signal abort.
 * @returns An atomic function
 */
export const atomic = (
  signalClosure: (signal: AbortSignal) => (...args: any[]) => Promise<any>,
  maxTimeMs?: number
) => {
  const queue: Task[] = []

  let flushing = false

  const flush = async () => {
    if (flushing) return
    flushing = true

    const task = queue.shift()!
    const abortController = new AbortController()

    try {
      const fn = signalClosure(abortController.signal)
      let promise = fn.apply(task.context, task.args)
      if (maxTimeMs != null) {
        promise = Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(reject, maxTimeMs, new Error('Timed out'))),
        ])
      }
      task.resolve(await promise)
    } catch (error) {
      abortController.abort()
      task.reject(error)
    } finally {
      flushing = false
      if (queue.length) flush()
    }
  }

  return function (this: any, ...args: any[]): Promise<any> {
    let resolve!: Task['resolve'], reject!: Task['reject']
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })
    queue.push({ context: this, resolve, reject, args })
    flush()
    return promise
  }
}
