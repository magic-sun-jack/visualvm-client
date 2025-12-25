#!/bin/sh
# 同时推送到 origin 和 gitee

current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ -z "$current_branch" ]; then
    echo "错误: 无法获取当前分支"
    exit 1
fi

echo "正在推送到 origin..."
if git push origin "$current_branch"; then
    echo "✓ 推送到 origin 成功"
else
    echo "✗ 推送到 origin 失败"
    exit 1
fi

echo ""
echo "正在推送到 gitee..."
if git push gitee "$current_branch"; then
    echo "✓ 推送到 gitee 成功"
else
    echo "✗ 推送到 gitee 失败"
    exit 1
fi

echo ""
echo "推送完成！"

