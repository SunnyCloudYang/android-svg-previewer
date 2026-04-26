# Android SVG Previewer

A Visual Studio Code extension for live preview of Android Vector Drawable XML files, with zoom, pan, rulers, crosshair, and hover tooltips.

## Features

### Live Preview Panel

- Side-by-side preview that opens in a split view beside the editor
- Real-time updates as you edit (debounced 300ms)
- VS Code theme-integrated UI with checkerboard transparency background

### Zoom & Pan

- **Auto-fit** on open — scales the drawable to fill the panel
- **Zoom toward pointer** — Ctrl/Cmd + scroll zooms in on the cursor position
- **Drag to pan** — hold left mouse button and drag
- **Keyboard shortcuts** — `+`/`-` to zoom, `0` to reset to fit
- **Floating zoom controls** in the preview panel
- Zoom range: 25% – 5000%

### Rulers & Crosshair

- Pixel rulers along the top and left edges, updating as you scroll and zoom
- Toggle crosshair overlay with coordinate readout (coordinates in SVG space)

### Visual Bounds

- Dashed border tracks the exact drawable boundary at any zoom level
- Dimension label shows width × height in pixels

### Hover Tooltips

- Hover over `<vector>` to see a full drawable preview inline
- Hover over `<path>` to see that path's preview with fill/stroke color info

### Android Vector Drawable Support

- `<path>` with `pathData`, `fillColor`, `strokeColor`, `fillAlpha`, `strokeAlpha`, `fillType`
- `<group>` with full transform support: `translateX/Y`, `rotation`, `pivotX/Y`, `scaleX/Y`
- `android:alpha` on `<vector>` mapped to SVG `opacity`
- `#AARRGGBB` Android colors correctly converted to `rgba()`
- `android:fillType="evenOdd"` mapped to `fill-rule="evenodd"`

## Usage

### Opening the Preview

| Method | Action |
|---|---|
| Editor title bar | Click the preview icon when a drawable XML is open |
| Context menu | Right-click → "Show Vector Drawable Preview" |
| Command Palette | `Show Vector Drawable Preview` |
| Keyboard shortcut | `Ctrl+Shift+V` / `Cmd+Shift+V` |

### Zoom Controls

| Action | How |
|---|---|
| Zoom in | `+` or `=`, or click `+` button |
| Zoom out | `-` or `_`, or click `-` button |
| Fit to view | `0`, or click fit button |
| Zoom toward pointer | Ctrl/Cmd + scroll wheel |
| Pan | Hold left mouse button and drag |

## Requirements

- VS Code 1.80.0 or higher
- Android vector drawable XML files (typically in `res/drawable/`)

## Supported Format

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <group
      android:translateX="2"
      android:rotation="45">
    <path
        android:fillColor="#FF000000"
        android:pathData="M12,2L2,7v10c0,5.55,3.84,10.74,9,12c5.16,-1.26,9,-6.45,9,-12V7L12,2z"/>
  </group>
</vector>
```

## Known Limitations

- Color references (`@color/primary`) render as default grey
- Theme attributes (`?attr/colorPrimary`) use default colors
- Gradient fills not yet supported
- Animation not yet supported

## Release Notes

### 0.1.2 (2026-04-26)
- Fixed crosshair lines drifting with scroll and zoom
- Fixed crosshair SVG-space coordinate calculation
- Crosshair now shows sub-pixel coordinates at higher zoom levels
- Crosshair hides during drag and restores correctly on release

### 0.1.1 (2026-04-26)
- Added extension icon

### 0.1.0 (2026-04-26)
- `<group>` element support with full transform
- `android:alpha`, `android:fillType` support
- Drag to pan
- Zoom toward pointer at all zoom levels
- Fixed `#AARRGGBB` color conversion
- Fixed bounds box tracking at all zoom levels
- Fixed ruler tick updates on scroll
- Fixed hover provider false positives between `<path>` tags
- Fixed race condition on preview button click
- Fixed double-dispose on panel close
- Debounced preview re-render to 300ms

### 0.0.3 (2026-01-22)
- Fixed missing template files

### 0.0.2 (2025-09-30)
- Initial release

## License

MIT
