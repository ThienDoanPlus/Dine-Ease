// 1. Định nghĩa các kiểu chung
export type TableStatus = "empty" | "serving" | "booked" | "cleaning" | "maintenance";
export type FloorElementType = "table" | "wall" | "door" | "decor";
export type TableShape = "rect" | "circle";

// 2. Base Element: Thuộc tính mà MỌI vật thể trên bản đồ đều phải có
export interface BaseFloorElement {
  id: string;
  type: FloorElementType; 
  x: number;              
  y: number;              
  width: number;          
  height: number;         
  rotation: number;       
}

// 3. Table Element: Thuộc tính DÀNH RIÊNG cho "Bàn"
export interface TableElement extends BaseFloorElement {
  type: "table";
  name: string;           
  shape: TableShape;      
  seats: number;          
  status: TableStatus;    
  mergedId: number | null;
}

// 4. Architectural Element: Thuộc tính DÀNH RIÊNG cho Tường, Cửa, Quầy...
export interface ArchitecturalElement extends BaseFloorElement {
  type: "wall" | "door" | "decor";
  label?: string;         
  color?: string;         
}

// 5. Floor Element Tổng hợp: Một mảng sẽ chứa tổng hợp các loại này
export type FloorElement = TableElement | ArchitecturalElement;

// 6. Cấu trúc lưu trữ cho toàn bộ nhà hàng (Theo Tầng/Khu vực)
export type FloorPlanData = Record<string, FloorElement[]>;
