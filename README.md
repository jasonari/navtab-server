# NavTab FastAPI Server

NavTab 的 FastAPI 后端，提供用户认证、书签同步和图片上传。

## 运行环境

- Python 3.11+
- MySQL

## 数据库准备

FastAPI 版使用 Argon2 保存新密码，并在旧用户成功登录后将 MD5 密码升级为 Argon2。部署前必须确保 `user_data.password` 能容纳 Argon2 哈希：

```sql
ALTER TABLE user_data MODIFY COLUMN password VARCHAR(255) NOT NULL;
```

相同 SQL 也保存在 `migrations/001_expand_password_column.sql`。请在备份数据库后由运维人员执行，应用不会自动修改表结构。

切换期间不要让 Node 版与 FastAPI 版同时接收登录流量：Node 版无法验证已升级的 Argon2 密码。

## 本地启动

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .
Copy-Item .env.example .env.development.local
```

填写 `.env.development.local` 中的 MySQL 连接信息和两个 JWT 密钥，然后启动：

```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

也可以让服务直接读取 `HOST` 和 `PORT`：

```powershell
python -m app
```

## API

| Method | Path | Authentication |
| --- | --- | --- |
| `POST` | `/user/register` | No |
| `POST` | `/user/login` | No |
| `GET` | `/user/getBookmarkList` | Access token |
| `POST` | `/user/setBookmarkList` | Access token |
| `POST` | `/auth/refreshToken` | No |
| `POST` | `/upload/` | No |

认证接口保持了 Express 版的 `accessToken` / `refreshToken` 字段、5 分钟 / 7 天有效期和 HS256 签名，因此已签发且未过期的 token 可继续使用。

上传图片存入 `public/images`，最大 5 MiB，返回可直接访问的 `/images/<filename>`。`public` 目录挂载在站点根路径。

## 配置加载

应用先读取 `.env`，再读取 `.env.<NODE_ENV>.local` 覆盖同名配置。`NODE_ENV` 默认为 `development`。生产环境可使用 `.env.production.local` 或由部署平台直接注入环境变量。

环境文件名在读取配置前就要确定，因此选择 `.env.production.local` 时，必须由操作系统或部署平台设置 `NODE_ENV=production`；只把它写在 `.env` 中不会改变被选中的环境文件。

`PUBLIC_DIRECTORY` 默认指向源码中的 `public`。如果使用 wheel 部署，需要把静态资源单独发布，并将 `PUBLIC_DIRECTORY` 设为该目录的绝对路径；上传文件会保存在其 `images` 子目录。

应用会根据 `Content-Length` 拒绝过大请求，并在写入上传文件时再次执行 5 MiB 限制。生产环境仍应在 Nginx 或等价入口层设置请求体上限，以覆盖不带 `Content-Length` 的流式请求。

Argon2 计算已从事件循环移到工作线程，并在每个进程内限制为最多 2 个并发操作。生产入口层还应对注册和登录接口做 IP 速率限制。

生产日志输出到 stdout/stderr，应由 Docker、systemd 或其他进程管理器负责收集与轮转。
