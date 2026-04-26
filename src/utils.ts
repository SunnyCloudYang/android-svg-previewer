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
    const vectorMatch = xmlContent.match(/<vector([^>]*)>/);
    if (!vectorMatch) {
      return null;
    }

    const vectorAttrs = vectorMatch[1];

    const viewportWidth =
      extractAttribute(vectorAttrs, "android:viewportWidth") || "24";
    const viewportHeight =
      extractAttribute(vectorAttrs, "android:viewportHeight") || "24";

    const width =
      extractAttribute(vectorAttrs, "android:width")?.replace(/dp$/, "") ||
      viewportWidth;
    const height =
      extractAttribute(vectorAttrs, "android:height")?.replace(/dp$/, "") ||
      viewportHeight;

    const tint = extractAttribute(vectorAttrs, "android:tint");
    const alpha = extractAttribute(vectorAttrs, "android:alpha");

    const vectorOpenEnd = xmlContent.indexOf(">", xmlContent.indexOf("<vector"));
    const vectorCloseStart = xmlContent.lastIndexOf("</vector>");
    const innerXml = vectorCloseStart !== -1
      ? xmlContent.substring(vectorOpenEnd + 1, vectorCloseStart)
      : xmlContent.substring(vectorOpenEnd + 1);

    const paths = convertChildren(innerXml, tint);

    const opacityAttr = alpha ? ` opacity="${alpha}"` : "";
    const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${viewportWidth} ${viewportHeight}"${opacityAttr}>
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

function buildTransform(attrs: string): string {
  const translateX = parseFloat(extractAttribute(attrs, "android:translateX") || "0");
  const translateY = parseFloat(extractAttribute(attrs, "android:translateY") || "0");
  const rotation = parseFloat(extractAttribute(attrs, "android:rotation") || "0");
  const pivotX = parseFloat(extractAttribute(attrs, "android:pivotX") || "0");
  const pivotY = parseFloat(extractAttribute(attrs, "android:pivotY") || "0");
  const scaleX = parseFloat(extractAttribute(attrs, "android:scaleX") || "1");
  const scaleY = parseFloat(extractAttribute(attrs, "android:scaleY") || "1");

  const parts: string[] = [];
  if (translateX !== 0 || translateY !== 0) {
    parts.push(`translate(${translateX}, ${translateY})`);
  }
  if (rotation !== 0) {
    if (pivotX !== 0 || pivotY !== 0) {
      parts.push(`rotate(${rotation}, ${pivotX}, ${pivotY})`);
    } else {
      parts.push(`rotate(${rotation})`);
    }
  }
  if (scaleX !== 1 || scaleY !== 1) {
    parts.push(`scale(${scaleX}, ${scaleY})`);
  }
  return parts.join(" ");
}

function convertPathElement(pathAttrs: string, tint: string | null): string {
  const pathData = extractAttribute(pathAttrs, "android:pathData");
  if (!pathData) {
    return "";
  }

  const fillColor = extractAttribute(pathAttrs, "android:fillColor") || tint || "#000000";
  const strokeColor = extractAttribute(pathAttrs, "android:strokeColor");
  const strokeWidth = extractAttribute(pathAttrs, "android:strokeWidth");
  const fillAlpha = extractAttribute(pathAttrs, "android:fillAlpha");
  const strokeAlpha = extractAttribute(pathAttrs, "android:strokeAlpha");
  const fillType = extractAttribute(pathAttrs, "android:fillType");

  let el = `<path d="${pathData}"`;

  if (fillColor && fillColor !== "none") {
    el += ` fill="${convertColor(fillColor)}"`;
    if (fillAlpha) {
      el += ` fill-opacity="${fillAlpha}"`;
    }
  }

  if (fillType === "evenOdd") {
    el += ` fill-rule="evenodd"`;
  }

  if (strokeColor) {
    el += ` stroke="${convertColor(strokeColor)}"`;
    if (strokeWidth) {
      el += ` stroke-width="${strokeWidth}"`;
    }
    if (strokeAlpha) {
      el += ` stroke-opacity="${strokeAlpha}"`;
    }
  }

  el += " />\n";
  return el;
}

