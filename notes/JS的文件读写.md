# Node.js的文件读写

> Node.js 文件读写，对比C/Python等语言。

## 🧓 第一幕：C 语言——你说了算，我全听你的（同步至上）

在 C 语言里，文件操作基本是一手一刀、全手工雕刻：

```c
FILE* fp = fopen("hello.txt", "r");
if (fp) {
    char buffer[100];
    fread(buffer, 1, sizeof(buffer), fp);
    fclose(fp);
}
```

优点：你想什么时候打开，就什么时候打开。  
缺点：线程阻塞，线程调度靠系统；你要想非阻塞？给你 `select/poll/epoll` 三件套，自行攒套件去吧。

### 🧠 背后机制

- 所有 I/O 都是 **默认同步阻塞**。
- 你不加 epoll，就是“读一个卡一分钟，线程全白等”。

## 🐍 第二幕：Python——我封装了，你别问为什么

```python
with open("hello.txt", "r") as f:
    content = f.read()
```

看似高级，但其实调用本质也是同步阻塞调用。

想非阻塞？用 `aiofiles`：

```python
import aiofiles
import asyncio

async def read_file():
    async with aiofiles.open('hello.txt', 'r') as f:
        content = await f.read()
    return content
```

> “看起来 async/await 这么现代，底层会不会也用了 epoll？”  
> ——当然，不是（错），aiofiles 背后是 asyncio + 线程池，真正无非是“我帮你起了个线程而已”。

## 👦 第三幕：Node.js——异步，是我的人生信仰

欢迎来到 Node.js 世界，一个 C 程序员初看想打人、深入觉得真香的世界。

```js
import fs from 'fs';

// 异步读文件
fs.readFile('hello.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// 同步版本（一定慎用!!!阻塞主线程）
const data = fs.readFileSync('hello.txt', 'utf8');
```

Node.js 默认强调 **异步非阻塞编程**，你可以用 callback、Promise，甚至 async/await：

```js
import fs from 'fs/promises';

async function readFileAsync() {
    const data = await fs.readFile('hello.txt', 'utf8');
    console.log(data);
}
```

Node 的文件读写默认使用线程池（libuv），虽然你写的代码是“异步非阻塞”，背后还是多线程悄悄干活——**线程你不用写，Node 自动安排得明明白白**。

---

## 🧪 同场竞技：三国演义之文件读取

| 项目 | C语言 | Python | Node.js |
|------|-------|--------|---------|
| 默认模式 | 同步 | 同步（默认） | 异步（推荐） |
| 异步方式 | `select/poll/epoll` + 自己动手 | `aiofiles` + asyncio | callback / Promise / async |
| 线程使用 | 程序员自己开线程 | 隐式线程池（有时） | libuv 线程池 |
| 学习曲线 | 你要懂 syscall | 你要懂 coroutine | 你要懂 event loop |
| 调试体验 | gdb 原始粗暴 | trace 简单但易糊 | console.log + async 栈调试 |

---

## 🎡 附录：Node.js 背后的调度模型小科普

Node.js 虽然是单线程 JS 引擎（基于 V8），但靠 libuv 实现了真正意义上的 **事件驱动 + 非阻塞 I/O**。

### 主要机制

- **事件循环（Event Loop）**：JS 主线程负责调度任务队列，轮询事件。
- **线程池**：libuv 背后的线程池处理文件 I/O、DNS 等“重活”。
- **任务队列**：分为 macro-task（比如 `setTimeout`）和 micro-task（比如 `Promise.then`）。
- **异步不等于并发**：你写的是 async，实际上还是单线程调度多个任务的状态机。

你写的 `fs.readFile()`，是 Node 注册事件 + 扔给线程池，等你回调进来再 resume 主线程。

>现代服务端 I/O 的基本范式：**CPU 负责调度、I/O 放给别人干、我再回来处理结果**。

## 🧾 小结：不忘初心，各取所长

- C 给你自由，也让你负责到底；
- Python 追求优雅，但很多时候本质“同步”；
- Node.js 一切异步，背后线程池支撑，看似单线程，实则你想不到的卷。

当你明白这些，Node.js 的“异步地狱”也不过是一座充满魔法的乐园罢了——别怕，你是从内核世界走出来的，callback 算啥。
