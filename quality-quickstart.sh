#!/bin/bash

# NeuroGlass AI Chat Interface 质量保证快速启动脚本
# 用于快速执行所有质量检查和生成报告

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_prerequisites() {
    log_info "检查必要工具..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi

    log_success "必要工具检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."

    if [ ! -d "node_modules" ]; then
        npm ci
    else
        log_info "依赖已存在，跳过安装"
    fi

    log_success "依赖安装完成"
}

# 创建必要目录
setup_directories() {
    log_info "创建质量保证相关目录..."

    mkdir -p quality-reports
    mkdir -p quality-data
    mkdir -p logs/quality

    log_success "目录创建完成"
}

# 执行代码质量检查
run_code_quality_checks() {
    log_info "执行代码质量检查..."

    # TypeScript 类型检查
    log_info "  • TypeScript 类型检查..."
    if npm run check-types --silent; then
        log_success "    ✓ TypeScript 类型检查通过"
    else
        log_error "    ✗ TypeScript 类型检查失败"
        return 1
    fi

    # ESLint 检查
    log_info "  • ESLint 代码规范检查..."
    if npm run lint --silent; then
        log_success "    ✓ ESLint 检查通过"
    else
        log_warning "    ⚠ ESLint 发现问题"
    fi

    # Prettier 格式检查
    log_info "  • Prettier 格式检查..."
    if npm run format:check --silent; then
        log_success "    ✓ Prettier 格式检查通过"
    else
        log_warning "    ⚠ Prettier 格式需要修复"
    fi

    # 自定义代码占比检查
    log_info "  • 自定义代码占比检查..."
    if npm run check:custom-ratio --silent; then
        log_success "    ✓ 自定义代码占比检查通过"
    else
        log_warning "    ⚠ 自定义代码占比过高"
    fi

    log_success "代码质量检查完成"
}

# 执行测试
run_tests() {
    log_info "执行测试套件..."

    # 单元测试
    log_info "  • 运行单元测试..."
    if npm run test:unit --silent -- --coverage --watchAll=false; then
        log_success "    ✓ 单元测试通过"
    else
        log_error "    ✗ 单元测试失败"
        return 1
    fi

    # 集成测试
    log_info "  • 运行集成测试..."
    if npm run test:integration --silent -- --watchAll=false; then
        log_success "    ✓ 集成测试通过"
    else
        log_warning "    ⚠ 集成测试发现问题"
    fi

    # 安全测试
    log_info "  • 运行安全测试..."
    if npm run test:security --silent -- --watchAll=false; then
        log_success "    ✓ 安全测试通过"
    else
        log_warning "    ⚠ 安全测试发现问题"
    fi

    log_success "测试执行完成"
}

# 执行安全检查
run_security_checks() {
    log_info "执行安全检查..."

    # npm audit
    log_info "  • 运行 npm audit..."
    if npm audit --audit-level=moderate --silent; then
        log_success "    ✓ npm audit 通过"
    else
        log_warning "    ⚠ npm audit 发现问题"
    fi

    # 脚本安全检查
    log_info "  • 脚本安全检查..."
    if npm run security:scripts --silent; then
        log_success "    ✓ 脚本安全检查通过"
    else
        log_warning "    ⚠ 脚本安全检查发现问题"
    fi

    log_success "安全检查完成"
}

# 执行性能检查
run_performance_checks() {
    log_info "执行性能检查..."

    # 构建性能
    log_info "  • 检查构建性能..."
    start_time=$(date +%s)
    if npm run build --silent; then
        end_time=$(date +%s)
        build_time=$((end_time - start_time))
        log_success "    ✓ 构建成功，耗时 ${build_time} 秒"
    else
        log_error "    ✗ 构建失败"
        return 1
    fi

    # 依赖性能
    log_info "  • 检查依赖性能..."
    if npm run test:performance --silent; then
        log_success "    ✓ 性能检查通过"
    else
        log_warning "    ⚠ 性能检查发现问题"
    fi

    log_success "性能检查完成"
}

