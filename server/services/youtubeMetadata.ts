import { z } from "zod";

// YouTube URL patterns
const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
];

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  channelTitle: string;
  duration: string;
  publishedAt: string;
  viewCount: string;
  thumbnailUrl: string;
}

export class YouTubeMetadataService {
  /**
   * Extract video ID from YouTube URL
   */
  static extractVideoId(url: string): string | null {
    for (const pattern of YOUTUBE_URL_PATTERNS) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Get video metadata from YouTube Data API
   */
  static async getVideoMetadata(videoId: string): Promise<YouTubeVideoMetadata | null> {
    try {
      // Check if YouTube API key is available
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        console.log("YouTube API key not available, using fallback metadata extraction");
        return await this.getFallbackMetadata(videoId);
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics`
      );

      if (!response.ok) {
        console.error("YouTube API request failed:", response.status, response.statusText);
        return await this.getFallbackMetadata(videoId);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.error("Video not found or not accessible");
        return null;
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      return {
        title: snippet.title || "Lacrosse Video Analysis",
        description: snippet.description || "Video analysis uploaded for coaching insights",
        channelTitle: snippet.channelTitle || "Unknown Channel",
        duration: contentDetails.duration || "Unknown",
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        viewCount: statistics.viewCount || "0",
        thumbnailUrl: snippet.thumbnails?.maxres?.url || 
                     snippet.thumbnails?.high?.url || 
                     snippet.thumbnails?.medium?.url || 
                     snippet.thumbnails?.default?.url || ""
      };
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error);
      return await this.getFallbackMetadata(videoId);
    }
  }

  /**
   * Get metadata from YouTube URL when API is not available
   */
  static async getFallbackMetadata(videoId: string): Promise<YouTubeVideoMetadata> {
    try {
      // Try to get basic metadata from YouTube's oEmbed service
      const oEmbedResponse = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (oEmbedResponse.ok) {
        const oEmbedData = await oEmbedResponse.json();
        return {
          title: oEmbedData.title || "Lacrosse Video Analysis",
          description: "Video analysis uploaded for coaching insights",
          channelTitle: oEmbedData.author_name || "Unknown Channel",
          duration: "Unknown",
          publishedAt: new Date().toISOString(),
          viewCount: "0",
          thumbnailUrl: oEmbedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
    } catch (error) {
      console.error("Error fetching oEmbed metadata:", error);
    }

    // Final fallback with basic info
    return {
      title: "Lacrosse Video Analysis",
      description: "Video analysis uploaded for coaching insights",
      channelTitle: "Unknown Channel",
      duration: "Unknown",
      publishedAt: new Date().toISOString(),
      viewCount: "0",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }

  /**
   * Parse YouTube duration (PT format) to readable format
   */
  static parseYouTubeDuration(duration: string): string {
    try {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return "Unknown";

      const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
      const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
      const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    } catch (error) {
      return "Unknown";
    }
  }

  /**
   * Format view count to readable format
   */
  static formatViewCount(viewCount: string): string {
    try {
      const count = parseInt(viewCount);
      if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M views`;
      } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K views`;
      } else {
        return `${count} views`;
      }
    } catch (error) {
      return "0 views";
    }
  }

  /**
   * Create enhanced title with metadata
   */
  static createEnhancedTitle(metadata: YouTubeVideoMetadata): string {
    const duration = this.parseYouTubeDuration(metadata.duration);
    const views = this.formatViewCount(metadata.viewCount);
    
    if (duration !== "Unknown" && views !== "0 views") {
      return `${metadata.title} (${duration} • ${views})`;
    } else if (duration !== "Unknown") {
      return `${metadata.title} (${duration})`;
    } else {
      return metadata.title;
    }
  }

  /**
   * Create enhanced description with metadata
   */
  static createEnhancedDescription(metadata: YouTubeVideoMetadata): string {
    const publishDate = new Date(metadata.publishedAt).toLocaleDateString();
    const channelInfo = metadata.channelTitle !== "Unknown Channel" ? 
      ` by ${metadata.channelTitle}` : "";
    
    let enhancedDescription = `YouTube video${channelInfo}, published on ${publishDate}.\n\n`;
    
    if (metadata.description && metadata.description.length > 10) {
      // Truncate very long descriptions
      const truncatedDescription = metadata.description.length > 500 ? 
        metadata.description.substring(0, 500) + "..." : 
        metadata.description;
      enhancedDescription += truncatedDescription;
    } else {
      enhancedDescription += "Video uploaded for lacrosse analysis and coaching insights.";
    }
    
    return enhancedDescription;
  }
}