# Kie.ai MCP Server (Extended)

An extended MCP (Model Context Protocol) server that provides access to Kie.ai's AI APIs including Nano Banana image generation/editing, Veo3 video generation, and **Sora 2 video generation** with **automatic download functionality**.

## Features

### Core Features
- **Auto-Download**: Automatically downloads completed videos and images to your local filesystem
- **Sora 2 Video Generation**: OpenAI's latest text-to-video and image-to-video models
- **Nano Banana Image Generation**: Text-to-image using Google's Gemini 2.5 Flash Image Preview
- **Nano Banana Image Editing**: Natural language image editing with up to 5 input images
- **Veo3 Video Generation**: Professional-quality video generation with text-to-video and image-to-video
- **1080p Video Upgrade**: Get high-definition versions of Veo3 videos

### Technical Features
- **Task Management**: SQLite-based task tracking with status polling
- **Smart Endpoint Routing**: Automatic detection of task types for status checking
- **Automatic Downloads**: Files are downloaded when tasks complete
- **Comprehensive Error Handling**: Robust error handling and validation

## Prerequisites

- Node.js 18+
- Kie.ai API key from https://kie.ai/api-key

## Installation

### From Source (Recommended for Extended Version)

```bash
# Clone the repository
git clone https://github.com/jansverre/kie-ai-mcp-server.git
cd kie-ai-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

```bash
# Required
export KIE_AI_API_KEY="your-api-key-here"

# Auto-download configuration
export KIE_AI_DOWNLOAD_DIR="/path/to/download/directory"  # Required for auto-download
export KIE_AI_AUTO_DOWNLOAD="true"                        # Default: true

# Optional
export KIE_AI_BASE_URL="https://api.kie.ai/api/v1"  # Default
export KIE_AI_TIMEOUT="60000"                        # Default: 60 seconds
export KIE_AI_DB_PATH="./tasks.db"                   # Default: ./tasks.db
```

### MCP Configuration

Add to your Claude Desktop configuration (`~/.claude.json`):

```json
{
  "mcpServers": {
    "kie-ai": {
      "command": "node",
      "args": ["/absolute/path/to/kie-ai-mcp-server/dist/index.js"],
      "env": {
        "KIE_AI_API_KEY": "your-api-key-here",
        "KIE_AI_DOWNLOAD_DIR": "/path/to/download/directory",
        "KIE_AI_AUTO_DOWNLOAD": "true",
        "KIE_AI_DB_PATH": "/path/to/tasks.db"
      }
    }
  }
}
```

## Available Tools

### 1. `generate_nano_banana`
Generate images using Nano Banana.

**Parameters:**
- `prompt` (string, required): Text description of the image to generate

**Example:**
```json
{
  "prompt": "A surreal painting of a giant banana floating in space"
}
```

### 2. `edit_nano_banana`
Edit images using natural language prompts.

**Parameters:**
- `prompt` (string, required): Description of edits to make
- `image_urls` (array, required): URLs of images to edit (max 5)

**Example:**
```json
{
  "prompt": "Add a rainbow arching over the mountains",
  "image_urls": ["https://example.com/image.jpg"]
}
```

### 3. `generate_veo3_video`
Generate videos using Veo3.

**Parameters:**
- `prompt` (string, required): Video description
- `imageUrls` (array, optional): Image for image-to-video (max 1)
- `model` (enum, optional): "veo3" or "veo3_fast" (default: "veo3")
- `aspectRatio` (enum, optional): "16:9" or "9:16" (default: "16:9")
- `seeds` (integer, optional): Random seed 10000-99999
- `watermark` (string, optional): Watermark text
- `enableFallback` (boolean, optional): Enable fallback mechanism

**Example:**
```json
{
  "prompt": "A dog playing in a park",
  "model": "veo3",
  "aspectRatio": "16:9",
  "seeds": 12345
}
```

### 4. `generate_sora2_video` ⭐ NEW
Generate videos using OpenAI's Sora 2.

**Parameters:**
- `prompt` (string, required): Video description
- `image_urls` (array, optional): Image for image-to-video (max 1)
- `model` (enum, optional): Model variant (default: "sora-2-text-to-video")
  - "sora-2-text-to-video"
  - "sora-2-image-to-video"
  - "sora-2-pro-text-to-video"
  - "sora-2-pro-image-to-video"
- `aspect_ratio` (enum, optional): "portrait" or "landscape" (default: "landscape")
- `n_frames` (enum, optional): "10s" or "15s" (default: "10s")
- `size` (enum, optional): "standard" or "high" (Pro models only)
- `remove_watermark` (boolean, optional): Remove watermark (default: false)

**Example:**
```json
{
  "prompt": "A cat chasing a laser pointer through a modern apartment",
  "model": "sora-2-text-to-video",
  "aspect_ratio": "landscape",
  "n_frames": "10s",
  "remove_watermark": true
}
```

### 5. `get_task_status` ⭐ AUTO-DOWNLOAD
Check the status of a generation task. **Automatically downloads files when completed.**

**Parameters:**
- `task_id` (string, required): Task ID to check

**Returns:**
- Task status information
- `downloaded_files` (array): Local file paths if auto-download is enabled

### 6. `list_tasks`
List recent tasks with their status.

**Parameters:**
- `limit` (integer, optional): Max tasks to return (default: 20, max: 100)
- `status` (string, optional): Filter by status ("pending", "processing", "completed", "failed")

### 7. `get_veo3_1080p_video`
Get 1080P high-definition version of a Veo3 video.

**Parameters:**
- `task_id` (string, required): Veo3 task ID
- `index` (integer, optional): Video index (for multiple results)

**Note**: Not available for videos generated with fallback mode.

## Auto-Download Feature

When `KIE_AI_AUTO_DOWNLOAD=true` and `KIE_AI_DOWNLOAD_DIR` is set:

1. **Automatic**: Files download when you check task status
2. **Smart Naming**: Files are named using task IDs (e.g., `abc123.mp4`)
3. **Duplicate Prevention**: Skips re-downloading existing files
4. **Multiple Results**: Handles tasks with multiple outputs (e.g., `abc123_0.mp4`, `abc123_1.mp4`)
5. **Image & Video**: Works for both Nano Banana images and video generations

**Example workflow:**
```javascript
// Generate video
const task = await generate_sora2_video({ prompt: "..." });
// Returns: { task_id: "abc123" }

