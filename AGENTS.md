# AGENTS.md

本文件适用于仓库根目录及其所有子目录。

## 沟通与工作原则

- 默认使用中文回复，除非用户明确要求其他语言。
- 动手前先说明关键假设、歧义和兼容性取舍；无法安全判断时先询问。
- 只实现用户要求的最小改动，不做顺手重构，不清理无关代码，不引入预设需求的抽象。
- 工作区可能包含用户尚未提交的 Express→FastAPI 迁移改动。保留所有无关改动，不恢复旧 Node.js 文件，也不覆盖用户的迁移内容。
- 除非用户明确要求，不运行测试、lint、类型检查、构建或其他静态检查。完成时列出改动文件、说明改动内容，并明确哪些检查未运行。
- 若使用了技能，在最终回复末尾追加：`Skills Used: [skill1, skill2, ...]`。

## 项目概况

- 这是 NavTab 的 FastAPI 后端，运行于 Python 3.11+，本地 `mise.toml` 当前选择 Python 3.14。新增代码必须兼容 Python 3.11，不要把本地工具版本当作项目最低版本。
- 主要依赖为 FastAPI、asyncmy、Pydantic Settings、PyJWT、argon2-cffi 和 Uvicorn；依赖声明只在 `pyproject.toml` 中维护。
- MySQL 连接池由 `app/main.py` 的 lifespan 创建和关闭，并保存在 `app.state.database_pool`。
- 应用提供用户注册、登录、刷新令牌、书签读写、图片上传及 `public/` 静态文件服务。
- 当前仓库没有测试目录、锁文件、lint/typecheck/formatter 配置、CI 或容器配置。不要假定这些设施存在；只有用户要求时才引入。

## 必须保留的兼容性

本项目由 Express 迁移而来。除非任务明确要求破坏性变更，否则以下内容都视为外部契约：

- 保留现有 URL、HTTP 方法、HTTP 状态码及响应包络 `{code, message, data}`；HTTP 状态码与响应体中的 `code` 可能不同，不要擅自“统一”。
- 保留 `accessToken`、`refreshToken`、`bookmarkList`、`imagePath` 等 camelCase 字段名。
- 注册、登录及相应接口需要继续接受当前支持的 JSON 和表单请求格式。
- 保留 `/upload` 与 `/upload/` 的现有行为，以及静态资源 `/images/<filename>` 路径。
- `StaticFiles` 的根路径挂载必须放在所有 API 路由注册之后，否则会遮蔽 API 路由。
- 保留 HS256、`uid`/`username` 载荷、access/refresh 两套密钥及当前令牌有效期，除非用户明确批准认证协议变更。
- 旧 MD5 密码只允许用于登录校验，并在成功登录后升级为 Argon2；新密码绝不能再以 MD5 保存。
- 切换期间不能假设旧 Node.js 服务能够验证已经升级的 Argon2 密码。

## 代码职责边界

- `app/main.py`：应用装配、lifespan、中间件、全局异常处理和静态目录挂载。不要在这里加入业务逻辑。
- `app/routers/`：HTTP 路由、依赖声明、状态码及响应转换。路由层不直接执行 SQL。
- `app/services/`：业务规则及异步流程编排。服务层不依赖 FastAPI 的 `Request` 或 `Response`。
- `app/repositories/`：数据库访问和必要的持久化格式转换。SQL 必须使用 asyncmy 参数占位符，禁止拼接用户输入。
- `app/schemas.py`：Pydantic 请求模型、令牌载荷及公开字段别名。Python 内部使用清晰的 snake_case，通过 alias 或响应映射保持外部 camelCase；新增公开输入时优先在这里做边界校验。
- `app/dependencies.py`：可复用的 FastAPI 依赖和兼容请求解析。不要在多个路由重复解析认证头或请求体。
- `app/security.py`：密码与 JWT 原语。Argon2 属于 CPU 密集操作，异步调用必须继续通过受限的工作线程执行，不能阻塞事件循环。
- `app/config.py`：环境配置的唯一来源。不得硬编码密钥、数据库凭据或机器相关绝对路径。
- `app/defaults.py`：默认书签数据；修改其中的静态资源路径时，必须确认对应文件存在于 `public/images/`。

