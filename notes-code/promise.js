// https://zh.javascript.info/async

// 模拟异步读取文件操作
function readFileAsync() {
  // resolve 和 reject 由 JavaScript 引擎预先定义
  // @resolve:  (value: any) => void
  // @reject: (reason?: any) => void
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5;
      success
        ? resolve("File content: Hello World!") // 成功, 改变此promise对象内部状态, 入参会给后续then
        : reject(new Error("File read failed!")); // 失败, 改变此promise对象内部状态, error给后续then/catch
        // 调用 resolve/reject 改变此promise的状态, 称为settled，且要么成功要么失败
        //   - `pending` -> `fulfilled`（resolve）
        //   - `pending` -> `rejected`（reject）
        // 并触发 `then` 或 `catch` 注册的回调
    }, 300); // JS内置的定时函数`setTimeout`, 延迟300 ms
  });
}

// [1] 使用 then/catch/finally 方法来使用 promise
console.log("[1][INFO] call `then` to register callback function");
readFileAsync()
  // 箭头函数，当只有1个函数入参和函数体的语句时，就可以省略()和{}
  // then 方法接收两个函数，第1个处理成功，第2个失败(可以省略)，返回1个新的promise
  // 使用 .then 和 .catch 方法来 *注册* 消费函数, promise内部对象变更后，会触发去调用对应的注册的函数
  .then(
    // 1) 第1个回调时成功处理, resove成功的入参会传给data, 返回值会会作为下一个promise的resove入参;
    data => console.log("[1]Success:", data),  
    // 2) 第2个回调是失败处理，可以省略，也可以用catch; .catch(f)调用是 .then(null, f) 的等价的完全的模拟;
    err => console.error("[1]Error:", err.message)  
  )
  .then(
    // 上1个promise的then里的注册的成功回调无返回值时，promise的resove入参就是undefined
    data => console.log("[1]next then data: ", data)
  )
  // `.finally(f)` 仅仅是注册一个最终执行的回调
  //   - 不会接收 `resolve` 的值，也不会接收 `reject` 的错误
  //   - 但是它可以用于清理资源（如关闭连接、释放内存等）
  .finally(
    () => console.log("[1]finaly")
  )

// [2] 使用 async/await 内置关键字来使用 promise，更加直观和常见
// `async function` 总是返回 `Promise`，即使显式返回一个普通值
//   - 如果 `async` 函数内部 return 了一个值，等价于 `Promise.resolve(返回值)`
//   - 如果 `async` 函数内部抛出错误，等价于 `Promise.reject(错误)`
//   - 在 async 内部才能够使用await操作其他promise, 类似同步等待一个promise的结果，但是其实异步不阻塞
async function readFile() {
  console.log("[2][INFO] into `async` function readFile");
  try {
    // await只在async修饰的函数内使用, 语法是：let value = await promise，返回值是promise成功resolve入参
    //   如果await失败了，后面可以直接跟`.catch`或用`try catch`包起来来捕获抛出的异常即可
    //   await 让 JavaScript 引擎等待直到 promise 完成（settle）并返回结果, 但是并不阻塞引擎主线程
    //   这个返回值，就是promise实现里的resolve的入参，可以替换掉 `then` 内置方法的调用更加直观
    //   那么整个逻辑本身可以就等价于then方法注册的成功回调的实现逻辑，用同步的写法写了，直观易读
    const data = await readFileAsync(); // 等待Promise解析
    console.log("[2]Success:", data);
  } catch (err) {
    console.error("[2]Error:", err.message);
  }
}
// 调用 async 函数
readFile().finally(
  () => console.log("[2]finally")
)

// https://zh.javascript.info/promise-api
/* Promise 类有 6 种静态方法：
Promise.all(promises) —— 等待所有 promise 都 resolve 时，返回存放它们结果的数组。如果给定的任意一个 promise 
                         为 reject，那么它就会变成 Promise.all 的 error，所有其他 promise 的结果都会被忽略。
Promise.allSettled(promises)（ES2020 新增方法）—— 等待所有 promise 都 settle 时，并以包含以下内容的对象数组的形式返回它们的结果：
                                                  status: "fulfilled" 或 "rejected"
                                                  value（如果 fulfilled）或 reason（如果 rejected）。
Promise.race(promises) —— 等待第一个 settle 的 promise，并将其 result/error 作为结果返回。
Promise.any(promises)（ES2021 新增方法）—— 等待第一个 fulfilled 的 promise，并将其结果作为结果返回。
                                          如果所有 promise 都 rejected，Promise.any 则会抛出 AggregateError 错误类型的 error 实例。
Promise.resolve(value) —— 使用给定 value 创建一个 resolved 的 promise。
Promise.reject(error) —— 使用给定 error 创建一个 rejected 的 promise。
以上所有方法，Promise.all 可能是在实战中使用最多的。
*/

// 猜测一下 `Promise.all` 内部实现，返回一个新的promise，内部的状态变化取决于所有的all里的各个promise的变化
//   1. 所有都resolve，触发这个新promise的state/result等变化，然后去调用then注册过来的回调
//   2. 有1个reject，那么直接返回错误，忽略掉其依赖的其他promise
let allPro = Promise.all([
  new Promise(resolve => setTimeout(() => resolve(1), 300)), // 1
  new Promise(resolve => setTimeout(() => resolve(2), 200)), // 2
  new Promise(resolve => setTimeout(() => resolve(3), 100))  // 3
])

// use `then` to register callback, only proc `resolve result`
allPro.then(
  data => console.log("[3][INFO] Promise.all:", data)
)

// use `async` to proc promise
const callAll = async () => {
  try{
    let data = await allPro;
    console.log("[3][INFO] async Promise all,", data);
  } catch {
    console.error("[3][Error: ", err.message)
  }
}
callAll();
