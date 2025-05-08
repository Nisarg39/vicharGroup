import React from 'react';
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

export default function LatexToolbar({ onSelectExpression, targetField }) {
  // Common LaTeX expressions grouped by category
  const expressions = {
    "Text Formatting": [
      { label: "Bold Text", latex: "**text**", isFormatting: true },
      { label: "Italic Text", latex: "*text*", isFormatting: true },
    ],
    "Basic Math": [
      { label: "Fraction", latex: "\\frac{a}{b}" },
      { label: "Square Root", latex: "\\sqrt{x}" },
      { label: "Cube Root", latex: "\\sqrt[3]{x}" },
      { label: "Power", latex: "x^{n}" },
      { label: "Subscript", latex: "x_{i}" },
    ],
    "Algebra": [
      { label: "Sum", latex: "\\sum_{i=1}^{n} x_i" },
      { label: "Product", latex: "\\prod_{i=1}^{n} x_i" },
      { label: "Limit", latex: "\\lim_{x \\to 0}" },
      { label: "Infinity", latex: "\\infty" },
    ],
    "Calculus": [
      { label: "Derivative", latex: "\\frac{d}{dx}" },
      { label: "Partial Derivative", latex: "\\frac{\\partial f}{\\partial x}" },
      { label: "Integral", latex: "\\int_{a}^{b} f(x) dx" },
      { label: "Double Integral", latex: "\\iint_{D} f(x,y) dA" },
    ],
    "Symbols": [
      { label: "Alpha", latex: "\\alpha" },
      { label: "Beta", latex: "\\beta" },
      { label: "Gamma", latex: "\\gamma" },
      { label: "Delta", latex: "\\Delta" },
      { label: "Pi", latex: "\\pi" },
      { label: "Theta", latex: "\\theta" },
      { label: "Less than or equal", latex: "\\leq" },
      { label: "Greater than or equal", latex: "\\geq" },
      { label: "Not equal", latex: "\\neq" },
      { label: "Approximately", latex: "\\approx" },
    ],
    "Matrices": [
      { label: "2×2 Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { label: "3×3 Matrix", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
    ]
  };

  const handleExpressionClick = (latex, isFormatting = false) => {
    console.log("LatexToolbar: Expression clicked:", latex);
    console.log("LatexToolbar: Target field:", targetField);
    
    // If it's a formatting expression (like bold or italic), don't wrap in dollar signs
    const formattedExpression = isFormatting ? latex : `$${latex}$`;
    console.log("LatexToolbar: Sending formatted expression:", formattedExpression);
    
    // Call the parent component's function
    onSelectExpression(formattedExpression, targetField);
  };

  // Add a simple test render to verify it works
  console.log("LatexToolbar rendering for field:", targetField);
  
  return (
    <div className="bg-white border rounded-md shadow-sm p-2 mb-2 w-full">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-medium text-gray-700">Formatting & LaTeX</h3>
        <span className="text-xs text-gray-500">Click to insert</span>
      </div>
      
      <div className="space-y-1">
        {Object.entries(expressions).map(([category, items]) => (
          <div key={category} className="border-t pt-1 first:border-t-0 first:pt-0">
            <h4 className="text-xs font-semibold text-gray-600 mb-0.5">{category}</h4>
            <div className="grid grid-cols-6 gap-1">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleExpressionClick(item.latex, item.isFormatting)}
                  className="flex flex-col items-center justify-center p-0.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                  title={item.label}
                >
                  <div className="h-4 flex items-center justify-center text-xs">
                    {item.isFormatting ? (
                      item.label === "Bold Text" ? (
                        <strong>B</strong>
                      ) : item.label === "Italic Text" ? (
                        <em>I</em>
                      ) : (
                        item.label
                      )
                    ) : (
                      <InlineMath math={item.latex} />
                    )}
                  </div>
                  <span className="text-[8px] text-gray-600 mt-0.5 truncate w-full text-center">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}