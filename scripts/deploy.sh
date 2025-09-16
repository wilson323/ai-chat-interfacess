#!/bin/bash

# 部署脚本
# 支持Docker和传统部署方式

set -e

echo "🚀 开始部署 AI Chat Interfaces..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查Docker是否可用
check_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Docker部署
deploy_docker() {
    log "使用Docker部署..."

    # 停止现有容器
    log "停止现有容器..."
    docker-compose down || true

    # 构建镜像
    log "构建Docker镜像..."
    docker-compose build --no-cache

    # 启动服务
    log "启动服务..."
    docker-compose up -d

    # 等待服务启动
    log "等待服务启动..."
    sleep 30

    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        success "Docker部署成功！"
        log "服务地址: http://localhost:3000"
        log "数据库地址: localhost:5432"
    else
        error "Docker部署失败！"
        docker-compose logs
        exit 1
    fi
}

# 传统部署
deploy_traditional() {
    log "使用传统方式部署..."

    # 检查Node.js版本
    if ! command -v node &> /dev/null; then
        error "Node.js未安装！"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js版本过低，需要18或更高版本！"
        exit 1
    fi

    # 安装依赖
    log "安装依赖..."
    npm ci --production

    # 构建应用
    log "构建应用..."
    npm run build:smart

    # 启动应用
    log "启动应用..."
    npm start &

    # 等待启动
    sleep 10

    # 检查服务
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "传统部署成功！"
        log "服务地址: http://localhost:3000"
    else
        error "传统部署失败！"
        exit 1
    fi
}

# 健康检查
health_check() {
    log "执行健康检查..."

    # 检查API健康状态
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "API健康检查通过"
    else
        error "API健康检查失败"
        return 1
    fi

    # 检查数据库连接（如果使用Docker）
    if check_docker && docker-compose ps | grep -q "db.*Up"; then
        success "数据库连接正常"
    fi

    success "所有健康检查通过！"
}

# 显示部署信息
show_deployment_info() {
    log "部署信息:"
    echo "  🌐 应用地址: http://localhost:3000"
    echo "  📊 管理后台: http://localhost:3000/admin"
    echo "  🔧 API文档: http://localhost:3000/api/health"

    if check_docker; then
        echo "  🐳 数据库: localhost:5432"
        echo "  📝 查看日志: docker-compose logs -f"
        echo "  🛑 停止服务: docker-compose down"
    else
        echo "  📝 查看日志: npm run dev"
        echo "  🛑 停止服务: Ctrl+C"
    fi
}

# 主函数
main() {
    log "开始部署流程..."

    # 检查部署方式
    if check_docker; then
        warning "检测到Docker环境，使用Docker部署"
        deploy_docker
    else
        warning "未检测到Docker，使用传统部署"
        deploy_traditional
    fi

    # 健康检查
    health_check

    # 显示部署信息
    show_deployment_info

    success "部署完成！"
}

# 错误处理
trap 'error "部署过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"
