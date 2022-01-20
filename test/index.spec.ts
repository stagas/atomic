import { atomic } from '../src'

describe('atomic(fn)', () => {
  it('makes the function atomic', async () => {
    const results = []
    let i = 0
    const fn = atomic(() => async () => {
      const a = i
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      results.push(a + 1)
      i = a + 1
    })
    fn()
    fn()
    fn()
    await fn()
    expect(i).toEqual(4)
    expect(results).toMatchSnapshot()
  })

  it('receives parameters', async () => {
    const results = []
    let i = 0
    const fn = atomic(() => async (x: number) => {
      const a = i
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      results.push(a + 1 + x)
      i = a + 1
    })
    fn(1)
    fn(1)
    fn(1)
    await fn(1)
    expect(i).toEqual(4)
    expect(results).toMatchSnapshot()
  })

  it('alternate', async () => {
    const results = []
    let i = 0
    const fn = atomic(() => async () => {
      const a = i
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      results.push(a + 1)
      i = a + 1
    })
    const promises = [fn(), fn(), fn(), fn()]
    await Promise.all(promises)
    expect(i).toEqual(4)
    expect(results).toMatchSnapshot()
  })

  it('returns result', async () => {
    const results = []
    let i = 0
    const fn = atomic(() => async () => {
      const a = i
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      results.push(a + 1)
      i = a + 1
      return i
    })
    fn()
    fn()
    fn()
    const result = await fn()
    expect(i).toEqual(4)
    expect(result).toEqual(4)
    expect(results).toMatchSnapshot()
  })

  it('throwing doesnt destroy queue', async () => {
    const results = []
    let i = 0
    let times = 0
    const fn = atomic(() => async () => {
      const a = i
      times++
      if (a === 2) throw new Error('problem')
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      results.push(a + 1)
      i = a + 1
      return i
    })
    await Promise.allSettled([fn(), fn(), fn(), fn()])
    expect(i).toEqual(2)
    expect(times).toEqual(4)
    expect(results).toMatchSnapshot()
  })

  it('uses this', async () => {
    const results = []
    const obj = {
      i: 0,
      fn: atomic(
        () =>
          async function () {
            const a = this.i
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
            results.push(a + 1)
            this.i = a + 1
            return a
          }
      ),
    }
    await Promise.allSettled([obj.fn(), obj.fn(), obj.fn(), obj.fn()])
    expect(obj.i).toEqual(4)
    expect(results).toMatchSnapshot()
  })

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
    expect(results).toMatchSnapshot()
    expect(output).toMatchSnapshot()
  })
})
