# Change Log

All notable changes to the "androidsvgsupport" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-09-30

### Added - Initial Release

#### Core Features

- **Side Panel Preview**: Display Android vector drawable XML files in a live preview panel
  - Opens in split view beside the editor
  - Real-time updates when source code changes
  - Beautiful VS Code theme-integrated interface

#### Zoom & Scaling

- Auto-fit to panel by default
- Interactive zoom controls (buttons, keyboard shortcuts, mouse wheel)
- Zoom in/out with +/- keys
- Ctrl/Cmd + Mouse Wheel for precise zoom control
- Reset to fit view with "0" key
- Scale percentage indicator in toolbar

#### Visual Features

- Checkerboard transparency background pattern
- Visual bounds overlay with dashed border
- Dimensions display (width × height)
- Viewport information display
- Shadow effect on drawable for better visibility

#### Hover Tooltips

- Hover over `<vector>` tag to see complete drawable preview
- Hover over `<path>` tag to see individual path preview
- Display fill and stroke color information in tooltips
- Show dimensions and viewport in tooltips

#### User Experience

- Multiple access points:
  - Editor title bar button
  - Context menu
  - Command palette
  - Keyboard shortcut (Ctrl+Shift+V / Cmd+Shift+V)
- Smart file detection (only activates for vector drawable XML files)
- Automatic drawable file recognition
- Professional toolbar with zoom controls and info display

#### Technical Implementation

- Modular architecture following VS Code best practices
- Separated concerns: extension activation, preview panel, hover provider, utilities
- XML to SVG conversion for Android vector drawables
- Support for path data, fill colors, stroke colors
- WebView-based preview panel with CSP security
- TypeScript with strict type checking

### Supported

- Android vector drawable `<vector>` elements
- `<path>` elements with pathData, fillColor, strokeColor
- Width, height, viewportWidth, viewportHeight attributes
- Fill and stroke alpha values
- Tint color attribute

### Known Limitations

- Color references (e.g., `@color/primary`) use default grey color
- Theme attributes (e.g., `?attr/colorPrimary`) use default colors
- Gradient fills not yet supported
- Animation sequences not yet supported

## [Unreleased]

### Planned Features

- Color resource resolution from colors.xml
- Support for gradient fills
- Export to PNG/SVG functionality
- Animation preview support
- Bulk preview of multiple drawables
- Theme preview (light/dark mode switching)
- Layer list support
- Shape drawable support
