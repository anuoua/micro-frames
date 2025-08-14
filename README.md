# Micro Frames

这是一款基于 iframe 的，超级简单易用的微前端框架，几乎不存在兼容性问题。

## 核心原理

这是一套针对经典后台管理页面设计的微前端框架，它可能并不适用于所有的项目。

这里的经典后台管理页面，指的是拥有**页头**或者**侧边栏**的经典页面布局的**使用鼠标操作的**后台管理页面。

我们为这类页面设计了一套简单易用的框架，核心就是，**覆盖全窗口的 iframe 动态调整层级**。

在鼠标移动到页头和侧边栏的时候，将页头和侧边栏的 z-index 提高，
高于 iframe 层，那么主应用的 UI 就可以正常操作了， 本身主应用的悬浮 UI 比如模态框等就比 iframe 层高，不会被 iframe 遮挡。

当鼠标回到 iframe 内部的时候，将页头和侧边栏的 z-index 降低，iframe 将全屏覆盖显示，模块的悬浮 UI 比如模态框等不会被遮挡。
同时，在 iframe 内部的 header 和 sidebar 区域是透明的，用于透出下层覆盖的主应用 UI。

<img width="1404" height="444" alt="截屏2025-07-21 00 39 35" src="https://github.com/user-attachments/assets/d89df225-4c3d-4fd0-8c81-14423ebc47ee" />

## 安装

```shell
npm i micro-frames
```

## 使用

框架分为主应用和模块两套逻辑

## 主应用

安装 micro-frames ,在应用启动最初阶段初始化

```js
import { init } from "micro-frames/main-frame";

init();
```

初始化会 hack window.history（无感），同时注册 mcf-mainframe、mcf-iframe 两个 web component，然后使用它们构建主应用。

```html
<mcf-mainframe header-height="50" side-width="200">
  <div slot="header">Header</div>
  <div slot="sidebar">Sidebar</div>
  <div slot="frames">
    <mcf-iframe src="http://localhost:8080/" active></mcf-iframe>
    <mcf-iframe src="http://localhost:8081/" ></mcf-iframe>
  </div>
</mcf-mainframe>
```

header-height 和 side-width 为 0 时，相关部分可以隐藏。

header-height 和 side-width 会同步给模块内部的 mcf-moduleframe 组件， 用于同步界面布局。

mcf-iframe 就是模块的 iframe ，组件挂载后就会立即加载模块，而 active 表示当前模块激活并显示。

你可以自己控制什么时候加载，什么时候激活，预加载和保活机制的实现你可以完全掌控。

## 模块

模块的接入也是类似，先安装 micro-frames 。

在应用启动最初阶段初始化，建议新增一个入口，因为模块初始化是异步的，这里使用 entry.js 表示。

初始化后会 hack window.history（无感），同时会注册 mcf-moduleframe 这个 web components。

```js
// entry.js
import { init } from "micro-frames/module-frame"

init({ prefix: "/module-1" }).then(() => import("./main.js"))
```

使用 mcf-moduleframe 包裹应用，里面放内容，它会自动留出页头和侧边栏的空间。

> 部分应用（比如 antd pro-components 的页面布局）使用 fixed 定位，需要自己改一下样式， 一般改成 absolute 定位，再修改一些样式就能正常定位到内容区域。

```html
<mcf-moduleframe>
  <div>
    Content
  </div>
</mcf-moduleframe>
```

## API

- micro-frame/main-frame：主应用
  - init：初始化
- micro-frame/module-frame：模块
  - init：初始化
- micro-frame/protocol： 跨 iframe 通信协议，基于 framebus 库
  - CookieStore2：全局（主应用）的 cookie 的相关方法和事件
  - SessionStore：全局（主应用）的 sessionStorage 存储相关方法和事件
  - LocalStore：全局（主应用）的 localStorage 存储相关方法和事件
  - Nav：全局（路由导航）相关方法和事件
  - Frame：主-模块，同步框架相关方法和事件
  - MemoryStore：全局（主应用）的内存存储相关方法和事件
  - Public：向全局暴露公共的 framebus 实例，可以在 主-模块 之间自行扩展使用

## Done
