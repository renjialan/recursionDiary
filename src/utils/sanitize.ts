// Basic sanitization for user inputs - lightweight XSS protection

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Basic length limit
  const maxLength = 100000; // 100KB of text
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }
  
  // Remove dangerous HTML tags and scripts
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
};

export const sanitizeTitle = (title: string): string => {
  if (!title) return '';
  
  // Title length limit
  const maxLength = 200;
  if (title.length > maxLength) {
    title = title.substring(0, maxLength);
  }
  
  // Remove HTML tags from titles entirely
  return title.replace(/<[^>]*>/g, '').trim();
};