
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  #state = PENDING
  #result = undefined
  #thenables = []
  constructor(excutor) {
    // resolver must be a function
    if (typeof excutor !== 'function') {
      throw new TypeError(`MyPromise resolver ${excutor} is not a function`)
    }

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
      // 没有心的处理 透传状态
      const settled = this.#state === FULFILLED ? resolve : reject
      queueMicrotask(() => settled(this.#result))
      return
    }

    // 推入异步队列一个方法
    // 处理回调函数是异步函数的情况
    queueMicrotask(async () => {
      try {
        const res = await cb(this.#result)
        resolve(res)
      } catch (err) {
        reject(err)
      }
    })
  }

  #isAsyncFunction(func) {
    // 首先检查函数是否通过 async 关键字定义
    if (func.constructor.name === 'AsyncFunction') {
      return true
    }

    try {
      const result = func()
      // 检查函数返回值是否为 Promise 对象
      return result instanceof Promise
    } catch (error) {
      // 如果函数执行出错，返回 false
      return false
    }
  }

  // 暴露出去的方法
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
}

const p = new MyPromise((resolve, reject) => {
  resolve('success')
})
  .then(res => {
    console.log(res, 'then1')
    return res + '111'
  })
  .then(async res => {
    console.log(res, 'then2')
    await setTimeout(() => {
      console.log('setTimeout' + res + '222')
    }, 0)
    return res + '222'
  })

  .then(async res => {
    console.log(res, 'then2.5')
    return new Promise((resolve, reject) => {
      resolve(res + '222.5')
    })
  })
  .then(res => {
    console.log(res, 'then3')
    return res + '333'
  })
