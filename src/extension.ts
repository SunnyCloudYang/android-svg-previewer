import * as vscode from "vscode";
import { AndroidVectorDrawablePreviewPanel } from "./previewPanel";
import { AndroidVectorDrawableHoverProvider } from "./hoverProvider";
import { isAndroidVectorDrawable } from "./utils";

/**
 * This method is called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("AndroidSVGSupport extension is now active!");

  const previewCommand = vscode.commands.registerCommand(
    "androidsvgsupport.showPreview",
    (uri?: vscode.Uri) => {
      // When invoked from editor/title the URI is passed as first arg.
      // Fall back to activeTextEditor for keybinding / command palette invocations.
      const editor = uri
        ? vscode.window.visibleTextEditors.find(
            (e) => e.document.uri.toString() === uri.toString()
          )
        : vscode.window.activeTextEditor;

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

  const hoverProvider = vscode.languages.registerHoverProvider(
    { language: "xml", pattern: "**/drawable/**/*.xml" },
    new AndroidVectorDrawableHoverProvider()
  );

  const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor && isAndroidVectorDrawable(editor.document)) {
        AndroidVectorDrawablePreviewPanel.updateIfVisible(editor.document);
      }
    }
  );

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (isAndroidVectorDrawable(event.document)) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          AndroidVectorDrawablePreviewPanel.updateIfVisible(event.document);
        }, 300);
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
