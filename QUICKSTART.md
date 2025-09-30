# Quick Start Guide

Welcome to Android SVG Support extension! This guide will help you get started quickly.

## Installation & Setup

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "Android SVG Support"
4. Click Install
5. Reload VS Code if prompted

## Testing the Extension

The extension comes with sample files in the `sample/drawable/` directory. You can use these to test all features:

### Step 1: Open a Sample File

1. Open any of the sample files:
   - `sample/drawable/ic_favorite.xml` - Heart icon with tint
   - `sample/drawable/ic_home.xml` - Home icon
   - `sample/drawable/ic_star.xml` - Star with multiple paths
   - `sample/drawable/ic_check_circle.xml` - Check mark icon

### Step 2: Open the Preview Panel

Use any of these methods:

- Click the preview icon (📄) in the editor title bar
- Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)
- Right-click and select "Show Vector Drawable Preview"
- Open Command Palette and type "Show Vector Drawable Preview"

### Step 3: Try the Features

#### Zoom Controls

- **Zoom In**: Click `+` button or press `+` key
- **Zoom Out**: Click `-` button or press `-` key
- **Fit to View**: Click "Fit to View" button or press `0` key
- **Mouse Zoom**: Hold `Ctrl`/`Cmd` and scroll mouse wheel

#### Hover Tooltips

- Hover over the `<vector>` tag to see the complete preview
- Hover over any `<path>` tag to see that specific path
- Tooltips show colors and dimensions

#### Live Editing

- Try changing the `android:fillColor` value
- Watch the preview update in real-time!

## Using in Your Android Project

1. Open your Android project in VS Code
2. Navigate to `res/drawable/` directory
3. Open any XML file with a `<vector>` element
4. Use the preview features described above

## Keyboard Shortcuts Reference

| Action       | Windows/Linux  | Mac           |
| ------------ | -------------- | ------------- |
| Open Preview | `Ctrl+Shift+V` | `Cmd+Shift+V` |
| Zoom In      | `+` or `=`     | `+` or `=`    |
| Zoom Out     | `-` or `_`     | `-` or `_`    |
| Fit to View  | `0`            | `0`           |
| Mouse Zoom   | `Ctrl` + Wheel | `Cmd` + Wheel |

## Tips & Tricks

### Best Practices

1. **Keep preview open while editing** - The preview updates automatically
2. **Use hover tooltips** - Quick way to inspect individual paths
3. **Use zoom controls** - Better visibility for complex drawables

### Common Issues

- **Preview not showing?** - Make sure the file contains a `<vector>` tag
- **Colors look wrong?** - Color references (`@color/...`) use default colors
- **Preview not updating?** - Save the file to trigger an update

## Sample Vector Drawables

The extension includes these sample files for testing:

### `ic_favorite.xml` - Heart Icon

- Demonstrates: Basic path, tint attribute
- Color: Red (#FF0000)

### `ic_home.xml` - Home Icon

- Demonstrates: Basic path with custom color
- Color: Blue (#2196F3)

### `ic_star.xml` - Star Icon

- Demonstrates: Multiple paths, fill alpha
- Colors: Amber (#FFC107) with overlay

### `ic_check_circle.xml` - Check Mark

- Demonstrates: Complex path
- Color: Green (#4CAF50)

## Next Steps

- Read the full [README](./README.md) for detailed documentation
- Check [CHANGELOG](./CHANGELOG.md) for version history
- Try creating your own vector drawables!

## Need Help?

- Check the README for detailed feature descriptions
- Visit the GitHub repository for issues and discussions
- Submit feature requests or bug reports

Happy coding! 🎨
