import ezdxf
import json
import os
import io
import subprocess
import requests
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import base64
import logging
import asyncio
import matplotlib.pyplot as plt
import numpy as np
import tempfile
from ezdxf.addons import odafc  # 导入ODA File Converter接口
# ======================
# 配置区
# ======================
ALIYUN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
API_KEY = "sk-e7494146b9d34192961dd4dad8489dd4"  # 请替换为您的实际API密钥
MAX_API_LENGTH = 1000000  # 设置API最大允许的字符数
MAX_ENTITIES = 3000  # 默认最大解析实体数

# 安防设备关键词列表
SECURITY_KEYWORDS = [
    '考勤', '门禁', '消费机', '道闸', '摄像机',
    '读卡器', '电锁', '门磁', '闸机', '访客机',
    '指纹机', '人脸机', '车位锁', '巡更点', '报警'
]

# 默认Prompt模板
CUSTOM_PROMPT = """
        - Role: 安防系统工程师和CAD图纸分析专家
        - Background: 用户需要对CAD图纸中的安防设备进行详细分析，设备类型统计（考勤、门禁、消费、停车等设备的类型和数量）、摄像头信息、安装调试建议以及预估布线数据等内容的分析。这表明用户对安防系统的细节和整体规划有更深入的需求，可能用于项目规划、设备采购或施工指导。
        - Profile: 你是一位经验丰富的安防系统工程师，精通CAD图纸的解读，对安防设备的类型、安装规范、接线要求以及系统拓扑关系有深入的理解和丰富的实践经验。同时，你具备专业的技术知识，能够准确统计设备数量、分析摄像头信息，并提供专业的安装调试建议和预估布线数据。
        - Skills: 你具备CAD图纸解读能力、安防设备专业知识、系统规划与设计能力、技术参数分析能力以及工程预估能力。
        - Goals:
        1. 严格按照图纸标注，统计各类安防设备的数量和类型。
        2. 详细分析摄像头信息，包括型号、安装位置、监控范围等。
        3. 提供专业的安装调试建议，确保设备正常运行。
        4. 预估布线数据，包括线缆长度、敷设方式等。
        5. 用Mermaid语法清晰描述系统拓扑关系。
        - Constrains:
        1. 设备名称必须与图纸标注完全一致。
        2. 技术参数需标注单位（如mm、m、Ω等）。
        3. 排除非安防相关设备（如照明、空调等）。
        4. 接线规范需区分强电和弱电线路。
        - OutputFormat: 以结构化文本形式输出，包括设备统计表、摄像头信息表、安装调试建议、预估布线数据以及系统拓扑图。
        - Workflow:
        1. 仔细阅读CAD图纸，识别并标注所有安防设备。
        2. 统计各类安防设备的数量，包括考勤、门禁、消费、停车等设备。
        3. 分析摄像头信息，记录型号、安装位置、监控范围等关键参数。
        4. 根据设备类型和安装环境，提供专业的安装调试建议。
        5. 预估布线数据，包括线缆类型、敷设方式、长度等。
        6. 用Mermaid语法描述设备连接关系，形成系统拓扑图。
        - Examples:
        - 例子1：
            设备类型统计：
            | 设备类型   | 数量 |
            |------------|------|
            | 考勤设备   | 10   |
            | 门禁设备   | 20   |
            | 消费设备   | 5    |
            | 停车设备   | 15   |

            摄像头信息：
            | 摄像头型号 | 安装位置   | 监控范围   |
            |------------|------------|------------|
            | HIK-IPC    | 入口       | 10m范围    |
            | HIK-IPC    | 停车场     | 20m范围    |

            安装调试建议：
            - 考勤设备：安装高度1.5m，确保员工打卡方便。
            - 门禁设备：安装高度1.2m，防护等级IP65。
            - 摄像头：安装高度3m，确保监控无死角。

            预估布线数据：
            - 强电线缆：RVV 2×1.5mm²，总长度500m。
            - 弱电线缆：RVVP 4×0.5mm²，总长度800m。

            系统拓扑关系：
            ```mermaid
            graph TD
                A[控制中心]
                A --> B[考勤设备]
                A --> C[门禁设备]
                A --> D[消费设备]
                A --> E[停车设备]
                A --> F[摄像头]
            ```
        - 例子2：
            设备类型统计：
            | 设备类型   | 数量 |
            |------------|------|
            | 考勤设备   | 8    |
            | 门禁设备   | 12   |
            | 消费设备   | 3    |
            | 停车设备   | 10   |

            摄像头信息：
            | 摄像头型号 | 安装位置   | 监控范围   |
            |------------|------------|------------|
            | DAHUA-IPC  | 大厅       | 15m范围    |
            | DAHUA-IPC  | 走廊       | 12m范围    |

            安装调试建议：
            - 考勤设备：安装高度1.4m，确保员工打卡方便。
            - 门禁设备：安装高度1.1m，防护等级IP65。
            - 摄像头：安装高度2.8m，确保监控无死角。

            预估布线数据：
            - 强电线缆：RVV 2×1.0mm²，总长度400m。
            - 弱电线缆：RVVP 4×0.5mm²，总长度700m。

            系统拓扑关系：
            ```mermaid
            graph TD
                A[控制中心]
                A --> B[考勤设备]
                A --> C[门禁设备]
                A --> D[消费设备]
                A --> E[停车设备]
                A --> F[摄像头]
            ```
            - Initialization: 在第一次对话中，请直接输出以下：您好，我是专业的安防系统工程师和CAD图纸分析专家。请提供需要分析的CAD图纸，我会严格按照要求进行详细分析，并为您提供专业的安防设备信息。请确保图纸清晰且标注完整。
    """

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化FastAPI
app = FastAPI(title="CAD Security Analysis API")

