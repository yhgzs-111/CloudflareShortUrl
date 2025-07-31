# 🔗 简介

这是一个基于 **Cloudflare Workers + KV** 实现的完全由AI生成的短链接系统。

示例站点：[f0x.in](https://f0x.in/)

## ❗ 已知问题

**管理后台无法搜索；管理后台删除短链接时有概率Error 1101，目前无法修复。欢迎大佬提交PRs。**

## 🚀 功能特性

- 🎯 自定义短链接后缀，或自动生成
- 🔐 支持设置访问密码
- ⏰ 支持设置过期时间
- 📦 Cloudflare Workers + KV 存储，无需服务器
- 📱 自带 UI，支持复制、二维码生成
- 🛠️ 管理后台（密码验证）
- 🚫 屏蔽反动/敏感域名或非法链接

## 📁 文件结构

- `worker.js`：主逻辑文件，部署至 Cloudflare Workers
- HTML UI：嵌入在 `worker.js` 中
- KV 命名空间：使用 `LINKS` 存储短链接信息

## 🧩 环境变量要求（KV 命名空间）

需要绑定一个名为 `LINKS` 的 KV 命名空间：

```toml
[[kv_namespaces]]
binding = "LINKS"
id = "<your-kv-id>"
```

并设置环境变量：

```env
ADMIN_PASSWORD=your_admin_password
```

## 🔒 链接安全限制

- 拒绝指向 `dour.in` 的链接（请自行更改，位于`worker.js`第550行）
- 拒绝包含中国大陆认定为邪教/反共的网站链接（例如 falundafa, minghui 等）
- 常用社交平台如 YouTube、Telegram、Facebook、X 等白名单通过

## 📦 部署方式

### 1. 安装 `wrangler` 工具

```bash
npm install -g wrangler
```

### 2. 初始化项目

```bash
wrangler init
```

### 3. 编辑 `wrangler.toml`

```toml
name = "shortlink"
type = "javascript"

account_id = "your_account_id"
workers_dev = true
compatibility_date = "2024-01-01"

[vars]
ADMIN_PASSWORD = "your_admin_password"

[[kv_namespaces]]
binding = "LINKS"
id = "your_kv_id"
```

### 4. 部署到 Cloudflare

```bash
wrangler publish
```
