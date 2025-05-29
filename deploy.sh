#!/bin/bash

# 确保脚本可执行
# chmod +x deploy.sh

set -e  # 遇到错误时退出

echo "开始部署 NeuroGlass AI Chat Interface..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 检查docker-compose是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "错误: docker-compose未安装"
    exit 1
fi

# 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 停止现有容器
echo "停止现有容器..."
docker-compose down

# 清理旧的镜像（可选）
echo "清理旧镜像..."
docker system prune -f

# 构建并启动容器
echo "构建并启动容器..."
docker-compose up -d --build

# 等待应用启动
echo "等待应用启动..."
sleep 30

# 检查应用健康状态
echo "检查应用健康状态..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3009/api/health > /dev/null 2>&1; then
        echo "应用健康检查通过！"
        break
    else
        echo "健康检查失败，等待重试... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "错误: 应用启动失败，请检查日志"
    docker-compose logs app
    exit 1
fi

# 初始化数据库
echo "初始化数据库..."
docker-compose exec app npx ts-node scripts/check-db.ts

echo "部署完成！"
echo "应用已在 http://localhost:3009 上运行"
echo "健康检查端点: http://localhost:3009/api/health"