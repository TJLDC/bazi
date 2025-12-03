# Render部署指南

## 📋 部署配置

### 方法1：使用Render Dashboard手动配置

1. **创建新的Web Service**
   - 登录 [Render Dashboard](https://dashboard.render.com/)
   - 点击 "New +" → "Web Service"
   - 连接你的GitHub仓库

2. **配置设置**
   ```
   Name: bazi-paipan (或你喜欢的名字)
   Environment: Python 3
   Region: 选择离你最近的区域
   Branch: main (或你的主分支)
   ```

3. **构建和启动命令**
   ```
   Root Directory: (留空)
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

4. **环境变量**（可选）
   ```
   PYTHON_VERSION = 3.12.0
   ```

5. **实例类型**
   - 选择 "Free" 或其他付费计划

6. **点击 "Create Web Service"**

### 方法2：使用render.yaml自动配置

如果你的仓库中有 [`render.yaml`](render.yaml:1) 文件，Render会自动读取配置。

只需：
1. 推送代码到GitHub
2. 在Render中连接仓库
3. Render会自动检测并使用 `render.yaml` 配置

## 🔧 已完成的配置

### 1. [`requirements.txt`](requirements.txt:1)
已添加 `gunicorn==21.2.0` 用于生产环境部署

### 2. [`app.py`](app.py:233)
已修改端口配置以适应Render：
```python
port = int(os.environ.get('PORT', 8080))
app.run(host='0.0.0.0', port=port, debug=False)
```

### 3. [`render.yaml`](render.yaml:1)
已创建自动部署配置文件

## 🚀 部署步骤

1. **提交并推送代码**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **在Render创建服务**
   - 访问 https://dashboard.render.com/
   - 选择 "New Web Service"
   - 连接GitHub仓库
   - Render会自动检测配置

3. **等待部署完成**
   - 首次部署需要5-10分钟
   - 部署成功后会获得一个URL

4. **访问你的应用**
   - URL格式：`https://your-app-name.onrender.com`

## ⚠️ 注意事项

### Free Plan限制
- 15分钟无活动后会休眠
- 首次访问需要等待唤醒（约30秒）
- 每月750小时免费运行时间

### 性能优化建议
- 考虑升级到付费计划以获得更好性能
- 使用CDN加速静态资源
- 添加缓存机制

## 🔍 故障排查

### 部署失败
1. 检查 Build Logs 查看错误信息
2. 确认 `requirements.txt` 中的依赖版本兼容
3. 检查 Python 版本是否匹配

### 应用无法访问
1. 检查 Deploy Logs 确认应用已启动
2. 确认端口配置正确
3. 检查防火墙设置

### 依赖安装失败
1. 确认 `lunar-python>=1.4.8` 版本可用
2. 尝试指定具体版本如 `lunar-python==1.4.8`

## 📞 获取帮助

- Render文档: https://render.com/docs
- Render社区: https://community.render.com/
- 项目Issues: 在GitHub仓库创建Issue

## 🎉 部署成功后

访问你的应用URL，你应该能看到：
- 简洁的八字排盘界面
- 输入日期时间或直接输入八字
- 查看基本信息、四柱八字和完整报告

祝部署顺利！