/**
 * CAD分析结果接口定义
 * 用于处理CAD文件分析API的返回类型
 */

export interface CADAnalysisResult {
    /** 分析任务ID */
    taskId: string;
    /** 分析状态 */
    status: 'pending' | 'processing' | 'completed' | 'failed';
    /** 分析结果数据 */
    data?: {
        /** 几何特征分析 */
        geometricFeatures?: Array<{
            type: string;
            count: number;
            dimensions?: Record<string, number>;
        }>;
        /** 材料属性 */
        materialProperties?: Record<string, string | number>;
        /** 制造特征 */
        manufacturingFeatures?: Array<{
            type: string;
            parameters: Record<string, number>;
        }>;
        /** 质量指标 */
        qualityMetrics?: Record<string, number>;
        /** 错误信息（如果分析失败） */
        error?: string;
    };
    /** 分析进度百分比 */
    progress?: number;
    /** 分析开始时间 */
    startedAt?: Date;
    /** 分析完成时间 */
    completedAt?: Date;
}

/** CAD分析请求参数 */
export interface CADAnalysisRequest {
    /** CAD文件路径或URL */
    filePath: string;
    /** 分析类型 */
    analysisType: 'geometric' | 'material' | 'manufacturing' | 'quality' | 'full';
    /** 分析配置选项 */
    options?: Record<string, any>;
}

/** CAD分析错误响应 */
export interface CADAnalysisError {
    /** 错误代码 */
    code: string;
    /** 错误消息 */
    message: string;
    /** 详细错误信息 */
    details?: Record<string, unknown>;
}
