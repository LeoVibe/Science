# GitHub Pages 部署设置说明

## 问题诊断

根据检查，GitHub Pages 无法正确运作的原因：

1. ✅ **代码已更新** - 所有最新代码已推送到 GitHub
2. ✅ **Vite 配置已更新** - `vite.config.js` 已设置正确的 base 路径：`/NexusLab/Science/`
3. ⚠️ **需要构建项目** - GitHub Pages 需要构建后的文件（`dist/` 目录）
4. ⚠️ **需要配置 GitHub Pages** - 需要设置正确的部署源

## 解决方案

### 方法 1：使用 GitHub Actions 自动部署（推荐）

#### 步骤 1：更新 GitHub 个人访问令牌权限

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 编辑或创建新的令牌，确保勾选以下权限：
   - ✅ `repo` (完整仓库访问权限)
   - ✅ `workflow` (更新 GitHub Actions 工作流)

#### 步骤 2：在 GitHub 上手动创建 GitHub Actions 工作流

1. 访问仓库：https://github.com/LeoVibe/NexusLab
2. 点击 "Actions" 标签
3. 点击 "New workflow"
4. 选择 "Set up a workflow yourself"
5. 将文件命名为 `deploy.yml`
6. 复制以下内容：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'Science/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'Science/package-lock.json'

      - name: Install dependencies
        run: npm ci
        working-directory: ./Science

      - name: Build
        run: npm run build
        working-directory: ./Science

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './Science/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

7. 点击 "Start commit" 提交工作流

#### 步骤 3：配置 GitHub Pages 设置

1. 访问仓库 Settings → Pages
2. 在 "Source" 部分，选择：
   - **Source**: `GitHub Actions`
3. 保存设置

### 方法 2：手动构建并部署（临时方案）

如果无法使用 GitHub Actions，可以手动构建并提交 `dist` 目录：

```bash
# 在 Science 目录中
cd Science
npm install
npm run build

# 将 dist 目录的内容复制到仓库根目录的 docs/ 或 gh-pages 分支
# 然后在 GitHub Pages 设置中选择该目录作为源
```

## 验证部署

部署成功后，访问：https://leovibe.github.io/NexusLab/Science/

应该能看到：
- ✅ 新的界面（有"國小自然科 題庫練習"标题）
- ✅ 统计和错题按钮在 header 中
- ✅ 基本挑戰和高級挑戰按钮可以正常点击

## 当前配置状态

- ✅ **Git 用户信息**：
  - 用户名：`LeoVibe`
  - 邮箱：`leoshih94@gmail.com`

- ✅ **远程仓库**：
  - URL：`https://github.com/LeoVibe/NexusLab.git`
  - 分支：`main`

- ✅ **Vite 配置**：
  - Base 路径：`/NexusLab/Science/`
  - 构建输出：`dist/`

- ⚠️ **需要操作**：
  - 设置 GitHub Pages 部署源
  - 启用 GitHub Actions（如果需要自动部署）

## 故障排除

如果部署后仍然看到旧版本：

1. **清除浏览器缓存**：按 `Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)
2. **检查 GitHub Actions**：在仓库的 "Actions" 标签中查看构建状态
3. **检查 GitHub Pages 设置**：确保选择了正确的部署源
4. **等待几分钟**：GitHub Pages 更新可能需要几分钟时间

## 参考链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#github-pages)










