#!/bin/bash

# 确保脚本可执行
# chmod +x deploy.sh

echo "开始部署 NeuroGlass AI Chat Interface..."

# 拉取最新代码
git pull origin main

# 构建并启动容器
docker-compose up -d --build

# 等待数据库启动
echo "等待数据库启动..."
sleep 10

# 初始化数据库
echo "初始化数据库..."
docker-compose exec app npx ts-node scripts/check-db.ts

echo "部署完成！应用已在 http://localhost:3000 上运行"