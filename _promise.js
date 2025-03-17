import { isPromise } from './isPromise.js'

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  [['name']] = 'MyPromise'
  test = '123'
  #state = PENDING
  #result = undefined
  #thenables = []

  constructor(excutor) {
    // resolver must be a function
    if (typeof excutor !== 'function') {
      throw new TypeError(`MyPromise resolver ${excutor} is not a function`)
    }

    // resolve reject 放在里面是为了this指针问题 避免this绑定的事
    const resolve = data => {
      this.#changeState(FULFILLED, data)
    }
    const reject = err => {
      this.#changeState(REJECTED, err)
    }

    // 捕获同步错误
    try {
      excutor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  #changeState(state, data) {
    // 状态不可多次更改
    if (this.#state !== PENDING) return
    this.#state = state
    this.#result = data
    this.#run()
  }

  #run() {
    // 清空队列
    while (this.#thenables.length) {
      // 所有的回调只有在状态改变后之后才会执行
      if (this.#state === PENDING) return
      const { onFulfilled, onRejected, resolve, reject } = this.#thenables.shift()

      if (this.#state === FULFILLED) {
        this.#callback(onFulfilled, resolve, reject)
      }
      if (this.#state === REJECTED) {
        this.#callback(onRejected, resolve, reject)
      }
    }
  }

  #callback(cb, resolve, reject) {
    if (typeof cb !== 'function') {
      // 没有新的处理 透传状态
      const settled = this.#state === FULFILLED ? resolve : reject
      this.#pushMicrotask(() => settled(this.#result))
      return
    }

    // 推入异步队列一个方法
    // 处理回调函数是异步函数的情况
    this.#pushMicrotask(async () => {
      try {
        const res = await cb(this.#result)
        resolve(res)
      } catch (err) {
        reject(err)
      }
    })
  }

  // 推入微队列的方法
  // 考虑兼容性
  #pushMicrotask(fn) {
    // 支持 queueMicrotask Api
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(fn)
      // Node 环境  支持 process.nextTick
    } else if (typeof process === 'object' && process.nextTick.then === 'function') {
      process.nextTick(fn)
    } else if (typeof MutationObserver === 'function') {
      // 浏览器环境
      const observer = new MutationObserver(fn)
      const node = document.createTextNode('')
      observer.observe(node, { characterData: true })
      node.data = '1'
    } else {
      // setTimeout
      setTimeout(fn, 0)
    }
  }

  /**
   * @name 暴露出去的方法
   */
  // then
  then(onFulfilled, onRejected) {
    // 链式调用 要返回实例
    return new MyPromise((resolve, reject) => {
      // 方法不一定是立马就执行的
      // 收集回调进队列
      this.#thenables.push({
        onFulfilled,
        onRejected,
        resolve,
        reject
      })

      // 执行队列
      this.#run()
    })
  }
  catch(errorHandler) {
    return this.then(undefined, errorHandler)
  }
  finally(finalyHandler) {
    return this.then(finalyHandler, undefined)
  }
  // all
  static all(promises) {
    let allResults = []
    let completeCount = 0
    return new MyPromise((resolve, reject) => {
      if (promises.length === 0) {
        resolve(allResults)
      }

      promises.forEach((item, index) => {
        if (!isPromise(item)) {
          allResults[index] = item
          completeCount++
          if (completeCount === promises.length) {
            resolve(allResults)
          }
          return
        }
       
        item.then(response => {
          allResults[index] = response
          completeCount++
          if (completeCount === promises.length) {
            resolve(allResults)
          }
        }).catch(err => {
          console.log('err', err)
          reject(err)
        })
      })
    })
  }
}

export default MyPromise
