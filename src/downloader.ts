import { promises as fs } from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface DownloadConfig {
  downloadDir?: string;
  autoDownload: boolean;
}

export class Downloader {
  private config: DownloadConfig;

  constructor(config: DownloadConfig) {
    this.config = config;
  }

  /**
   * Download a file from URL to local filesystem
   */
  async downloadFile(url: string, taskId: string, fileType: 'image' | 'video'): Promise<string | null> {
    if (!this.config.autoDownload || !this.config.downloadDir) {
      return null;
    }

    try {
      // Ensure download directory exists
      await fs.mkdir(this.config.downloadDir, { recursive: true });

      // Extract file extension from URL or use default
      const urlParts = new URL(url);
      const pathname = urlParts.pathname;
      const ext = path.extname(pathname) || (fileType === 'video' ? '.mp4' : '.png');

      // Generate filename: taskId + extension
      const filename = `${taskId}${ext}`;
      const filepath = path.join(this.config.downloadDir, filename);

      // Check if file already exists
      try {
        await fs.access(filepath);
        console.error(`[Downloader] File already exists: ${filepath}`);
        return filepath;
      } catch {
        // File doesn't exist, proceed with download
      }

      // Download file
      console.error(`[Downloader] Downloading ${fileType} from ${url} to ${filepath}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response to file
      const fileStream = createWriteStream(filepath);
      await pipeline(response.body as any, fileStream);

      console.error(`[Downloader] Successfully downloaded to ${filepath}`);
      return filepath;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Downloader] Failed to download file: ${message}`);
      return null;
    }
  }

  /**
   * Download multiple files (for tasks that return multiple results)
   */
  async downloadMultipleFiles(
    urls: string[],
    taskId: string,
    fileType: 'image' | 'video'
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const indexedTaskId = urls.length > 1 ? `${taskId}_${i}` : taskId;
      const filepath = await this.downloadFile(url, indexedTaskId, fileType);
      if (filepath) {
        results.push(filepath);
      }
    }

    return results;
  }
}