# 请求模型
class ParseRequest(BaseModel):
    file_path: str
    model_choice: str = "qwen-turbo"
    max_entities: int = MAX_ENTITIES

    model_config = {"protected_namespaces": ()}
# 线程池
executor = ThreadPoolExecutor(max_workers=4)

# ======================
# 核心功能函数
# ======================
def convert_dwg_to_dxf(dwg_file_path):
    """将DWG文件转换为DXF文件"""
    logger.info(f"Converting DWG file to DXF: {dwg_file_path}")
    try:
        # 创建唯一的临时文件名
        import uuid
        unique_id = str(uuid.uuid4())
        current_directory = os.path.dirname(os.path.abspath(__file__))
        dxf_file_path = os.path.join(current_directory, "tmp", f"cad_convert_{unique_id}.dxf")

        # 确保目标文件不存在
        if os.path.exists(dxf_file_path):
            os.remove(dxf_file_path)

        # 使用ODA File Converter进行转换
        oda_path  = os.path.join(current_directory,'ODAFileConverter', "ODAFileConverter.exe")
        cmd = [oda_path, dwg_file_path, dxf_file_path, "ACAD2018", "DXF", "0", "1"]
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=os.path.dirname(oda_path)  # 设置工作目录为 ODAFileConverter.exe 所在目录
            )
            print(f"返回码: {result.returncode}")
            print(f"标准输出: {result.stdout}")
            print(f"错误输出: {result.stderr}")

            if result.returncode == 0:
                print(f"转换成功: {dxf_file_path}")
            else:
                print(f"转换失败，返回码: {result.returncode}")
        except FileNotFoundError as e:
            print(f"错误: {e}")
        except Exception as e:
            print(f"意外错误: {e}")

        # 检查转换后的文件是否存在
        if not os.path.exists(dxf_file_path):
            raise Exception(f"转换后的DXF文件不存在: {dxf_file_path}")

        return dxf_file_path
    except Exception as e:
        raise Exception(f"DWG转换失败: {str(e)}")

def vec_to_list(vec):
    """将Vec3对象转换为列表，兼容不同版本的ezdxf"""
    try:
        return vec.tolist()
    except AttributeError:
        try:
            return [vec.x, vec.y, vec.z]
        except:
            return list(vec)

