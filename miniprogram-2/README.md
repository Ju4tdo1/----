# 微信小程序认证服务器

这是一个简单的微信小程序认证服务器，处理登录、令牌验证和登出操作。

## 功能

- 账号密码注册和登录
- JWT令牌生成和验证
- 用户信息管理（头像、昵称）
- 登出功能
- CORS支持
- 错误处理

## 前提条件

- Node.js (v14或更高版本)
- npm (v6或更高版本)

## 设置

1. 克隆此仓库
2. 安装依赖:
   ```
   npm install
   ```
3. 在`server.js`中更新JWT密钥:
   ```javascript
   const JWT_SECRET = 'your_jwt_secret';  // 替换为您的JWT密钥
   ```

## 运行服务器

### 开发模式
```
npm run dev
```

### 生产模式
```
npm start
```

服务器默认在端口3000上运行。您可以通过修改`server.js`中的`PORT`变量来更改此设置。

## API端点

### 注册
- **URL**: `/api/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "message": "注册成功"
  }
  ```

### 登录
- **URL**: `/api/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "token": "JWT令牌",
    "user": {
      "id": "用户ID",
      "username": "用户名",
      "avatar": "头像URL",
      "nickname": "昵称"
    }
  }
  ```

### 获取用户信息
- **URL**: `/api/user`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "avatar": "头像URL",
    "nickname": "昵称"
  }
  ```

### 更新用户信息
- **URL**: `/api/user`
- **方法**: `PUT`
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "avatar": "头像URL",
    "nickname": "昵称"
  }
  ```
- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "avatar": "头像URL",
    "nickname": "昵称"
  }
  ```

### 登出
- **URL**: `/api/logout`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "message": "登出成功"
  }
  ```

## 错误处理

服务器返回适当的HTTP状态码和错误消息:

- 400: 错误请求（缺少或无效的参数）
- 401: 未授权（无效或过期的令牌）
- 404: 未找到（用户不存在）
- 500: 服务器内部错误

## 安全注意事项

- JWT令牌使用密钥签名。在生产环境中，请使用强且唯一的密钥。
- 密码使用bcrypt进行哈希处理，确保安全存储。
- 考虑实施速率限制以防止滥用。
- 在生产环境中使用HTTPS加密所有通信。

## 许可证

MIT 