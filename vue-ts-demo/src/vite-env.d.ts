/**
 * 该文件是 TypeScript 声明文件，用于为 Vite 项目提供类型声明支持。
 * 它可以帮助 TypeScript 编译器识别 Vite 相关的模块和类型，
 * 从而提供更好的类型检查和代码提示。
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
