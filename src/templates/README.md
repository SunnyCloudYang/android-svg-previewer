# Template System Documentation

This directory contains modular HTML, CSS, and JavaScript templates for the Android Vector Drawable Preview extension.

## Directory Structure

```
templates/
├── README.md              # This file
├── preview.html           # Main preview panel HTML template
├── error.html             # Error page HTML template
├── styles/
│   ├── preview.css        # Styles for the preview panel
│   └── error.css          # Styles for the error page
└── scripts/
    └── preview.js         # JavaScript for the preview panel interactions
```

## How It Works

### Template Engine

The `TemplateEngine` class (`src/templateEngine.ts`) provides a simple templating system:

- **Template Loading**: Templates are loaded from disk and cached for performance
- **Variable Substitution**: Variables are injected using `{{variableName}}` syntax
- **Modular Design**: Separate files for HTML structure, CSS styles, and JavaScript logic

### Variable Substitution

Templates use double curly braces for variable substitution:

```html
<div>{{variableName}}</div>
```

In the code, you render templates like this:

```typescript
this.renderTemplate(template, {
  variableName: "value",
});
```

## Preview Panel Template

The preview panel is composed of multiple files:

### `preview.html`

Main HTML structure with variables:

- `{{nonce}}`: Security nonce for CSP
- `{{cspSource}}`: Content Security Policy source
- `{{styles}}`: Injected CSS content
- `{{svgDataUri}}`: Base64-encoded SVG data
- `{{script}}`: Injected JavaScript content

### `styles/preview.css`

Contains all CSS styling for the preview panel:

- Toolbar styles
- Ruler and crosshair styles
- SVG container and zoom controls
- VSCode theme-aware color variables

### `scripts/preview.js`

Interactive functionality:

- Zoom controls (in/out/reset)
- Crosshair tool
- Ruler rendering
- Mouse interaction handlers
- Keyboard shortcuts

Variables in the script:

- `{{svgWidth}}`: Width of the SVG
- `{{svgHeight}}`: Height of the SVG

## Error Page Template

### `error.html`

Simple error page structure with variables:

- `{{nonce}}`: Security nonce
- `{{styles}}`: Injected CSS content
- `{{errorMessage}}`: Error message to display

### `styles/error.css`

Minimal styling for error pages

## Benefits of This Architecture

1. **Maintainability**: Separate concerns (HTML, CSS, JS) into individual files
2. **Readability**: No more huge template strings in TypeScript files
3. **Reusability**: Templates can be easily shared or duplicated
4. **Development**: Easier to edit with proper syntax highlighting
5. **Performance**: Template caching reduces file I/O
6. **Testing**: Templates can be tested independently

## Making Changes

### To modify the preview panel appearance:

Edit `styles/preview.css`

### To modify the preview panel layout:

Edit `preview.html`

### To modify the preview panel behavior:

Edit `scripts/preview.js`

### To add new templates:

1. Create the template file in the appropriate directory
2. Use `{{variableName}}` for dynamic content
3. Load it using `this.loadTemplate('filename')`
4. Render it using `this.renderTemplate(template, variables)`

## Example Usage

```typescript
// Load templates
const htmlTemplate = this.loadTemplate("preview.html");
const cssTemplate = this.loadTemplate("styles/preview.css");
const jsTemplate = this.loadTemplate("scripts/preview.js");

// Render with variables
const script = this.renderTemplate(jsTemplate, {
  svgWidth: "24",
  svgHeight: "24",
});

const html = this.renderTemplate(htmlTemplate, {
  nonce: getNonce(),
  cspSource: webview.cspSource,
  styles: cssTemplate,
  svgDataUri: "data:image/svg+xml...",
  script: script,
});
```
