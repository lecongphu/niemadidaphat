"use client";

import React from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  // Simple markdown parsing function
  const parseMarkdown = (text: string) => {
    if (!text) return '';
    
    // Split into lines for better processing
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is a list item
      const listMatch = line.match(/^- (.*)$/);
      
      if (listMatch) {
        // Start list if not already in list
        if (!inList) {
          html += '<ul class="list-disc ml-4 mb-2">';
          inList = true;
        }
        // Add list item
        const itemContent = listMatch[1];
        html += `<li class="mb-1">${itemContent}</li>`;
      } else {
        // End list if we were in one
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        
        // Add regular line
        if (line.trim() === '') {
          html += '<br>';
        } else {
          html += line + '<br>';
        }
      }
    }
    
    // Close list if still in one
    if (inList) {
      html += '</ul>';
    }
    
    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert [link](url) to <a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    
    // Convert #hashtags to styled spans
    html = html.replace(/#(\w+)/g, '<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">#$1</span>');
    
    return html;
  };

  const parsedHtml = parseMarkdown(content);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
}
