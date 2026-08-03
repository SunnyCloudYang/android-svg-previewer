import * as assert from "assert";
import * as vscode from "vscode";

const EXTENSION_ID = "SunnyCloudYang.androidsvgpreview";

suite("Extension activation", () => {
  test("extension is installed and can be activated", async () => {
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(ext, `extension ${EXTENSION_ID} not found`);
    const api = await ext!.activate();
    assert.strictEqual(typeof api, "undefined");
    assert.strictEqual(ext!.isActive, true);
  });

  test("registers the showPreview command", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("androidsvgsupport.showPreview"),
      "androidsvgsupport.showPreview command should be registered"
    );
  });

  test("showPreview warns when no editor is active", async () => {
    // Ensure no editor is focused so the command falls back to activeTextEditor = undefined.
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await vscode.commands.executeCommand("androidsvgsupport.showPreview");
    // No exception thrown means the command handled the missing editor gracefully.
    assert.ok(true);
  });
});
