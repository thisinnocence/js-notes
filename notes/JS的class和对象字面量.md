# JS的class和对象字面量

## 一、现代 JavaScript 的 class并不“类”比

ES2022（ECMAScript 13）把 `class` 玩得越来越像“正经语言”了，先来看一眼现代 JS 的类定义：

```js
class Animal {
  #name; // 私有字段，ES2022 新语法

  constructor(name) {
    this.#name = name;
  }

  speak() {
    console.log(`${this.#name} makes a sound.`);
  }

  static kingdom() {
    return 'Animalia';
  }
}
```

看起来是不是很像 C++ 或 Java 的类？  
别被外表骗了，底子里还是熟悉的 JavaScript。

---

## 二、JS 的类实现原理

JavaScript 的 `class` 是**语法糖**，背后还是基于 **原型链（prototype chain）** 的对象模型。用 C++ 的视角看，它更像是函数指针表加结构体的自由结合体。

我们“手撕糖衣”，还原原型：

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound.`);
};
```

这段代码与使用 `class` 定义的效果完全等价。  
JS 的 `class`，只是让你**写得舒服，看得懂，骗骗强类型出身的自己**。

---

## 三、私有字段（#）：终于正经了

ES2022 引入了 **真正私有字段** 的机制，语法上用 `#` 前缀定义成员：

```js
class Secret {
  #value = 42;

  getValue() {
    return this.#value;
  }
}
```

尝试访问 `obj.#value` 会直接报语法错误。  
不像早期那种靠 `_secret` 命名约定的“私有变量”，这是真封闭、真安全，编译阶段就拦你。

这下私密信息终于不用靠“自觉”保护了。

---

## 四、继承：JS 的“基类”情结

继承的写法很像 C++：

```js
class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks.`);
  }
}
```

但是等等，这里有坑：

- 如果 `Animal` 的 `#name` 是私有字段，`Dog` 访问不到它！不像 C++ 中 `protected` 成员对子类可见。
- JS 的 `#` 私有字段是 **类私有**（per-class），连子类都无权访问，别说 friend。

所以建议用 getter/setter 提供可控访问：

```js
class Animal {
  #name;
  constructor(name) { this.#name = name; }
  get name() { return this.#name; }
}
```

让封装和继承之间有个缓冲区。

---

## 五、实例方法与共享内存：JS 的 prototype 哲学

JavaScript 的类方法默认都挂在原型上，这意味着：

- 所有实例共享方法地址，节省内存；
- 方法内部通过 `this` 引用各自的实例字段。

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }

  print() {
    console.log(`Count is ${this.count}`);
  }
}
```

调用 `c1.increment()`，其实是从原型链里找到 `increment`，再以 `this = c1` 执行。  
这和你 C++ 里 vtable + this 指针那套思路，不谋而合。

---

## 六、“对象字面量”：自由版 `struct`

你一定见过这种结构：

```js
const user = {
  name: 'Alice',
  age: 30,
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};
```

这是不是像极了 C 的 `struct`？  又像 Python 的 `dict`？  
但它还能带方法、动态添加属性，灵活得不像话。

- ✅ 支持字段定义
- ✅ 支持方法（函数）定义
- ✅ 可以随时添加/修改属性
- ✅ 支持点语法或中括号访问

和 `class` 的主要区别：

| JS 对象字面量     | class 实例     |
|------------------|----------------|
| 无构造函数       | 有 constructor |
| 无继承机制       | 支持继承       |
| 属性默认公开     | 支持私有字段   |
| 实例即定义       | 需要模板构造   |

一个像一次性 `struct`，一个像模板化 `class`，看你怎么用。

想实例化多个想通对象，那需要class。  
或者字面量对象封装工厂函数(最灵活)：

```js
function createUser(name, age) {
  return {
    name,
    age,
    greet() {
      console.log(`Hi, I'm ${this.name}`);
    }
  };
}

const user1 = createUser('Alice', 30);
const user2 = createUser('Bob', 25);

user1.greet(); // Hi, I'm Alice
user2.greet(); // Hi, I'm Bob
```

JavaScript 中，对象字面量其实就是创建一个“哈希表对象”，带有一个默认原型 `Object.prototype`，其行为基本等价于：

```js
const user = new Object();
user.name = 'Alice';
user.age = 30;
```

每个属性实际上存储在一个内部的键值映射表中（底层实现可以是哈希表或类哈希结构），并自动附带了一些默认方法，如 `toString()` 等。

JS 对象还有一个隐藏的 `[[Prototype]]` 属性，支撑它的原型继承系统。

字面量对象的用法建议：

- ✅ 用 `Object.freeze(obj)` 创建只读配置对象
- ✅ 使用方法定义逻辑行为，保持数据与操作耦合
- ✅ 结合解构赋值 / 默认参数提升可读性
- ❌ 不要滥用动态属性，保持结构可预测

---

## 六、写 JS 也讲“工程味”

- ✅ 构造函数只负责初始化  
构造里不要写副作用代码，别干 IO、别调接口，让构造保持纯粹。
- ✅ 使用 `#` 私有字段  
别再用 `_value` 这种约定，`#value` 才是 ES 的正道。
- ✅ 把无状态方法写成 `static`  
不依赖实例状态的函数，比如工具方法，全都写成 `static`，利于封装与测试。
- ✅ 组合优于继承  
JS 不支持多继承，但可以用组合模式优雅实现复用逻辑，告别“菱形继承”。
