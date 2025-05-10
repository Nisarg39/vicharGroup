import React, { useState } from 'react';
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

export default function LatexToolbar({ onSelectExpression, targetField }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // Common LaTeX expressions grouped by category
  const expressions = {
    "Text Formatting ✏️": [
      { label: "Bold Text", latex: "**text**", isFormatting: true },
      { label: "Italic Text", latex: "*text*", isFormatting: true },
    ],
    
    "Basic Math ➗": [
      { label: "Fraction", latex: "\\frac{a}{b}" },
      { label: "Square Root", latex: "\\sqrt{x}" },
      { label: "Cube Root", latex: "\\sqrt[3]{x}" },
      { label: "Power", latex: "x^{n}" },
      { label: "Subscript", latex: "x_{i}" },
      { label: "Plus/Minus", latex: "\\pm" },
      { label: "Multiplication Dot", latex: "\\cdot" },
      { label: "Division", latex: "\\div" },
    ],
    
    "Scripts 📝": [
      { label: "Superscript", latex: "x^{a}" },
      { label: "Subscript", latex: "x_{a}" },
      { label: "Super-Subscript", latex: "x^{a}_{b}" },
      { label: "Stacked Text", latex: "\\stackrel{a}{b}" },
    ],
    
    "Fractions ⅓": [
      { label: "Simple Fraction", latex: "\\frac{a}{b}" },
      { label: "Small Fraction", latex: "\\tfrac{a}{b}" },
      { label: "Binomial", latex: "\\binom{n}{k}" },
      { label: "Continued Fraction", latex: "a_0 + \\cfrac{1}{a_1 + \\cfrac{1}{a_2}}" },
    ],
    
    "Radicals √": [
      { label: "Square Root", latex: "\\sqrt{x}" },
      { label: "Cube Root", latex: "\\sqrt[3]{x}" },
      { label: "Fourth Root", latex: "\\sqrt[4]{x}" },
      { label: "nth Root", latex: "\\sqrt[n]{x}" },
    ],
    
    "Large Operators ∑": [
      { label: "Sum", latex: "\\sum_{i=1}^{n} x_i" },
      { label: "Product", latex: "\\prod_{i=1}^{n} x_i" },
      { label: "Coproduct", latex: "\\coprod_{i=1}^{n} x_i" },
      { label: "Union", latex: "\\bigcup_{i=1}^{n} A_i" },
      { label: "Intersection", latex: "\\bigcap_{i=1}^{n} A_i" },
    ],
    
    "Integrals ∫": [
      { label: "Integral", latex: "\\int_{a}^{b} f(x) dx" },
      { label: "Double Integral", latex: "\\iint_{D} f(x,y) dA" },
      { label: "Triple Integral", latex: "\\iiint_{E} f(x,y,z) dV" },
      { label: "Contour Integral", latex: "\\oint_{C} f(z) dz" },
      { label: "Surface Integral", latex: "\\iint_{S} \\vec{F} \\cdot d\\vec{S}" },
    ],
    
    "Brackets & Delimiters 【】": [
      { label: "Parentheses", latex: "\\left( x \\right)" },
      { label: "Brackets", latex: "\\left[ x \\right]" },
      { label: "Braces", latex: "\\left\\{ x \\right\\}" },
      { label: "Angle Brackets", latex: "\\left\\langle x \\right\\rangle" },
      { label: "Floor", latex: "\\left\\lfloor x \\right\\rfloor" },
      { label: "Ceiling", latex: "\\left\\lceil x \\right\\rceil" },
      { label: "Absolute Value", latex: "\\left| x \\right|" },
      { label: "Norm", latex: "\\left\\| x \\right\\|" },
    ],
    
    "Functions 𝑓": [
      { label: "Sine", latex: "\\sin(x)" },
      { label: "Cosine", latex: "\\cos(x)" },
      { label: "Tangent", latex: "\\tan(x)" },
      { label: "Logarithm", latex: "\\log_{b}(x)" },
      { label: "Natural Log", latex: "\\ln(x)" },
      { label: "Exponential", latex: "e^{x}" },
      { label: "Arcsin", latex: "\\arcsin(x)" },
      { label: "Arccos", latex: "\\arccos(x)" },
      { label: "Arctan", latex: "\\arctan(x)" },
    ],
    
    "Limits & Logs 🔄": [
      { label: "Limit", latex: "\\lim_{x \\to a} f(x)" },
      { label: "Limit from Left", latex: "\\lim_{x \\to a^-} f(x)" },
      { label: "Limit from Right", latex: "\\lim_{x \\to a^+} f(x)" },
      { label: "Logarithm", latex: "\\log_{b}(x)" },
      { label: "Natural Log", latex: "\\ln(x)" },
      { label: "Maximum", latex: "\\max_{x \\in D} f(x)" },
      { label: "Minimum", latex: "\\min_{x \\in D} f(x)" },
    ],
    
    "Accents ˆ": [
      { label: "Hat", latex: "\\hat{a}" },
      { label: "Bar", latex: "\\bar{a}" },
      { label: "Vector", latex: "\\vec{a}" },
      { label: "Tilde", latex: "\\tilde{a}" },
      { label: "Dot", latex: "\\dot{a}" },
      { label: "Double Dot", latex: "\\ddot{a}" },
      { label: "Overline", latex: "\\overline{abc}" },
      { label: "Underline", latex: "\\underline{abc}" },
      { label: "Overbrace", latex: "\\overbrace{abc}^{\\text{note}}" },
      { label: "Underbrace", latex: "\\underbrace{abc}_{\\text{note}}" },
    ],
    
    "Matrices 🔲": [
      { label: "2×2 Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { label: "3×3 Matrix", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
      { label: "Bracket Matrix", latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
      { label: "Determinant", latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}" },
      { label: "Augmented Matrix", latex: "\\left[ \\begin{array}{cc|c} a & b & e \\\\ c & d & f \\end{array} \\right]" },
      { label: "Cases", latex: "\\begin{cases} f(x) & \\text{if } x > 0 \\\\ g(x) & \\text{if } x \\leq 0 \\end{cases}" },
    ],
    
    "Greek Letters": [
      { label: "Alpha", latex: "\\alpha" },
      { label: "Beta", latex: "\\beta" },
      { label: "Gamma", latex: "\\gamma" },
      { label: "Delta", latex: "\\Delta" },
      { label: "Epsilon", latex: "\\epsilon" },
      { label: "Zeta", latex: "\\zeta" },
      { label: "Eta", latex: "\\eta" },
      { label: "Theta", latex: "\\theta" },
      { label: "Iota", latex: "\\iota" },
      { label: "Kappa", latex: "\\kappa" },
      { label: "Lambda", latex: "\\lambda" },
      { label: "Mu", latex: "\\mu" },
      { label: "Nu", latex: "\\nu" },
      { label: "Xi", latex: "\\xi" },
      { label: "Pi", latex: "\\pi" },
      { label: "Rho", latex: "\\rho" },
      { label: "Sigma", latex: "\\sigma" },
      { label: "Tau", latex: "\\tau" },
      { label: "Upsilon", latex: "\\upsilon" },
      { label: "Phi", latex: "\\phi" },
      { label: "Chi", latex: "\\chi" },
      { label: "Psi", latex: "\\psi" },
      { label: "Omega", latex: "\\omega" },
    ],
    
    "Comparison Symbols 🔣": [
      { label: "Equal", latex: "=" },
      { label: "Not Equal", latex: "\\neq" },
      { label: "Less Than", latex: "<" },
      { label: "Greater Than", latex: ">" },
      { label: "Less Than or Equal", latex: "\\leq" },
      { label: "Greater Than or Equal", latex: "\\geq" },
      { label: "Approximately", latex: "\\approx" },
      { label: "Proportional To", latex: "\\propto" },
      { label: "Similar To", latex: "\\sim" },
      { label: "Congruent To", latex: "\\cong" },
      { label: "Equivalent To", latex: "\\equiv" },
    ],
    
    "Arrows ↔️": [
      { label: "Left Arrow", latex: "\\leftarrow" },
      { label: "Right Arrow", latex: "\\rightarrow" },
      { label: "Left-Right Arrow", latex: "\\leftrightarrow" },
      { label: "Double Left Arrow", latex: "\\Leftarrow" },
      { label: "Double Right Arrow", latex: "\\Rightarrow" },
      { label: "Double Left-Right", latex: "\\Leftrightarrow" },
      { label: "Maps To", latex: "\\mapsto" },
      { label: "Long Right Arrow", latex: "\\longrightarrow" },
    ],
    
    "Set Theory 🔢": [
      { label: "Union", latex: "\\cup" },
      { label: "Intersection", latex: "\\cap" },
      { label: "Subset", latex: "\\subset" },
      { label: "Superset", latex: "\\supset" },
      { label: "Element Of", latex: "\\in" },
      { label: "Not Element Of", latex: "\\notin" },
      { label: "Empty Set", latex: "\\emptyset" },
      { label: "Power Set", latex: "\\mathcal{P}" },
      { label: "Set Difference", latex: "\\setminus" },
    ],
    
    "Algebra 📐": [
      { label: "Infinity", latex: "\\infty" },
      { label: "Partial", latex: "\\partial" },
      { label: "Nabla", latex: "\\nabla" },
      { label: "Exists", latex: "\\exists" },
      { label: "For All", latex: "\\forall" },
      { label: "Empty Set", latex: "\\emptyset" },
      { label: "Belongs To", latex: "\\in" },
    ],
    
    "Calculus 📊": [
      { label: "Derivative", latex: "\\frac{d}{dx}" },
      { label: "Partial Derivative", latex: "\\frac{\\partial f}{\\partial x}" },
      { label: "Integral", latex: "\\int_{a}^{b} f(x) dx" },
      { label: "Double Integral", latex: "\\iint_{D} f(x,y) dA" },
      { label: "Gradient", latex: "\\nabla f" },
      { label: "Divergence", latex: "\\nabla \\cdot \\vec{F}" },
      { label: "Curl", latex: "\\nabla \\times \\vec{F}" },
      { label: "Laplacian", latex: "\\nabla^2 f" },
    ],
  };

  const handleExpressionClick = (latex, isFormatting = false) => {
    console.log("LatexToolbar: Expression clicked:", latex);
    console.log("LatexToolbar: Target field:", targetField);
    
    // If it's a formatting expression (bold/italic), insert as is
    // If it's LaTeX, wrap it in dollar signs if not already wrapped
    const formattedExpression = isFormatting 
        ? latex 
        : (latex.startsWith('$') && latex.endsWith('$')) 
            ? latex 
            : `$${latex}$`;
            
    console.log("LatexToolbar: Sending formatted expression:", formattedExpression);
    
    onSelectExpression(formattedExpression, targetField);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  console.log("LatexToolbar rendering for field:", targetField);
  
  return (
    <div className="bg-white border rounded-md shadow-sm p-4 mb-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Formatting & LaTeX</h3>
        <span className="text-sm text-gray-500">Click to insert</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(expressions).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="border-t pt-2">
            <div className="grid grid-cols-4 gap-2">
              {expressions[activeCategory].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleExpressionClick(item.latex, item.isFormatting)}
                  className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                  title={item.label}
                >
                  <div className="h-6 flex items-center justify-center text-sm">
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
                  <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}