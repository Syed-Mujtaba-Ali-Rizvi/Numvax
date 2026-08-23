export interface CropCorner {
  x: number; // 0 to 1 percentage
  y: number; // 0 to 1 percentage
}

export type FilterType = 'none' | 'auto' | 'grayscale' | 'bw' | 'high_contrast';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  exposure: number; // -100 to 100
}

export interface EditStack {
  id: string;
  originalBlob: Blob;
  originalUrl: string;
  corners?: [CropCorner, CropCorner, CropCorner, CropCorner];
  rotation: 0 | 90 | 180 | 270;
  adjustments: ImageAdjustments;
  filter: FilterType;
}

export type QualityPreset = 'small' | 'average' | 'large';

export interface PdfExportConfig {
  pageSize: 'A4' | 'Letter' | 'Original';
  orientation: 'Auto' | 'Portrait' | 'Landscape';
  quality: QualityPreset;
  filename: string;
}
