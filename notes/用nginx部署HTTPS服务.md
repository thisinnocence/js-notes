# 如何基于 Nginx 部署 HTTPS（Let’s Encrypt 免费证书）

很多浏览器、平台（如微信）会对 HTTP 链接进行限制或弹出“不安全”提示。本文将讲述如何将你的 Node.js Web 服务，通过 Nginx 配置成 HTTPS，提升安全性与兼容性。

---

## 🧩 项目背景

- Web 服务部署在 Ubuntu 云服务器上
- 服务运行在 `localhost:3000`，通过 Nginx 做反向代理暴露到公网 80 端口
- 希望使用 Let’s Encrypt 免费证书，将域名升级为 HTTPS 访问

---

## 🛠️ Nginx 基础 HTTP 配置

首先配置一个最基本的反向代理，将 HTTP 请求转发到 Node.js：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
````

---

## ✅ 使用 Certbot 自动签发证书

安装 certbot（如果尚未安装）：

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

执行自动配置命令：

```bash
sudo certbot --nginx -d yourdomain.com
```

Certbot 会自动：

- 验证你对域名的所有权（通过 `.well-known` 路径）
- 自动修改 nginx 配置文件，添加 HTTPS 监听
- 自动配置 443 端口和证书路径
- 自动配置 HTTP → HTTPS 的 301 跳转

---

## 🔒 自动续期（推荐设置）

Let’s Encrypt 的证书有效期只有 90 天，需要自动续期：

```bash
sudo crontab -e
```

以 root 用户身份 打开系统的 crontab（定时任务）配置文件。因为 Certbot 会修改系统配置或写入证书目录，需要 root 权限 来续期。

- 以 root 用户身份 打开系统的 crontab（定时任务）配置文件。
- crontab 是 Linux 系统中管理定时执行任务的工具。
- -e 代表 “edit”（编辑），会在编辑器中打开 root 的定时任务列表。

```bash
0 3 * * * /usr/bin/certbot renew --quiet
```

- 表示每天凌晨 3:00 执行一次 `certbot renew --quiet` 命令
- `/usr/bin/certbot` 是 certbot 程序的完整路径（你也可以用 `which certbot` 查验你系统上的实际路径）
- `renew` 是 `Certbot` 的续期命令，它会判断证书是否快到期，并在需要时自动续签
- `--quiet` 表示静默运行，不输出无关信息，只有错误时才显示

只要修改了这行，从此刻起，crontab 就会自动生效，不需要重启或运行其他命令。可以用下面命令看：

```bash
sudo crontab -l
```

可以运行以下命令测试一次自动续期流程是否能成功：

```bash
sudo certbot renew --dry-run
```

这个命令不会真正续签证书，但会模拟一次完整的流程，能验证你的配置是否正确（包括 Nginx 配置、证书路径、DNS 设置等）。

---

## 🔍 常见问题：Let’s Encrypt 验证失败（超时）

使用 `certbot` 自动申请证书时，可能出现如下错误：

```bash
Timeout during connect (likely firewall problem)
```

这是 Let’s Encrypt 验证服务器无法访问你的域名。

### ✅ 解决方案

1. **检查 DNS 设置是否正确**

   - 使用 `dig` 或 `nslookup` 检查域名是否解析到你正在使用的公网 IP：

     ```bash
     dig +short yourdomain.com A
     ```

   - 如果返回多个 IP，例如：

     ```bash
     x.x.x.x
     y.y.y.y
     ```

     就说明你有多个 A 记录，其中可能存在已废弃或错误的 IP。

2. **登录 DNS 控制台，删除无效 A 记录**

   - 如果你使用的是某云服务（如腾讯云、阿里云、Cloudflare 等），进入域名解析控制台
   - 找到 `yourdomain.com` → 点击「解析」→ 删除错误 IP 的 A 记录
   - 最终只保留你当前服务器的公网 IP

---

## 🎉 最终效果

成功部署后，你的 Nginx 配置中会自动多出如下 HTTPS 配置段：

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        # ... 其余设置不变 ...
    }
}

# HTTP 自动跳转到 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

现在可以通过：

```html
https://yourdomain.com
```

正常访问你的 Node.js Web 应用了！

---

## 📌 总结

部署 HTTPS 的关键步骤是：

1. 保证 Nginx 可被公网访问，特别是 `.well-known/acme-challenge/` 路径；
2. DNS 设置唯一、准确，避免多个 A 记录造成验证失败；
3. 使用 `certbot --nginx` 一键申请证书，简单高效；
4. 设置定时任务自动续期，避免证书过期。

HTTPS 是现代 Web 的基础配置，Let's Encrypt + Nginx 的方式适用于大部分个人和中小型服务，简单可靠。
