import * as vscode from "vscode";

/**
 * Check if a document is an Android vector drawable XML file
 */
export function isAndroidVectorDrawable(
  document: vscode.TextDocument
): boolean {
  if (document.languageId !== "xml") {
    return false;
  }

  const text = document.getText();
  // Check if it contains vector tag (Android vector drawable)
  return /\<vector[\s\>]/.test(text);
}

/**
 * Convert Android vector drawable XML to standard SVG
 */
export function convertVectorDrawableToSVG(xmlContent: string): string | null {
  try {
    // Parse the vector drawable attributes
    const vectorMatch = xmlContent.match(/<vector([^>]*)>/);
    if (!vectorMatch) {
      return null;
    }

    const vectorAttrs = vectorMatch[1];

    // Extract viewportWidth and viewportHeight
    const viewportWidth =
      extractAttribute(vectorAttrs, "android:viewportWidth") || "24";
    const viewportHeight =
      extractAttribute(vectorAttrs, "android:viewportHeight") || "24";

    // Extract width and height (default to viewport if not specified)
    const width =
      extractAttribute(vectorAttrs, "android:width")?.replace(/dp$/, "") ||
      viewportWidth;
    const height =
      extractAttribute(vectorAttrs, "android:height")?.replace(/dp$/, "") ||
      viewportHeight;

    // Extract tint if present
    const tint = extractAttribute(vectorAttrs, "android:tint");

    // Convert paths
    const pathRegex = /<path([^>]*)\/?>(?:<\/path>)?/g;
    let paths = "";
    let match;

    while ((match = pathRegex.exec(xmlContent)) !== null) {
      const pathAttrs = match[1];
      const pathData = extractAttribute(pathAttrs, "android:pathData");
      const fillColor =
        extractAttribute(pathAttrs, "android:fillColor") || tint || "#000000";
      const strokeColor = extractAttribute(pathAttrs, "android:strokeColor");
      const strokeWidth = extractAttribute(pathAttrs, "android:strokeWidth");
      const fillAlpha = extractAttribute(pathAttrs, "android:fillAlpha");
      const strokeAlpha = extractAttribute(pathAttrs, "android:strokeAlpha");

      if (pathData) {
        let pathElement = `<path d="${pathData}"`;

        if (fillColor && fillColor !== "none") {
          const color = convertColor(fillColor);
          pathElement += ` fill="${color}"`;
          if (fillAlpha) {
            pathElement += ` fill-opacity="${fillAlpha}"`;
          }
        }

        if (strokeColor) {
          pathElement += ` stroke="${convertColor(strokeColor)}"`;
          if (strokeWidth) {
            pathElement += ` stroke-width="${strokeWidth}"`;
          }
          if (strokeAlpha) {
            pathElement += ` stroke-opacity="${strokeAlpha}"`;
          }
        }

        pathElement += " />\n";
        paths += pathElement;
      }
    }

    // Build SVG
    const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${width}" 
     height="${height}" 
     viewBox="0 0 ${viewportWidth} ${viewportHeight}">
${paths}</svg>`;

    return svg;
  } catch (error) {
    console.error("Error converting vector drawable to SVG:", error);
    return null;
  }
}

/**
 * Extract attribute value from XML attributes string
 */
function extractAttribute(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}="([^"]*)"`, "i");
  const match = attrs.match(regex);
  return match ? match[1] : null;
}

/**
 * Convert Android color format to CSS color format
 */
function convertColor(color: string): string {
  if (!color) {
    return "#000000";
  }

  // Handle @color/ references (use a default color)
  if (color.startsWith("@color/") || color.startsWith("?")) {
    return "#757575"; // Material grey
  }

  // Handle #AARRGGBB format (Android) -> #RRGGBBAA (CSS)
  if (color.match(/^#[0-9A-Fa-f]{8}$/)) {
    const alpha = color.substring(1, 3);
    const rgb = color.substring(3);
    return `#${rgb}${alpha}`;
  }

  // Already in standard format
  return color;
}

/**
 * Get the nonce for CSP in webview
 */
export function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
