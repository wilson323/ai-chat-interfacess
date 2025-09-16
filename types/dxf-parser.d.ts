/**
 * DXF Parser 类型声明
 * 为 dxf-parser 库提供 TypeScript 类型支持
 */

declare module 'dxf-parser' {
  export interface DxfEntity {
    type: string;
    layer: string;
    color?: number;
    lineType?: string;
    lineWeight?: number;
    visible?: boolean;
    handle?: string;
    owner?: string;
    [key: string]: any;
  }

  export interface DxfLayer {
    name: string;
    color: number;
    lineType: string;
    lineWeight: number;
    visible: boolean;
    frozen: boolean;
    locked: boolean;
    plotStyle: number;
    [key: string]: any;
  }

  export interface DxfBlock {
    name: string;
    layer: string;
    entities: DxfEntity[];
    [key: string]: any;
  }

  export interface DxfHeader {
    [key: string]: any;
  }

  export interface DxfData {
    header: DxfHeader;
    entities: DxfEntity[];
    blocks: DxfBlock[];
    layers: DxfLayer[];
    tables: any;
    [key: string]: any;
  }

  export class DxfParser {
    constructor();
    parseSync(dxfString: string): DxfData;
    parse(dxfString: string): Promise<DxfData>;
  }

  export default DxfParser;
}
