/**
 * Utility functions for handling markdown content
 */

/**
 * Removes markdown formatting and returns plain text
 * @param text - Text that may contain markdown formatting
 * @returns Plain text with markdown formatting removed
 */
export function removeMarkdownFormatting(text: string): string {
  if (!text) return '';
  
  // Remove bold formatting (**text** or __text__)
  let processed = text.replace(/\*\*(.*?)\*\*/g, '$1');
  processed = processed.replace(/__(.*?)__/g, '$1');
  
  // Remove italic formatting (*text* or _text_)
  processed = processed.replace(/\*(.*?)\*/g, '$1');
  processed = processed.replace(/_(.*?)_/g, '$1');
  
  // Remove code formatting (`text`)
  processed = processed.replace(/`(.*?)`/g, '$1');
  
  // Remove headers (# Header)
  processed = processed.replace(/^#+\s+(.*)$/gm, '$1');
  
  // Remove links [text](url)
  processed = processed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove strikethrough (~~text~~)
  processed = processed.replace(/~~(.*?)~~/g, '$1');
  
  // Remove blockquotes (> text)
  processed = processed.replace(/^>\s+(.*)$/gm, '$1');
  
  // Remove horizontal rules (---, ***, ___)
  processed = processed.replace(/^[-*_]{3,}$/gm, '');
  
  // Clean up extra whitespace
  processed = processed.replace(/\n{3,}/g, '\n\n');
  processed = processed.trim();
  
  return processed;
}

/**
 * Converts basic markdown to HTML for safe rendering
 * @param text - Text containing markdown
 * @returns HTML string with converted markdown
 */
export function convertMarkdownToHTML(text: string): string {
  if (!text) return '';
  
  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Convert bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert line breaks
  html = html.replace(/\n/g, '<br />');
  
  return html;
}