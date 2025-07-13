import React from "react";

// Simple markdown-like processor as replacement for signalwerk.md
function simpleMarkdownToHtml(text) {
  if (!text) return '';
  
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    // Code blocks (basic)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Wrap in paragraph if not already wrapped
    .replace(/^(?!<[h1-6|div|p])/gm, '<p>')
    .replace(/(?![h1-6|div|p]>)$/gm, '</p>')
    // Clean up extra paragraph tags
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6])/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1');
}

export function text(node) {
  if (!node) return null;
  
  // Handle different input formats
  let content = '';
  
  if (node.body) {
    // Direct body content
    content = simpleMarkdownToHtml(node.body);
  } else if (node.children && Array.isArray(node.children)) {
    // Children array format
    content = node.children.map(child => {
      if (typeof child === 'string') {
        return simpleMarkdownToHtml(child);
      } else if (child.value) {
        return simpleMarkdownToHtml(child.value);
      }
      return '';
    }).join('');
  } else if (typeof node === 'string') {
    // Direct string
    content = simpleMarkdownToHtml(node);
  }

  if (!content) return null;

  return (
    <div
      className={`node-text ${node.class || ""}`}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}
