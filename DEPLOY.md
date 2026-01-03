# 部署到 GitHub Pages 的步骤

## 1. 在 GitHub 上创建新仓库

1. 访问：https://github.com/new
2. 仓库名称：`Science`（必须！这样 URL 才会是 `https://leovibe.github.io/Science/`）
3. 设置为 **Public**（GitHub Pages 免费版需要）
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

## 2. 推送代码到 GitHub

在终端执行以下命令：

```bash
cd /Users/s389080/Documents/文件\ -\ NM389080/miaw/Cursor/Science-Standalone

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/LeoVibe/Science.git

# 推送代码
git push -u origin main
```

## 3. 设置 GitHub Pages

1. 访问：https://github.com/LeoVibe/Science/settings/pages
2. 在 "Source" 部分，选择：**GitHub Actions**
3. 点击 "Save"

## 4. 等待部署完成

1. 访问：https://github.com/LeoVibe/Science/actions
2. 等待 "Deploy to GitHub Pages" 工作流完成（绿色勾号）
3. 等待 1-2 分钟让 GitHub Pages 更新

## 5. 访问网站

访问：**https://leovibe.github.io/Science/**

---

## 如果遇到问题

### 问题：仓库已存在
如果 `Science` 仓库已存在，可以：
- 使用其他名称，如 `Science-Quiz` 或 `Elementary-Science`
- 或者删除现有仓库后重新创建

### 问题：推送失败
检查：
- GitHub 用户名是否正确
- 是否有推送权限
- 网络连接是否正常

### 问题：还是 404
确保：
- GitHub Pages Source 设置为 "GitHub Actions"
- GitHub Actions 工作流成功运行
- 等待足够的时间（3-5 分钟）
- 清除浏览器缓存

