# 理解Promise

## 背景：为什么需要 Promise？

在前端开发中，我们经常需要处理异步任务，比如：

- 读取远程数据
- 等待用户操作
- 定时器任务

传统的处理方法是回调函数（callback），但嵌套多了之后会变得非常混乱，形成所谓的“回调地狱”（callback hell）。

为了解决这个问题，ES6 引入了 Promise，它是一种异步编程的规范和机制，本质上就是：
> *用对象的状态变化来管理异步结果*

---

## Promise 是什么？

简单来说，Promise 是一个对象，代表了一个异步操作的最终结果（或者失败的原因）。

这个对象有三种状态：

| 状态        | 意义                      | 触发条件   |
|------------|----------------------------|------------|
| pending    | 初始状态，未完成            | 刚创建时   |
| fulfilled  | 操作成功，调用 resolve()    | 执行成功   |
| rejected   | 操作失败，调用 reject()     | 执行失败   |

状态一旦改变（settled），就不能再修改。这是 Promise 的“状态不可逆”特性。

---

## 模拟异步操作的案例

来看一个模拟异步读取文件的例子：

```js
function readFileAsync() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5;
      success
        ? resolve("File content: Hello World!") // 成功
        : reject(new Error("File read failed!")); // 失败
    }, 300);
  });
}
```

### 说明

1. `new Promise((resolve, reject) => { ... })`
   - Promise 构造函数接受一个 **执行器** 函数，JS 引擎自动提供 `resolve` 和 `reject` 两个回调。
   - 注意：new Promise() 的时候立即执行，且是同步执行。
2. setTimeout 模拟异步延迟 300ms。
3. 随机决定成功还是失败。
4. 根据结果调用 `resolve()` 或 `reject()`，改变 Promise 对象的状态。

---

## 如何消费 Promise？

重点是 `.then()`、`.catch()` 和 `.finally()` 这三个方法，它们的原理是：
> 在 promise 内部状态变化（fulfilled/rejected）时，触发之前通过 `then`/`catch` 注册的回调函数。

调用示例：

```js
console.log("[INFO] call `then` to register callback function");

readFileAsync()
  .then(
    data => console.log("Success:", data),
    err  => console.error("Error:", err.message)
  )
  .finally(() => console.log("Done!")); // 无论成功或失败都会执行
```

---

## Promise 的重要机制

### 1. `.then()` 方法

- 用于注册成功和失败的回调函数。
- 返回一个新的 Promise 对象（支持链式调用）。
- 可以省略失败的回调函数（用 `.catch()` 单独处理）。

### 2. `.catch()` 方法

- 等价于 `.then(null, onRejected)`。
- 用来专门捕获异常。

### 3. `.finally()` 方法

- 无论结果如何都会执行，常用于清理动作（关闭连接、日志打印等）。

---

## Promise 背后的运行机制

### JS 是单线程的，为什么 Promise 能做异步？

这依赖于 JS 的 *事件循环（Event Loop）* 机制。JS的执行模型：

JS 执行模型：

```c
while (true) {
  执行同步代码 (主线程任务)

  while (Microtask 队列不为空) {
    执行 Microtask
  }

  执行下一个 Macrotask（如 setTimeout 回调）// only one

  ... 下一轮循环
}

```

简单流程：

1. 主线程执行同步代码。
2. 遇到 Promise 异步任务，先挂起。
3. 状态改变后（resolve/reject）对应的回调会被放入 *微任务队列（MicroTask Queue）*。
4. 当前同步任务执行完后，Event Loop 会优先处理微任务（then/catch）。

这就是为什么你注册的 `.then()` 回调，会在异步任务完成后被自动调用。

### Promise 执行器函数的执行时机

在 JavaScript 中，`new Promise((resolve, reject) => { ... })` 这段代码的核心点在于：

Promise 构造函数的执行器（executor）是同步执行的, `new Promise` 后立即执行。  
执行器内部调用的 `resolve(value)` 或 `reject(reason)`，是 JavaScript 引擎自动传入的两个回调函数，作用有两个：

1. 改变 Promise 对象的内部状态

    - `pending` -> `fulfilled`（成功）
    - `pending` -> `rejected`（失败）

2. 保存结果数据（data 或 error）到内部属性（规范里叫 `[[PromiseResult]]`）
3. `.then()` 和 `.catch()` 注册的回调函数，会在 Promise 状态变更（settled）之后，以微任务（Microtask）的方式被异步触发，等待当前同步代码执行完成后运行。

这种设计保证了：

1. 你在 `new Promise()` 的同时，就可以启动需要的异步任务。
2. 但后续的回调处理是统一的异步触发，符合事件循环（Event Loop）的机制，确保可控的异步流程。

---

## 使用场景

Promise 的核心意义 不是 为了让代码变慢或者阻塞，而是为了优雅地表达「未来某个时刻才会有结果」的这种异步编程模型。

| 场景 | 是否需要 Promise？ | 为什么？ |
|------|------------------|---------|
| 执行器里是同步代码（瞬间就有结果） | 没必要用 Promise | 完全是浪费，直接 return 就行了。 |
| 执行器里是异步耗时逻辑（I/O、定时器、网络） | 必须用 Promise | 因为同步 return 不适用了，需要 Promise 来「承诺未来给结果」。 |

这种同步无阻塞逻辑，完全没必要包装异步

```js
function getNumber() {
  return new Promise((resolve, reject) => {
    resolve(123);
  });
}
```

适合的逻辑：IO/定时器/网络请求就适合，因为不确定什么时候完成，无法用同步 return，如前面例子所示。

I/O 操作、定时器、网络请求 等场景，通常都需要使用回调函数来处理异步结果，这就是所谓的 **异步通知回调接口** 。最底层几乎是定时器内置函数，或者OS级别的接口封装了。如果没有发生 定时器事件、文件 I/O、网络 I/O 或其他类似的异步事件，那么就没有异步通知的需求。在这种情况下，程序的执行是同步的。所以前面的给的例子，Promise的执行器就由定时器内置函数，异步通知的。

JavaScript 中没有提供像 **同步阻塞接口** 的 API，所有可能导致程序等待的操作（如文件读取、网络请求等）基本上都是异步的。

例如读取文件时，文件的大小和磁盘读取速度是不可预见的，或者网络请求的响应时间会受网络延迟等因素影响，都会导致操作完成的时间不确定。

```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Done');
  }, 1000);
}).then(result => {
  console.log(result);
});

// 改造同步逻辑类似下面的伪代码
promise：
    sleep(1000);
    data = xx;
    console.log(data);

// 使用 await 类似写成同步代码
// 函数表达式，使其可以立即执行
// await 不会阻塞整个程序的执行，它只会阻塞 async 函数内的后续代码
//    后续代码可以看作是 Promise 的 .then() 回调
//    返回值就是resolve的入参
(async function() {
  const result = await new Promise((resolve) => {
    setTimeout(() => {
      resolve('Done');
    }, 1000);
  });
  console.log(result);
})();
```

---

## 总结

| 知识点         | 说明                                 |
|----------------|--------------------------------------|
| Promise 本质   | 异步任务结果的容器，对象状态变化驱动 |
| 核心状态       | pending → fulfilled / rejected       |
| 状态变化触发   | .then(), .catch(), .finally() 回调   |
| 背后机制       | 事件循环 + 微任务队列                |
| 好处           | 解决 callback hell、支持链式调用     |

Promise 本身不神秘，但它是 JavaScript 异步编程的基础。理解 Promise 的运行机制、状态变化和事件循环，是迈向现代 JavaScript 编程的必经之路。
