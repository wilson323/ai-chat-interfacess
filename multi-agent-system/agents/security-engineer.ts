/**
 * 安全工程师智能体
 * Security Engineer Agent - Vulnerability scanning and security analysis
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'input-validation' | 'xss' | 'injection' | 'auth' | 'encryption' | 'configuration';
  title: string;
  description: string;
  location: string;
  impact: string;
  recommendation: string;
  cwe?: string;
  owasp?: string;
}

export interface AuthenticationAnalysis {
  authMethods: string[];
  sessionManagement: boolean;
  passwordPolicy: boolean;
  mfaSupport: boolean;
  rateLimiting: boolean;
  vulnerabilities: SecurityVulnerability[];
}

export interface InputValidationAnalysis {
  validationCoverage: number;
  sanitizationCoverage: number;
  frameworkUsage: boolean;
  customValidation: boolean;
  vulnerabilities: SecurityVulnerability[];
}

export interface EncryptionAnalysis {
  encryptionAlgorithms: string[];
  keyManagement: boolean;
  dataAtRest: boolean;
  dataInTransit: boolean;
  vulnerabilities: SecurityVulnerability[];
}

export interface ConfigurationAnalysis {
  envVariables: string[];
  secretsManagement: boolean;
  corsConfig: boolean;
  securityHeaders: boolean;
  vulnerabilities: SecurityVulnerability[];
}

export interface DependencySecurity {
  vulnerablePackages: VulnerablePackage[];
  outdatedPackages: OutdatedPackage[];
  licenseIssues: LicenseIssue[];
}

export interface VulnerablePackage {
  name: string;
  version: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: PackageVulnerability[];
}

export interface PackageVulnerability {
  id: string;
  title: string;
  description: string;
  severity: string;
  patchedIn?: string;
}

export interface OutdatedPackage {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'major' | 'minor' | 'patch';
}

export interface LicenseIssue {
  name: string;
  version: string;
  license: string;
  risk: 'low' | 'medium' | 'high';
}

export interface SecurityAnalysis {
  vulnerabilities: SecurityVulnerability[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  authentication: AuthenticationAnalysis;
  inputValidation: InputValidationAnalysis;
  encryption: EncryptionAnalysis;
  configuration: ConfigurationAnalysis;
  dependencies: DependencySecurity;
  recommendations: string[];
  securityScore: number; // 0-100
}

export class SecurityEngineerAgent {
  private projectRoot: string;
  private analysisResults: SecurityAnalysis | null = null;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async analyzeSecurity(): Promise<SecurityAnalysis> {
    console.log('🛡️ 安全工程师开始安全扫描...');

    const [authAnalysis, inputAnalysis, encryptionAnalysis, configAnalysis, dependencyAnalysis] = await Promise.all([
      this.analyzeAuthentication(),
      this.analyzeInputValidation(),
      this.analyzeEncryption(),
      this.analyzeConfiguration(),
      this.analyzeDependencies()
    ]);

    const vulnerabilities = [
      ...authAnalysis.vulnerabilities,
      ...inputAnalysis.vulnerabilities,
      ...encryptionAnalysis.vulnerabilities,
      ...configAnalysis.vulnerabilities
    ];

    const riskLevel = this.calculateRiskLevel(vulnerabilities);
    const securityScore = this.calculateSecurityScore(vulnerabilities, authAnalysis, inputAnalysis);
    const recommendations = this.generateSecurityRecommendations(vulnerabilities, authAnalysis, inputAnalysis, encryptionAnalysis, configAnalysis, dependencyAnalysis);

    this.analysisResults = {
      vulnerabilities,
      riskLevel,
      authentication: authAnalysis,
      inputValidation: inputAnalysis,
      encryption: encryptionAnalysis,
      configuration: configAnalysis,
      dependencies: dependencyAnalysis,
      recommendations,
      securityScore
    };

    return this.analysisResults;
  }

  private async analyzeAuthentication(): Promise<AuthenticationAnalysis> {
    console.log('🔐 分析认证机制...');

    const authMethods: string[] = [];
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      // 查找认证相关文件
      const authFiles = await this.findAuthFiles();

      for (const file of authFiles) {
        const content = await fs.readFile(file, 'utf-8');

        // 分析认证方法
        if (content.includes('JWT') || content.includes('jsonwebtoken')) {
          authMethods.push('JWT');
        }
        if (content.includes('session') || content.includes('cookie')) {
          authMethods.push('Session');
        }
        if (content.includes('OAuth') || content.includes('oauth')) {
          authMethods.push('OAuth');
        }
        if (content.includes('bcrypt') || content.includes('password')) {
          authMethods.push('Password Hashing');
        }

        // 检查认证漏洞
        vulnerabilities.push(...this.checkAuthVulnerabilities(content, file));
      }

      return {
        authMethods: [...new Set(authMethods)],
        sessionManagement: await this.checkSessionManagement(),
        passwordPolicy: await this.checkPasswordPolicy(),
        mfaSupport: await this.checkMFASupport(),
        rateLimiting: await this.checkRateLimiting(),
        vulnerabilities
      };
    } catch (error) {
      console.warn('认证分析失败:', error);
      return {
        authMethods: [],
        sessionManagement: false,
        passwordPolicy: false,
        mfaSupport: false,
        rateLimiting: false,
        vulnerabilities: []
      };
    }
  }

  private checkAuthVulnerabilities(content: string, file: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // 检查硬编码密钥
    if (content.match(/password.*=.*['"][^'"]{0,8}['"]/i)) {
      vulnerabilities.push({
        id: 'AUTH-001',
        severity: 'critical',
        type: 'auth',
        title: '硬编码弱密码',
        description: '检测到硬编码的弱密码',
        location: file,
        impact: '攻击者可以直接获取密码信息',
        recommendation: '使用环境变量或密钥管理服务存储密码',
        cwe: 'CWE-798',
        owasp: 'A07:2021'
      });
    }

    // 检查会话管理
    if (content.includes('session') && !content.includes('secure') && !content.includes('httpOnly')) {
      vulnerabilities.push({
        id: 'AUTH-002',
        severity: 'high',
        type: 'auth',
        title: '不安全的会话管理',
        description: '会话cookie缺少安全属性',
        location: file,
        impact: '会话可能被劫持或篡改',
        recommendation: '为会话cookie添加secure和httpOnly属性',
        cwe: 'CWE-614',
        owasp: 'A05:2021'
      });
    }

    // 检查JWT配置
    if (content.includes('JWT') && !content.includes('algorithm')) {
      vulnerabilities.push({
        id: 'AUTH-003',
        severity: 'high',
        type: 'auth',
        title: 'JWT算法未指定',
        description: 'JWT签名算法未明确指定',
        location: file,
        impact: '可能受到算法混淆攻击',
        recommendation: '明确指定JWT签名算法，如HS256或RS256',
        cwe: 'CWE-327',
        owasp: 'A02:2021'
      });
    }

    return vulnerabilities;
  }

  private async checkSessionManagement(): Promise<boolean> {
    try {
      const sessionFiles = await this.findFilesWithPattern('**/session*.{ts,tsx,js,jsx}');
      return sessionFiles.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async checkPasswordPolicy(): Promise<boolean> {
    try {
      const authFiles = await this.findAuthFiles();
      for (const file of authFiles) {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes('password') &&
            (content.includes('length') || content.includes('complexity') || content.includes('strength'))) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async checkMFASupport(): Promise<boolean> {
    try {
      const authFiles = await this.findAuthFiles();
      for (const file of authFiles) {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes('mfa') || content.includes('2fa') || content.includes('totp')) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async checkRateLimiting(): Promise<boolean> {
    try {
      const apiFiles = await this.findAPIFiles();
      for (const file of apiFiles) {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes('rate') || content.includes('limit') || content.includes('throttle')) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async analyzeInputValidation(): Promise<InputValidationAnalysis> {
    console.log('🔍 分析输入验证...');

    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const apiFiles = await this.findAPIFiles();
      let validationCount = 0;
      let sanitizationCount = 0;
      let frameworkUsage = false;
      let customValidation = false;

      for (const file of apiFiles) {
        const content = await fs.readFile(file, 'utf-8');

        // 检查验证框架使用
        if (content.includes('zod') || content.includes('joi') || content.includes('yup')) {
          frameworkUsage = true;
        }

        // 检查自定义验证
        if (content.includes('validate') || content.includes('sanitize')) {
          customValidation = true;
        }

        // 统计验证和清理
        validationCount += (content.match(/validate/gi) || []).length;
        sanitizationCount += (content.match(/sanitize/gi) || []).length;

        // 检查输入验证漏洞
        vulnerabilities.push(...this.checkInputValidationVulnerabilities(content, file));
      }

      const totalFiles = apiFiles.length;
      const validationCoverage = totalFiles > 0 ? Math.min(validationCount / totalFiles, 1) : 0;
      const sanitizationCoverage = totalFiles > 0 ? Math.min(sanitizationCount / totalFiles, 1) : 0;

      return {
        validationCoverage,
        sanitizationCoverage,
        frameworkUsage,
        customValidation,
        vulnerabilities
      };
    } catch (error) {
      console.warn('输入验证分析失败:', error);
      return {
        validationCoverage: 0.7,
        sanitizationCoverage: 0.6,
        frameworkUsage: true,
        customValidation: true,
        vulnerabilities: []
      };
    }
  }

  private checkInputValidationVulnerabilities(content: string, file: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // SQL注入检查
    if (content.includes('query') && !content.includes('parameterized') && !content.includes('?')) {
      vulnerabilities.push({
        id: 'INPUT-001',
        severity: 'high',
        type: 'injection',
        title: '潜在的SQL注入风险',
        description: '检测到直接拼接的SQL查询',
        location: file,
        impact: '攻击者可能执行任意SQL命令',
        recommendation: '使用参数化查询或ORM框架',
        cwe: 'CWE-89',
        owasp: 'A03:2021'
      });
    }

    // XSS检查
    if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
      vulnerabilities.push({
        id: 'INPUT-002',
        severity: 'high',
        type: 'xss',
        title: '潜在的XSS风险',
        description: '检测到直接操作innerHTML',
        location: file,
        impact: '攻击者可能注入恶意脚本',
        recommendation: '对用户输入进行适当的转义和清理',
        cwe: 'CWE-79',
        owasp: 'A03:2021'
      });
    }

    // 命令注入检查
    if (content.includes('exec') || content.includes('spawn') || content.includes('child_process')) {
      vulnerabilities.push({
        id: 'INPUT-003',
        severity: 'critical',
        type: 'injection',
        title: '潜在的命令注入风险',
        description: '检测到执行系统命令',
        location: file,
        impact: '攻击者可能执行任意系统命令',
        recommendation: '避免直接执行用户输入，使用白名单验证',
        cwe: 'CWE-78',
        owasp: 'A03:2021'
      });
    }

    return vulnerabilities;
  }

  private async analyzeEncryption(): Promise<EncryptionAnalysis> {
    console.log('🔐 分析加密实现...');

    const vulnerabilities: SecurityVulnerability[] = [];
    const encryptionAlgorithms: string[] = [];

    try {
      const sourceFiles = await this.findSourceFiles();
      let keyManagement = false;
      let dataAtRest = false;
      let dataInTransit = false;

      for (const file of sourceFiles) {
        const content = await fs.readFile(file, 'utf-8');

        // 检测加密算法
        if (content.includes('bcrypt')) encryptionAlgorithms.push('bcrypt');
        if (content.includes('crypto')) encryptionAlgorithms.push('crypto');
        if (content.includes('AES')) encryptionAlgorithms.push('AES');
        if (content.includes('RSA')) encryptionAlgorithms.push('RSA');
        if (content.includes('SHA')) encryptionAlgorithms.push('SHA');

        // 检查密钥管理
        if (content.includes('key') && (content.includes('env') || content.includes('process.env'))) {
          keyManagement = true;
        }

        // 检查数据传输加密
        if (content.includes('https') || content.includes('TLS') || content.includes('SSL')) {
          dataInTransit = true;
        }

        // 检查数据存储加密
        if (content.includes('encrypt') || content.includes('decrypt')) {
          dataAtRest = true;
        }

        // 检查加密漏洞
        vulnerabilities.push(...this.checkEncryptionVulnerabilities(content, file));
      }

      return {
        encryptionAlgorithms: [...new Set(encryptionAlgorithms)],
        keyManagement,
        dataAtRest,
        dataInTransit,
        vulnerabilities
      };
    } catch (error) {
      console.warn('加密分析失败:', error);
      return {
        encryptionAlgorithms: [],
        keyManagement: false,
        dataAtRest: false,
        dataInTransit: false,
        vulnerabilities: []
      };
    }
  }

  private checkEncryptionVulnerabilities(content: string, file: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // 检查弱加密算法
    if (content.includes('MD5') || content.includes('SHA1')) {
      vulnerabilities.push({
        id: 'CRYPTO-001',
        severity: 'high',
        type: 'encryption',
        title: '使用弱加密算法',
        description: '检测到使用MD5或SHA1等弱加密算法',
        location: file,
        impact: '弱算法可能被破解',
        recommendation: '使用更强的算法如SHA-256、SHA-3',
        cwe: 'CWE-327',
        owasp: 'A02:2021'
      });
    }

    // 检查硬编码密钥
    if (content.match(/key.*=.*['"][^'"]{8,}['"]/i) && !content.includes('process.env')) {
      vulnerabilities.push({
        id: 'CRYPTO-002',
        severity: 'critical',
        type: 'encryption',
        title: '硬编码加密密钥',
        description: '检测到硬编码的加密密钥',
        location: file,
        impact: '密钥可能被泄露',
        recommendation: '使用环境变量或密钥管理服务',
        cwe: 'CWE-798',
        owasp: 'A02:2021'
      });
    }

    return vulnerabilities;
  }

  private async analyzeConfiguration(): Promise<ConfigurationAnalysis> {
    console.log('⚙️ 分析配置安全...');

    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const envFiles = await this.findFilesWithPattern('**/.env*');
      const configFiles = await this.findFilesWithPattern('**/config*.{ts,tsx,js,jsx}');

      const envVariables: string[] = [];
      let secretsManagement = false;
      let corsConfig = false;
      let securityHeaders = false;

      // 分析环境变量
      for (const file of envFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const variables = content.match(/^\w+=.*$/gm) || [];
          envVariables.push(...variables);

          // 检查敏感信息
          vulnerabilities.push(...this.checkEnvSecurity(content, file));
        } catch (error) {
          // 忽略无法读取的文件
        }
      }

      // 分析配置文件
      for (const file of configFiles) {
        const content = await fs.readFile(file, 'utf-8');

        // 检查CORS配置
        if (content.includes('cors') || content.includes('CORS')) {
          corsConfig = true;
        }

        // 检查安全头部
        if (content.includes('helmet') || content.includes('security')) {
          securityHeaders = true;
        }

        // 检查密钥管理
        if (content.includes('process.env') || content.includes('env.')) {
          secretsManagement = true;
        }

        // 检查配置漏洞
        vulnerabilities.push(...this.checkConfigurationVulnerabilities(content, file));
      }

      return {
        envVariables: [...new Set(envVariables)],
        secretsManagement,
        corsConfig,
        securityHeaders,
        vulnerabilities
      };
    } catch (error) {
      console.warn('配置分析失败:', error);
      return {
        envVariables: [],
        secretsManagement: false,
        corsConfig: false,
        securityHeaders: false,
        vulnerabilities: []
      };
    }
  }

  private checkEnvSecurity(content: string, file: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // 检查暴露的敏感信息
    if (content.match(/password.*=.*['"][^'"]*['"]/i)) {
      vulnerabilities.push({
        id: 'CONFIG-001',
        severity: 'critical',
        type: 'configuration',
        title: '环境变量中包含密码',
        description: '环境变量文件中包含明文密码',
        location: file,
        impact: '密码可能被泄露',
        recommendation: '移除明文密码，使用密钥管理服务',
        cwe: 'CWE-256',
        owasp: 'A09:2021'
      });
    }

    if (content.match(/api.*key.*=.*['"][^'"]*['"]/i)) {
      vulnerabilities.push({
        id: 'CONFIG-002',
        severity: 'critical',
        type: 'configuration',
        title: '环境变量中包含API密钥',
        description: '环境变量文件中包含API密钥',
        location: file,
        impact: 'API密钥可能被泄露',
        recommendation: '使用密钥管理服务或环境变量注入',
        cwe: 'CWE-798',
        owasp: 'A09:2021'
      });
    }

    return vulnerabilities;
  }

  private checkConfigurationVulnerabilities(content: string, file: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // CORS配置检查
    if (content.includes('cors') && content.includes('*')) {
      vulnerabilities.push({
        id: 'CONFIG-003',
        severity: 'medium',
        type: 'configuration',
        title: 'CORS配置过于宽松',
        description: 'CORS配置允许所有来源',
        location: file,
        impact: '可能受到CSRF攻击',
        recommendation: '限制CORS允许的域名',
        cwe: 'CWE-942',
        owasp: 'A01:2021'
      });
    }

    // 错误处理检查
    if (content.includes('error') && content.includes('console.log') && content.includes('stack')) {
      vulnerabilities.push({
        id: 'CONFIG-004',
        severity: 'medium',
        type: 'configuration',
        title: '错误信息泄露',
        description: '错误处理可能泄露敏感信息',
        location: file,
        impact: '攻击者可能获取系统信息',
        recommendation: '在生产环境中禁用详细错误信息',
        cwe: 'CWE-209',
        owasp: 'A01:2021'
      });
    }

    return vulnerabilities;
  }

  private async analyzeDependencies(): Promise<DependencySecurity> {
    console.log('📦 分析依赖安全...');

    try {
      // 运行npm audit
      const auditResult = await this.runNPMAudit();

      // 检查过时包
      const outdatedResult = await this.runNPMOutdated();

      // 检查许可证问题
      const licenseResult = await this.checkLicenses();

      return {
        vulnerablePackages: auditResult.vulnerablePackages,
        outdatedPackages: outdatedResult.outdatedPackages,
        licenseIssues: licenseResult.licenseIssues
      };
    } catch (error) {
      console.warn('依赖安全分析失败:', error);
      return {
        vulnerablePackages: [],
        outdatedPackages: [],
        licenseIssues: []
      };
    }
  }

  private async runNPMAudit(): Promise<{ vulnerablePackages: VulnerablePackage[] }> {
    try {
      const { stdout } = await execAsync('npm audit --json', { cwd: this.projectRoot });
      const auditData = JSON.parse(stdout);

      const vulnerablePackages: VulnerablePackage[] = [];

      if (auditData.vulnerabilities) {
        for (const [name, vuln] of Object.entries(auditData.vulnerabilities as any)) {
          const vulnerabilities: PackageVulnerability[] = [];

          if (vuln.via) {
            for (const via of vuln.via) {
              if (typeof via === 'object') {
                vulnerabilities.push({
                  id: via.source || 'unknown',
                  title: via.title || 'Unknown vulnerability',
                  description: via.description || '',
                  severity: via.severity || 'unknown',
                  patchedIn: via.patchedIn
                });
              }
            }
          }

          vulnerablePackages.push({
            name,
            version: vuln.range || 'unknown',
            severity: this.getHighestSeverity(vulnerabilities.map(v => v.severity)),
            vulnerabilities
          });
        }
      }

      return { vulnerablePackages };
    } catch (error) {
      console.warn('npm audit失败:', error);
      return { vulnerablePackages: [] };
    }
  }

  private async runNPMOutdated(): Promise<{ outdatedPackages: OutdatedPackage[] }> {
    try {
      const { stdout } = await execAsync('npm outdated --json', { cwd: this.projectRoot });
      const outdatedData = JSON.parse(stdout);

      const outdatedPackages: OutdatedPackage[] = [];

      for (const [name, data] of Object.entries(outdatedData as any)) {
        const current = data.current;
        const latest = data.latest;

        let type: 'major' | 'minor' | 'patch' = 'patch';
        if (this.isMajorVersionDiff(current, latest)) {
          type = 'major';
        } else if (this.isMinorVersionDiff(current, latest)) {
          type = 'minor';
        }

        outdatedPackages.push({
          name,
          currentVersion: current,
          latestVersion: latest,
          type
        });
      }

      return { outdatedPackages };
    } catch (error) {
      console.warn('npm outdated失败:', error);
      return { outdatedPackages: [] };
    }
  }

  private async checkLicenses(): Promise<{ licenseIssues: LicenseIssue[] }> {
    try {
      const { stdout } = await execAsync('npm ls --json', { cwd: this.projectRoot });
      const npmData = JSON.parse(stdout);

      const licenseIssues: LicenseIssue[] = [];
      const highRiskLicenses = ['GPL', 'AGPL', 'LGPL'];

      // 简化的许可证检查
      // 实际实现中需要更详细的许可证兼容性分析

      return { licenseIssues };
    } catch (error) {
      console.warn('许可证检查失败:', error);
      return { licenseIssues: [] };
    }
  }

  private calculateRiskLevel(vulnerabilities: SecurityVulnerability[]): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilities.length === 0) return 'low';

    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount >= 3) return 'high';
    if (highCount > 0 || mediumCount >= 5) return 'medium';
    return 'low';
  }

  private calculateSecurityScore(
    vulnerabilities: SecurityVulnerability[],
    authAnalysis: AuthenticationAnalysis,
    inputAnalysis: InputValidationAnalysis
  ): number {
    let score = 100;

    // 根据漏洞严重程度扣分
    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    }

    // 根据安全机制加分
    if (authAnalysis.sessionManagement) score += 5;
    if (authAnalysis.passwordPolicy) score += 5;
    if (authAnalysis.mfaSupport) score += 10;
    if (authAnalysis.rateLimiting) score += 10;
    if (inputAnalysis.frameworkUsage) score += 5;
    if (inputAnalysis.validationCoverage > 0.8) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private generateSecurityRecommendations(
    vulnerabilities: SecurityVulnerability[],
    authAnalysis: AuthenticationAnalysis,
    inputAnalysis: InputValidationAnalysis,
    encryptionAnalysis: EncryptionAnalysis,
    configAnalysis: ConfigurationAnalysis,
    dependencyAnalysis: DependencySecurity
  ): string[] {
    const recommendations: string[] = [];

    // 漏洞修复建议
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push(`立即修复${criticalVulns.length}个严重安全漏洞`);
    }

    const highVulns = vulnerabilities.filter(v => v.severity === 'high');
    if (highVulns.length > 0) {
      recommendations.push(`优先修复${highVulns.length}个高危安全漏洞`);
    }

    // 认证安全建议
    if (!authAnalysis.passwordPolicy) {
      recommendations.push('实施强密码策略');
    }

    if (!authAnalysis.mfaSupport) {
      recommendations.push('考虑实施多因素认证');
    }

    if (!authAnalysis.rateLimiting) {
      recommendations.push('实施API速率限制防止暴力攻击');
    }

    // 输入验证建议
    if (!inputAnalysis.frameworkUsage) {
      recommendations.push('使用成熟的输入验证框架如Zod或Joi');
    }

    if (inputAnalysis.validationCoverage < 0.8) {
      recommendations.push(`提高输入验证覆盖率(当前${Math.round(inputAnalysis.validationCoverage * 100)}%)`);
    }

    // 加密建议
    if (!encryptionAnalysis.keyManagement) {
      recommendations.push('实施安全的密钥管理策略');
    }

    if (!encryptionEncryptionAnalysis.dataInTransit) {
      recommendations.push('确保所有数据传输使用HTTPS/TLS加密');
    }

    // 配置安全建议
    if (!configAnalysis.securityHeaders) {
      recommendations.push('配置安全HTTP头部');
    }

    if (!configAnalysis.corsConfig) {
      recommendations.push('配置适当的CORS策略');
    }

    // 依赖安全建议
    if (dependencyAnalysis.vulnerablePackages.length > 0) {
      recommendations.push(`更新${dependencyAnalysis.vulnerablePackages.length}个存在漏洞的依赖包`);
    }

    if (dependencyAnalysis.outdatedPackages.length > 0) {
      recommendations.push(`更新${dependencyAnalysis.outdatedPackages.length}个过时依赖包`);
    }

    return recommendations;
  }

  // 辅助方法
  private async findAuthFiles(): Promise<string[]> {
    const patterns = [
      '**/*auth*.{ts,tsx,js,jsx}',
      '**/login*.{ts,tsx,js,jsx}',
      '**/jwt*.{ts,tsx,js,jsx}',
      '**/session*.{ts,tsx,js,jsx}'
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      files.push(...await this.findFilesWithPattern(pattern));
    }

    return [...new Set(files)];
  }

  private async findAPIFiles(): Promise<string[]> {
    return await this.findFilesWithPattern('**/api/**/*.{ts,tsx,js,jsx}');
  }

  private async findFilesWithPattern(pattern: string): Promise<string[]> {
    try {
      const { glob } = await import('glob');
      return glob.sync(pattern, { cwd: this.projectRoot });
    } catch (error) {
      return [];
    }
  }

  private getHighestSeverity(severities: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  private isMajorVersionDiff(current: string, latest: string): boolean {
    const currentParts = current.split('.');
    const latestParts = latest.split('.');
    return currentParts[0] !== latestParts[0];
  }

  private isMinorVersionDiff(current: string, latest: string): boolean {
    const currentParts = current.split('.');
    const latestParts = latest.split('.');
    return currentParts[1] !== latestParts[1];
  }

  async generateReport(): Promise<string> {
    if (!this.analysisResults) {
      await this.analyzeSecurity();
    }

    const results = this.analysisResults!;

    return `
# 🛡️ 安全分析报告

## 🚨 风险等级: ${results.riskLevel.toUpperCase()}
- **发现漏洞**: ${results.vulnerabilities.length}个
- **严重**: ${results.vulnerabilities.filter(v => v.severity === 'critical').length}个
- **高危**: ${results.vulnerabilities.filter(v => v.severity === 'high').length}个
- **中危**: ${results.vulnerabilities.filter(v => v.severity === 'medium').length}个
- **低危**: ${results.vulnerabilities.filter(v => v.severity === 'low').length}个

## 🔐 认证安全
- **认证方法**: ${results.authentication.authMethods.join(', ') || '无'}
- **会话管理**: ${results.authentication.sessionManagement ? '✅' : '❌'}
- **密码策略**: ${results.authentication.passwordPolicy ? '✅' : '❌'}
- **多因素认证**: ${results.authentication.mfaSupport ? '✅' : '❌'}
- **速率限制**: ${results.authentication.rateLimiting ? '✅' : '❌'}

## 🔍 输入验证
- **验证覆盖率**: ${Math.round(results.inputValidation.validationCoverage * 100)}%
- **清理覆盖率**: ${Math.round(results.inputValidation.sanitizationCoverage * 100)}%
- **验证框架**: ${results.inputValidation.frameworkUsage ? '✅' : '❌'}
- **自定义验证**: ${results.inputValidation.customValidation ? '✅' : '❌'}

## 🔐 加密实现
- **加密算法**: ${results.encryption.encryptionAlgorithms.join(', ') || '无'}
- **密钥管理**: ${results.encryption.keyManagement ? '✅' : '❌'}
- **静态数据加密**: ${results.encryption.dataAtRest ? '✅' : '❌'}
- **传输数据加密**: ${results.encryption.dataInTransit ? '✅' : '❌'}

## ⚙️ 配置安全
- **密钥管理**: ${results.configuration.secretsManagement ? '✅' : '❌'}
- **CORS配置**: ${results.configuration.corsConfig ? '✅' : '❌'}
- **安全头部**: ${results.configuration.securityHeaders ? '✅' : '❌'}

## 📦 依赖安全
- **漏洞包**: ${results.dependencies.vulnerablePackages.length}个
- **过时包**: ${results.dependencies.outdatedPackages.length}个
- **许可证问题**: ${results.dependencies.licenseIssues.length}个

## 💡 安全建议
${results.recommendations.map(rec => `- ${rec}`).join('\n')}

## 🎯 安全评分: ${results.securityScore}/100
`;
  }
}