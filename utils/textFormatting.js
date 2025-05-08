import React from 'react';
import { InlineMath } from 'react-katex';

export const renderFormattedText = (text) => {
    if (!text) return '';
    
    try {
        // Split the text by new lines first
        const lines = text.split('\n');
        
        // If there's only one line, process it as before
        if (lines.length === 1) {
            return processTextFormatting(text);
        }
        
        // If there are multiple lines, process each line and join with <br /> tags
        return (
            <>
                {lines.map((line, lineIndex) => (
                    <React.Fragment key={`line-${lineIndex}`}>
                        {lineIndex > 0 && <br />}
                        {processTextFormatting(line)}
                    </React.Fragment>
                ))}
            </>
        );
    } catch (error) {
        return <span className="text-red-500">Error rendering formatted text: {error.message}</span>;
    }
}

