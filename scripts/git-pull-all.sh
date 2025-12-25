#!/bin/sh
# 从 origin 和 gitee 同时拉取代码

current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ -z "$current_branch" ]; then
    echo "错误: 无法获取当前分支"
    exit 1
fi

echo "正在从 origin 拉取..."
if git pull origin "$current_branch"; then
    echo "✓ 从 origin 拉取成功"
else
    echo "✗ 从 origin 拉取失败，继续..."
fi

echo ""
echo "正在从 gitee 拉取..."
if git pull gitee "$current_branch"; then
    echo "✓ 从 gitee 拉取成功"
else
    echo "✗ 从 gitee 拉取失败，继续..."
fi

echo ""
echo "拉取完成！"

