# Android SVG Support

A Visual Studio Code extension that provides comprehensive support for Android Vector Drawable files with live preview, hover tooltips, and advanced viewing features.

## Features

### 🎨 Live Preview Panel

- **Side-by-side preview** of Android vector drawable XML files
- Opens automatically in a split view when you click the preview button
- Real-time updates as you edit the XML source code
- Beautiful modern UI with VS Code theme integration

![Preview Panel Feature](https://via.placeholder.com/600x300?text=Preview+Panel)

### 🔍 Smart Zoom & Scaling

- **Auto-fit to panel** - Automatically scales drawables to fit the preview panel
- **Interactive zoom controls** - Zoom in/out with buttons or keyboard shortcuts
- **Mouse wheel zoom** - Ctrl/Cmd + Mouse Wheel for precise zoom control
- **Scale indicator** - Always shows current zoom percentage
- **Visual bounds display** - Dashed border showing the drawable boundaries with dimensions

### 📐 Visual Information Display

- **Dimensions display** - Shows the actual size and viewport dimensions
- **Scale percentage** - Real-time scale information in the toolbar
- **Bounds overlay** - Visual representation of the drawable's bounds
- **Checkerboard background** - Professional transparency background pattern

### 💡 Hover Preview (Quick Preview)

- **Instant preview on hover** - Hover over `<vector>` or `<path>` tags to see a preview
- **Individual path preview** - See individual paths when hovering over `<path>` elements
- **Color information** - Shows fill and stroke colors in the hover tooltip
- **Dimension details** - Displays size and viewport information

### ⚡ Smart Features

- **Automatic detection** - Only activates for Android vector drawable XML files
- **Real-time sync** - Preview updates automatically when you edit the source
- **Keyboard shortcuts** - Ctrl+Shift+V (Cmd+Shift+V on Mac) to open preview
- **Multiple access points** - Available via command palette, editor title button, and context menu

## Usage

### Opening the Preview

There are multiple ways to open the vector drawable preview:

1. **Editor Title Button**: Click the preview icon in the editor title bar when viewing a drawable XML file
2. **Context Menu**: Right-click in the editor and select "Show Vector Drawable Preview"
3. **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Show Vector Drawable Preview"
4. **Keyboard Shortcut**: Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)

### Zoom Controls

- **Zoom In**: Click the "+" button, press `+` or `=` key
- **Zoom Out**: Click the "-" button, press `-` or `_` key
- **Fit to View**: Click "Fit to View" button or press `0` key
- **Mouse Wheel**: Hold `Ctrl` (or `Cmd` on Mac) and scroll

### Hover Previews

Simply hover your mouse over:

- **`<vector>` tag** - See the complete drawable preview
- **`<path>` tag** - See individual path preview with color information

## Requirements

- Visual Studio Code version 1.10.0 or higher
- Android vector drawable XML files (typically in `res/drawable/` directory)

## Supported File Format

This extension works with Android Vector Drawable XML files that contain a `<vector>` root element:

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FF000000"
        android:pathData="M12,2L2,7v10c0,5.55,3.84,10.74,9,12c5.16,-1.26,9,-6.45,9,-12V7L12,2z"/>
</vector>
```

## Extension Settings

This extension currently doesn't contribute any VS Code settings. All features work out of the box.

## Known Issues

- Color references (e.g., `@color/primary`) are displayed with a default grey color in the preview
- Complex gradient fills are not yet fully supported
- Theme attributes (e.g., `?attr/colorPrimary`) use default colors

## Development

### Architecture

The extension follows VS Code best practices and is organized into modular components:

- **`extension.ts`** - Main extension activation and registration
- **`previewPanel.ts`** - Webview panel management for the preview feature
- **`hoverProvider.ts`** - Hover tooltip provider for inline previews
- **`utils.ts`** - Utility functions including XML to SVG conversion

### Building from Source

```bash
# Install dependencies
yarn install

# Compile TypeScript
yarn run compile

# Watch mode for development
yarn run watch

# Run tests
yarn run test
```

### Testing the Extension

1. Press `F5` to open a new VS Code window with the extension loaded
2. Open an Android project with vector drawable XML files
3. Navigate to a drawable XML file in the `res/drawable/` directory
4. Click the preview button or use the keyboard shortcut

## Release Notes

### 1.0.0 (2025-09-30)

**Initial Release** 🎉

Features included:

- ✅ Side panel preview for Android vector drawables
- ✅ Auto-fit scaling with zoom controls
- ✅ Visual bounds and dimension display
- ✅ Hover tooltips for `<vector>` and `<path>` elements
- ✅ Real-time preview updates
- ✅ Keyboard shortcuts and multiple access points
- ✅ Beautiful VS Code theme-integrated UI
- ✅ Mouse wheel zoom support
- ✅ Checkerboard transparency background

## Contributing

This extension is designed to be easy to maintain and extend. Contributions are welcome!

### Future Enhancement Ideas

- Support for gradient fills
- Color resource resolution from `colors.xml`
- Export to PNG/SVG functionality
- Animation preview support
- Bulk preview of multiple drawables
- Theme preview (light/dark mode switching)

## Acknowledgments

Built with best practices from the [VS Code Extension API](https://code.visualstudio.com/api) documentation.

## License

See LICENSE file for details.

---

**Enjoy the extension!** If you find it useful, please consider rating it on the marketplace. For issues or feature requests, please visit the [GitHub repository](https://github.com/yourusername/androidsvgsupport).
