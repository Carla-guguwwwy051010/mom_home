# Netlify 部署配置修复指南

## 问题诊断
❌ **错误：** 404 - Failed to load resource
✅ **原因：** Netlify 部署时没有正确指向 `netlify-deploy` 目录

## 解决方案

### 方案 1：修改 Netlify 部署设置（推荐）

1. 登录 Netlify (https://app.netlify.com)
2. 进入你的站点
3. 点击 **Site configuration** → **Build & deploy**
4. 找到 **Build settings**
5. 修改配置：
   - **Base directory**: `netlify-deploy`
   - **Publish directory**: `.` （一个点）或留空
   - **Build command**: 留空（静态站点不需要构建）

6. 点击 **Save**
7. 点击 **Deploys** → **Trigger deploy** → **Deploy site**

### 方案 2：调整项目结构（如果方案 1 不行）

将 `netlify-deploy` 目录下的所有文件移到仓库根目录：

```bash
# 将文件移到根目录
cp netlify-deploy/index.html ./
cp netlify-deploy/netlify.toml ./
cp netlify-deploy/_redirects ./

# 提交并推送
git add index.html netlify.toml _redirects
git commit -m "Move files to root for Netlify deployment"
git push
```

### 方案 3：使用 GitHub Actions 部署

如果使用 GitHub Pages，创建 `.github/workflows/deploy.yml`

## 验证部署

部署成功后，检查：
1. 网站能正常打开（不是 404）
2. 页面不是白屏
3. 能看到 3D 场景或加载动画

## 如果还是白屏

如果 404 解决了但还是白屏，按 F12 查看：
- **Console** 标签：是否有其他 JavaScript 错误？
- **Network** 标签：index.html 是否成功加载（状态码 200，大小 1.6MB）？

---

## 快速测试（本地）

在修改 Netlify 配置前，可以先本地测试：

```bash
cd netlify-deploy
python -m http.server 8000
```

访问 http://localhost:8000 - 如果本地能看到网站，说明文件没问题，纯粹是部署配置问题。

## 当前文件状态

✅ netlify-deploy/index.html (1.6MB) - 存在
✅ netlify-deploy/netlify.toml - 已创建
✅ netlify-deploy/_redirects - 已创建

**下一步：按方案 1 修改 Netlify 的 Base directory 设置。**
