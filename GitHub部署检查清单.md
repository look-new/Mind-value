# GitHub 部署检查清单

## ✅ 项目能否在 GitHub 上运行？

**答案：可以！** 项目已经配置好了自动部署。

## 📋 部署前检查清单

### 1. 必需的支持（GitHub 自动提供）

✅ **Node.js 环境**
- GitHub Actions 会自动安装 Node.js 20
- 无需手动配置

✅ **依赖安装**
- 所有依赖都在 `package.json` 中
- GitHub Actions 会自动运行 `npm ci` 安装依赖
- 包括：React、TypeScript、Vite、lucide-react 等

✅ **自动构建**
- 工作流会自动运行 `npm run build`
- 生成 `dist` 文件夹

✅ **自动部署**
- 自动部署到 GitHub Pages
- 无需手动操作

### 2. 需要手动配置的（只需一次）

#### ⚙️ 启用 GitHub Pages

1. 进入 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Source** 中选择：
   - **Source**: `GitHub Actions`
4. 保存

#### 🔑 可选：DeepSeek API Key（可选）

如果需要 AI 摘要功能：

1. 进入 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加：
   - **Name**: `VITE_DEEPSEEK_API_KEY`
   - **Value**: 你的 DeepSeek API Key
5. 修改 `.github/workflows/deploy.yml`，在 Build 步骤添加：
   ```yaml
   - name: Build
     env:
       VITE_BASE_PATH: /${{ github.event.repository.name }}/
       VITE_DEEPSEEK_API_KEY: ${{ secrets.VITE_DEEPSEEK_API_KEY }}
     run: npm run build
   ```

**注意**：不配置 API Key 也能运行，只是 AI 功能会使用默认摘要。

### 3. 外部依赖（需要网络访问）

✅ **CDN 资源**（自动加载，无需配置）
- Tailwind CSS CDN：`https://cdn.tailwindcss.com`
- Google Fonts：`https://fonts.googleapis.com`

✅ **数据存储**（无需后端）
- 所有数据保存在浏览器 LocalStorage
- 无需数据库或后端服务器
- 每个用户的数据独立存储

### 4. 部署流程

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **GitHub Actions 自动运行**
   - 检测到 push 到 main/master 分支
   - 自动触发部署工作流
   - 安装依赖 → 构建项目 → 部署到 GitHub Pages

3. **访问网站**
   - 部署完成后，访问：`https://你的用户名.github.io/仓库名/`
   - 例如：`https://username.github.io/mind-vault/`

## 🎯 总结

### ✅ 不需要的：
- ❌ 服务器
- ❌ 数据库
- ❌ 后端代码
- ❌ 手动构建
- ❌ 手动部署

### ✅ 需要的：
- ✅ GitHub 账号（免费）
- ✅ 启用 GitHub Pages（一次设置）
- ✅ 推送代码到 GitHub
- ✅ 网络连接（访问 CDN）

### ⚙️ 可选的：
- ⚙️ DeepSeek API Key（用于 AI 功能）

## 🚀 快速开始

1. **创建 GitHub 仓库**
2. **推送代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - Settings → Pages → Source: GitHub Actions

4. **等待部署完成**（约 1-2 分钟）

5. **访问网站**

## ⚠️ 注意事项

1. **仓库名称会影响 URL**
   - 如果仓库名是 `mind-vault`，URL 是 `https://username.github.io/mind-vault/`
   - 工作流会自动设置正确的 base path

2. **首次部署可能需要几分钟**
   - GitHub Actions 需要安装依赖和构建

3. **数据是本地存储**
   - 每个用户的数据保存在自己的浏览器中
   - 清除浏览器数据会丢失数据
   - 建议定期导出 JSON 备份

4. **HTTPS 自动启用**
   - GitHub Pages 自动提供 HTTPS
   - 无需额外配置