def is_security_related(text):
    """检查文本是否与安防设备相关"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in SECURITY_KEYWORDS)

def enhanced_parse_dxf(file_path, max_entities=3000):
    """增强版DXF解析器，特别关注安防设备"""
    logger.info(f"Parsing DXF file: {file_path}")
    try:
        doc = ezdxf.readfile(file_path)
        all_entities = list(doc.modelspace())
        entities_count = len(all_entities)
        limited_entities = all_entities[:max_entities]

        # 安防设备专用数据结构
        security_data = {
            "metadata": {
                "layers": [layer.dxf.name for layer in doc.layers],
                "units": doc.header.get('$INSUNITS', 0),
                "total_entities": entities_count
            },
            "security_devices": [],
            "text_annotations": [],
            "dimensions": [],
            "wiring": []
        }

        # 第一遍扫描：识别安防设备
        for entity in limited_entities:
            if entity.dxftype() in ('INSERT', 'ATTDEF'):
                block_name = entity.dxf.name if hasattr(entity.dxf, 'name') else None
                if block_name and is_security_related(block_name):
                    device_info = {
                        "type": "block_reference",
                        "name": block_name,
                        "layer": entity.dxf.layer,
                        "position": vec_to_list(entity.dxf.insert),
                        "rotation": getattr(entity.dxf, 'rotation', 0)
                    }
                    security_data["security_devices"].append(device_info)

            elif entity.dxftype() in ('MTEXT', 'TEXT'):
                text_content = getattr(entity, 'text', '') or getattr(entity.dxf, 'text', '')
                if text_content and is_security_related(text_content):
                    annotation = {
                        "type": entity.dxftype(),
                        "text": text_content,
                        "layer": entity.dxf.layer,
                        "position": vec_to_list(entity.dxf.insert) if hasattr(entity.dxf, 'insert') else None
                    }
                    security_data["text_annotations"].append(annotation)

                    # 如果是线缆标注
                    if any(word in text_content.lower() for word in ['线', '缆', 'RVVP', 'RVV']):
                        wiring_info = {
                            "text": text_content,
                            "position": vec_to_list(entity.dxf.insert) if hasattr(entity.dxf, 'insert') else None,
                            "layer": entity.dxf.layer
                        }
                        security_data["wiring"].append(wiring_info)

            elif entity.dxftype() in ('LINE', 'LWPOLYLINE'):
                # 检查是否连接安防设备（简单版）
                if entity.dxftype() == 'LINE':
                    points = [vec_to_list(entity.dxf.start), vec_to_list(entity.dxf.end)]
                else:
                    points = [vec_to_list(point) for point in entity.get_points()]

                # 标记为可能的连接线
                security_data["wiring"].append({
                    "type": entity.dxftype(),
                    "points": points,
                    "layer": entity.dxf.layer
                })

        return security_data
    except Exception as e:
        logger.error(f"Error parsing DXF: {str(e)}")
        raise

def plot_security_layout(data):
    """生成安防设备布局图"""
    logger.info("Generating security layout plot")
    fig, ax = plt.subplots(figsize=(12, 12))
    ax.set_aspect('equal')
    ax.grid(True)
    ax.set_title("安防设备布局图", fontproperties='SimHei')

    # 绘制设备位置
    devices = data.get("security_devices", [])
    for device in devices:
        pos = device["position"]
        if pos and len(pos) >= 2:
            ax.plot(pos[0], pos[1], 'ro', markersize=8)
            ax.text(pos[0], pos[1]+0.2, device["name"],
                   fontsize=8, ha='center', fontproperties='SimHei')

    # 绘制连接线
    wiring = data.get("wiring", [])
    for wire in wiring:
        if "points" in wire and len(wire["points"]) >= 2:
            points = np.array(wire["points"])
            ax.plot(points[:,0], points[:,1], 'b-', linewidth=1)

    # 添加图例
    ax.plot([], [], 'ro', label='安防设备')
    ax.plot([], [], 'b-', label='连接线路')
    ax.legend(prop={'family': 'SimHei'})

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150)
    plt.close()
    buf.seek(0)
    return buf.getvalue()

def call_aliyun_model(prompt, model_name="qwen-turbo"):
    """调用阿里云大模型API，支持长文本分块处理"""
    logger.info(f"Calling Aliyun API with model: {model_name}")
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # 如果提示不超过最大长度，直接调用
    # if len(prompt) <= MAX_API_LENGTH:
    return [single_api_call(prompt, model_name, headers)]

    # 分割长提示为多个块
    chunks = split_prompt_into_chunks(prompt)
    results = []

    for chunk in chunks:
        result = single_api_call(chunk, model_name, headers)
        if result.startswith("API Error:") or result.startswith("Request Failed:"):
            logger.error(f"API call failed: {result}")
            return [result]
        results.append(result)

    return results

def single_api_call(content, model_name, headers):
    """执行单次API调用"""
    payload = {
        "model": model_name,
        "input": {
            "messages": [{'role': 'system', 'content': CUSTOM_PROMPT},
                         {"role": "user", "content": content}]
        },
        "parameters": {
            "result_format": "message"
        }
    }

    try:
        response = requests.post(ALIYUN_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        if "output" in result:
            return result["output"]["choices"][0]["message"]["content"]
        return f"API Error: {result.get('message', 'Unknown error')}"
    except Exception as e:
        logger.error(f"API request failed: {str(e)}")
        return f"Request Failed: {str(e)}"

def split_prompt_into_chunks(prompt):
    """将长提示分割成适合API调用的块"""
    chunks = []
    for i in range(0, len(prompt), MAX_API_LENGTH):
        chunk = prompt[i:i + MAX_API_LENGTH]
        chunks.append(chunk)
    return chunks

def process_cad_file(file_path, model_choice, max_entities):
    """处理CAD文件(DXF或DWG)并返回解析结果和预览"""
    # 检查文件是否存在
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

    # 根据文件扩展名或传入的文件类型处理
    file_ext = os.path.splitext(file_path)[1].lower()
    if not file_ext.startswith('.'):
        file_ext = '.' + file_ext  # 确保扩展名以点开头

    logger.info(f"File extension determined as: {file_ext}")
    dxf_file_path = file_path
    temp_file_created = False

    try:
        # 如果是DWG文件，先转换为DXF
        if file_ext.lower() == '.dwg':
            logger.info("Detected DWG file, converting to DXF")
            try:
                dxf_file_path = convert_dwg_to_dxf(file_path)
                temp_file_created = True
                logger.info(f"DWG file converted successfully to: {dxf_file_path}")
            except Exception as e:
                logger.error(f"Failed to convert DWG to DXF: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to convert DWG to DXF: {str(e)}")
        elif file_ext.lower() != '.dxf':
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}. Only DXF and DWG files are supported")

        # 解析DXF
        cad_data = enhanced_parse_dxf(dxf_file_path, max_entities)

        # 生成预览图
        preview_image = plot_security_layout(cad_data)
        preview_base64 = base64.b64encode(preview_image).decode('utf-8')

        # 调用大模型分析
        data_json = json.dumps(cad_data, ensure_ascii=False, indent=2)
        ai_response = call_aliyun_model(data_json, model_choice)
        ai_response = '\n'.join(ai_response)

        # 构建结果
        result = {
            "filename": os.path.basename(file_path),
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "preview_image": f"data:image/png;base64,{preview_base64}",
            "metadata": cad_data["metadata"],
            "analysis": ai_response,
            "raw_data": cad_data
        }

        return result
    finally:
        # 如果创建了临时文件，清理它
        if temp_file_created and os.path.exists(dxf_file_path):
            try:
                os.unlink(dxf_file_path)
                logger.info(f"Temporary DXF file removed: {dxf_file_path}")
            except Exception as e:
                logger.warning(f"Failed to remove temporary file: {str(e)}")

# ======================
# FastAPI 路由
# ======================
@app.post("/parse_dxf")
async def parse_dxf(request: ParseRequest):
    """解析DXF或DWG文件并返回预览和分析结果"""
    try:
        # 在线程池中执行解析任务
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            executor,
            process_cad_file,
            request.file_path,
            request.model_choice,
            request.max_entities
        )

        # 记录处理成功
        logger.info(f"Successfully processed file: {request.file_path}")
        return result
    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        # 返回更详细的错误信息
        error_detail = f"Error processing file: {str(e)}"
        logger.error(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("cadserver:app", host="0.0.0.0", port=8000, reload=True)