/**
 * 安全扫描和加固工具
 * 扫描常见安全漏洞并提供修复建议
 */

export interface SecurityIssue {
  id: string;
  type: 'vulnerability' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  code?: string;
  recommendation: string;
  cwe?: string;
  owasp?: string;
}

export interface SecurityScanResult {
  timestamp: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  issues: SecurityIssue[];
  summary: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  };
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];

  /**
   * 扫描代码中的安全漏洞
   */
  public async scanCode(
    code: string,
    filePath: string
  ): Promise<SecurityIssue[]> {
    this.issues = [];

    // 扫描各种安全漏洞
    this.scanSQLInjection(code, filePath);
    this.scanXSS(code, filePath);
    this.scanCSRF(code, filePath);
    this.scanInsecureDirectObjectReference(code, filePath);
    this.scanSecurityMisconfiguration(code, filePath);
    this.scanSensitiveDataExposure(code, filePath);
    this.scanMissingFunctionLevelAccessControl(code, filePath);
    this.scanCrossSiteScripting(code, filePath);
    this.scanUsingComponentsWithKnownVulnerabilities(code, filePath);
    this.scanUnderprotectedAPIs(code, filePath);
    this.scanInsufficientLogging(code, filePath);
    this.scanServerSideRequestForgery(code, filePath);

    return this.issues;
  }

  /**
   * 扫描SQL注入漏洞
   */
  private scanSQLInjection(code: string, filePath: string): void {
    const sqlPatterns = [
      /query\s*\(\s*['"`][^'"`]*\$\{/g,
      /query\s*\(\s*['"`][^'"`]*\+/g,
      /query\s*\(\s*['"`][^'"`]*concat/g,
      /SELECT.*FROM.*WHERE.*\+/g,
      /INSERT.*INTO.*VALUES.*\+/g,
      /UPDATE.*SET.*WHERE.*\+/g,
      /DELETE.*FROM.*WHERE.*\+/g,
    ];

    sqlPatterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addIssue({
            id: `sql-injection-${index}`,
            type: 'vulnerability',
            severity: 'high',
            title: 'SQL注入漏洞',
            description: '发现可能的SQL注入漏洞，使用了字符串拼接构建SQL查询',
            file: filePath,
            code: match,
            recommendation:
              '使用参数化查询或预编译语句，避免直接拼接用户输入到SQL语句中',
            cwe: 'CWE-89',
            owasp: 'A03:2021 – Injection',
          });
        });
      }
    });
  }

  /**
   * 扫描XSS漏洞
   */
  private scanXSS(code: string, filePath: string): void {
    const xssPatterns = [
      /dangerouslySetInnerHTML/g,
      /innerHTML\s*=/g,
      /document\.write/g,
      /eval\s*\(/g,
      /Function\s*\(/g,
      /setTimeout\s*\(\s*['"`]/g,
      /setInterval\s*\(\s*['"`]/g,
    ];

    xssPatterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addIssue({
            id: `xss-${index}`,
            type: 'vulnerability',
            severity: 'high',
            title: '跨站脚本攻击(XSS)漏洞',
            description: '发现可能的XSS漏洞，直接操作DOM或执行动态代码',
            file: filePath,
            code: match,
            recommendation:
              '对用户输入进行适当的转义和验证，使用安全的DOM操作方法',
            cwe: 'CWE-79',
            owasp: 'A03:2021 – Injection',
          });
        });
      }
    });
  }

  /**
   * 扫描CSRF漏洞
   */
  private scanCSRF(code: string, filePath: string): void {
    const csrfPatterns = [
      /fetch\s*\(\s*['"`][^'"`]*['"`]\s*,\s*\{[^}]*method\s*:\s*['"`](POST|PUT|DELETE|PATCH)['"`]/g,
      /axios\s*\.\s*(post|put|delete|patch)/g,
      /XMLHttpRequest.*open\s*\(\s*['"`](POST|PUT|DELETE|PATCH)['"`]/g,
    ];

    const hasCSRFToken = /csrf|xsrf|_token|authenticity_token/i.test(code);

    if (!hasCSRFToken) {
      csrfPatterns.forEach((pattern, index) => {
        const matches = code.match(pattern);
        if (matches) {
          matches.forEach(match => {
            this.addIssue({
              id: `csrf-${index}`,
              type: 'vulnerability',
              severity: 'medium',
              title: '跨站请求伪造(CSRF)漏洞',
              description: '发现可能的CSRF漏洞，缺少CSRF令牌保护',
              file: filePath,
              code: match,
              recommendation: '实施CSRF令牌验证，确保请求来自合法来源',
              cwe: 'CWE-352',
              owasp: 'A01:2021 – Broken Access Control',
            });
          });
        }
      });
    }
  }

  /**
   * 扫描不安全的直接对象引用
   */
  private scanInsecureDirectObjectReference(
    code: string,
    filePath: string
  ): void {
    const patterns = [
      /\/api\/[^\/]+\/\$\{/g,
      /\/api\/[^\/]+\/\+/g,
      /params\.\w+\s*:\s*['"`][^'"`]*\$\{/g,
    ];

    patterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addIssue({
            id: `idor-${index}`,
            type: 'vulnerability',
            severity: 'medium',
            title: '不安全的直接对象引用',
            description: '发现可能的IDOR漏洞，直接使用用户输入作为资源标识符',
            file: filePath,
            code: match,
            recommendation:
              '实施适当的访问控制，验证用户是否有权访问请求的资源',
            cwe: 'CWE-639',
            owasp: 'A01:2021 – Broken Access Control',
          });
        });
      }
    });
  }

  /**
   * 扫描安全配置错误
   */
  private scanSecurityMisconfiguration(code: string, filePath: string): void {
    const patterns = [
      /cors\s*:\s*\{\s*origin\s*:\s*true/g,
      /cors\s*:\s*\{\s*origin\s*:\s*['"`]\*['"`]/g,
      /helmet\s*\(\s*\)/g,
      /express\.static\s*\(/g,
      /process\.env\.NODE_ENV\s*!==\s*['"`]production['"`]/g,
    ];

    patterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addIssue({
            id: `misconfig-${index}`,
            type: 'warning',
            severity: 'medium',
            title: '安全配置错误',
            description: '发现可能的安全配置问题',
            file: filePath,
            code: match,
            recommendation: '检查安全配置，确保在生产环境中使用适当的安全设置',
            cwe: 'CWE-16',
            owasp: 'A05:2021 – Security Misconfiguration',
          });
        });
      }
    });
  }

  /**
   * 扫描敏感数据泄露
   */
  private scanSensitiveDataExposure(code: string, filePath: string): void {
    const patterns = [
      /password\s*:\s*['"`][^'"`]*['"`]/g,
      /api[_-]?key\s*:\s*['"`][^'"`]*['"`]/g,
      /secret\s*:\s*['"`][^'"`]*['"`]/g,
      /token\s*:\s*['"`][^'"`]*['"`]/g,
      /console\.log\s*\(\s*[^)]*password[^)]*\)/gi,
      /console\.log\s*\(\s*[^)]*api[_-]?key[^)]*\)/gi,
    ];

    patterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addIssue({
            id: `sensitive-data-${index}`,
            type: 'vulnerability',
            severity: 'high',
            title: '敏感数据泄露',
            description: '发现可能的敏感数据泄露，硬编码密码或API密钥',
            file: filePath,
            code: match,
            recommendation: '使用环境变量存储敏感信息，避免在代码中硬编码',
            cwe: 'CWE-798',
            owasp: 'A02:2021 – Cryptographic Failures',
          });
        });
      }
    });
  }

  /**
   * 扫描缺少函数级访问控制
   */
  private scanMissingFunctionLevelAccessControl(
    code: string,
    filePath: string
  ): void {
    const patterns = [
      /export\s+async\s+function\s+\w+\s*\([^)]*req[^)]*\)/g,
      /app\.(get|post|put|delete|patch)\s*\(/g,
    ];

    const hasAuthCheck =
      /auth|authenticate|authorize|middleware|jwt|session/i.test(code);

    if (!hasAuthCheck) {
      patterns.forEach((pattern, index) => {
        const matches = code.match(pattern);
        if (matches) {
          matches.forEach(match => {
            this.addIssue({
              id: `missing-auth-${index}`,
              type: 'warning',
              severity: 'medium',
              title: '缺少函数级访问控制',
              description: 'API端点缺少身份验证和授权检查',
              file: filePath,
              code: match,
              recommendation: '实施适当的身份验证和授权中间件',
              cwe: 'CWE-285',
              owasp: 'A01:2021 – Broken Access Control',
            });
          });
        }
      });
    }
  }

  /**
   * 扫描跨站脚本攻击
   */
  private scanCrossSiteScripting(code: string, filePath: string): void {
    // 已在scanXSS中处理
  }

  /**
   * 扫描使用已知漏洞的组件
   */
  private scanUsingComponentsWithKnownVulnerabilities(
    code: string,
    filePath: string
  ): void {
    const vulnerablePackages = [
      'lodash@4.17.0',
      'jquery@1.12.0',
      'moment@2.24.0',
      'express@4.16.0',
    ];

    vulnerablePackages.forEach((pkg, index) => {
      if (code.includes(pkg)) {
        this.addIssue({
          id: `vulnerable-package-${index}`,
          type: 'warning',
          severity: 'medium',
          title: '使用已知漏洞的组件',
          description: `发现使用了可能存在安全漏洞的包: ${pkg}`,
          file: filePath,
          recommendation: '更新到最新版本或使用替代方案',
          cwe: 'CWE-1104',
          owasp: 'A06:2021 – Vulnerable and Outdated Components',
        });
      }
    });
  }

  /**
   * 扫描保护不足的API
   */
  private scanUnderprotectedAPIs(code: string, filePath: string): void {
    const patterns = [/rate[_-]?limit/gi, /throttle/gi, /helmet/gi, /cors/gi];

    const hasProtection = patterns.some(pattern => pattern.test(code));

    if (!hasProtection && /app\.(get|post|put|delete|patch)/.test(code)) {
      this.addIssue({
        id: 'underprotected-api',
        type: 'warning',
        severity: 'medium',
        title: 'API保护不足',
        description: 'API端点缺少速率限制、CORS等保护措施',
        file: filePath,
        recommendation: '实施速率限制、CORS、安全头等保护措施',
        cwe: 'CWE-770',
        owasp: 'A05:2021 – Security Misconfiguration',
      });
    }
  }

  /**
   * 扫描日志记录不足
   */
  private scanInsufficientLogging(code: string, filePath: string): void {
    const hasLogging = /console\.(log|error|warn)|logger|winston|pino/i.test(
      code
    );

    if (!hasLogging && /app\.(get|post|put|delete|patch)/.test(code)) {
      this.addIssue({
        id: 'insufficient-logging',
        type: 'info',
        severity: 'low',
        title: '日志记录不足',
        description: 'API端点缺少适当的日志记录',
        file: filePath,
        recommendation:
          '实施适当的日志记录，包括访问日志、错误日志和安全事件日志',
        cwe: 'CWE-778',
        owasp: 'A09:2021 – Security Logging and Monitoring Failures',
      });
    }
  }

  /**
   * 扫描服务器端请求伪造
   */
  private scanServerSideRequestForgery(code: string, filePath: string): void {
    const patterns = [
      /fetch\s*\(\s*[^)]*req\.(query|params|body)/g,
      /axios\s*\.\s*(get|post|put|delete)\s*\(\s*[^)]*req\.(query|params|body)/g,
      /http\.(get|post|put|delete)/g,
    ];

    patterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addIssue({
            id: `ssrf-${index}`,
            type: 'vulnerability',
            severity: 'high',
            title: '服务器端请求伪造(SSRF)漏洞',
            description: '发现可能的SSRF漏洞，直接使用用户输入发起HTTP请求',
            file: filePath,
            code: match,
            recommendation: '验证和过滤用户输入，使用白名单限制允许的URL',
            cwe: 'CWE-918',
            owasp: 'A10:2021 – Server-Side Request Forgery',
          });
        });
      }
    });
  }

  /**
   * 添加安全问题
   */
  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  /**
   * 生成安全扫描报告
   */
  public generateReport(): SecurityScanResult {
    const criticalIssues = this.issues.filter(
      i => i.severity === 'critical'
    ).length;
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(
      i => i.severity === 'medium'
    ).length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;

    // 计算安全评分
    const score = Math.max(
      0,
      100 -
        (criticalIssues * 20 +
          highIssues * 10 +
          mediumIssues * 5 +
          lowIssues * 2)
    );
    const grade =
      score >= 90
        ? 'A'
        : score >= 80
          ? 'B'
          : score >= 70
            ? 'C'
            : score >= 60
              ? 'D'
              : 'F';

    // 生成建议
    const recommendations = this.generateRecommendations();

    return {
      timestamp: Date.now(),
      totalIssues: this.issues.length,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      issues: this.issues,
      summary: {
        score,
        grade,
        recommendations,
      },
    };
  }

  /**
   * 生成修复建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (
      this.issues.some(
        i => i.type === 'vulnerability' && i.severity === 'critical'
      )
    ) {
      recommendations.push('立即修复所有关键漏洞');
    }

    if (this.issues.some(i => i.title.includes('SQL注入'))) {
      recommendations.push('实施参数化查询防止SQL注入');
    }

    if (this.issues.some(i => i.title.includes('XSS'))) {
      recommendations.push('对用户输入进行适当的转义和验证');
    }

    if (this.issues.some(i => i.title.includes('CSRF'))) {
      recommendations.push('实施CSRF令牌验证');
    }

    if (this.issues.some(i => i.title.includes('敏感数据'))) {
      recommendations.push('使用环境变量存储敏感信息');
    }

    if (this.issues.some(i => i.title.includes('身份验证'))) {
      recommendations.push('实施适当的身份验证和授权机制');
    }

    if (this.issues.some(i => i.title.includes('日志记录'))) {
      recommendations.push('实施全面的安全日志记录');
    }

    return recommendations;
  }
}

export { SecurityScanner };
