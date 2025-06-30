import { convertLatexToFormattedText } from './convertLatexToRegular';

export function handleLatexConversion(value) {
  // Check for LaTeX markers ($) or common LaTeX commands
  const hasLatexMarkers = value.includes('$') || /\\[a-zA-Z]+\{/.test(value);

  if (hasLatexMarkers) {
    // Convert LaTeX to regular text format with special handling for enumerate
    return convertLatexToFormattedText(value)
      .replace(/\\begin\{enumerate\}/g, '\n')
      .replace(/\\end\{enumerate\}/g, '')
      .replace(/\\item\[(.*?)\]/g, '$1.');
  }

  return value;
}