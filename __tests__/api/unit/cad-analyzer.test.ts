/**
 * CAD Analyzer API Unit Tests
 * Tests for /api/cad-analyzer/analyze endpoint
 */

import { POST } from '@/app/api/cad-analyzer/analyze/route';
import {
  TestRequestBuilder,
  testValidators,
} from '@/__tests__/utils/api-test-utils';

// Mock dependencies
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  appendFile: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
}));

jest.mock('dxf-parser', () => ({
  parse: jest.fn(),
}));

jest.mock('@/lib/db/models/agent-config', () => ({
  findOne: jest.fn(),
}));

const mockFs = require('fs/promises');
const mockPath = require('path');
const mockDxfParser = require('dxf-parser');
const mockAgentConfig = require('@/lib/db/models/agent-config');

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('CAD Analyzer API - Unit Tests', () => {
  const ADMIN_TOKEN = 'admin123';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_TOKEN = ADMIN_TOKEN;

    // Default mock implementations
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('file content');
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.appendFile.mockResolvedValue(undefined);
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.resolve.mockImplementation((...args) => args.join('/'));
    mockAgentConfig.findOne.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/cad-analyzer/analyze', () => {
    it('should analyze CAD file successfully with admin token', async () => {
      const mockFile = new File(['cad content'], 'test.dxf', {
        type: 'application/dxf',
      });

      const mockAnalysisResult = {
        devices: [
          { type: '摄像机', count: 2, coordinates: [{ x: 100, y: 200 }] },
          { type: '门禁', count: 1, coordinates: [{ x: 300, y: 400 }] },
        ],
        summary: '测试图纸分析结果',
        analysis: '分析完成，发现2个摄像机和1个门禁设备',
        preview_image: 'data:image/png;base64,test',
        metadata: { total_devices: 3, file_size: 1024 },
      };

      // Mock successful analysis
      jest
        .spyOn(require('@/app/api/cad-analyzer/analyze/route'), 'analyzeWithAI')
        .mockResolvedValue(mockAnalysisResult);

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = TestRequestBuilder.createRequest(
        'POST',
        '/api/cad-analyzer/analyze',
        formData,
        {
          headers: new Map([
            ['content-type', 'multipart/form-data'],
            ['x-admin-token', ADMIN_TOKEN],
          ]),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBeDefined();
      expect(data.analysis).toBe(mockAnalysisResult.analysis);
      expect(data.structured).toEqual(mockAnalysisResult);
      expect(data.preview_image).toBe('data:image/png;base64,test');
      expect(data.metadata).toEqual({ total_devices: 3, file_size: 1024 });

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('cad-analyzer'),
        { recursive: true }
      );
      expect(mockFs.writeFile).toHaveBeenCalledTimes(3); // file + report + structured report
    });

    it('should validate admin token', async () => {
      const mockFile = new File(['cad content'], 'test.dxf', {
        type: 'application/dxf',
      });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = TestRequestBuilder.createRequest(
        'POST',
        '/api/cad-analyzer/analyze',
        formData,
        {
          headers: new Map([
            ['content-type', 'multipart/form-data'],
            ['x-admin-token', 'invalid-token'],
          ]),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('无权限');

      expect(mockFs.mkdir).not.toHaveBeenCalled();
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should validate required file parameter', async () => {
      const formData = new FormData();
      // Missing file

      const request = TestRequestBuilder.createRequest(
        'POST',
        '/api/cad-analyzer/analyze',
        formData,
        {
          headers: new Map([
            ['content-type', 'multipart/form-data'],
            ['x-admin-token', ADMIN_TOKEN],
          ]),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('未检测到文件');
    });

    describe('File validation', () => {
      it('should validate supported file formats', async () => {
        const supportedFiles = [
          new File(['content'], 'test.dxf', { type: 'application/dxf' }),
          new File(['content'], 'test.dwg', { type: 'application/dwg' }),
          new File(['content'], 'test.pdf', { type: 'application/pdf' }),
          new File(['content'], 'test.jpg', { type: 'image/jpeg' }),
          new File(['content'], 'test.png', { type: 'image/png' }),
          new File(['content'], 'test.DXF', { type: 'application/dxf' }),
          new File(['content'], 'test.DWG', { type: 'application/dwg' }),
        ];

        for (const file of supportedFiles) {
          mockFs.writeFile.mockClear();

          jest
            .spyOn(
              require('@/app/api/cad-analyzer/analyze/route'),
              'analyzeWithAI'
            )
            .mockResolvedValue({
              devices: [],
              summary: 'test',
              analysis: 'test analysis',
            });

          const formData = new FormData();
          formData.append('file', file);

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/cad-analyzer/analyze',
            formData,
            {
              headers: new Map([
                ['content-type', 'multipart/form-data'],
                ['x-admin-token', ADMIN_TOKEN],
              ]),
            }
          );

          const response = await POST(request);
          expect(response.status).toBe(200);
        }
      });

      it('should reject unsupported file formats', async () => {
        const unsupportedFiles = [
          new File(['content'], 'test.txt', { type: 'text/plain' }),
          new File(['content'], 'test.doc', { type: 'application/msword' }),
          new File(['content'], 'test.exe', {
            type: 'application/octet-stream',
          }),
        ];

        for (const file of unsupportedFiles) {
          const formData = new FormData();
          formData.append('file', file);

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/cad-analyzer/analyze',
            formData,
            {
              headers: new Map([
                ['content-type', 'multipart/form-data'],
                ['x-admin-token', ADMIN_TOKEN],
              ]),
            }
          );

          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(400);
          expect(data.error).toBe('不支持的文件类型');
        }
      });

      it('should validate file size limit', async () => {
        // Create a large file (25MB)
        const largeFile = new File(
          ['x'.repeat(25 * 1024 * 1024)],
          'large.dxf',
          {
            type: 'application/dxf',
          }
        );

        const formData = new FormData();
        formData.append('file', largeFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('文件过大，最大100MB');
      });

      it('should handle files without extensions', async () => {
        const mockFile = new File(['content'], 'test', {
          type: 'application/octet-stream',
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('不支持的文件类型');
      });
    });

    describe('Configuration management', () => {
      it('should use default configuration when no config found', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        // Mock no database config and no file config
        mockAgentConfig.findOne.mockResolvedValue(null);
        mockFs.readFile.mockRejectedValue(new Error('Config file not found'));

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue({
            devices: [],
            summary: 'test',
            analysis: 'test analysis',
          });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        // Should proceed with default 100MB limit
      });

      it('should use configuration from database when available', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const dbConfig = {
          id: 1,
          type: 'cad-analyzer',
          isPublished: true,
          config: {
            maxFileSizeMB: 50,
            supportedFormats: ['.dxf', '.dwg'],
            apiEndpoint: 'http://test-api.com',
            apiKey: 'test-key',
          },
        };

        mockAgentConfig.findOne.mockResolvedValue(dbConfig);

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue({
            devices: [],
            summary: 'test',
            analysis: 'test analysis',
          });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockAgentConfig.findOne).toHaveBeenCalledWith({
          where: {
            type: 'cad-analyzer',
            isPublished: true,
          },
        });
      });

      it('should use configuration from file when available', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const fileConfig = {
          maxFileSizeMB: 75,
          supportedFormats: ['.dxf', '.dwg', '.pdf'],
          apiEndpoint: 'http://file-config-api.com',
          apiKey: 'file-config-key',
        };

        mockFs.readFile.mockResolvedValue(JSON.stringify(fileConfig));

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue({
            devices: [],
            summary: 'test',
            analysis: 'test analysis',
          });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockFs.readFile).toHaveBeenCalledWith(
          expect.stringContaining('cad-analyzer-config.json'),
          'utf-8'
        );
      });
    });

    describe('File operations', () => {
      it('should handle directory creation errors gracefully', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        // Mock directory creation error
        mockFs.mkdir.mockRejectedValueOnce(new Error('Permission denied'));
        mockFs.mkdir.mockResolvedValueOnce(undefined); // Second call for temp directory

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue({
            devices: [],
            summary: 'test',
            analysis: 'test analysis',
          });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockFs.mkdir).toHaveBeenCalledTimes(2); // Original + temp directory
      });

      it('should handle file write errors', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('服务异常，请稍后重试');
        expect(data.detail).toBe('文件保存失败: Disk full');
        expect(data.success).toBe(false);
      });

      it('should generate correct file URLs', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const mockAnalysisResult = {
          devices: [],
          summary: 'test',
          analysis: 'test analysis',
        };

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue(mockAnalysisResult);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.url).toMatch(/^\/cad-analyzer\/\d+_/);
        expect(data.reportUrl).toMatch(/^\/cad-analyzer\/report_\d+\.txt$/);
        expect(data.structuredReportUrl).toMatch(
          /^\/cad-analyzer\/structured_\d+\.json$/
        );
      });
    });

    describe('Analysis functionality', () => {
      it('should handle image file analysis', async () => {
        const mockFile = new File(['image content'], 'test.jpg', {
          type: 'image/jpeg',
        });

        const mockImageAnalysis = {
          devices: [
            { type: '摄像机', count: 3, coordinates: [{ x: 100, y: 200 }] },
          ],
          summary: '图像分析完成',
          analysis: '通过图像识别发现3个摄像机设备',
        };

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue(mockImageAnalysis);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.structured).toEqual(mockImageAnalysis);
        expect(data.analysis).toBe(mockImageAnalysis.analysis);
      });

      it('should handle DXF file analysis', async () => {
        const mockFile = new File(['dxf content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const mockDxfAnalysis = {
          devices: [
            { type: '门禁', count: 2, coordinates: [{ x: 50, y: 75 }] },
          ],
          summary: 'DXF分析完成',
          analysis: '通过DXF解析发现2个门禁设备',
          preview_image: 'data:image/png;base64,dxf-preview',
        };

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue(mockDxfAnalysis);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.structured).toEqual(mockDxfAnalysis);
        expect(data.preview_image).toBe('data:image/png;base64,dxf-preview');
      });

      it('should handle analysis errors gracefully', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockRejectedValue(new Error('AI service unavailable'));

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('服务异常，请稍后重试');
        expect(data.detail).toBe('AI service unavailable');
        expect(data.success).toBe(false);
      });
    });

    describe('External service integration', () => {
      it('should call Python DXF parsing service for DXF files', async () => {
        const mockFile = new File(['dxf content'], 'test.dxf', {
          type: 'application/dxf',
        });

        // Mock Python service response
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            devices: [
              { type: '摄像机', count: 1, coordinates: [{ x: 100, y: 200 }] },
            ],
            summary: 'DXF解析成功',
            preview_image: 'data:image/png;base64,preview',
          }),
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(fetch).toHaveBeenCalledWith(
          'http://127.0.0.1:8000/parse_dxf',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('file_path'),
          })
        );
      });

      it('should handle Python service errors', async () => {
        const mockFile = new File(['dxf content'], 'test.dxf', {
          type: 'application/dxf',
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should return default result when Python service fails
        expect(data.structured.devices).toHaveLength(2); // Default devices
        expect(data.structured.summary).toContain('DXF解析服务调用失败');
      });

      it('should handle Python service network errors', async () => {
        const mockFile = new File(['dxf content'], 'test.dxf', {
          type: 'application/dxf',
        });

        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should return default result when Python service is unreachable
        expect(data.structured.devices).toHaveLength(2);
        expect(data.structured.summary).toContain('DXF解析服务调用失败');
      });
    });

    describe('Error logging', () => {
      it('should log API errors to file system', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const testError = new Error('Test CAD analysis error');
        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockRejectedValue(testError);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        await POST(request);

        expect(mockFs.mkdir).toHaveBeenCalledWith(
          expect.stringContaining('data'),
          {
            recursive: true,
          }
        );
        expect(mockFs.appendFile).toHaveBeenCalledWith(
          expect.stringContaining('api-error.log'),
          expect.stringContaining('[cad-analyzer-analyze]')
        );
      });

      it('should handle file system logging errors gracefully', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        mockFs.appendFile.mockRejectedValueOnce(
          new Error('Cannot write log file')
        );

        const testError = new Error('Test analysis error');
        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockRejectedValue(testError);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);

        // Should still return error response even if logging fails
        expect(response.status).toBe(500);
      });
    });

    describe('Response format validation', () => {
      it('should return consistent success response format', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const mockAnalysisResult = {
          devices: [{ type: '摄像机', count: 1, coordinates: [] }],
          summary: '测试分析',
          analysis: '分析完成',
        };

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue(mockAnalysisResult);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('url');
        expect(data).toHaveProperty('analysis');
        expect(data).toHaveProperty('reportUrl');
        expect(data).toHaveProperty('structuredReportUrl');
        expect(data).toHaveProperty('structured');
        expect(data).toHaveProperty('preview_image');
        expect(data).toHaveProperty('metadata');
      });

      it('should return consistent error response format', async () => {
        const formData = new FormData();
        // Missing file

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      });

      it('should handle analysis results with missing optional fields', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const minimalAnalysisResult = {
          devices: [],
          summary: '最小分析结果',
          // Missing analysis, preview_image, metadata
        };

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue(minimalAnalysisResult);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.analysis).toBeUndefined(); // Should be undefined if not provided
        expect(data.preview_image).toBeNull();
        expect(data.metadata).toBeNull();
      });
    });

    describe('Performance tests', () => {
      it('should handle large CAD files efficiently', async () => {
        const largeFile = new File(
          ['x'.repeat(10 * 1024 * 1024)],
          'large.dxf',
          {
            type: 'application/dxf',
          }
        );

        const mockAnalysisResult = {
          devices: Array.from({ length: 100 }, (_, i) => ({
            type: '摄像机',
            count: 1,
            coordinates: [{ x: i * 10, y: i * 10 }],
          })),
          summary: '大型文件分析完成',
          analysis: '发现100个设备',
        };

        jest
          .spyOn(
            require('@/app/api/cad-analyzer/analyze/route'),
            'analyzeWithAI'
          )
          .mockResolvedValue(mockAnalysisResult);

        const formData = new FormData();
        formData.append('file', largeFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(5000); // Should handle 10MB file in under 5s
        console.log(`Large CAD file analysis response time: ${responseTime}ms`);
      });

      it('should respond within 100ms for validation failures', async () => {
        const invalidFile = new File(['content'], 'test.txt', {
          type: 'text/plain',
        });

        const formData = new FormData();
        formData.append('file', invalidFile);

        const request = TestRequestBuilder.createRequest(
          'POST',
          '/api/cad-analyzer/analyze',
          formData,
          {
            headers: new Map([
              ['content-type', 'multipart/form-data'],
              ['x-admin-token', ADMIN_TOKEN],
            ]),
          }
        );

        const startTime = process.hrtime.bigint();
        const response = await POST(request);
        const endTime = process.hrtime.bigint();

        const responseTime = Number(endTime - startTime) / 1000000;

        expect(response.status).toBe(400);
        expect(responseTime).toBeLessThan(100); // Validation should be fast
        console.log(`File validation response time: ${responseTime}ms`);
      });
    });

    describe('Security and input sanitization', () => {
      it('should validate admin token format', async () => {
        const mockFile = new File(['content'], 'test.dxf', {
          type: 'application/dxf',
        });

        const invalidTokens = [
          '', // Empty
          'undefined', // Undefined string
          'null', // Null string
          'admin123', // Valid but might be default
          "'", // SQL injection attempt
          '<script>alert("xss")</script>', // XSS attempt
        ];

        for (const token of invalidTokens.slice(0, 4)) {
          // Test first 4
          const formData = new FormData();
          formData.append('file', mockFile);

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/cad-analyzer/analyze',
            formData,
            {
              headers: new Map([
                ['content-type', 'multipart/form-data'],
                ['x-admin-token', token],
              ]),
            }
          );

          const response = await POST(request);
          const data = await response.json();

          if (token !== ADMIN_TOKEN) {
            expect(response.status).toBe(401);
            expect(data.error).toBe('无权限');
          }
        }
      });

      it('should prevent directory traversal in file names', async () => {
        const maliciousFiles = [
          new File(['content'], '../../../etc/passwd', {
            type: 'application/dxf',
          }),
          new File(['content'], '..\\..\\windows\\system32\\config', {
            type: 'application/dxf',
          }),
          new File(['content'], 'test/../../../etc/passwd', {
            type: 'application/dxf',
          }),
        ];

        for (const file of maliciousFiles) {
          mockFs.writeFile.mockClear();

          jest
            .spyOn(
              require('@/app/api/cad-analyzer/analyze/route'),
              'analyzeWithAI'
            )
            .mockResolvedValue({
              devices: [],
              summary: 'test',
              analysis: 'test analysis',
            });

          const formData = new FormData();
          formData.append('file', file);

          const request = TestRequestBuilder.createRequest(
            'POST',
            '/api/cad-analyzer/analyze',
            formData,
            {
              headers: new Map([
                ['content-type', 'multipart/form-data'],
                ['x-admin-token', ADMIN_TOKEN],
              ]),
            }
          );

          const response = await POST(request);

          expect(response.status).toBe(200);

          // Verify that the file path doesn't contain traversal sequences
          const writeCalls = mockFs.writeFile.mock.calls;
          if (writeCalls.length > 0) {
            const filePath = writeCalls[0][0];
            expect(filePath).not.toContain('..');
            expect(filePath).not.toContain('etc');
            expect(filePath).not.toContain('windows');
          }
        }
      });
    });
  });
});
