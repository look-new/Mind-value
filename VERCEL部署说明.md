# Vercel 部署说明

## 问题：404 错误的原因

Vercel 出现 404 通常是因为：
1. **输出目录配置错误** - Vercel 不知道构建后的文件在哪里
2. **路由配置错误** - React 单页应用需要重写规则
3. **只上传了 dist 文件夹** - 应该上传整个项目让 Vercel 自动构建

## 解决方案

### 方案一：上传整个项目（推荐）

**步骤：**
1. 将整个项目（不是 dist 文件夹）上传到 GitHub
2. 在 Vercel 中导入 GitHub 仓库
3. Vercel 会自动检测到 Vite 项目
4. 确保配置如下：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. 项目根目录已经有 `vercel.json` 配置文件，会自动处理路由

### 方案二：只上传 dist 文件夹（不推荐，但可行）

如果只上传了 dist 文件夹：

1. 在 dist 文件夹中创建 `vercel.json`：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. 在 Vercel 项目设置中：
   - **Root Directory**: 留空或填 `dist`
   - **Build Command**: 留空（不需要构建）
   - **Output Directory**: 留空

### 方案三：修复现有部署

如果已经部署但出现 404：

1. **检查 Vercel 项目设置**：
   - 进入 Vercel 项目 → Settings → General
   - 确认 "Output Directory" 设置为 `dist`
   - 确认 "Build Command" 设置为 `npm run build`

2. **添加 vercel.json**（如果还没有）：
   - 在项目根目录创建 `vercel.json`
   - 内容如下：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

3. **重新部署**：
   - 在 Vercel 中点击 "Redeploy"

## 验证部署

部署成功后，访问你的 Vercel 链接，应该能看到：
- ✅ 页面正常显示
- ✅ 可以添加资源
- ✅ 数据保存在浏览器 LocalStorage 中

## 常见问题

**Q: 为什么需要 rewrites？**
A: React 是单页应用（SPA），所有路由都由前端处理。rewrites 确保所有路径都返回 index.html，让 React Router 处理路由。

**Q: 构建失败怎么办？**
A: 检查：
- package.json 中是否有 build 脚本
- 是否有 TypeScript 错误
- 查看 Vercel 构建日志

**Q: 部署后样式丢失？**
A: 检查 vite.config.ts 中的 base 配置，确保是 `'./'` 或 `/`

