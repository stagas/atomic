import { atomic } from '../src'

describe('atomic()', () => {
  it('times out after maxTimeMs', async () => {
    const results = []
    let i = 0
    let times = 0
    const fn = atomic(
      signal => async () => {
        const a = i
        times++
        await new Promise(resolve => setTimeout(resolve, a === 2 ? 300 : 100))
        if (signal.aborted) return
        results.push(a + 1)
        i = a + 1
        return i
      },
      200
    )
    const output = await Promise.allSettled([fn(), fn(), fn(), fn()])
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(i).toEqual(2)
    expect(times).toEqual(4)
    expect(results).toEqual([1, 2])
    expect(output).toMatchObject([
      { status: 'fulfilled' },
      { status: 'fulfilled' },
      { status: 'rejected' },
      { status: 'rejected' },
    ])
  })
})
