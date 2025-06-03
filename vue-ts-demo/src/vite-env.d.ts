/**
 * 该文件是 TypeScript 声明文件，用于为 Vite 项目提供类型声明支持。
 * 它可以帮助 TypeScript 编译器识别 Vite 相关的模块和类型，
 * 从而提供更好的类型检查和代码提示。
 * .d 后缀表示这是一个声明文件(Declaration File)​
 *
 * 这里的 "/// <reference types="vite/client" />" 是一种特殊的 TypeScript 指令，
 * 称为“三斜线指令”。它用于告诉 TypeScript 编译器，
 * 引用名为 "vite/client" 的类型声明文件。
 *
 * 这种方式主要用于引入全局的类型定义，
 * 使得在代码中可以直接使用 Vite 客户端相关的类型，而无需显式地 import。
 *
 *  "<reference types="vite/client" />"  中的 "<>" 并不是 TypeScript 的常规编程语法，
 *  而是三斜线指令的一部分，用于指定引用的类型声明文件的名称。
 *  在这里，它告诉 TypeScript 编译器去查找名为 "vite/client" 的类型声明文件。
 */

/// <reference types="vite/client" />

// TypeScript 的模块声明，专门用于处理 .vue 单文件组件（SFC）的类型支持
// 告诉 TypeScript "所有以 .vue 结尾的导入，都应该被视为 Vue 组件"
// 这使得在 TypeScript 中使用 Vue 单文件组件时，能够获得类型检查和代码提示的支持
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  
  // DefineComponent 是 Vue 提供的类型工具，用于定义组件类型
  // 泛型参数说明（按顺序）：
  // 1. Props 类型（这里用 {} 表示无 props）
  // 2. Data 类型（这里用 {} 表示空 data）
  // 3. Methods/Computed/其他组件选项类型（any 表示允许任意类型）
  const component: DefineComponent<{}, {}, any>
  export default component
}
