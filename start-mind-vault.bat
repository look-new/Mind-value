@echo off
REM 启动 MindVault 本地开发服务器并打开浏览器

REM 切换到当前批处理文件所在目录（即 mind-vault 项目根目录）
cd /d %~dp0

REM 先在默认浏览器中打开地址
start "" http://localhost:5173

REM 启动 Vite 开发服务器（保持窗口打开）
npm run dev




