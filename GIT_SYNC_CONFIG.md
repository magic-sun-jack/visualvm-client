# Git 双远程自动同步配置说明

本项目已配置为自动同步到 GitHub (origin) 和 Gitee 两个远程仓库。

## 已配置的功能

### 1. 自动推送
- **每次提交后**：`post-commit` hook 会自动推送到 Gitee
- **每次合并后**：`post-merge` hook 会自动推送到 Gitee（pull 操作会触发）
- **每次 push 时**：`git push` 命令已配置为自动同时推送到 origin 和 gitee

### 2. 自动拉取
- **每次 pull 时**：`git pull` 命令已配置为自动从 origin 和 gitee 同时拉取

### 3. 使用方式

#### 提交和推送（自动同步到 Gitee）
```bash
git add .
git commit -m "提交信息"
# 提交后会自动推送到 Gitee

git push
# 或
git push origin main
# 推送到 origin 时会自动同时推送到 Gitee
```

#### 拉取代码（自动从两个远程拉取）
```bash
git pull
# 自动从 origin 和 gitee 同时拉取
```

#### 手动命令（备选方案）

如果需要手动控制，可以使用以下命令：

```bash
# 同时推送到两个远程
git push-all

# 同时从两个远程拉取
git pull-all
```

> **注意**：
> - `git pull` 和 `git push` 已配置为自动处理双远程同步
> - 如果需要只操作单个远程，可以使用 `git pull origin <branch>` 或 `git push gitee <branch>`

## 使用说明

### 正常使用流程

1. **提交代码**：
   ```bash
   git add .
   git commit -m "提交信息"
   # 提交后会自动推送到 Gitee
   ```

2. **推送到远程**：
   ```bash
   git push
   # 或
   git push origin main
   # 推送到 origin 时会自动同时推送到 Gitee
   ```

3. **拉取代码**：
   ```bash
   # 标准拉取（只从 origin）
   git pull
   
   # 从两个远程同时拉取
   git pull-all
   ```

### 注意事项

1. **首次使用**：如果 Gitee 仓库还没有对应的分支，需要先手动推送一次：
   ```bash
   git push -u gitee main
   ```

2. **冲突处理**：如果两个远程仓库有冲突，`git pull-all` 会分别处理，可能需要手动解决冲突。

3. **推送失败**：如果推送到 Gitee 失败（例如网络问题），不会影响推送到 GitHub，可以稍后手动推送：
   ```bash
   git push gitee main
   ```

## 配置位置

- Git hooks: `.git/hooks/post-commit`, `.git/hooks/post-merge`, `.git/hooks/pre-push`
- 脚本文件: `scripts/git-pull-all.sh`, `scripts/git-push-all.sh`
- Git 别名: 通过 `git config --local` 配置，保存在 `.git/config`

## 远程仓库信息

- **origin (GitHub)**: https://github.com/magic-sun-jack/visualvm-client.git
- **gitee**: https://gitee.com/SY199505/visualvm-client.git

