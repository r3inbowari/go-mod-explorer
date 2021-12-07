import { watch } from "fs";
import { userInfo } from "os";
import * as vscode from "vscode";
import { parseMod } from "./file";
import { ModTree } from "./goMod";

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.workspaceFolders?.forEach((e, index) => {
    updateTree(e);
    watch(e.uri.fsPath + "/go.mod", (action, file) => {
      updateTree(e);
    });
  });

  vscode.window.showInformationMessage("Go mod attach");

  let disposable1 = vscode.commands.registerCommand(
    "gomod.refreshEntry",
    () => {
      vscode.window.showInformationMessage("Hello");
    }
  );

  vscode.commands.registerCommand("gomod.openResource", (resource) =>
    openResource(resource)
  );
  context.subscriptions.push(disposable1);
}

export function deactivate() {}

function updateTree(e: any) {
  let dat = parseMod(e.uri.fsPath + "/go.mod");
  console.log(dat);
  vscode.window.createTreeView("gomod", {
    treeDataProvider: new ModTree(dat),
  });
}

function openResource(resource: vscode.Uri): void {
  vscode.window.showTextDocument(resource);
}
