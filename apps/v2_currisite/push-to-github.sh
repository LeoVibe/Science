#!/bin/bash

# 推送到 GitHub 的脚本

echo "🚀 准备推送到 GitHub..."
echo ""
echo "⚠️  重要：请先在 GitHub 上创建名为 'Science' 的仓库"
echo "   访问：https://github.com/new"
echo "   仓库名称：Science"
echo "   设置为 Public"
echo "   不要初始化 README"
echo ""
read -p "按 Enter 继续，或 Ctrl+C 取消..."

cd "$(dirname "$0")"

# 检查是否已有远程仓库
if git remote | grep -q origin; then
    echo "✅ 远程仓库已配置"
    git remote -v
else
    echo "📝 添加远程仓库..."
    git remote add origin https://github.com/LeoVibe/Science.git
fi

echo ""
echo "📤 推送到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📋 下一步："
    echo "1. 访问：https://github.com/LeoVibe/Science/settings/pages"
    echo "2. 设置 Source 为：GitHub Actions"
    echo "3. 点击 Save"
    echo "4. 等待部署完成（1-2 分钟）"
    echo "5. 访问：https://leovibe.github.io/Science/"
else
    echo ""
    echo "❌ 推送失败！"
    echo "请检查："
    echo "1. 是否已在 GitHub 上创建 'Science' 仓库"
    echo "2. 是否有推送权限"
    echo "3. 网络连接是否正常"
fi










