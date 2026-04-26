# Change Log

All notable changes to the "androidsvgsupport" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.0] - 2026-04-26

### Added

- **`<group>` element support**: Nested `<group>` tags are now converted to SVG `<g>` elements with full transform support (`translateX/Y`, `rotation`, `pivotX/Y`, `scaleX/Y`)
- **`android:alpha`**: Root `<vector>` alpha attribute is now applied as SVG `opacity`
- **`android:fillType`**: `evenOdd` fill type is now correctly mapped to `fill-rule="evenodd"`
- **Drag to pan**: Hold left mouse button and drag to pan the preview
- **Zoom toward pointer**: Ctrl/Cmd + scroll now zooms toward the cursor position at all zoom levels

### Fixed

- **Color conversion**: `#AARRGGBB` Android colors are now correctly converted to `rgba()` instead of invalid 8-digit CSS hex
- **Bounds box**: The dashed bounds border now always tracks the SVG at any zoom level and scroll position
- **Rulers**: Ruler tick marks now update correctly when scrolling
- **Hover provider**: Path hover no longer fires when cursor is between two `<path>` tags
- **Preview command**: Title bar button now works reliably without a race condition on focus
- **Double-dispose**: Closing the preview panel no longer causes a double-dispose error
- **Template load crash**: Missing template files now show an error panel instead of crashing the extension host
- **Keystroke performance**: Preview no longer re-renders on every keystroke — debounced to 300ms

### Removed

- Unused `TemplateEngine` class (dead code)

## [0.0.3] - 2026-01-22

### Fixed - Fix missing template files

- Fix missing template files.

## [0.0.2] - 2025-09-30

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
