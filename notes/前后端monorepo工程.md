# 前后端monorepo工程

> 引言：为什么选择 pnpm + Monorepo
>
> 在现代全栈开发中，我们经常需要同时管理前端和后端项目。传统的多仓库管理方式会导致：
>
> - 依赖重复安装
> - 版本同步困难
> - 协作效率低下

pnpm 与 Monorepo 的结合完美解决了这些问题。本文将带你全面掌握从初始化到高级优化的完整工作流。

## 1. 项目初始化与架构设计

### 1.1 创建项目根结构

```bash
mkdir fullstack-monorepo && cd fullstack-monorepo
pnpm init
```

### 1.2 工作区配置文件

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - "frontend"
  - "backend"
  - "packages/*"  # 共享工具库
  - "infra"       # 基础设施代码
```

### 1.3 标准化目录结构

典型的例子：

```bash
.
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── frontend/       # 前端项目
├── backend/        # 后端项目
├── packages/       # 共享库
│   ├── configs/    # 通用配置
│   └── utils/      # 工具函数
└── infra/          # 部署配置
```

## 2. 前端项目初始化（Vue + Vite 示例）

### 2.1 规范创建流程

```bash
# 推荐方式：保持工作区上下文，在根目录执行
pnpm create vite frontend --template vue

# 等效替代方案（不推荐）：
# cd frontend && pnpm install
```

### 2.2 依赖安装规范

举例如下：

```bash
# 添加生产依赖，这里 -F 和 --filter 是等效的
pnpm add vue-router pinia -F frontend

# 添加开发依赖，这里 -D 和 --save-dev 是等效的, 表示只在开发环境使用
pnpm add -D @types/node -F frontend
```

### 2.3 特殊工具配置（TailwindCSS）

```bash
# 推荐方式（保持工作区上下文）
pnpm add -D tailwindcss postcss autoprefixer -F frontend
pnpm -F frontend exec tailwindcss init -p

# 替代方案（进入frontend子目录），不推荐
# cd frontend && pnpm dlx tailwindcss init -p && cd ..
```

## 3. 后端项目初始化（Node.js + Express 示例）

### 3.1 规范创建流程

```bash
# 推荐方式：使用工作区命令
pnpm create express-backend backend  # 假设有自定义模板
# 也可以自己标准初始化
mkdir backend && pnpm -C backend init

# 替代方案，进入子目录初始化，不推荐
# mkdir backend && cd backend && pnpm init
```

### 3.2 依赖安装规范

```bash
# 添加生产依赖
pnpm add express cors -F backend

# 添加开发依赖，@types 是一个作用域名称，表示这个包属于types组织维护
pnpm add -D @types/express nodemon -F backend

# 添加共享工具
pnpm add @monorepo/utils -F backend  # 来自 packages/utils
```

### 3.3 启动脚本配置

在 `backend/package.json` 中：

```js
{
  "scripts": {
    // NODE_ENV=production：设置环境变量为生产模式（优化性能、禁用调试日志等）。
    "start": "NODE_ENV=production node src/index.js",
    // nodemon：监控文件变动的工具，修改代码后自动重启应用
    // --watch src：只监听 src/ 目录下的文件变化
    "dev": "nodemon --watch src src/index.js"
  }
}
```

## 4. 共享工具库的创建与使用

```bash
# -w (--workspace-root) 意思是在根目录安装
# 并且有了-w参数，在 frontend/backend 目录下也可以使用 pnpm add, 效果仍然是安装到根目录
pnpm add -wD concurrently
```

我个人也会在根目录下创建 scripts 目录，存放一些常用的脚本， 也可以直接启动工程啥的。

## 5. 依赖管理高级策略

### 5.1 依赖类型处理矩阵

| 依赖类型       | 安装位置      | 命令示例                      | 说明                     |
|----------------|-------------|-----------------------------|-------------------------|
| 全局工具       | 根目录       | `pnpm add -D typescript -w` | 如 ESLint、Jest 等       |
| 前端专属依赖   | frontend    | `pnpm add vue -F frontend`  | 框架、组件库等           |
| 后端专属依赖   | backend     | `pnpm add express -F backend` | 运行时依赖              |

### 5.2 版本锁定策略

在根目录 `package.json` 中：

```json
"pnpm": {
  "overrides": {
    "react": "18.2.0",
    "typescript": "~5.0.4"
  }
}
```

### 5.3 依赖清理与重建

```bash
# 会递归删除​当前目录及所有子目录​ 下的 node_modules 文件夹，然后清理
rm -rf **/node_modules && pnpm store prune

# 安全重建，强制 ​严格依赖 lockfile（pnpm-lock.yaml）​，避免意外更新依赖版本。
pnpm install --frozen-lockfile
```

## 6. 工作流优化实践

### 6.1 脚本执行策略

| 场景                  | 推荐命令                                  | 说明                          |
|-----------------------|-----------------------------------------|-----------------------------|
| 开发前端              | `pnpm --filter frontend run dev`        | 单独启动                    |
| 开发后端              | `pnpm --filter backend run dev`         | 单独启动                    |
| 全栈开发              | `pnpm dev`                            | 用 ``concurrently`` 并行启动   |
| 运行共享工具          | `pnpm --filter utils run build`         | 构建工具包                  |
| 执行临时命令          | `cd frontend && pnpm dlx ...`           | 快速原型开发                |

### 6.2 自定义脚本示例

根目录 `package.json`：

```js
{
  "scripts": {
    "dev": "concurrently -c \"bgBlue.bold,bgGreen.bold\" -n \"FRONTEND,BACKEND\" \"pnpm -F frontend run dev\" \"pnpm -F backend run dev\"",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint"
  }
}
```

也可以写个shell脚本，去调用，更加方便复杂逻辑。推荐。

```js
{
  "scripts": {
    "dev": "./scripts/run.sh dev",
    "build": "./scripts/run.sh build",
    "test": "./scripts/run.sh test",
    "lint": "./scripts/run.sh lint"
  }
}
```

### 6.3 IDE 配置建议

`.vscode/settings.json`：

```js
{
  "eslint.workingDirectories": [
    "frontend",
    "backend"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 7 样式指南与代码共享

### 7.1 共享配置方案

```bash
packages/
└── configs/
    ├── eslint-config/
    ├── tsconfig/
    └── stylelint-config/
```

### 7.2 引用方式

```js
// frontend/package.json
{
  "devDependencies": {
    "@monorepo/eslint-config": "workspace:*"
  }
}
```

## 结论：何时选择哪种方式？

### 推荐策略矩阵

| 场景                 | 推荐方式          | 示例                          | 理由                     |
|----------------------|-----------------|-----------------------------|-------------------------|
| 团队协作项目          | 严格 --filter   | `pnpm add -D jest -F frontend` | 保证一致性              |
| 个人快速原型          | cd + 本地安装    | `cd frontend && pnpm add ...`  | 开发速度快             |
| 生产环境准备          | 清理重建         | `rm -rf node_modules && pnpm install` | 确保纯净环境          |
| CI/CD 流水线         | --frozen-lockfile | `pnpm install --frozen-lockfile` | 可重复构建           |

### 最终建议

1. **新项目**：严格遵循 `--filter` 规范
2. **已有项目迁移**：渐进式采用，先 `cd` 后逐步改造
3. **混合使用原则**：
   - 长期依赖用 `--filter`
   - 临时调试用 `cd`
   - 最终通过 `pnpm install` 统一状态

通过这套方法论，你既能享受 pnpm 工作区的高效，又能保持开发的灵活性。  
记住：好的工程规范应该服务于开发效率，而不是束缚生产力。