// Check status (auto-downloads when complete)
const status = await get_task_status({ task_id: "abc123" });
// Returns: {
//   success: true,
//   downloaded_files: ["/path/to/download/abc123.mp4"],
//   ...
// }
```

## API Endpoints

The server interfaces with these Kie.ai API endpoints:

- **Veo3 Video Generation**: `POST /api/v1/veo/generate`
- **Veo3 Video Status**: `GET /api/v1/veo/record-info`
- **Veo3 1080p Upgrade**: `GET /api/v1/veo/get-1080p-video`
- **Sora 2 Generation**: `POST /api/v1/playground/createTask` ⭐ NEW
- **Playground Status**: `GET /api/v1/playground/recordInfo`
- **Nano Banana Generation**: `POST /api/v1/playground/createTask`

All endpoints have been tested and validated with live API responses.

## Database Schema

The server uses SQLite to track tasks:

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT UNIQUE NOT NULL,
  api_type TEXT NOT NULL,  -- 'nano-banana', 'nano-banana-edit', 'veo3', 'sora2'
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result_url TEXT,
  error_message TEXT
);
```

## Pricing

Based on Kie.ai pricing (60% cheaper than official APIs):

| Model | Kie.ai | OpenAI/Official |
|-------|--------|-----------------|
| **Sora 2** | $0.015/s | $0.10/s |
| **Sora 2 Pro (720P)** | $0.045/s | $0.30/s |
| **Sora 2 Pro (1080P)** | $0.10-0.13/s | $0.50/s |
| **Nano Banana** | $0.04/image | N/A |
| **Veo3 Fast** | $0.40/5s | $6.00/5s |
| **Veo3 Quality** | $0.80/5s | $6.00/5s |

See https://kie.ai/billing for detailed pricing.

## Development

```bash
# Run tests
npm test

# Development mode with auto-reload
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## Production Tips

1. **Download Directory**: Ensure `KIE_AI_DOWNLOAD_DIR` has sufficient storage and write permissions
2. **Database Location**: Set `KIE_AI_DB_PATH` to a persistent location
3. **API Key Security**: Never commit API keys to version control
4. **Rate Limiting**: Implement client-side rate limiting for high-volume usage
5. **Monitoring**: Monitor task status and handle failed generations appropriately
6. **Storage Cleanup**: Implement automatic cleanup of old downloaded files if needed

## Troubleshooting

### Common Issues

**"Unauthorized" errors**
- Verify `KIE_AI_API_KEY` is set correctly
- Check API key is valid at https://kie.ai/api-key

**Auto-download not working**
- Verify `KIE_AI_DOWNLOAD_DIR` is set and directory exists
- Check write permissions on download directory
- Ensure `KIE_AI_AUTO_DOWNLOAD` is set to "true"

**"Task not found" errors**
- Tasks may expire after 14 days
- Check task ID format matches expected pattern

**Generation failures**
- Check content policy compliance
- Verify prompt is in English
- Ensure sufficient API credits

## Roadmap

- [x] Auto-download functionality
- [x] Sora 2 support (standard and Pro)
- [ ] Veo 3.1 support
- [ ] Runway Gen-3 Alpha Turbo support
- [ ] Runway Aleph support
- [ ] Webhook support for async notifications
- [ ] Batch processing capabilities

## Support

For issues related to:
- **Extended MCP Server**: Open an issue at https://github.com/jansverre/kie-ai-mcp-server/issues
- **Original MCP Server**: https://github.com/andrewlwn77/kie-ai-mcp-server/issues
- **Kie.ai API**: Contact support@kie.ai or check https://docs.kie.ai/
- **API Keys**: Visit https://kie.ai/api-key

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Changelog

### v2.0.0 (Extended Version)
- ⭐ **NEW**: Automatic download functionality
- ⭐ **NEW**: Sora 2 API support (all variants)
- ⭐ **NEW**: Auto-download on task completion
- Updated package name to @jansverre/kie-ai-mcp-server-extended
- Enhanced task tracking for sora2 type
- Added Downloader class for file management
- Improved environment variable configuration

### v1.0.0
- Initial release by andrewlwn77
- Nano Banana image generation and editing
- Veo3 video generation
- 1080p video upgrade support
- SQLite task tracking
- Smart endpoint routing
- Comprehensive error handling

## Credits

Based on original work by [andrewlwn77](https://github.com/andrewlwn77/kie-ai-mcp-server).

Extended version maintained by [jansverre](https://github.com/jansverre).