当前分层足以支撑项目规模。不要仅为追求目录形式而增加 domain、CRUD、DTO、ORM 等单次使用层；只有实际复杂度或用户需求证明有必要时再扩展。

## 数据库与迁移

- 复用 lifespan 中的连接池；不要为单个请求创建新连接池，也不要在模块导入时建立数据库连接。
- 保持 SQL 参数化，并只查询业务实际需要的字段。跨多条写操作需要原子性时使用显式事务。
- 表结构变更应在 `migrations/` 中新增按顺序编号、可审查的 SQL 文件，并同步更新 README 中的部署说明。
- 应用启动时不得自动执行 DDL。不要替用户执行生产迁移；涉及破坏性 SQL 时必须说明备份、锁表及回滚风险。
- `migrations/001_expand_password_column.sql` 是 Argon2 上线前置条件，不得在未确认数据兼容性的情况下撤销。

## API、安全与异步约束

- 不把数据库异常、密钥、令牌、密码、文件系统绝对路径或堆栈信息直接返回给客户端。若修正现有错误文案会影响兼容性，先明确说明取舍。
- 认证头必须按 Bearer scheme 严格解析；认证失败统一返回稳定的 401 语义。
- 对用户名、密码、令牌、书签内容和上传文件在入口处设置与业务匹配的约束，避免把无界输入传入 Argon2、JWT 或数据库。
- 上传文件继续使用随机服务端文件名，并同时执行请求体上限和落盘字节上限。扩展名和客户端 MIME 类型不能被视为文件内容可信证明。
- 未认证上传会带来磁盘耗尽和滥用风险；任何扩大上传能力的改动都必须同时说明认证、配额、速率限制和清理策略。
- 避免在 `async def` 中新增阻塞式网络、CPU 或大文件 I/O。确需使用同步库时，将阻塞工作移至线程，并设置明确的并发边界。
- 日志写入 stdout/stderr，不记录密码或完整令牌。记录异常时保留服务端诊断上下文，但客户端只接收稳定错误信息。
- 请求体大小限制仍需由 Nginx 或等价入口层兜底，不能只依赖 `Content-Length`。

## 配置与静态文件

- 配置加载顺序为 `.env`，再由 `.env.<NODE_ENV>.local` 覆盖；操作系统环境变量优先。选择环境文件的 `NODE_ENV` 必须在进程启动前设置。
- 不读取、打印、提交或修改真实 `.env*` 文件。新增配置项时同步更新 `Settings`、`.env.example` 和 README；敏感配置使用 `SecretStr`，示例密钥保持为空。
- `PUBLIC_DIRECTORY` 可指向仓库外的部署目录。不要假设 wheel 中包含 `public/`，也不要把运行时上传文件当作源码提交。
- 不要重命名或删除 `public/images/` 中被 `app/defaults.py` 或客户端引用的既有资源，除非任务同时更新全部引用。
- 修改外部 API、配置、部署前置条件、迁移步骤或静态目录行为时同步更新 README。发布版本时同步检查 `pyproject.toml`、`app/main.py` 和 `CHANGELOG.md` 中的版本信息。

## 本地命令与交付

- 安装：`python -m pip install -e .`
- 开发启动：`python -m uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload`
- 按配置启动：`python -m app`
- 仅在用户明确要求验证时，运行与改动范围最小的检查。若将来新增测试，测试必须使用隔离数据库或替身，绝不能连接生产数据库。
- 未经明确要求，不安装依赖、不启动服务、不连接数据库、不执行 SQL，也不暂存、提交或推送 Git 改动。
- 完成任务时只报告本次实际修改的文件，不把工作区原有迁移改动归为自己的成果。
