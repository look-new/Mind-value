# MindVault（思维金库）

MindVault 是一个纯前端的个人知识库工具（HTML + CSS + JavaScript），用于收藏文章、视频、音频和短内容，并借助 DeepSeek 生成摘要与标签。

## 功能特性

- 添加/编辑/删除资源（文章、视频、音频、推文/短内容）
- 本地搜索、类型筛选、标签筛选、时间排序
- 资源笔记编辑与保存
- JSON 导入 / 导出
- 可选接入 DeepSeek API 自动生成摘要与标签

## 本地运行

```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 构建静态文件

```bash
npm run build
```

构建结果输出到 `dist/` 目录。

## DeepSeek API Key 配置（可选）

可任选一种方式：

1. 浏览器控制台设置：

```js
localStorage.setItem('mindvault_deepseek_api_key', '你的API密钥')
```

2. 在 `index.html` 的 `<head>` 中注入：

```html
<script>window.MINDVAULT_DEEPSEEK_API_KEY = '你的API密钥';</script>
```

未配置 API Key 时，应用会回退到本地默认摘要，不影响基础功能。
