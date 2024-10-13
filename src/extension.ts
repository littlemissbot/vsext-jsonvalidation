// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vsext-jsonvalidation" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "vsext-jsonvalidation.validateJson",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage(
      //   "Hello World from vsext-jsonvalidation!"
      // );
      const editor = vscode.window.activeTextEditor;

      if (
        editor &&
        (editor.document.languageId === "json" ||
          editor.document.languageId === "json5")
      ) {
        try {
          const jsonContent = editor.document.getText();
          const jsonObject = JSON.parse(jsonContent);

          // Validate Schema
          if (!validateSchema(jsonObject)) {
            return;
          }

          // Check Overlap
          const overlap = checkOverlap(jsonObject);
          if (overlap) {
            vscode.window.showErrorMessage(
              `Overlap found in region: ${overlap}`,
              "OK"
            );
          } else {
            vscode.window.showInformationMessage("No overlap found.", "OK");
          }
        } catch (error) {
          vscode.window.showErrorMessage(
            "Invalid JSON: " + (error as any).message
          );
        }
      } else {
        vscode.window.showInformationMessage(
          "This extension requires a valid JSON file to function correctly.",
          "OK"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function validateSchema(jsonObject: any): boolean {
  const requiredKeys = ["baseAddress", "protocol", "sizeBytes", "widthBits"];
  for (let port in jsonObject) {
    for (let key of requiredKeys) {
      if (!jsonObject[port].hasOwnProperty(key)) {
        return false;
      }
    }
  }
  return true;
}

export function checkOverlap(jsonObject: any): string | null {
  const ranges: { port: string; start: number; end: number }[] = [];

  for (let port in jsonObject) {
    const start = jsonObject[port].baseAddress;
    const end = start + jsonObject[port].sizeBytes;
    ranges.push({ port, start, end });
  }

  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (ranges[i].start < ranges[j].end && ranges[j].start < ranges[i].end) {
        return `${ranges[i].port} (${ranges[i].start}-${ranges[i].end}) overlaps with ${ranges[j].port} (${ranges[j].start}-${ranges[j].end})`;
      }
    }
  }
  return null;
}

// This method is called when your extension is deactivated
export function deactivate() {}
