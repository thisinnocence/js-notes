# JS的Proxy和Reflect: 给对象加“钩子”的正确姿势

随着 ECMAScript 6 的推出，JavaScript 不再只是“脚本语言”，它加入了 `Proxy` 和 `Reflect` —— 让 JS 开发者第一次拥有了像 C++ 重载运算符、修改默认语义一样的“元编程能力”。

本篇面向有系统编程背景的开发者，用类比和代码帮你理解：**如何用 Proxy 截获对象行为，Reflect 如何作为默认“原始操作”的后门**。

<https://zh.javascript.info/proxy>

---

## 一、什么是 Proxy？

> `Proxy` 是 JS 的拦截器，它允许你定义 **对对象的基本操作行为**（如读取、赋值、删除等）的自定义逻辑。

```js
const proxy = new Proxy(target, handler);
```

你可以拦截的操作包括：

- 属性读取：`get`
- 属性赋值：`set`
- 删除属性：`deleteProperty`
- `in` 操作符：`has`
- 遍历：`ownKeys`
- 函数调用：`apply`
- 构造函数：`construct`
- ……

---

## 二、最基础的 Proxy 示例：读取日志

```js
const target = {
  msg: "Hello",
};

const handler = {
  // 入参个数和位置固定，名字可以改，但是不推荐
  get(obj, prop) {
    console.log(`Accessed property: ${prop}`);
    return obj[prop];
  },
};

const proxy = new Proxy(target, handler);

console.log(proxy.msg);

// output:
//   Accessing the property
//   Hello
```

|Trap 名称 | 函数签名 | 参数说明|
|--|--|--|
|get | get(target, prop, receiver) | 拦截属性读取，如 proxy.foo|
|set | set(target, prop, value, receiver) | 拦截属性赋值，如 proxy.foo = 123|
|has | has(target, prop) | 拦截 prop in proxy 操作|
|deleteProperty | deleteProperty(target, prop) | 拦截 delete proxy.foo|
|ownKeys | ownKeys(target) | 拦截 Object.keys(proxy)、for...in、Object.getOwnPropertyNames() 等|
|getOwnPropertyDescriptor | getOwnPropertyDescriptor(target, prop) | 拦截 Object.getOwnPropertyDescriptor(proxy, prop)|
|defineProperty | defineProperty(target, prop, descriptor) | 拦截 Object.defineProperty(proxy, prop, desc)|
|preventExtensions | preventExtensions(target) | 拦截 Object.preventExtensions(proxy)|
|isExtensible | isExtensible(target) | 拦截 Object.isExtensible(proxy)|
|setPrototypeOf | setPrototypeOf(target, proto) | 拦截 Object.setPrototypeOf(proxy, proto)|
|getPrototypeOf | getPrototypeOf(target) | 拦截 Object.getPrototypeOf(proxy)|
|apply | apply(target, thisArg, argsList) | 拦截函数调用，如 proxy(...args)，只适用于函数对象|
|construct | construct(target, argsList, newTarget) | 拦截 new proxy(...args)，只适用于构造函数对象|

---

## 三、写拦截 + Reflect：让代理行为更“原生”

Proxy 中如果不使用 `Reflect`，很多行为就会失真。

```js
const handler = {
  set(obj, prop, value) {
    console.log(`Setting ${prop} = ${value}`);
    return Reflect.set(obj, prop, value); // 保持原语义
  },
};
```

> ✅ `Reflect` 是 JS 的“原生反射 API”，相当于“执行默认操作”的后门，能 **确保代理行为与原生一致**，如是否返回 true/false、触发错误等。

为什么用 Reflect.set 而不是 obj[prop] = value？两者效果一样，但：

✅ 推荐使用 Reflect.set(obj, prop, value)：  

- 更语义化（就是“我执行一次默认的 set 操作”）
- 避免一些边界情况下的 this 错乱（比如涉及继承和 receiver 的时候）
- 兼容性好，配合 Proxy 是最佳实践

使用 Proxy 拦截后，Reflect.set(...) 就是你 显式调用默认行为 的方式。它让你既能“观察和干预”，又能“不破坏原始语义”。

