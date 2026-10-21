# 个人数字名片｜Vibe Coding 项目

这是一个面向数字经济专业学生的个人数字名片网站，使用自然语言驱动编程完成需求对齐、代码生成、本地验证与 GitHub Pages 部署。

## 功能

- 响应式个人介绍、项目与技能展示
- 明暗主题切换并记忆偏好
- 一键复制邮箱
- 下载 vCard 联系人名片
- 页面进入动效与鼠标跟随卡片
- GitHub Pages 自动部署

## 本地运行

在项目目录执行：

```bash
python3 -m http.server 8000
```

浏览器打开 `http://localhost:8000`。

## 修改个人信息

1. 在 `index.html` 中替换姓名、简介、项目、技能和社交链接。
2. 在 `script.js` 顶部的 `profile` 对象中替换姓名、邮箱、电话等 vCard 信息。
3. 邮箱与电话已同步写入 `script.js` 的 vCard 信息；如需修改，请保持页面与脚本中的内容一致。

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库，将本项目推送到 `main` 分支。
2. 打开仓库 `Settings → Pages`。
3. 在 `Build and deployment` 的 `Source` 中选择 **GitHub Actions**。
4. 等待 Actions 运行完成，即可获得公网访问地址。

## 作业提交建议

- 截图 1：与 Vibe Coding 工具的需求对齐和代码生成交互记录。
- 截图 2：本地运行后的首页完整页面。
- 截图 3：GitHub Actions 部署成功记录和公网网址。
- 可选：录制主题切换、复制邮箱、下载名片与移动端适配的演示。
