import { watch } from "fs";
import * as vscode from "vscode";
import { ModTree } from "./gomod";
import { exec } from "child_process";
import { getParentNode, resolvePath } from "./utils";

const openExplorer = require("open-file-explorer");
const fs = require("fs");

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.workspaceFolders?.forEach((e, index) => {
    updateTree(e);
    watch(e.uri.fsPath + "/go.mod", (action, file) => {
      updateTree(e);
    });
  });

  vscode.window.showInformationMessage("Go mod attach");

  vscode.commands.registerCommand("gomod.openResource", (resource) =>
    openResource(resource)
  );
  // context.subscriptions.push();

  vscode.commands.registerCommand("gomod.openByFileExplorer", (resource) =>
    openEx(resource)
  );
}

function openEx(res: any) {
  let p = resolvePath(res.resource)
  let stat = fs.lstatSync(p);

  if (stat.isFile()) {
    // trim right in order to get parent
    // node relative to the current file.
    p = getParentNode(p)
  }
  openExplorer(p, (err: any) => {
    if (err) {
      console.log(err);
    } 
  });
}

export function deactivate() {}

function updateTree(e: any) {
  exec(
    "cd " + e.uri.fsPath + " && go list -mod=readonly -m -json all",
    function (error, stdout, stderr) {
      if (error === null && stderr === "") {
        stdout = stdout.replace(new RegExp("}", "g"), "},");
        stdout = stdout.replace("{", "[{");
        stdout = stdout.trimRight();
        stdout = stdout.substr(0, stdout.length - 1) + "]";
        let dat = JSON.parse(stdout);
        vscode.window.createTreeView("gomod", {
          treeDataProvider: new ModTree(dat),
        });
      }
    }
  );
}

function openResource(resource: vscode.Uri): void {
  if (process.platform === "win32") {
    vscode.window.showTextDocument(vscode.Uri.file(resource.toString(true)));
  } else {
    vscode.window.showTextDocument(vscode.Uri.parse(resource.toString(true)));
  }
}