---

## 四、案例：只读对象

用 Proxy 创建一个不可写的对象：

```js
function readonly(obj) {
  return new Proxy(obj, {
    set(target, prop, value) {
      console.warn(`Attempt to write ${prop} ignored`);
      return true; // 拦截成功但不写入
    }
  });
}

const config = readonly({ debug: true });
config.debug = false; // 警告 + 无效
```

---

## 五、案例：虚拟属性（不存在但可访问）

```js
const user = {
  firstName: "John",
  lastName: "Doe",
};

const proxy = new Proxy(user, {
  get(target, prop) {
    if (prop === "fullName") {
      return `${target.firstName} ${target.lastName}`;
    }
    return Reflect.get(target, prop);
  }
});

console.log(proxy.fullName); // John Doe
```

## 六、案例：属性访问控制（模拟 private）

```js
const secure = new Proxy({}, {
  get(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error(`Access denied to private property ${prop}`);
    }
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    if (prop.startsWith('_')) {
      throw new Error(`Cannot set private property ${prop}`);
    }
    return Reflect.set(target, prop, value);
  }
});

secure.name = "Alice";
console.log(secure.name); // Alice
secure._token = "abc"; // ❌ 报错
```

> ✅ 类比 C++ 的 `private` 成员 —— 虽然不是强类型保护，但至少是运行时“保护墙”。

---

## 七、Proxy + Reflect 实现双向数据绑定（简版）

```js
// 用 Proxy 包了一下对象，只要你给它赋值，我就能监控到，并且调用你给的回调函数
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const old = target[prop];
      const result = Reflect.set(target, prop, value);
      if (old !== value) {
        onChange(prop, value);
      }
      return result;
    }
  });
}

const state = reactive({ count: 0 }, (prop, val) => {
  console.log(`State changed: ${prop} -> ${val}`);
});

state.count++; // 输出：State changed: count -> 1
```

> ✅ 类比 Vue 的响应式原理，用 Proxy 拦截并追踪变化。

---

## 八、Reflect API 总览

`Reflect` 是 JavaScript 的“原始操作集合”，提供以下方法：

| Reflect 方法 | 类似原始操作 | 说明 |
|--------------|--------------|------|
| `get()` | obj[prop] | 获取属性值 |
| `set()` | obj[prop] = val | 设置属性值 |
| `has()` | prop in obj | 属性存在性判断 |
| `deleteProperty()` | delete obj[prop] | 删除属性 |
| `ownKeys()` | Object.keys/Reflect.ownKeys | 所有键（含 symbol） |
| `getPrototypeOf()` | Object.getPrototypeOf | 获取原型 |
| `setPrototypeOf()` | Object.setPrototypeOf | 设置原型 |
| `defineProperty()` | Object.defineProperty | 定义属性 |
| `apply()` | fn.apply(thisArg, args) | 函数调用 |
| `construct()` | new fn(...args) | 构造函数调用 |

---

## 九、应用场景小结

| 场景 | 描述 |
|------|------|
| 日志跟踪 | 拦截所有访问、修改行为 |
| 数据绑定 | Vue/React 等响应式库基础原理 |
| 表单验证 | 拦截 `set` 并做合法性检查 |
| 保护属性 | 实现“私有成员”语义 |
| 动态属性 | 虚拟属性、懒加载等 |
| 调试工具 | 动态 Hook 所有操作进行监控 |
| 元编程工具 | 创建可自描述、可变行为的对象模型 |

---

## 十、结语

`Proxy` 和 `Reflect` 把 JavaScript 的对象系统从“被动接受”变成了“主动定制”。你可以像写中间件一样定制属性访问行为，像写编译器一样重定义操作语义。

> 对于系统程序员来说，Proxy 就像是给每个对象插了一层“钩子链表”；Reflect 就像是 `default_handler()`，你可以选择是否调用它。

在未来，你会在 Vue 3、MobX、Immer、Mock 框架、沙箱环境等地方看到 Proxy 的大量使用。掌握它，就像掌握了 JS 对象系统的“操作系统内核”。