function convertChildren(xml: string, tint: string | null): string {
  let result = "";
  let i = 0;

  while (i < xml.length) {
    const tagStart = xml.indexOf("<", i);
    if (tagStart === -1) {
      break;
    }

    if (xml[tagStart + 1] === "/" || xml[tagStart + 1] === "?") {
      const tagEnd = xml.indexOf(">", tagStart);
      i = tagEnd === -1 ? xml.length : tagEnd + 1;
      continue;
    }

    let nameEnd = tagStart + 1;
    while (nameEnd < xml.length && !/[\s>\/]/.test(xml[nameEnd])) {
      nameEnd++;
    }
    const tagName = xml.substring(tagStart + 1, nameEnd);

    if (tagName === "path") {
      const tagEnd = xml.indexOf(">", tagStart);
      const rawTag = xml.substring(tagStart, tagEnd + 1);
      const attrsStr = rawTag.substring(tagName.length + 2, rawTag.endsWith("/>") ? rawTag.length - 2 : rawTag.length - 1);
      result += convertPathElement(attrsStr, tint);
      i = tagEnd + 1;
    } else if (tagName === "group") {
      const tagEnd = xml.indexOf(">", tagStart);
      const rawOpenTag = xml.substring(tagStart, tagEnd + 1);
      const isSelfClosing = rawOpenTag.endsWith("/>");

      const attrsStr = rawOpenTag.substring(tagName.length + 2, isSelfClosing ? rawOpenTag.length - 2 : rawOpenTag.length - 1);
      const transform = buildTransform(attrsStr);

      if (isSelfClosing) {
        i = tagEnd + 1;
        continue;
      }

      const closeTag = `</${tagName}>`;
      let depth = 1;
      let searchFrom = tagEnd + 1;
      let closePos = -1;

      while (depth > 0) {
        const nextOpen = xml.indexOf(`<${tagName}`, searchFrom);
        const nextClose = xml.indexOf(closeTag, searchFrom);

        if (nextClose === -1) {
          break;
        }

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          searchFrom = nextOpen + tagName.length + 1;
        } else {
          depth--;
          if (depth === 0) {
            closePos = nextClose;
          } else {
            searchFrom = nextClose + closeTag.length;
          }
        }
      }

      if (closePos === -1) {
        i = tagEnd + 1;
        continue;
      }

      const innerXml = xml.substring(tagEnd + 1, closePos);
      const innerSvg = convertChildren(innerXml, tint);

      if (transform) {
        result += `<g transform="${transform}">\n${innerSvg}</g>\n`;
      } else {
        result += `<g>\n${innerSvg}</g>\n`;
      }

      i = closePos + closeTag.length;
    } else {
      const tagEnd = xml.indexOf(">", tagStart);
      i = tagEnd === -1 ? xml.length : tagEnd + 1;
    }
  }

  return result;
}

/**
 * Convert Android color format to CSS color format
 */
function convertColor(color: string): string {
  if (!color) {
    return "#000000";
  }

  if (color.startsWith("@color/") || color.startsWith("?attr/") || color.startsWith("?")) {
    // Emit a recognizable placeholder; unresolved at preview time
    return "#757575";
  }

  // #AARRGGBB (Android) → rgba(r, g, b, a/255)
  if (/^#[0-9A-Fa-f]{8}$/.test(color)) {
    const a = parseInt(color.substring(1, 3), 16);
    const r = parseInt(color.substring(3, 5), 16);
    const g = parseInt(color.substring(5, 7), 16);
    const b = parseInt(color.substring(7, 9), 16);
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  }

  // #RRGGBB or #RGB — already valid CSS
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
