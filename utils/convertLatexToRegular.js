export function convertLatexToFormattedText(latex) {
  if (!latex) return '';

  let output = latex;

  // Remove LaTeX preamble and wrappers
  output = output.replace(/\\documentclass(\[.*?\])?\{.*?\}/g, '');
  output = output.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, '');
  output = output.replace(/\\begin\{document\}/g, '');
  output = output.replace(/\\end\{document\}/g, '');

  // Convert display math \[...\] to $$...$$
  output = output.replace(/\\\[(.*?)\\\]/gs, (_, math) => `$$${math.trim()}$$`);

  // Convert inline math \( ... \) to $...$
  output = output.replace(/\\\((.*?)\\\)/gs, (_, math) => `$${math.trim()}$`);

  // Convert \begin{equation}...\end{equation} to $$...$$
  output = output.replace(/\\begin\{equation\}(.*?)\\end\{equation\}/gs, (_, math) => `$$${math.trim()}$$`);

  // Convert \textbf{} to **bold**
  output = output.replace(/\\textbf\{(.*?)\}/g, '**$1**');

  // Convert \textit{} and \emph{} to *italic*
  output = output.replace(/\\textit\{(.*?)\}/g, '*$1*');
  output = output.replace(/\\emph\{(.*?)\}/g, '*$1*');

  // Strip LaTeX comments and clean spacing
  output = output.replace(/%.*$/gm, ''); // remove % comments
  output = output.replace(/\r\n|\r|\n/g, '\n'); // normalize line endings
  output = output.replace(/\n{3,}/g, '\n\n'); // collapse extra line breaks

  return output.trim();
}
