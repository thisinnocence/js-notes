# TypeScript 类型入门

> 本文面向有一定 JS/Vue/Node.js 开发经验，并熟悉 C++/Python 的开发者，快速理解 TypeScript 的类型系统、工具链与最佳实践。适合做学习笔记，也适合分享给刚接触 TS 的工程师。

---

## 一、TypeScript 是什么？

TypeScript 是 JavaScript 的超集，增加了静态类型系统。其目标是让 JS 项目具备更强的可维护性、可读性和工程可控性。

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

## 二、前端如何使用 TS：以 Vue + Vite 为例

Vue 3 **强烈推荐**使用 TypeScript，结合 Vite 构建工具，体验非常丝滑。

### 1. 启用 TypeScript 项目

```bash
pnpm create vite@latest my-vue-app --template vue-ts
cd my-vue-app
pnpm install
pnpm run dev
```

在 tsconfig.json 中启用严格模式：

```js
{  
  "compilerOptions": {  
    "strict": true, // 强制类型检查  
    "types": ["vite/client"] // Vite 环境类型支持[6](@ref)  
  }  
}  
```

### 2. Vue SFC 中使用 TS

```vue
<script lang="ts" setup>
import { ref } from 'vue'
const count = ref<number>(0)
function increment(): void {
  count.value++
}
</script>
```

TS 帮助你获得 IDE 自动补全、重构提示、组件 props 校验等。

---

## 三、后端如何使用 TS：以 Express 为例

### 1. 初始化 TS 项目

```bash
pnpm init
pnpm add express
pnpm add -D typescript @types/node @types/express tsx nodemon
npx tsc --init
```

### 2. 创建一个基本服务

```ts
// src/index.ts
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## 四、TypeScript 工具链

| 工具                           | 用途                         |
| ---------------------------- | -------------------------- |
| `tsc`                        | TypeScript 编译器             |
| `tsx`                        | 更快的 TS/JS 执行器，支持 ESM 与 HMR |
| `vite`                       | 快速前端打包器，支持 TS              |
| `eslint + typescript-eslint` | 代码规范检查                     |
| `prettier`                   | 代码格式化                      |
| `typedoc`                    | 自动生成文档                     |
| `ts-node`                   | 直接运行 TS 代码（开发时）         |

> 提示：VS Code 提供实时类型错误提示和定义跳转​（Ctrl+点击）。

---

## 五、TypeScript 的类型系统（对比 C++）

### 1. 基本类型

| TS 类型     | C++ 类比          | 示例                         |
| --------- | --------------- | -------------------------- |
| `number`  | `int`, `double` | `let a: number = 42;`      |
| `string`  | `std::string`   | `let name: string = "TS";` |
| `boolean` | `bool`          | `let ok: boolean = true;`  |
| `any`     | `void*`         | `let x: any = 123;`        |
| `void`    | `void`          | `function f(): void {}`    |

举例：

```ts
let count: number = 5;      // ≈ C++ int/double  
let name: string = "John";  // ≈ std::string  
let isDone: boolean = true; // ≈ bool  
let nothing: void = null;   // ≈ void  
```

### 2. 复合类型

| TS 类型                 | C++ 类比                           | 示例                                         |
| ---------------------- | ---------------------------------- | ----------------------------------------------- |
| 数组 `number[]`         | `std::vector<int>`                 | `let arr: number[] = [1, 2];`                   |
| 元组 `[string, number]` | `std::tuple<std::string, int>`     | `let t: [string, number] = ["hi", 1];`          |
| 枚举 `enum`             | `enum class`                       | `enum Direction { Up, Down }`                   |
| 对象 `interface`        | `struct` / `class`                 | `interface User { name: string; age: number; }` |
| Generic `Array<T>`        | `template<typename T> class Array` | `let nums: Array<number> = [1, 2, 3];`          |

### 3. 函数类型

入参返回值有类型:

```ts
function greet(name: string): string {
  return `Hello, ${name}`
}
```

### 4. 泛型（Templates）

```ts
function identity<T>(arg: T): T {
  return arg;
}
```

---

## 六、TS vs JS 开发效率与收益对比

| 维度         | JS 项目              | TS 项目                  |
|--------------|----------------------|--------------------------|
| 学习曲线     | 快                   | 需要了解类型系统          |
| 初始开发效率 | 高                   | 稍低                     |
| 重构安全性   | 低，靠测试和经验      | 高，类型系统护航          |
| 大型项目维护性 | 难                   | 易于维护和协作            |

> 通常项目规模达到 3k+ 行代码，多人协作时，TS 的收益就开始显著放大。

---

## 七、从软件工程角度看 TS 的优势

* **类型是 API 的文档**：无需翻源码，一看类型定义即可理解用法；
* **类型是重构的安全网**：删除、改名、参数调整都能快速反馈；
* **类型是团队协作的契约**：接口规范统一，减少沟通成本；
* **配合 ESLint、Prettier、CI 检查**：构建严谨的工程体系。

TS 是现代 JavaScript 工程实践的基石。一些最佳实践：

​**避免 any**​ → 优先用 unknown + 类型守卫：

```ts
function isError(err: unknown): err is Error {  
  return err instanceof Error;  
}

function handle(err: unknown) {
  // 安全地检查某个未知类型是否是 Error
  // 在处理 try/catch 的错误时常用的技巧
  if (isError(err)) {
    console.error(err.message);  // 在这里 err 被推断为 Error 类型
  } else {
    console.error('Unknown error:', err);
  }
}
```

泛型替代重复类型​（类似 C++ 模板），如：

```ts
type ApiResponse<T> = { data: T; error?: string };  
```

**使用场景：**

除了一次性脚本或超小型工具，其他都建议用TypeScript.

---

## 结语

TypeScript 对 C++ 背景开发者而言并不难，它像 Python 引入类型提示，又像 C++ 提供模板泛型系统。当你开始习惯 TS 的工程方式，会发现在大型项目中，它能帮你避免大量『经验主义』的坑。趁现在，开始你的 TS 项目吧！

> 学习建议：先上手 Vue + TS 项目，配合 VSCode + Volar 插件，逐步替换 JS 模块为 TS；再尝试后端 Express + TS 构建完整项目。
