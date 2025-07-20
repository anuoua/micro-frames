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

然后在应用内使用已注册的 web components，构建自己的主应用，header-height 和 side-width 为 0 时，相关部分可以隐藏。

header-height 和 side-width 会同步给模块内部的 mcf-moduleframe， 保持界面布局。

mcf-iframe 就是模块的 iframe ，这里的逻辑是渲染后既加载模块，active 既激活显示，你需要自定义加载逻辑和激活显示逻辑，更高级的预加载和保活也全部由你自己定义。

```html
<mcf-mainframe header-height="50" side-width="200">
  <div slot="header">Header</div>
  <div slot="sidebar">Sidebar</div>
  <div slot="frames">
    <mcf-iframe src="http://localhost:8080/" baseurl="/module-1" active></mcf-iframe>
    <mcf-iframe src="http://localhost:8081/" baseurl="/module-2"></mcf-iframe>
  </div>
</mcf-mainframe>
```

## 模块

模块的接入也是类似，先安装 micro-frames ，在应用启动最初阶段初始化，建议新增一个入口，因为模块初始化是异步的。

```js
// entry.js
import { init } from "micro-frames/module-frame"

init({ baseURL: "/module-1" }).then(() => import("./main.js"))
```

然后在应用内使用已注册的 web components，构建自己的模块，使用 mcf-moduleframe，其内部就是不包含页头和侧边栏的内容。

> 部分应用（比如 antd pro-components 的页面布局）使用 fixed 定位，需要自己改一下样式， 一般改成 absolute 定位，再修改一些样式就能正常定位到内容区域。

```html
<mcf-module>
  <div>
    Content
  </div>
</mcf-module>
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
