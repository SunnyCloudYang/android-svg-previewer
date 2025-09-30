import * as vscode from "vscode";
import { convertVectorDrawableToSVG } from "./utils";

/**
 * Provides hover previews for Android vector drawable elements
 */
export class AndroidVectorDrawableHoverProvider
  implements vscode.HoverProvider
{
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position.line);
    const lineText = line.text;

    // Check if hovering over a vector tag
    if (lineText.includes("<vector")) {
      return this.createVectorHover(document);
    }

    // Check if hovering over a path tag
    if (lineText.includes("<path")) {
      return this.createPathHover(document, position);
    }

    return null;
  }

  private createVectorHover(
    document: vscode.TextDocument
  ): vscode.Hover | null {
    const xmlContent = document.getText();
    const svgContent = convertVectorDrawableToSVG(xmlContent);

    if (!svgContent) {
      return null;
    }

    // Create a data URI for the SVG
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(
      svgContent
    ).toString("base64")}`;

    // Create markdown with the image
    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;
    markdown.isTrusted = true;

    // Add the preview image
    markdown.appendMarkdown(`**Vector Drawable Preview**\n\n`);
    markdown.appendMarkdown(`![Preview](${svgDataUri})\n\n`);

    // Extract and show dimensions
    const widthMatch = xmlContent.match(/android:width="([^"]*)"/);
    const heightMatch = xmlContent.match(/android:height="([^"]*)"/);
    const viewportWidthMatch = xmlContent.match(
      /android:viewportWidth="([^"]*)"/
    );
    const viewportHeightMatch = xmlContent.match(
      /android:viewportHeight="([^"]*)"/
    );

    if (widthMatch && heightMatch) {
      markdown.appendMarkdown(
        `**Size:** ${widthMatch[1]} × ${heightMatch[1]}\n\n`
      );
    }
    if (viewportWidthMatch && viewportHeightMatch) {
      markdown.appendMarkdown(
        `**Viewport:** ${viewportWidthMatch[1]} × ${viewportHeightMatch[1]}\n\n`
      );
    }

    return new vscode.Hover(markdown);
  }

  private createPathHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Hover | null {
    // Find the complete path element
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Find the start of the path tag
    let pathStart = text.lastIndexOf("<path", offset);
    if (pathStart === -1) {
      return null;
    }

    // Find the end of the path tag
    let pathEnd = text.indexOf("/>", pathStart);
    if (pathEnd === -1) {
      pathEnd = text.indexOf("</path>", pathStart);
      if (pathEnd !== -1) {
        pathEnd += 7; // length of '</path>'
      }
    } else {
      pathEnd += 2; // length of '/>'
    }

    if (pathEnd === -1) {
      return null;
    }

    const pathElement = text.substring(pathStart, pathEnd);

    // Extract path data
    const pathDataMatch = pathElement.match(/android:pathData="([^"]*)"/);
    const fillColorMatch = pathElement.match(/android:fillColor="([^"]*)"/);
    const strokeColorMatch = pathElement.match(/android:strokeColor="([^"]*)"/);

    if (!pathDataMatch) {
      return null;
    }

    // Create a minimal SVG for this path
    const fillColor = fillColorMatch ? fillColorMatch[1] : "#000000";
    const strokeColor = strokeColorMatch ? strokeColorMatch[1] : "none";

    // Get viewport dimensions from the parent vector
    const viewportWidthMatch = text.match(/android:viewportWidth="([^"]*)"/);
    const viewportHeightMatch = text.match(/android:viewportHeight="([^"]*)"/);
    const viewportWidth = viewportWidthMatch ? viewportWidthMatch[1] : "24";
    const viewportHeight = viewportHeightMatch ? viewportHeightMatch[1] : "24";

    const pathSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 ${viewportWidth} ${viewportHeight}">
	<path d="${pathDataMatch[1]}" fill="${fillColor}" stroke="${strokeColor}" />
</svg>`;

    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(
      pathSvg
    ).toString("base64")}`;

    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;
    markdown.isTrusted = true;

    markdown.appendMarkdown(`**Path Preview**\n\n`);
    markdown.appendMarkdown(`![Path Preview](${svgDataUri})\n\n`);

    if (fillColorMatch) {
      markdown.appendMarkdown(`**Fill:** \`${fillColorMatch[1]}\`\n\n`);
    }
    if (strokeColorMatch) {
      markdown.appendMarkdown(`**Stroke:** \`${strokeColorMatch[1]}\`\n\n`);
    }

    return new vscode.Hover(markdown);
  }
}
