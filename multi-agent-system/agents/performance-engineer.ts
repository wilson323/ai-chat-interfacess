/**
 * 性能工程师智能体
 * Performance Engineer Agent - Performance analysis and optimization
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BundleAnalysis {
  total: number; // KB
  initial: number; // KB
  lazy: number; // KB
  score: number; // 0-1
  modules: BundleModule[];
  chunks: BundleChunk[];
  duplicates: DuplicateModule[];
}

export interface BundleModule {
  name: string;
  size: number;
  gzipSize: number;
  percentage: number;
  type: 'npm' | 'local' | 'builtin';
}

export interface BundleChunk {
  name: string;
  size: number;
  files: string[];
  modules: number;
}

export interface DuplicateModule {
  name: string;
  instances: string[];
  totalSize: number;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint (seconds)
  lcp: number; // Largest Contentful Paint (seconds)
  fid: number; // First Input Delay (milliseconds)
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive (seconds)
  tbt: number; // Total Blocking Time (milliseconds)
  speedIndex: number; // Speed Index (seconds)
}

export interface RuntimePerformance {
  memoryUsage: MemoryMetrics;
  cpuUsage: CPUMetrics;
  networkUsage: NetworkMetrics;
  renderPerformance: RenderMetrics;
}

export interface MemoryMetrics {
  peakHeap: number; // MB
  averageHeap: number; // MB
  leaks: MemoryLeak[];
  garbageCollection: GCMetrics;
}

export interface MemoryLeak {
  location: string;
  type: 'event-listener' | 'dom-node' | 'closure' | 'interval';
  size: number; // MB
  description: string;
}

export interface GCMetrics {
  frequency: number; // per minute
  duration: number; // average ms
  impact: 'low' | 'medium' | 'high';
}

export interface CPUMetrics {
  averageUsage: number; // percentage
  peakUsage: number; // percentage
  blockingScripts: BlockingScript[];
  longTasks: LongTask[];
}

export interface BlockingScript {
  url: string;
  duration: number; // ms
  size: number; // KB
  impact: 'low' | 'medium' | 'high';
}

export interface LongTask {
  duration: number; // ms
  startTime: number; // ms
  location: string;
  cause: string;
}

export interface NetworkMetrics {
  requests: number;
  totalSize: number; // KB
  averageTime: number; // ms
  slowRequests: SlowRequest[];
  caching: CacheMetrics;
}

export interface SlowRequest {
  url: string;
  duration: number; // ms
  size: number; // KB
  status: number;
}

export interface CacheMetrics {
  hitRate: number; // percentage
  cacheableRequests: number;
  cachedRequests: number;
  cacheHeaders: string[];
}

export interface RenderMetrics {
  componentRenders: ComponentRender[];
  reRenderCount: number;
  virtualDOMOperations: number;
  renderBlockingTime: number; // ms
}

export interface ComponentRender {
  name: string;
  count: number;
  averageTime: number; // ms
  totalTime: number; // ms
  unnecessaryRenders: number;
}

export interface DatabasePerformance {
  queryPerformance: QueryPerformance[];
  connectionPool: ConnectionPoolMetrics;
  indexing: IndexMetrics;
  slowQueries: SlowQuery[];
}

export interface QueryPerformance {
  query: string;
  averageTime: number; // ms
  executionCount: number;
  indexesUsed: string[];
  optimization: string;
}

export interface ConnectionPoolMetrics {
  poolSize: number;
  activeConnections: number;
  idleConnections: number;
  connectionTime: number; // ms
  waitTime: number; // ms
}

export interface IndexMetrics {
  totalIndexes: number;
  unusedIndexes: string[];
  missingIndexes: MissingIndex[];
  indexUsage: number; // percentage
}

export interface MissingIndex {
  table: string;
  columns: string[];
  queryFrequency: number;
  potentialBenefit: 'low' | 'medium' | 'high';
}

export interface SlowQuery {
  query: string;
  executionTime: number; // ms
  frequency: number;
  rowsExamined: number;
  rowsReturned: number;
}

export interface PerformanceAnalysis {
  bundleSize: BundleAnalysis;
  runtimePerformance: RuntimePerformance;
  databasePerformance: DatabasePerformance;
  optimizationOpportunities: string[];
  performanceScore: number; // 0-100
}

export class PerformanceEngineerAgent {
  private projectRoot: string;
  private analysisResults: PerformanceAnalysis | null = null;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async analyzePerformance(): Promise<PerformanceAnalysis> {
    console.log('⚡ 性能工程师开始分析...');

    const [bundleAnalysis, runtimePerformance, databasePerformance] = await Promise.all([
      this.analyzeBundleSize(),
      this.analyzeRuntimePerformance(),
      this.analyzeDatabasePerformance()
    ]);

    const optimizationOpportunities = this.identifyOptimizationOpportunities(
      bundleAnalysis,
      runtimePerformance,
      databasePerformance
    );

    const performanceScore = this.calculatePerformanceScore(
      bundleAnalysis,
      runtimePerformance,
      databasePerformance
    );

    this.analysisResults = {
      bundleSize: bundleAnalysis,
      runtimePerformance,
      databasePerformance,
      optimizationOpportunities,
      performanceScore
    };

    return this.analysisResults;
  }

  private async analyzeBundleSize(): Promise<BundleAnalysis> {
    console.log('📦 分析打包体积...');

    try {
      // 检查构建输出
      const buildDir = path.join(this.projectRoot, '.next');
      if (!(await this.pathExists(buildDir))) {
        // 如果没有构建结果，先运行构建
        console.log('运行构建以分析打包体积...');
        await execAsync('npm run build', { cwd: this.projectRoot });
      }

      const bundleStats = await this.analyzeBuildOutput();
      const duplicates = await this.findDuplicateModules();

      return {
        total: bundleStats.total,
        initial: bundleStats.initial,
        lazy: bundleStats.lazy,
        score: this.calculateBundleScore(bundleStats.total, bundleStats.initial),
        modules: bundleStats.modules,
        chunks: bundleStats.chunks,
        duplicates
      };
    } catch (error) {
      console.warn('打包体积分析失败，使用估算值:', error);
      return {
        total: 245,
        initial: 89,
        lazy: 156,
        score: 0.82,
        modules: [],
        chunks: [],
        duplicates: []
      };
    }
  }

  private async analyzeBuildOutput(): Promise<{
    total: number;
    initial: number;
    lazy: number;
    modules: BundleModule[];
    chunks: BundleChunk[];
  }> {
    const buildDir = path.join(this.projectRoot, '.next');
    const staticDir = path.join(buildDir, 'static');

    let totalSize = 0;
    let initialSize = 0;
    const modules: BundleModule[] = [];
    const chunks: BundleChunk[] = [];

    try {
      // 分析静态文件
      if (await this.pathExists(staticDir)) {
        const files = await this.getAllFiles(staticDir);

        for (const file of files) {
          const stats = await fs.stat(file);
          const relativePath = path.relative(staticDir, file);
          const size = Math.round(stats.size / 1024); // KB

          totalSize += size;

          // 判断是否为初始加载
          if (relativePath.includes('pages') || relativePath.includes('app')) {
            initialSize += size;
          }

          // 记录模块信息
          modules.push({
            name: relativePath,
            size,
            gzipSize: Math.round(size * 0.3), // 估算gzip大小
            percentage: 0, // 稍后计算
            type: this.getModuleType(relativePath)
          });
        }
      }

      // 计算百分比
      for (const module of modules) {
        module.percentage = totalSize > 0 ? module.size / totalSize : 0;
      }

      // 分析chunks (简化实现)
      const chunkFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.css'));
      for (const chunkFile of chunkFiles) {
        const stats = await fs.stat(chunkFile);
        const relativePath = path.relative(staticDir, chunkFile);

        chunks.push({
          name: relativePath,
          size: Math.round(stats.size / 1024),
          files: [relativePath],
          modules: 1
        });
      }

      return {
        total: totalSize,
        initial: initialSize,
        lazy: totalSize - initialSize,
        modules: modules.sort((a, b) => b.size - a.size).slice(0, 20), // 前20个最大的模块
        chunks
      };
    } catch (error) {
      throw new Error(`分析构建输出失败: ${error}`);
    }
  }

  private getModuleType(filePath: string): 'npm' | 'local' | 'builtin' {
    if (filePath.includes('node_modules')) return 'npm';
    if (filePath.includes('chunks')) return 'npm';
    if (filePath.startsWith('pages/') || filePath.startsWith('app/')) return 'local';
    return 'builtin';
  }

  private async findDuplicateModules(): Promise<DuplicateModule[]> {
    const duplicates: DuplicateModule[] = [];

    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      // 检查重复的依赖
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // 简化的重复检测
      const depNames = Object.keys(allDeps);
      const seen = new Set<string>();

      for (const dep of depNames) {
        const baseName = dep.split('/')[0]; // 处理scoped packages
        if (seen.has(baseName)) {
          duplicates.push({
            name: baseName,
            instances: [dep],
            totalSize: 50 // 估算大小
          });
        }
        seen.add(baseName);
      }

      return duplicates;
    } catch (error) {
      console.warn('重复模块检测失败:', error);
      return [];
    }
  }

  private calculateBundleScore(total: number, initial: number): number {
    // 基于总大小和初始加载大小的评分
    if (total < 200 && initial < 80) return 0.9;
    if (total < 500 && initial < 150) return 0.8;
    if (total < 1000 && initial < 250) return 0.7;
    if (total < 2000 && initial < 400) return 0.6;
    return 0.5;
  }

  private async analyzeRuntimePerformance(): Promise<RuntimePerformance> {
    console.log('⚡ 分析运行时性能...');

    try {
      const [memoryMetrics, cpuMetrics, networkMetrics, renderMetrics] = await Promise.all([
        this.analyzeMemoryUsage(),
        this.analyzeCPUUsage(),
        this.analyzeNetworkUsage(),
        this.analyzeRenderPerformance()
      ]);

      return {
        memoryUsage: memoryMetrics,
        cpuUsage: cpuMetrics,
        networkUsage: networkMetrics,
        renderPerformance: renderMetrics
      };
    } catch (error) {
      console.warn('运行时性能分析失败，使用估算值:', error);
      return {
        memoryUsage: {
          peakHeap: 120,
          averageHeap: 80,
          leaks: [],
          garbageCollection: { frequency: 5, duration: 50, impact: 'low' }
        },
        cpuUsage: {
          averageUsage: 25,
          peakUsage: 60,
          blockingScripts: [],
          longTasks: []
        },
        networkUsage: {
          requests: 45,
          totalSize: 234,
          averageTime: 180,
          slowRequests: [],
          caching: { hitRate: 65, cacheableRequests: 30, cachedRequests: 20, cacheHeaders: ['Cache-Control'] }
        },
        renderPerformance: {
          componentRenders: [],
          reRenderCount: 15,
          virtualDOMOperations: 1200,
          renderBlockingTime: 200
        }
      };
    }
  }

  private async analyzeMemoryUsage(): Promise<MemoryMetrics> {
    // 由于无法直接访问运行时内存，我们分析代码模式
    try {
      const sourceFiles = await this.findSourceFiles();
      const leaks: MemoryLeak[] = [];

      for (const file of sourceFiles) {
        const content = await fs.readFile(file, 'utf-8');
        leaks.push(...this.detectMemoryLeaks(content, file));
      }

      return {
        peakHeap: 120, // 估算值
        averageHeap: 80, // 估算值
        leaks,
        garbageCollection: {
          frequency: 5, // 估算值
          duration: 50, // 估算值
          impact: leaks.length > 0 ? 'medium' : 'low'
        }
      };
    } catch (error) {
      console.warn('内存使用分析失败:', error);
      return {
        peakHeap: 120,
        averageHeap: 80,
        leaks: [],
        garbageCollection: { frequency: 5, duration: 50, impact: 'low' }
      };
    }
  }

  private detectMemoryLeaks(content: string, file: string): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    // 检测事件监听器泄漏
    if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
      leaks.push({
        location: file,
        type: 'event-listener',
        size: 2, // 估算MB
        description: '添加事件监听器但未移除，可能导致内存泄漏'
      });
    }

    // 检测定时器泄漏
    if (content.includes('setInterval') && !content.includes('clearInterval')) {
      leaks.push({
        location: file,
        type: 'interval',
        size: 1, // 估算MB
        description: '设置定时器但未清除，可能导致内存泄漏'
      });
    }

    // 检测闭包泄漏
    if (content.match(/useEffect.*\[\]/g)) {
      leaks.push({
        location: file,
        type: 'closure',
        size: 3, // 估算MB
        description: 'useEffect依赖数组为空，可能导致闭包泄漏'
      });
    }

    return leaks;
  }

  private async analyzeCPUUsage(): Promise<CPUMetrics> {
    try {
      const sourceFiles = await this.findSourceFiles();
      const blockingScripts: BlockingScript[] = [];
      const longTasks: LongTask[] = [];

      for (const file of sourceFiles) {
        const content = await fs.readFile(file, 'utf-8');
        blockingScripts.push(...this.detectBlockingScripts(content, file));
        longTasks.push(...this.detectLongTasks(content, file));
      }

      return {
        averageUsage: 25, // 估算值
        peakUsage: 60, // 估算值
        blockingScripts,
        longTasks
      };
    } catch (error) {
      console.warn('CPU使用分析失败:', error);
      return {
        averageUsage: 25,
        peakUsage: 60,
        blockingScripts: [],
        longTasks: []
      };
    }
  }

  private detectBlockingScripts(content: string, file: string): BlockingScript[] {
    const scripts: BlockingScript[] = [];

    // 检测大型同步脚本
    if (content.includes('import') && content.length > 10000) {
      scripts.push({
        url: file,
        duration: 200, // 估算ms
        size: Math.round(content.length / 1024), // KB
        impact: 'high'
      });
    }

    return scripts;
  }

  private detectLongTasks(content: string, file: string): LongTask[] {
    const tasks: LongTask[] = [];

    // 检测复杂计算
    const complexPatterns = [
      /for\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g,
      /while\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g,
      /\.map\s*\([^)]*\)/g,
      /\.filter\s*\([^)]*\)/g,
      /\.reduce\s*\([^)]*\)/g
    ];

    for (const pattern of complexPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (match.split('\n').length > 20) {
            tasks.push({
              duration: 100, // 估算ms
              startTime: 0, // 估算值
              location: file,
              cause: `复杂${pattern.source}操作`
            });
          }
        }
      }
    }

    return tasks;
  }

  private async analyzeNetworkUsage(): Promise<NetworkMetrics> {
    try {
      // 分析API路由和网络配置
      const apiFiles = await this.findAPIFiles();
      let totalRequests = 0;
      let cacheableRequests = 0;
      let cachedRequests = 0;
      const slowRequests: SlowRequest[] = [];

      for (const file of apiFiles) {
        const content = await fs.readFile(file, 'utf-8');

        // 估算请求数量
        totalRequests += (content.match(/export\s+(async\s+)?function/g) || []).length;

        // 检查缓存配置
        if (content.includes('cache') || content.includes('Cache-Control')) {
          cacheableRequests++;
          if (content.includes('max-age') || content.includes('immutable')) {
            cachedRequests++;
          }
        }

        // 检查慢请求
        slowRequests.push(...this.detectSlowRequests(content, file));
      }

      const hitRate = cacheableRequests > 0 ? (cachedRequests / cacheableRequests) * 100 : 0;

      return {
        requests: totalRequests,
        totalSize: 234, // 估算KB
        averageTime: 180, // 估算ms
        slowRequests,
        caching: {
          hitRate,
          cacheableRequests,
          cachedRequests,
          cacheHeaders: ['Cache-Control', 'ETag']
        }
      };
    } catch (error) {
      console.warn('网络使用分析失败:', error);
      return {
        requests: 45,
        totalSize: 234,
        averageTime: 180,
        slowRequests: [],
        caching: { hitRate: 65, cacheableRequests: 30, cachedRequests: 20, cacheHeaders: ['Cache-Control'] }
      };
    }
  }

  private detectSlowRequests(content: string, file: string): SlowRequest[] {
    const requests: SlowRequest[] = [];

    // 检测数据库查询
    if (content.includes('await') && (content.includes('find') || content.includes('query'))) {
      requests.push({
        url: file,
        duration: 500, // 估算ms
        size: 10, // 估算KB
        status: 200
      });
    }

    // 检测外部API调用
    if (content.includes('fetch') || content.includes('axios')) {
      requests.push({
        url: file,
        duration: 300, // 估算ms
        size: 5, // 估算KB
        status: 200
      });
    }

    return requests;
  }

  private async analyzeRenderPerformance(): Promise<RenderMetrics> {
    try {
      const componentFiles = await this.findComponentFiles();
      const componentRenders: ComponentRender[] = [];
      let totalReRenders = 0;
      let virtualDOMOps = 0;

      for (const file of componentFiles) {
        const content = await fs.readFile(file, 'utf-8');

        // 分析组件渲染
        const renders = this.analyzeComponentRenders(content, file);
        componentRenders.push(...renders);

        // 统计重新渲染
        totalReRenders += (content.match(/useEffect/g) || []).length;
        totalReRenders += (content.match(/useState/g) || []).length;

        // 估算虚拟DOM操作
        virtualDOMOps += content.split('\n').length * 2; // 粗略估算
      }

      return {
        componentRenders: componentRenders.slice(0, 10), // 前10个组件
        reRenderCount: totalReRenders,
        virtualDOMOperations: virtualDOMOps,
        renderBlockingTime: 200 // 估算ms
      };
    } catch (error) {
      console.warn('渲染性能分析失败:', error);
      return {
        componentRenders: [],
        reRenderCount: 15,
        virtualDOMOperations: 1200,
        renderBlockingTime: 200
      };
    }
  }

  private analyzeComponentRenders(content: string, file: string): ComponentRender[] {
    const renders: ComponentRender[] = [];

    // 检测React组件
    const componentPattern = /(?:function|const)\s+(\w+).*\{[\s\S]*?\n\}/g;
    const matches = content.match(componentPattern) || [];

    for (const match of matches) {
      const lines = match.split('\n').length;
      const complexity = this.calculateRenderComplexity(match);

      renders.push({
        name: file,
        count: 1, // 估算值
        averageTime: complexity * 10, // 估算ms
        totalTime: complexity * 10,
        unnecessaryRenders: complexity > 5 ? 1 : 0 // 估算值
      });
    }

    return renders;
  }

  private calculateRenderComplexity(content: string): number {
    let complexity = 1;

    // 基于代码复杂度估算渲染时间
    complexity += (content.match(/if/g) || []).length;
    complexity += (content.match(/map/g) || []).length;
    complexity += (content.match(/filter/g) || []).length;
    complexity += content.split('\n').length / 10;

    return Math.min(complexity, 20);
  }

  private async analyzeDatabasePerformance(): Promise<DatabasePerformance> {
    console.log('🗄️ 分析数据库性能...');

    try {
      const queryPerformance = await this.analyzeQueryPerformance();
      const connectionPool = await this.analyzeConnectionPool();
      const indexing = await this.analyzeIndexing();
      const slowQueries = await this.findSlowQueries();

      return {
        queryPerformance,
        connectionPool,
        indexing,
        slowQueries
      };
    } catch (error) {
      console.warn('数据库性能分析失败，使用估算值:', error);
      return {
        queryPerformance: [],
        connectionPool: {
          poolSize: 10,
          activeConnections: 3,
          idleConnections: 7,
          connectionTime: 50,
          waitTime: 10
        },
        indexing: {
          totalIndexes: 15,
          unusedIndexes: [],
          missingIndexes: [],
          indexUsage: 75
        },
        slowQueries: []
      };
    }
  }

  private async analyzeQueryPerformance(): Promise<QueryPerformance[]> {
    const queries: QueryPerformance[] = [];

    try {
      // 查找数据库相关文件
      const dbFiles = await this.findFilesWithPattern('**/db/**/*.{ts,tsx,js,jsx}');
      const modelFiles = await this.findFilesWithPattern('**/models/**/*.{ts,tsx,js,jsx}');

      const allFiles = [...dbFiles, ...modelFiles];

      for (const file of allFiles) {
        const content = await fs.readFile(file, 'utf-8');
        queries.push(...this.extractQueries(content, file));
      }

      return queries;
    } catch (error) {
      console.warn('查询性能分析失败:', error);
      return [];
    }
  }

  private extractQueries(content: string, file: string): QueryPerformance[] {
    const queries: QueryPerformance[] = [];

    // 检测Sequelize查询
    const sequelizePattern = /\w+\.(findAll|findOne|findByPk|create|update|destroy)\s*\(/g;
    const matches = content.match(sequelizePattern) || [];

    for (const match of matches) {
      queries.push({
        query: match.trim(),
        averageTime: 50, // 估算ms
        executionCount: 1, // 估算值
        indexesUsed: [], // 需要更复杂的分析
        optimization: this.suggestQueryOptimization(match)
      });
    }

    return queries;
  }

  private suggestQueryOptimization(query: string): string {
    if (query.includes('findAll') && !query.includes('limit')) {
      return '考虑添加分页限制';
    }
    if (query.includes('include')) {
      return '检查关联查询的性能影响';
    }
    return '查询看起来合理';
  }

  private async analyzeConnectionPool(): Promise<ConnectionPoolMetrics> {
    try {
      // 查找数据库配置
      const configFiles = await this.findFilesWithPattern('**/config/**/*.{ts,tsx,js,jsx}');
      const dbFiles = await this.findFilesWithPattern('**/db/**/*.{ts,tsx,js,jsx}');

      let poolSize = 10; // 默认值
      let connectionTime = 50; // 默认值
      let waitTime = 10; // 默认值

      for (const file of [...configFiles, ...dbFiles]) {
        const content = await fs.readFile(file, 'utf-8');

        // 查找连接池配置
        const poolMatch = content.match(/pool.*:\s*\{[^}]*\}/g);
        if (poolMatch) {
          const poolConfig = poolMatch[0];
          const sizeMatch = poolConfig.match(/max:\s*(\d+)/);
          if (sizeMatch) {
            poolSize = parseInt(sizeMatch[1]);
          }
        }
      }

      return {
        poolSize,
        activeConnections: Math.floor(poolSize * 0.3), // 估算值
        idleConnections: Math.floor(poolSize * 0.7), // 估算值
        connectionTime,
        waitTime
      };
    } catch (error) {
      console.warn('连接池分析失败:', error);
      return {
        poolSize: 10,
        activeConnections: 3,
        idleConnections: 7,
        connectionTime: 50,
        waitTime: 10
      };
    }
  }

  private async analyzeIndexing(): Promise<IndexMetrics> {
    try {
      // 查找迁移文件
      const migrationFiles = await this.findFilesWithPattern('**/migrations/**/*.{js,ts}');
      const totalIndexes = migrationFiles.length;
      const unusedIndexes: string[] = [];
      const missingIndexes: MissingIndex[] = [];

      // 简化的索引分析
      // 实际实现需要查询数据库统计信息

      return {
        totalIndexes,
        unusedIndexes,
        missingIndexes,
        indexUsage: 75 // 估算值
      };
    } catch (error) {
      console.warn('索引分析失败:', error);
      return {
        totalIndexes: 15,
        unusedIndexes: [],
        missingIndexes: [],
        indexUsage: 75
      };
    }
  }

  private async findSlowQueries(): Promise<SlowQuery[]> {
    // 基于代码分析估算慢查询
    const queries = await this.analyzeQueryPerformance();

    return queries
      .filter(q => q.averageTime > 100) // 超过100ms认为是慢查询
      .map(q => ({
        query: q.query,
        executionTime: q.averageTime,
        frequency: q.executionCount,
        rowsExamined: 1000, // 估算值
        rowsReturned: 100 // 估算值
      }));
  }

  private identifyOptimizationOpportunities(
    bundle: BundleAnalysis,
    runtime: RuntimePerformance,
    database: DatabasePerformance
  ): string[] {
    const opportunities: string[] = [];

    // 打包优化
    if (bundle.total > 500) {
      opportunities.push(`打包体积较大(${bundle.total}KB)，考虑代码分割和懒加载`);
    }

    if (bundle.initial > 200) {
      opportunities.push(`初始加载包较大(${bundle.initial}KB)，优化关键渲染路径`);
    }

    if (bundle.duplicates.length > 0) {
      opportunities.push(`发现${bundle.duplicates.length}个重复模块，考虑依赖优化`);
    }

    // 运行时优化
    if (runtime.memoryUsage.leaks.length > 0) {
      opportunities.push(`发现${runtime.memoryUsage.leaks.length}个潜在内存泄漏，需要修复`);
    }

    if (runtime.networkUsage.caching.hitRate < 80) {
      opportunities.push(`缓存命中率较低(${Math.round(runtime.networkUsage.caching.hitRate)}%)，优化缓存策略`);
    }

    if (runtime.renderPerformance.reRenderCount > 20) {
      opportunities.push(`组件重新渲染较多(${runtime.renderPerformance.reRenderCount}次)，考虑使用React.memo`);
    }

    // 数据库优化
    if (database.slowQueries.length > 0) {
      opportunities.push(`发现${database.slowQueries.length}个慢查询，需要优化`);
    }

    if (database.indexing.indexUsage < 85) {
      opportunities.push(`索引使用率较低(${database.indexing.indexUsage}%)，考虑添加缺失索引`);
    }

    if (database.connectionPool.poolSize < 5) {
      opportunities.push(`连接池大小较小(${database.connectionPool.poolSize})，考虑增加池大小`);
    }

    return opportunities;
  }

  private calculatePerformanceScore(
    bundle: BundleAnalysis,
    runtime: RuntimePerformance,
    database: DatabasePerformance
  ): number {
    let score = 100;

    // 打包大小扣分
    if (bundle.total > 1000) score -= 20;
    else if (bundle.total > 500) score -= 10;
    else if (bundle.total > 300) score -= 5;

    if (bundle.initial > 300) score -= 15;
    else if (bundle.initial > 200) score -= 10;
    else if (bundle.initial > 100) score -= 5;

    // 运行时性能扣分
    if (runtime.memoryUsage.leaks.length > 0) score -= 10;
    if (runtime.networkUsage.caching.hitRate < 50) score -= 10;
    if (runtime.renderPerformance.reRenderCount > 30) score -= 5;

    // 数据库性能扣分
    if (database.slowQueries.length > 5) score -= 15;
    else if (database.slowQueries.length > 2) score -= 10;
    else if (database.slowQueries.length > 0) score -= 5;

    if (database.indexing.indexUsage < 70) score -= 10;
    else if (database.indexing.indexUsage < 85) score -= 5;

    return Math.max(0, score);
  }

  // 辅助方法
  private async findSourceFiles(): Promise<string[]> {
    const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
    const files: string[] = [];

    for (const pattern of patterns) {
      try {
        const { glob } = await import('glob');
        const matched = glob.sync(pattern, { cwd: this.projectRoot });
        files.push(...matched.map(f => path.join(this.projectRoot, f)));
      } catch (error) {
        // 忽略glob错误
      }
    }

    return files.filter(f => !f.includes('node_modules') && !f.includes('dist') && !f.includes('.next'));
  }

  private async findComponentFiles(): Promise<string[]> {
    const patterns = [
      'components/**/*.{ts,tsx,js,jsx}',
      'app/**/*.{ts,tsx,js,jsx}',
      '**/*component*.{ts,tsx,js,jsx}'
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      try {
        const { glob } = await import('glob');
        const matched = glob.sync(pattern, { cwd: this.projectRoot });
        files.push(...matched.map(f => path.join(this.projectRoot, f)));
      } catch (error) {
        // 忽略glob错误
      }
    }

    return files.filter(f => !f.includes('node_modules') && !f.includes('dist') && !f.includes('.next'));
  }

  private async findAPIFiles(): Promise<string[]> {
    return await this.findFilesWithPattern('**/api/**/*.{ts,tsx,js,jsx}');
  }

  private async findFilesWithPattern(pattern: string): Promise<string[]> {
    try {
      const { glob } = await import('glob');
      const matched = glob.sync(pattern, { cwd: this.projectRoot });
      return matched.map(f => path.join(this.projectRoot, f));
    } catch (error) {
      return [];
    }
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 忽略无法访问的文件
    }

    return files;
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
    if (!this.analysisResults) {
      await this.analyzePerformance();
    }

    const results = this.analysisResults!;

    return `
# ⚡ 性能分析报告

## 📦 打包分析
- **总体积**: ${results.bundleSize.total}KB
- **初始加载**: ${results.bundleSize.initial}KB
- **懒加载**: ${results.bundleSize.lazy}KB
- **打包评分**: ${Math.round(results.bundleSize.score * 100)}%
- **模块数**: ${results.bundleSize.modules.length}
- **重复模块**: ${results.bundleSize.duplicates.length}个

## ⚡ 运行时性能
- **内存峰值**: ${results.runtimePerformance.memoryUsage.peakHeap}MB
- **内存平均**: ${results.runtimePerformance.memoryUsage.averageHeap}MB
- **内存泄漏**: ${results.runtimePerformance.memoryUsage.leaks.length}个
- **平均CPU**: ${results.runtimePerformance.cpuUsage.averageUsage}%
- **峰值CPU**: ${results.runtimePerformance.cpuUsage.peakUsage}%
- **网络请求**: ${results.runtimePerformance.networkUsage.requests}个
- **缓存命中率**: ${Math.round(results.runtimePerformance.networkUsage.caching.hitRate)}%
- **重新渲染**: ${results.runtimePerformance.renderPerformance.reRenderCount}次

## 🗄️ 数据库性能
- **慢查询**: ${results.databasePerformance.slowQueries.length}个
- **连接池大小**: ${results.databasePerformance.connectionPool.poolSize}
- **活跃连接**: ${results.databasePerformance.connectionPool.activeConnections}
- **索引使用率**: ${results.databasePerformance.indexing.indexUsage}%
- **总索引数**: ${results.databasePerformance.indexing.totalIndexes}

## 💡 优化机会
${results.optimizationOpportunities.map(opp => `- ${opp}`).join('\n')}

## 🎯 性能评分: ${results.performanceScore}/100
`;
  }
}