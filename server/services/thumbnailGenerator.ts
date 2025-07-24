import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import * as fs from 'fs/promises';
import * as path from 'path';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const THUMBNAILS_DIR = path.join(process.cwd(), 'uploads', 'thumbnails');

// Ensure thumbnails directory exists
async function ensureThumbnailsDir() {
  try {
    await fs.access(THUMBNAILS_DIR);
  } catch {
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
  }
}

export async function generateVideoThumbnail(
  videoPath: string,
  videoId: number
): Promise<string> {
  await ensureThumbnailsDir();
  
  const thumbnailFilename = `thumbnail-${videoId}.jpg`;
  const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'], // Take screenshot at 10% of video duration
        filename: thumbnailFilename,
        folder: THUMBNAILS_DIR,
        size: '800x450' // 16:9 aspect ratio
      })
      .on('end', () => {
        console.log(`Thumbnail generated for video ${videoId}`);
        resolve(`/api/thumbnails/${thumbnailFilename}`);
      })
      .on('error', (err) => {
        console.error(`Error generating thumbnail for video ${videoId}:`, err);
        reject(err);
      });
  });
}

export async function getVideoMetadata(videoPath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  codec: string;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: Math.round(metadata.format.duration || 0),
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        codec: videoStream.codec_name || 'unknown'
      });
    });
  });
}

// For YouTube videos, we'll create a thumbnail from the YouTube URL
export function getYouTubeThumbnail(youtubeUrl: string): string {
  // Extract video ID from YouTube URL
  const videoIdMatch = youtubeUrl.match(/(?:v=|\/embed\/|\/v\/|youtu\.be\/|\/watch\?v=)([^#&?]*).*/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  if (videoId) {
    // Use YouTube's high quality thumbnail API
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  // Fallback to medium quality if maxresdefault doesn't exist
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}