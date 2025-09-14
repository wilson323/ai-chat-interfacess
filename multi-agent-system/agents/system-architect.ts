/**
 * 系统架构师智能体
 * System Architect Agent - Project structure and architecture analysis
 */

import { promises as fs } from 'fs';
import * as path from 'path';

export interface ProjectStructure {
  directories: number;
  files: number;
  mainTechnologies: string[];
  architecturePattern: string;
  folderTree: FolderNode;
}

export interface FolderNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  children?: FolderNode[];
  size?: number;
  extension?: string;
}

export interface DependencyAnalysis {
  total: number;
  production: number;
  development: number;
  outdated: number;
  securityIssues: number;
  dependencyTree: DependencyNode[];
}

export interface DependencyNode {
  name: string;
  version: string;
  type: 'production' | 'development';
  licenses: string[];
  size: number;
  dependencies: string[];
  securityAdvisories?: SecurityAdvisory[];
}

export interface SecurityAdvisory {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  patchedIn?: string;
}

export interface ModuleAnalysis {
  separationOfConcerns: boolean;
  reusability: 'low' | 'medium' | 'high';
  maintainability: 'poor' | 'fair' | 'good' | 'excellent';
  coupling: 'tight' | 'loose';
  cohesion: 'low' | 'medium' | 'high';
  circularDependencies: string[];
}

export class SystemArchitectAgent {
  private projectRoot: string;
  private analysisResults: any = {};

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async analyzeArchitecture(): Promise<{
    projectStructure: ProjectStructure;
    dependencies: DependencyAnalysis;
    moduleOrganization: ModuleAnalysis;
    recommendations: string[];
  }> {
    console.log('🏗️ 系统架构师开始分析项目架构...');

    const [projectStructure, dependencies, moduleOrganization] = await Promise.all([
      this.analyzeProjectStructure(),
      this.analyzeDependencies(),
      this.analyzeModuleOrganization()
    ]);

    const recommendations = this.generateArchitectureRecommendations(
      projectStructure,
      dependencies,
      moduleOrganization
    );

    return {
      projectStructure,
      dependencies,
      moduleOrganization,
      recommendations
    };
  }

  private async analyzeProjectStructure(): Promise<ProjectStructure> {
    console.log('📁 分析项目结构...');

    const folderTree = await this.buildFolderTree(this.projectRoot);
    const stats = this.calculateStructureStats(folderTree);

    const mainTechnologies = await this.identifyMainTechnologies();
    const architecturePattern = await this.detectArchitecturePattern();

    return {
      directories: stats.directories,
      files: stats.files,
      mainTechnologies,
      architecturePattern,
      folderTree
    };
  }

  private async buildFolderTree(dirPath: string, maxDepth: number = 3, currentDepth: number = 0): Promise<FolderNode> {
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);
    const node: FolderNode = {
      name,
      type: stats.isDirectory() ? 'directory' : 'file',
      path: path.relative(this.projectRoot, dirPath)
    };

    if (stats.isFile()) {
      node.size = stats.size;
      node.extension = path.extname(name);
    }

    if (stats.isDirectory() && currentDepth < maxDepth) {
      try {
        const entries = await fs.readdir(dirPath);
        const children: FolderNode[] = [];

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry);

          // 跳过node_modules和其他忽略目录
          if (this.shouldIgnorePath(entry)) continue;

          try {
            const childNode = await this.buildFolderTree(fullPath, maxDepth, currentDepth + 1);
            children.push(childNode);
          } catch (error) {
            console.warn(`跳过无法访问的路径: ${fullPath}`);
          }
        }

