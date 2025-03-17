import MyPromise from './_promise.js'

const p1 = new MyPromise((resolve, reject) => {
  resolve(1111)
})
const p2 = new MyPromise((resolve, reject) => {
  resolve(2222)
})
const p3 = new MyPromise((resolve, reject) => {
  resolve(3333)
})

MyPromise.all([p1, p2, p3, 213, () => {}]).then(res => {
  console.log(res, '===========response in test')
})

// const p = new MyPromise((resolve, reject) => {
//   resolve('success')
// })
//   .then(res => {
//     console.log(res, 'then1')
//     return res + '111'
//   })
//   .then(async res => {
//     console.log(res, 'then2')
//     await setTimeout(() => {
//       console.log('setTimeout' + res + '222')
//     }, 0)
//     return res + '222'
//   })
//   .then(async res => {
//     console.log(res, 'then2.5')
//     return new Promise((resolve, reject) => {
//       resolve(res + '222.5')
//     })
//   })
//   .then(res => {
//     console.log(res, 'then3')
//     return res + '333'
//   })
