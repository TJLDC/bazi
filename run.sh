#!/bin/bash
# 八字排盘Web服务 - 前台运行脚本

echo "========================================="
echo "🔮 八字排盘Web服务"
echo "========================================="
echo ""
echo "📍 访问地址: http://localhost:8080"
echo "🛑 停止服务: 按 Ctrl+C"
echo ""
echo "========================================="
echo ""

# 先清理可能占用端口的进程
PORT=8080
PIDS=$(lsof -ti:$PORT 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "⚠️  发现端口 $PORT 被占用，正在清理..."
    kill -9 $PIDS 2>/dev/null
    sleep 1
    echo "✅ 端口已清理"
    echo ""
fi

# 启动服务器（前台运行）
echo "🚀 启动服务器..."
echo ""
python app.py