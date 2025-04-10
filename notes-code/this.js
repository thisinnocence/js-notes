/* `this` 关键字
https://zh.javascript.info/object-methods

`this` JavaScript 中的 `this` 可以用于任何函数，即使它不是对象的方法。
`this` 的值是在代码运行时计算出来的，它取决于代码上下文。
    好处：更灵活；坏处：易出错
在 *没有对象* 的情况下调用：this == undefined
*/
let user = { name: "John" };
let admin = { name: "Admin" };
function sayHi() {
  console.log( this.name );
}
// 在两个对象中使用相同的函数
user.f = sayHi;
admin.f = sayHi;
// 这两个调用有不同的 this 值
// 函数内部的 "this" 是“点符号前面”的那个对象
user.f(); // John（this == user）
admin.f(); // Admin（this == admin）


// 箭头函数没有自己的 `this`
let user2 = {
    firstName: "Ilya",
    sayHi() {
      // 显然，这里不是用 obj.method() 的形式来调用的箭头函数，但是这里this就是外部的this
      let arrow = () => console.log(this.firstName); // Ilya
      arrow();
    }
};
user2.sayHi();
// 箭头函数对比非箭头函数，关于 `this` 的区别点
let user3 = {
    firstName: "",
    sayHi() {
      // 显然，这里用了普通的函数(拥有this需要动态绑定), 但是没有用 obj.method() 的形式调用，就undefine了
      function test() {
        console.log(this.firstName); // undefined
      }
      test();
    }
};
user3.sayHi();


// just practice
function makeUser() {
  return {
    name: "John",
    ref: this
  };
}
let user5 = makeUser();
console.log( user5.ref.name );  // undefined，还是根据所在函数的调用方式来定
let tt = {t : makeUser};
console.log( tt.t().ref.t); // [Function: makeUser], 函数被赋值给了对象的属性方法并调用了，this动态绑定


// `call` 和 `bind` 对 `this` 的动态绑定
let user6 = {
  name: "Alice",
  greet: function (age) {
    console.log(`${this.name} is ${age} years old.`);
  }
};
let anotherUser = { name: "Bob" };
// 使用 call 显式绑定 this 为 anotherUser，传入参数
// call 方法将 greet 函数的 this 绑定到 anotherUser，并传入参数 30, 并且立即调用
user6.greet.call(anotherUser, 30); // Bob is 30 years old.
//
// 对比 bind, bind：返回一个新的函数，绑定 this，但是不会立即调用。
let anotherUser2 = { name: "Dave" };
// 使用 bind 绑定 this 为 anotherUser
let greetDave = user6.greet.bind(anotherUser2);
greetDave(40); // Dave is 40 years old.
