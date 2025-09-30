import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { convertVectorDrawableToSVG, getNonce } from "./utils";

/**
 * Manages the webview panel for Android vector drawable preview
 */
export class AndroidVectorDrawablePreviewPanel {
  public static currentPanel: AndroidVectorDrawablePreviewPanel | undefined;
  private static readonly viewType = "androidVectorDrawablePreview";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _document: vscode.TextDocument | undefined;
  private _templateCache: Map<string, string> = new Map();

  public static createOrShow(
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ) {
    const column = vscode.ViewColumn.Beside;

    // If we already have a panel, show it
    if (AndroidVectorDrawablePreviewPanel.currentPanel) {
      AndroidVectorDrawablePreviewPanel.currentPanel._panel.reveal(column);
      AndroidVectorDrawablePreviewPanel.currentPanel.update(document);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      AndroidVectorDrawablePreviewPanel.viewType,
      "Vector Drawable Preview",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    AndroidVectorDrawablePreviewPanel.currentPanel =
      new AndroidVectorDrawablePreviewPanel(panel, extensionUri, document);
  }

  public static updateIfVisible(document: vscode.TextDocument) {
    if (AndroidVectorDrawablePreviewPanel.currentPanel) {
      AndroidVectorDrawablePreviewPanel.currentPanel.update(document);
    }
  }

  public static dispose() {
    AndroidVectorDrawablePreviewPanel.currentPanel?.dispose();
    AndroidVectorDrawablePreviewPanel.currentPanel = undefined;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._document = document;

    // Set the webview's initial html content
    this.update(document);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "error":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public update(document: vscode.TextDocument) {
    this._document = document;
    this._panel.title = `Preview: ${document.fileName.split("/").pop()}`;
    this._panel.webview.html = this._getHtmlForWebview(document);
  }

  public dispose() {
    AndroidVectorDrawablePreviewPanel.currentPanel = undefined;

    // Clean up resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Load a template file from the templates directory
   */
  private loadTemplate(templateName: string): string {
    if (this._templateCache.has(templateName)) {
      return this._templateCache.get(templateName)!;
    }

    const templatePath = path.join(
      this._extensionUri.fsPath,
      "src",
      "templates",
      templateName
    );
    const content = fs.readFileSync(templatePath, "utf8");
    this._templateCache.set(templateName, content);
    return content;
  }

  /**
   * Render a template with variables
   */
  private renderTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;

    // Replace all {{variableName}} with actual values
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      result = result.replace(regex, String(value ?? ""));
    }

    return result;
  }

  private _getHtmlForWebview(document: vscode.TextDocument): string {
    const nonce = getNonce();

    const xmlContent = document.getText();
    const svgContent = convertVectorDrawableToSVG(xmlContent);

    if (!svgContent) {
      return this._getErrorHtml(
        nonce,
        "Unable to parse vector drawable. Please ensure it's a valid Android vector drawable XML."
      );
    }

    // Extract dimensions from SVG for JavaScript
    const widthMatch = svgContent.match(/width="([^"]+)"/);
    const heightMatch = svgContent.match(/height="([^"]+)"/);
    const svgWidth = widthMatch ? widthMatch[1] : "24";
    const svgHeight = heightMatch ? heightMatch[1] : "24";

    // Encode SVG for data URI
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(
      svgContent
    ).toString("base64")}`;

    // Load templates
    const htmlTemplate = this.loadTemplate("preview.html");
    const cssTemplate = this.loadTemplate("styles/preview.css");
    const jsTemplate = this.loadTemplate("scripts/preview.js");

    // Render script with SVG dimensions
    const script = this.renderTemplate(jsTemplate, {
      svgWidth,
      svgHeight,
    });

    // Render final HTML
    return this.renderTemplate(htmlTemplate, {
      nonce,
      cspSource: this._panel.webview.cspSource,
      styles: cssTemplate,
      svgDataUri,
      script,
    });
  }

  private _getErrorHtml(nonce: string, errorMessage: string): string {
    const htmlTemplate = this.loadTemplate("error.html");
    const cssTemplate = this.loadTemplate("styles/error.css");

    return this.renderTemplate(htmlTemplate, {
      nonce,
      styles: cssTemplate,
      errorMessage,
    });
  }
}