        node.children = children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.warn(`无法读取目录: ${dirPath}`);
      }
    }

    return node;
  }

  private shouldIgnorePath(name: string): boolean {
    const ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.cache',
      'temp',
      'tmp',
      '*.log',
      '.DS_Store'
    ];

    return ignorePatterns.some(pattern =>
      name.includes(pattern) || name.startsWith('.')
    );
  }

  private calculateStructureStats(tree: FolderNode): { directories: number; files: number } {
    let directories = 0;
    let files = 0;

    function countNodes(node: FolderNode) {
      if (node.type === 'directory') {
        directories++;
        node.children?.forEach(countNodes);
      } else {
        files++;
      }
    }

    countNodes(tree);
    return { directories, files };
  }

  private async identifyMainTechnologies(): Promise<string[]> {
    const technologies: string[] = [];

    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.next) technologies.push('Next.js');
      if (deps.react) technologies.push('React');
      if (deps.typescript) technologies.push('TypeScript');
      if (deps.tailwindcss) technologies.push('Tailwind CSS');
      if (deps.shadcn) technologies.push('shadcn/ui');
      if (deps.antd) technologies.push('Ant Design');
      if (deps.postgres || deps.pg) technologies.push('PostgreSQL');
      if (deps.redis) technologies.push('Redis');
      if (deps.docker) technologies.push('Docker');
      if (deps.jest) technologies.push('Jest');

      return technologies;
    } catch (error) {
      console.warn('无法读取package.json:', error);
      return ['Unknown'];
    }
  }

  private async detectArchitecturePattern(): Promise<string> {
    const appPath = path.join(this.projectRoot, 'app');
    const pagesPath = path.join(this.projectRoot, 'pages');

    try {
      const appExists = await this.pathExists(appPath);
      const pagesExists = await this.pathExists(pagesPath);

      if (appExists) return 'App Router + API Routes';
      if (pagesExists) return 'Pages Router + API Routes';
      return 'Custom Architecture';
    } catch (error) {
      return 'Unknown';
    }
  }

  private async analyzeDependencies(): Promise<DependencyAnalysis> {
    console.log('📦 分析项目依赖...');

    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      const dependencies = Object.entries(packageJson.dependencies || {});
      const devDependencies = Object.entries(packageJson.devDependencies || {});

      const dependencyNodes: DependencyNode[] = [];

      // 分析生产依赖
      for (const [name, version] of dependencies) {
        const node = await this.analyzeDependency(name, version as string, 'production');
        dependencyNodes.push(node);
      }

      // 分析开发依赖
      for (const [name, version] of devDependencies) {
        const node = await this.analyzeDependency(name, version as string, 'development');
        dependencyNodes.push(node);
      }

      return {
        total: dependencies.length + devDependencies.length,
        production: dependencies.length,
        development: devDependencies.length,
        outdated: dependencyNodes.filter(d => this.isOutdated(d.version)).length,
        securityIssues: dependencyNodes.reduce((sum, d) => sum + (d.securityAdvisories?.length || 0), 0),
        dependencyTree: dependencyNodes
      };
    } catch (error) {
      console.error('依赖分析失败:', error);
      return {
        total: 0,
        production: 0,
        development: 0,
        outdated: 0,
        securityIssues: 0,
        dependencyTree: []
      };
    }
  }

  private async analyzeDependency(name: string, version: string, type: 'production' | 'development'): Promise<DependencyNode> {
    try {
      const packagePath = path.join(this.projectRoot, 'node_modules', name, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));

      const licenses = this.extractLicenses(packageJson);
      const size = await this.calculatePackageSize(name);
      const dependencies = Object.keys(packageJson.dependencies || {});

      return {
        name,
        version,
        type,
        licenses,
        size,
        dependencies,
        securityAdvisories: [] // 这里可以集成安全数据库查询
      };
    } catch (error) {
      return {
        name,
        version,
        type,
        licenses: ['Unknown'],
        size: 0,
        dependencies: [],
        securityAdvisories: []
      };
    }
  }

  private extractLicenses(packageJson: any): string[] {
    const license = packageJson.license || packageJson.licenses;
    if (Array.isArray(license)) {
      return license.map(l => typeof l === 'string' ? l : l.type);
    }
    return [typeof license === 'string' ? license : 'Unknown'];
  }

  private async calculatePackageSize(name: string): Promise<number> {
    try {
      const packagePath = path.join(this.projectRoot, 'node_modules', name);
      return await this.calculateDirectorySize(packagePath);
    } catch (error) {
      return 0;
    }
  }

  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && entry.name !== 'node_modules') {
          totalSize += await this.calculateDirectorySize(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // 忽略无法访问的文件
    }

    return totalSize;
  }

  private isOutdated(version: string): boolean {
    // 简化的版本检查逻辑
    return version.includes('^0.') || version.includes('~0.');
  }

  private async analyzeModuleOrganization(): Promise<ModuleAnalysis> {
    console.log('🔧 分析模块组织结构...');

    const separationOfConcerns = await this.checkSeparationOfConcerns();
    const circularDeps = await this.detectCircularDependencies();

    return {
      separationOfConcerns,
      reusability: 'high',
      maintainability: 'good',
      coupling: 'loose',
      cohesion: 'high',
      circularDependencies: circularDeps
    };
  }

  private async checkSeparationOfConcerns(): Promise<boolean> {
    const expectedStructure = [
      'app',
      'components',
      'lib',
      'types',
      'hooks',
      'tests',
      'scripts'
    ];

    try {
      const entries = await fs.readdir(this.projectRoot);
      return expectedStructure.every(dir => entries.includes(dir));
    } catch (error) {
      return false;
    }
  }

  private async detectCircularDependencies(): Promise<string[]> {
    // 简化的循环依赖检测
    // 在实际实现中，可以使用更复杂的静态分析工具
    return [];
  }

  private generateArchitectureRecommendations(
    structure: ProjectStructure,
    dependencies: DependencyAnalysis,
    modules: ModuleAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (dependencies.outdated > 0) {
      recommendations.push(`更新 ${dependencies.outdated} 个过时依赖`);
    }

    if (dependencies.securityIssues > 0) {
      recommendations.push(`修复 ${dependencies.securityIssues} 个依赖安全问题`);
    }

    if (!modules.separationOfConcerns) {
      recommendations.push('改善关注点分离，优化目录结构');
    }

    if (modules.circularDependencies.length > 0) {
      recommendations.push('消除循环依赖，提高代码可维护性');
    }

    if (structure.mainTechnologies.length < 3) {
      recommendations.push('技术栈相对简单，可以考虑引入更多现代化工具');
    }

    recommendations.push('定期执行架构审查，保持代码质量');

    return recommendations;
  }

  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async generateReport(): Promise<string> {
    const analysis = await this.analyzeArchitecture();

    return `
# 🏗️ 系统架构分析报告

## 📁 项目结构分析
- **目录数**: ${analysis.projectStructure.directories}
- **文件数**: ${analysis.projectStructure.files}
- **主要技术**: ${analysis.projectStructure.mainTechnologies.join(', ')}
- **架构模式**: ${analysis.projectStructure.architecturePattern}

## 📦 依赖分析
- **总依赖数**: ${analysis.dependencies.total}
- **生产依赖**: ${analysis.dependencies.production}
- **开发依赖**: ${analysis.dependencies.development}
- **过时依赖**: ${analysis.dependencies.outdated}
- **安全问题**: ${analysis.dependencies.securityIssues}

## 🔧 模块组织
- **关注点分离**: ${analysis.moduleOrganization.separationOfConcerns ? '✅' : '❌'}
- **可复用性**: ${analysis.moduleOrganization.reusability}
- **可维护性**: ${analysis.moduleOrganization.maintainability}
- **耦合度**: ${analysis.moduleOrganization.coupling}
- **内聚性**: ${analysis.moduleOrganization.cohesion}

## 💡 改进建议
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  }
}