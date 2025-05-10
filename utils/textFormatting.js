import React from 'react';
import { InlineMath } from 'react-katex';

// Helper function to process LaTeX expressions
const processLatex = (text) => {
    if (!text) return '';
    
    try {
        // Split by dollar signs to identify LaTeX parts
        const parts = text.split(/(\$[^$]*\$)/g);
        
        // Check if there are any LaTeX parts
        const hasLatex = parts.some(part => part.startsWith('$') && part.endsWith('$'));
        
        if (!hasLatex) return text; // Return as string if no LaTeX
        
        // Process each part, converting LaTeX and preserving text
        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                const latex = part.slice(1, -1);
                return <InlineMath key={index} math={latex} />;
            }
            return part; // Return text parts as is
        });
    } catch (error) {
        console.error("Error processing LaTeX:", error);
        return text; // Return original text on error
    }
};

// Helper function to process bold and italic formatting
const processFormatting = (content) => {
    if (!content) return '';
    
    // If content is already a React element (from LaTeX processing), return it
    if (React.isValidElement(content)) return content;
    
    // If content is an array (from LaTeX processing), process each text element
    if (Array.isArray(content)) {
        return content.map((part, index) => {
            if (React.isValidElement(part)) return part;
            return processTextStyles(part, index);
        });
    }
    
    // Otherwise, process as text
    return processTextStyles(content);
};

// Process bold and italic text styles
const processTextStyles = (text, keyPrefix = '') => {
    if (!text) return '';
    
    // Process bold formatting
    const boldPattern = /\*\*(.*?)\*\*/g;
    const boldParts = text.split(boldPattern);
    
    if (boldParts.length > 1) {
        return (
            <React.Fragment key={`fragment-${keyPrefix}`}>
                {boldParts.map((part, index) => {
                    // Bold parts are at odd indices
                    if (index % 2 === 1) {
                        return <strong key={`bold-${keyPrefix}-${index}`}>{processItalic(part, `${keyPrefix}-bold-${index}`)}</strong>;
                    }
                    // Process non-bold parts for italic
                    return processItalic(part, `${keyPrefix}-${index}`);
                })}
            </React.Fragment>
        );
    }
    
    // If no bold formatting, check for italic
    return processItalic(text, keyPrefix);
};

// Process italic formatting
const processItalic = (text, keyPrefix) => {
    if (!text) return '';
    
    const italicPattern = /\*(.*?)\*/g;
    const italicParts = text.split(italicPattern);
    
    if (italicParts.length > 1) {
        return (
            <React.Fragment key={`italic-fragment-${keyPrefix}`}>
                {italicParts.map((part, index) => {
                    // Italic parts are at odd indices
                    if (index % 2 === 1) {
                        return <em key={`italic-${keyPrefix}-${index}`}>{part}</em>;
                    }
                    return <span key={`text-${keyPrefix}-${index}`}>{part}</span>;
                })}
            </React.Fragment>
        );
    }
    
    // If no italic formatting, return as is
    return <span key={`text-${keyPrefix}`}>{text}</span>;
};

export const renderFormattedText = (text) => {
    if (!text) return '';
    
    try {
        // Split the text by new lines first
        const lines = text.split('\n');
        
        // If there's only one line, process it
        if (lines.length === 1) {
            // First process LaTeX, then handle formatting
            const latexProcessed = processLatex(text);
            return processFormatting(latexProcessed);
        }
        
        // If there are multiple lines, process each line and join with <br /> tags
        return (
            <>
                {lines.map((line, lineIndex) => {
                    // Process LaTeX first, then formatting
                    const latexProcessed = processLatex(line);
                    const formattedLine = processFormatting(latexProcessed);
                    
                    return (
                        <React.Fragment key={`line-${lineIndex}`}>
                            {lineIndex > 0 && <br />}
                            {formattedLine}
                        </React.Fragment>
                    );
                })}
            </>
        );
    } catch (error) {
        console.error("Error rendering formatted text:", error);
        return <span className="text-red-500">Error rendering formatted text: {error.message}</span>;
    }
};
