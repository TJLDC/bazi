# 八字排盘Web系统使用说明

## 📋 项目简介

这是一个基于Flask的八字排盘Web应用，提供友好的Web界面来使用原有的命令行八字排盘系统。

## 🚀 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 启动服务器

```bash
python app.py
```

服务器将在 `http://localhost:5000` 启动

### 3. 访问网站

在浏览器中打开: `http://localhost:5000`

## 📁 项目结构

```
bazi/
├── app.py                 # Flask后端API
├── bazi.py               # 原八字排盘核心程序
├── requirements.txt      # Python依赖
├── templates/
│   └── index.html       # 前端HTML页面
├── static/
│   ├── css/
│   │   └── style.css    # 样式文件
│   └── js/
│       └── app.js       # 前端交互逻辑
└── README_WEB.md        # 本说明文件
```

## 🎯 功能特性

### 1. 两种输入方式

#### 方式一：日期时间输入
- 支持公历/农历切换
- 支持闰月选择
- 支持性别选择（男/女）
- 时辰选择（子丑寅卯...）

#### 方式二：直接输入八字
- 格式：年柱 月柱 日柱 时柱
- 示例：`丁巳 己酉 癸未 壬戌`

### 2. 结果展示

- **基本信息**：公历、农历、命宫、胎元
- **四柱八字**：年月日时的天干地支
- **五行分析**：五行分数柱状图、强弱判断
- **格局神煞**：格局类型、神煞标签
- **详细分析**：命理分析要点
- **完整报告**：原始完整输出

## 🔧 API接口

### 1. 日期计算接口

**端点**: `POST /api/calculate`

**请求体**:
```json
{
    "year": 1977,
    "month": 8,
    "day": 11,
    "hour": 19,
    "is_solar": false,
    "is_female": true,
    "is_leap": false
}
```

**响应**:
```json
{
    "success": true,
    "data": {
        "basic": {...},
        "wuxing": {...},
        "shishen": {...},
        "geju": [...],
        "shensha": [...],
        "analysis": [...],
        "raw_output": "..."
    }
}
```

### 2. 八字直接计算接口

**端点**: `POST /api/calculate_direct`

**请求体**:
```json
{
    "bazi": "丁巳 己酉 癸未 壬戌"
}
```

### 3. 健康检查

**端点**: `GET /api/health`

## 🎨 界面特色

- 🎋 中国风设计，古朴典雅
- 📱 响应式布局，支持移动端
- 🎯 直观的五行柱状图
- 🏷️ 标签化的格局神煞展示
- 📊 清晰的信息分类展示

## ⚙️ 配置说明

### 修改端口

在 `app.py` 最后一行修改：

```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

### 生产环境部署

使用 gunicorn 或 uwsgi：

```bash
# 使用 gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 或使用 uwsgi
pip install uwsgi
uwsgi --http :5000 --wsgi-file app.py --callable app --processes 4
```

## 🐛 故障排除

### 1. 依赖安装失败

确保使用Python 3.7+版本：
```bash
python --version
```

### 2. 计算超时

检查 `bazi.py` 是否可以正常运行：
```bash
python bazi.py 1977 8 11 19 -n
```

### 3. 端口被占用

修改 `app.py` 中的端口号，或关闭占用5000端口的程序

### 4. 静态文件404

确保目录结构正确：
```bash
ls -la templates/
ls -la static/css/
ls -la static/js/
```

## 📝 使用示例

### 示例1：查询女命

1. 选择"日期时间输入"
2. 输入：1977年8月11日19时
3. 勾选"女命"
4. 点击"开始排盘"

### 示例2：直接输入八字

1. 选择"直接输入八字"
2. 输入：`丁巳 己酉 癸未 壬戌`
3. 点击"开始排盘"

## 🔐 安全建议

- 生产环境请关闭 `debug=True`
- 添加请求频率限制
- 添加输入验证和清理
- 使用HTTPS协议
- 设置CORS白名单

## 📞 技术支持

如有问题，请参考原项目的钉钉群：21734177

## 📄 许可证

本Web界面基于原八字排盘系统开发，遵循原项目许可。

---

**注意**: 本系统仅供参考学习，不构成任何专业建议。