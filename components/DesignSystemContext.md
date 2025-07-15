# Vichar Design System Context

## UI Design Rules (ManageExams Gold Standard)

All UI components in this project must follow these rules for a polished, modern, and visually rich experience:

### 1. Glassmorphic/Soft Dashboard Style
- Use semi-transparent backgrounds (e.g., `bg-white/80`), backdrop blur, and large, soft, rounded corners (`rounded-xl`, `rounded-2xl`).
- Apply subtle gradients for backgrounds (e.g., `bg-gradient-to-br from-white/90 via-blue-50/40 to-indigo-50/20`).
- Use soft, layered shadows for depth (`shadow-xl`, `shadow-inner`).

### 2. Visually Rich Cards, Tables, and Layouts
- Prefer visually distinct cards or tables for all main content.
- Use beautiful, responsive grid/flex layouts for lists, stats, and actions.
- Add decorative backgrounds (blurred circles, gradients) for visual interest.
- **Do NOT** use plain, unstyled lists or default HTML tables.

#### Example: Card
```jsx
<div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6">
  <h3 className="text-lg font-bold text-gray-900 mb-2">Section Title</h3>
  <p className="text-gray-600">Section content goes here.</p>
</div>
```

#### Example: Table
```jsx
<table className="min-w-full divide-y divide-gray-200 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
  <thead className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Header</th>
      <!-- ... -->
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-100">
    <tr className="hover:bg-blue-50/40 transition">
      <td className="px-6 py-4">Row content</td>
      <!-- ... -->
    </tr>
  </tbody>
</table>
```

### 3. Typography & Spacing
- Use bold, clear headings and subheadings (`text-2xl font-bold`, `text-lg font-semibold`).
- Maintain generous, consistent spacing and padding for readability.
- Use modern, readable font sizes and weights throughout.
- **Do NOT** use default or browser-styled headings or cramped layouts.

### 4. Color & Iconography
- Use a soft, pastel color palette (blues, purples, greens, oranges) for highlights and icons.
- All text should be in black/gray shades for clarity, with accent colors for important numbers and actions.
- Use Heroicons for modern, outline-style icons, matching the accent color of their context.
- **Do NOT** use default browser icons or unstyled SVGs.

### 5. Interactivity & Feedback
- All interactive elements (buttons, cards, table rows) must have clear hover, focus, and active states.
- Use subtle animations (e.g., `hover:shadow-2xl`, `group-hover:scale-110`) for feedback.
- Show toast notifications for user actions (success, error, loading).
- **Do NOT** use default HTML buttons or links without styling.

#### Example: Button
```jsx
<button className="py-2 px-4 rounded-xl bg-blue-600/90 text-white font-semibold shadow hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200">
  Action
</button>
```

### 6. Sectioning & Visual Hierarchy
- Each section (stats, actions, lists, forms) should be visually distinct, with clear headings and separation.
- Use dividers (`border-t border-gray-100/60`) and background contrast to separate content.
- **Do NOT** stack unrelated content without clear separation.

### 7. Responsiveness & Accessibility
- All layouts must be fully responsive, using grid/flex and adaptive spacing for different screen sizes.
- Use semantic HTML and ARIA attributes for accessibility.
- Ensure sufficient color contrast for text and interactive elements.
- **Do NOT** use fixed-width layouts or ignore accessibility best practices.

### 8. Production-Ready Polish
- Always aim for a visually impressive, production-ready look, not just functional or minimal UI.
- Never default to low-detail or minimal versions unless explicitly requested.
- **Do NOT** use default, unstyled, or placeholder elements in production code.

### 9. Reference Example
- The `ManageExams` component is the gold standard for visual polish, layout, and interactivity. All new components should match or exceed this level of detail.
- Compare new components visually to `ManageExams` to ensure consistency.

### 10. Checklist for New Components
- [ ] Uses glassmorphic/soft backgrounds, gradients, and shadows
- [ ] Has bold, clear headings and modern typography
- [ ] Uses visually rich cards, tables, or grids (not plain lists)
- [ ] All interactive elements have hover/focus/active states
- [ ] Uses Heroicons and color accents for icons
- [ ] Responsive and accessible
- [ ] No default/minimal/unstyled elements
- [ ] Matches the visual polish of ManageExams

---

**To all AI and developers:**
Use this file as the single source of truth for UI design in this project. All new UI code must adhere to these rules for consistency and quality. If in doubt, visually compare your component to `ManageExams` and follow the checklist above. 