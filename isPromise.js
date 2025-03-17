// 判断是否是 Promise
// 依据 promise A+ 规范

export function isPromise(value) {
  return (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function'
}