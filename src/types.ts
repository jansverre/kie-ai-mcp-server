import { z } from 'zod';

// Zod schemas for request validation
export const NanoBananaGenerateSchema = z.object({
  prompt: z.string().min(1).max(1000)
});

export const NanoBananaEditSchema = z.object({
  prompt: z.string().min(1).max(1000),
  image_urls: z.array(z.string().url()).min(1).max(5)
});

export const Veo3GenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  imageUrls: z.array(z.string().url()).max(1).optional(),
  model: z.enum(['veo3', 'veo3_fast']).default('veo3'),
  watermark: z.string().max(100).optional(),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  seeds: z.number().int().min(10000).max(99999).optional(),
  callBackUrl: z.string().url().optional(),
  enableFallback: z.boolean().default(false)
});

export const Sora2GenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  image_urls: z.array(z.string().url()).max(1).optional(),
  model: z.enum(['sora-2-text-to-video', 'sora-2-image-to-video', 'sora-2-pro-text-to-video', 'sora-2-pro-image-to-video']).default('sora-2-text-to-video'),
  aspect_ratio: z.enum(['portrait', 'landscape']).default('landscape'),
  n_frames: z.enum(['10s', '15s']).default('10s'),
  size: z.enum(['standard', 'high']).optional(),
  remove_watermark: z.boolean().default(false),
  callBackUrl: z.string().url().optional()
});

// TypeScript types
export type NanoBananaGenerateRequest = z.infer<typeof NanoBananaGenerateSchema>;
export type NanaBananaEditRequest = z.infer<typeof NanoBananaEditSchema>;
export type Veo3GenerateRequest = z.infer<typeof Veo3GenerateSchema>;
export type Sora2GenerateRequest = z.infer<typeof Sora2GenerateSchema>;

export interface KieAiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

export interface ImageResponse {
  imageUrl?: string;
  taskId?: string;
}

export interface TaskResponse {
  taskId: string;
}

export interface TaskRecord {
  id?: number;
  task_id: string;
  api_type: 'nano-banana' | 'nano-banana-edit' | 'veo3' | 'sora2';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  result_url?: string;
  error_message?: string;
}

export interface KieAiConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}