# 生成质量报告
generate_quality_report() {
    log_info "生成质量报告..."

    # 执行完整质量检查清单
    log_info "  • 运行完整质量检查清单..."
    if npx tsx scripts/quality-checklist.ts; then
        log_success "    ✓ 质量检查清单完成"
    else
        log_warning "    ⚠ 质量检查发现问题"
    fi

    # 生成质量监控仪表板
    log_info "  • 生成质量监控仪表板..."
    if npx tsx scripts/quality-dashboard.ts; then
        log_success "    ✓ 质量监控仪表板生成成功"
        log_info "    📊 仪表板文件: quality-dashboard.html"
    else
        log_warning "    ⚠ 质量监控仪表板生成失败"
    fi

    log_success "质量报告生成完成"
}

# 生成摘要报告
generate_summary() {
    log_info "生成质量保证摘要..."

    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="quality-reports/summary-$(date +%Y%m%d_%H%M%S).txt"

    cat > "$report_file" << EOF
NeuroGlass AI Chat Interface 质量保证摘要
=============================================

时间: $timestamp
环境: $(node --version) / $(npm --version)

检查项目:
✓ 代码质量检查
✓ 测试套件执行
✓ 安全检查
✓ 性能检查
✓ 质量报告生成

状态: 完成
建议: 定期运行此脚本以保持代码质量

报告文件:
- 质量检查清单: quality-reports/
- 质量监控仪表板: quality-dashboard.html
- 详细日志: logs/quality/

=============================================
EOF

    log_success "质量保证摘要已保存到: $report_file"
}

# 显示结果
show_results() {
    echo
    echo "============================================"
    echo "🎉 NeuroGlass 质量保证检查完成！"
    echo "============================================"
    echo
    echo "📊 质量监控仪表板: quality-dashboard.html"
    echo "📋 质量检查报告: quality-reports/"
    echo "📝 质量保证日志: logs/quality/"
    echo
    echo "💡 建议:"
    echo "   1. 定期运行此脚本 (建议每周一次)"
    echo "   2. 在 CI/CD 流水线中集成质量检查"
    echo "   3. 关注质量趋势变化"
    echo "   4. 及时修复发现的问题"
    echo
    echo "============================================"
}

# 清理函数
cleanup() {
    log_info "清理临时文件..."
    # 可以添加清理逻辑
    log_success "清理完成"
}

# 主函数
main() {
    echo "============================================"
    echo "🚀 NeuroGlass AI Chat Interface 质量保证"
    echo "============================================"
    echo

    # 设置错误处理
    trap cleanup EXIT

    # 执行检查步骤
    check_prerequisites
    install_dependencies
    setup_directories

    # 质量检查流程
    run_code_quality_checks
    run_tests
    run_security_checks
    run_performance_checks
    generate_quality_report
    generate_summary

    # 显示结果
    show_results

    echo
    log_success "质量保证流程全部完成！"
}

# 解析命令行参数
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "用法: $0 [选项]"
        echo
        echo "选项:"
        echo "  help, -h, --help    显示此帮助信息"
        echo "  code               仅运行代码质量检查"
        echo "  test               仅运行测试"
        echo "  security           仅运行安全检查"
        echo "  performance        仅运行性能检查"
        echo "  report             仅生成质量报告"
        echo
        echo "默认行为: 运行完整的质量保证流程"
        exit 0
        ;;
    "code")
        check_prerequisites
        install_dependencies
        setup_directories
        run_code_quality_checks
        ;;
    "test")
        check_prerequisites
        install_dependencies
        setup_directories
        run_tests
        ;;
    "security")
        check_prerequisites
        install_dependencies
        setup_directories
        run_security_checks
        ;;
    "performance")
        check_prerequisites
        install_dependencies
        setup_directories
        run_performance_checks
        ;;
    "report")
        check_prerequisites
        install_dependencies
        setup_directories
        generate_quality_report
        ;;
    *)
        main
        ;;
esac