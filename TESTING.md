# Testing Guide

This guide will help you test the Android SVG Support extension to ensure all features are working correctly.

## Prerequisites

Before testing, ensure you have:

- ✅ Compiled the extension (`yarn run compile`)
- ✅ No linting errors (`yarn run lint`)
- ✅ VS Code version 1.10.0 or higher

## Running the Extension

### Method 1: Debug Mode (Recommended for Development)

1. Open the project in VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with the extension loaded
4. Open one of the sample files in `sample/drawable/`

### Method 2: Install Locally

1. Package the extension: `vsce package` (requires vsce: `npm install -g @vscode/vsce`)
2. Install the `.vsix` file in VS Code
3. Reload VS Code
4. Test with sample files

## Test Cases

### Test 1: Basic Preview Panel

**Steps:**

1. Open `sample/drawable/ic_favorite.xml`
2. Click the preview icon in the editor title bar
3. Verify preview panel opens to the right

**Expected Results:**

- ✅ Preview panel opens in split view
- ✅ Heart icon is visible
- ✅ Icon has red tint
- ✅ Toolbar shows scale and bounds
- ✅ Checkerboard background is visible

### Test 2: Zoom In/Out

**Steps:**

1. With preview panel open, click "Zoom In" button
2. Click "Zoom Out" button
3. Click "Fit to View" button

**Expected Results:**

- ✅ Image grows when zooming in
- ✅ Image shrinks when zooming out
- ✅ Scale percentage updates correctly
- ✅ Fit to View centers and scales the image
- ✅ Bounds overlay scales with image

### Test 3: Keyboard Zoom Controls

**Steps:**

1. Click in the preview panel
2. Press `+` key several times
3. Press `-` key several times
4. Press `0` key

**Expected Results:**

- ✅ `+` zooms in
- ✅ `-` zooms out
- ✅ `0` resets to fit view
- ✅ Zoom level indicator updates

### Test 4: Mouse Wheel Zoom

**Steps:**

1. Click in the preview panel
2. Hold `Ctrl` (or `Cmd` on Mac)
3. Scroll mouse wheel up and down

**Expected Results:**

- ✅ Scroll up zooms in
- ✅ Scroll down zooms out
- ✅ Zoom is smooth and responsive
- ✅ Scale indicator updates

### Test 5: Hover on Vector Tag

**Steps:**

1. Open `sample/drawable/ic_home.xml`
2. Hover mouse over the `<vector` tag (line 1)
3. Wait for tooltip to appear

**Expected Results:**

- ✅ Tooltip shows "Vector Drawable Preview"
- ✅ Complete drawable is visible in tooltip
- ✅ Size and viewport dimensions are shown
- ✅ Image is clear and visible

### Test 6: Hover on Path Tag

**Steps:**

1. With `ic_home.xml` open
2. Hover over the `<path` tag
3. Wait for tooltip

**Expected Results:**

- ✅ Tooltip shows "Path Preview"
- ✅ Individual path is visible
- ✅ Fill color is displayed (#2196F3)
- ✅ Path is rendered correctly

### Test 7: Multiple Paths

**Steps:**

1. Open `sample/drawable/ic_star.xml`
2. View in preview panel
3. Hover over first `<path>` tag
4. Hover over second `<path>` tag

**Expected Results:**

- ✅ Preview shows both paths combined
- ✅ Colors are correct (amber base, orange overlay)
- ✅ First path hover shows outer star
- ✅ Second path hover shows inner star with alpha
- ✅ Alpha transparency is visible

### Test 8: Live Updates

**Steps:**

1. Open `sample/drawable/ic_favorite.xml` with preview open
2. Change `android:tint="#FF0000"` to `android:tint="#00FF00"`
3. Save the file

**Expected Results:**

- ✅ Preview updates immediately
- ✅ Heart icon turns green
- ✅ No need to refresh
- ✅ No errors in console

### Test 9: Different File Sizes

**Steps:**

1. Open `sample/drawable/ic_home.xml` (24dp)
2. Open preview
3. Open `sample/drawable/ic_star.xml` (48dp)
4. View preview

**Expected Results:**

- ✅ Both files preview correctly
- ✅ Bounds show correct dimensions (24×24, 48×48)
- ✅ Both fit to view appropriately
- ✅ Scale percentages differ based on size

### Test 10: Command Palette

**Steps:**

1. Open any drawable XML file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
3. Type "Show Vector Drawable Preview"
4. Select the command

**Expected Results:**

- ✅ Command appears in palette
- ✅ Command is under "Android SVG" category
- ✅ Preview opens when selected

### Test 11: Context Menu

**Steps:**

1. Open any drawable XML file
2. Right-click in the editor
3. Look for "Show Vector Drawable Preview"
4. Click it

**Expected Results:**

- ✅ Option appears in context menu
- ✅ Preview opens when clicked
- ✅ Works same as other methods

### Test 12: Keyboard Shortcut

**Steps:**

1. Open any drawable XML file
2. Press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac)

