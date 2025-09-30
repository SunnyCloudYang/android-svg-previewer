import * as vscode from "vscode";
import { AndroidVectorDrawablePreviewPanel } from "./previewPanel";
import { AndroidVectorDrawableHoverProvider } from "./hoverProvider";
import { isAndroidVectorDrawable } from "./utils";

/**
 * This method is called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("AndroidSVGSupport extension is now active!");

  // Register the preview command
  const previewCommand = vscode.commands.registerCommand(
    "androidsvgsupport.showPreview",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }

      const document = editor.document;
      if (!isAndroidVectorDrawable(document)) {
        vscode.window.showWarningMessage(
          "This file is not an Android vector drawable"
        );
        return;
      }

      AndroidVectorDrawablePreviewPanel.createOrShow(
        context.extensionUri,
        document
      );
    }
  );

  // Register the hover provider for XML files
  const hoverProvider = vscode.languages.registerHoverProvider(
    { language: "xml", pattern: "**/drawable/**/*.xml" },
    new AndroidVectorDrawableHoverProvider()
  );

  // Watch for active editor changes to update preview
  const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor && isAndroidVectorDrawable(editor.document)) {
        AndroidVectorDrawablePreviewPanel.updateIfVisible(editor.document);
      }
    }
  );

  // Watch for document changes to update preview
  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (isAndroidVectorDrawable(event.document)) {
        AndroidVectorDrawablePreviewPanel.updateIfVisible(event.document);
      }
    }
  );

  context.subscriptions.push(
    previewCommand,
    hoverProvider,
    editorChangeListener,
    documentChangeListener
  );
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
  AndroidVectorDrawablePreviewPanel.dispose();
}
