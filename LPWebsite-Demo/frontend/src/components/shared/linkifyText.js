import React from 'react';

export const linkifyText = (text) => {
  if (!text) return text;

  // Create new regex instance each time to avoid global state issues
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+)/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Reset regex lastIndex to avoid global state issues
      urlRegex.lastIndex = 0;
      
      let url = part.startsWith('http') ? part : `https://${part}`;
      
      // Basic validation to prevent javascript: protocol and other suspicious schemes
      if (!url.match(/^https?:\/\//)) {
        return part;
      }
      
      return (
        <a
          key={`link-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="auto-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};