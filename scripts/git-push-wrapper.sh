#!/bin/sh
# Git push wrapper - 推送到 origin 时同时推送到 gitee

# 如果指定了远程仓库且不是 origin，使用标准的 push
if [ -n "$1" ] && [ "$1" != "origin" ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
    # 推送到其他远程，使用标准 push
    exec git push "$@"
fi

current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ -z "$current_branch" ]; then
    echo "错误: 无法获取当前分支"
    exit 1
fi

# 推送到 origin
echo "正在推送到 origin..."
if git push origin "$current_branch" "$@"; then
    echo "✓ 推送到 origin 成功"
else
    echo "✗ 推送到 origin 失败"
    exit 1
fi

# 同时推送到 gitee
echo ""
echo "正在推送到 gitee..."
if git push gitee "$current_branch"; then
    echo "✓ 推送到 gitee 成功"
else
    echo "✗ 推送到 gitee 失败（不影响 origin 推送）"
fi

echo ""
echo "推送完成！"