**Expected Results:**

- ✅ Preview opens immediately
- ✅ Shortcut is quick and responsive

### Test 13: Invalid File Handling

**Steps:**

1. Create a new XML file without `<vector>` tag
2. Try to open preview

**Expected Results:**

- ✅ Warning message appears
- ✅ Message says "This file is not an Android vector drawable"
- ✅ No errors or crashes

### Test 14: Non-Drawable XML

**Steps:**

1. Open a non-drawable XML file (e.g., layout file)
2. Try to open preview

**Expected Results:**

- ✅ Warning message appears
- ✅ Extension doesn't crash
- ✅ Helpful error message

### Test 15: Theme Switching

**Steps:**

1. Open preview with any drawable
2. Switch VS Code theme (light ↔ dark)
3. Observe preview panel

**Expected Results:**

- ✅ Preview panel updates with new theme
- ✅ Toolbar colors match theme
- ✅ Background checkerboard adjusts
- ✅ Text remains readable

### Test 16: Panel Persistence

**Steps:**

1. Open preview panel
2. Switch to a different file
3. Close the different file
4. Switch back to drawable

**Expected Results:**

- ✅ Preview panel remains visible
- ✅ Preview updates to show current file
- ✅ Zoom level resets appropriately
- ✅ No performance issues

### Test 17: Bounds Display

**Steps:**

1. Open any drawable in preview
2. Observe the bounds overlay

**Expected Results:**

- ✅ Dashed border surrounds the drawable
- ✅ Dimensions label shows correct size
- ✅ Label is readable
- ✅ Bounds scale with zoom

### Test 18: Scale Information

**Steps:**

1. Open preview
2. Change zoom levels
3. Observe toolbar

**Expected Results:**

- ✅ "Scale: X%" shows in toolbar
- ✅ Percentage updates in real-time
- ✅ Floating widget also shows percentage
- ✅ Both match exactly

### Test 19: Complex Path

**Steps:**

1. Open `sample/drawable/ic_check_circle.xml`
2. View in preview
3. Test all zoom features

**Expected Results:**

- ✅ Complex path renders correctly
- ✅ Circle and checkmark both visible
- ✅ Green color applied
- ✅ Smooth at all zoom levels

### Test 20: Rapid File Switching

**Steps:**

1. Open multiple drawable files
2. Quickly switch between them
3. Keep preview panel open

**Expected Results:**

- ✅ Preview updates for each file
- ✅ No lag or freezing
- ✅ Correct drawable shown for each file
- ✅ No memory leaks

## Automated Testing (Future)

Consider adding these automated tests:

- Unit tests for XML parsing
- Unit tests for color conversion
- Integration tests for preview panel
- Snapshot tests for rendered output

## Performance Testing

### Memory Usage

1. Open Task Manager/Activity Monitor
2. Open multiple drawables
3. Switch between them repeatedly
4. Check memory usage

**Expected:**

- ✅ Memory usage stays stable
- ✅ No continuous growth
- ✅ Reasonable memory footprint

### Responsiveness

1. Open a very large drawable
2. Test zoom operations
3. Edit the file while preview is open

**Expected:**

- ✅ UI remains responsive
- ✅ Zoom is smooth
- ✅ Updates are quick
- ✅ No blocking operations

## Bug Reporting

If you find issues during testing:

1. Note the exact steps to reproduce
2. Record the expected vs actual behavior
3. Check console for errors (Help → Toggle Developer Tools)
4. Note your VS Code version and OS
5. Create an issue with all details

## Success Criteria

All features should:

- ✅ Work as described in README
- ✅ Handle errors gracefully
- ✅ Perform responsively
- ✅ Follow VS Code UI guidelines
- ✅ Work on Windows, Mac, and Linux

## Next Steps After Testing

1. ✅ All tests pass → Ready for publication
2. ⚠️ Some tests fail → Fix issues and retest
3. 📝 Note any edge cases discovered
4. 💡 Consider additional features based on testing

## Cleanup After Testing

In debug mode:

- Close the Extension Development Host window
- Stop the debugger in VS Code

After local installation:

- Extension remains installed
- Can be disabled in Extensions panel
- Can be uninstalled if needed
