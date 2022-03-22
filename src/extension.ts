import { watch } from "fs";
import * as vscode from "vscode";
import { ModNode, ModTree } from "./gomod";
import { exec } from "child_process";
import { getParentNode, resolvePath } from "./utils";
import ExpanderProvider from "./expander";

const openExplorer = require("open-file-explorer");
const fs = require("fs");
let hideDetail = true;

export function activate(context: vscode.ExtensionContext) {
  let bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  bar.text = "$(loading~spin) Loading Go module explorer";
  bar.show();
  vscode.workspace.workspaceFolders?.forEach((e, index) => {
    updateTree(e, hideDetail);
    setTimeout(() => {
      bar.hide();
    }, 3000);
    watch(e.uri.fsPath + "/go.mod", (action, file) => {
      bar.show();
      updateTree(e, hideDetail);
      setTimeout(() => {
        bar.hide();
      }, 3000);
    });
  });
  // vscode.window.showInformationMessage("Go mod attach");

  vscode.commands.registerCommand("gomod.expandPackageDetail", (resource) => {
    hideDetail = !hideDetail;
    vscode.workspace.workspaceFolders?.forEach((e, index) => {
      bar.show();
      updateTree(e, hideDetail);
      setTimeout(() => {
        bar.hide();
      }, 3000);
    });
  });

  vscode.commands.registerCommand("gomod.openResource", (resource) =>
    openResource(resource)
  );
  // context.subscriptions.push();

  vscode.commands.registerCommand("gomod.findInFiles", (resource) => {
    // findInFiles(resource);

    vscode.commands.executeCommand(
      "search.action.openNewEditor",
      "C:\\Users\\inven\\Desktop\\common\\fs.go"
    );
  });

  vscode.commands.registerCommand("gomod.openByFileExplorer", (resource) =>
    openEx(resource)
  );

  // focus to gomod explorer
  vscode.commands.registerCommand("gomod.focus", () => {
    focusGomod();
  });

  // blur and back to the previous(editor area) focus position.
  vscode.commands.registerCommand("gomod.blur", () => {
    vscode.commands.executeCommand("workbench.view.explorer");
  });

  // golang languages selector
  let goSelector: vscode.DocumentSelector = { scheme: "file", language: "go" };
  // provide function
  const goProvide = new ExpanderProvider();
  vscode.languages.registerDefinitionProvider(goSelector, goProvide);
}

function openEx(res: any) {
  let p = resolvePath(res.resource);
  let stat = fs.lstatSync(p);

  if (stat.isFile()) {
    // trim right in order to get parent
    // node relative to the current file.
    p = getParentNode(p);
  }
  openExplorer(p, (err: any) => {
    if (err) {
      console.log(err);
    }
  });
}

export function deactivate() {}

let d: vscode.TreeView<ModNode>;
let mt: ModTree;
function updateTree(e: any, hide: boolean) {
  exec(
    "cd " + e.uri.fsPath + " && go list -mod=readonly -m -json all",
    function (error, stdout, stderr) {
      if (error === null && stderr === "") {
        stdout = stdout.replace(new RegExp("}(,+)?", "g"), "},");
        stdout = stdout.replace("{", "[{");
        stdout = stdout.trimRight();
        stdout = stdout.substr(0, stdout.length - 1) + "]";
        let dat = JSON.parse(stdout);
        mt = new ModTree(dat, hide);
        d = vscode.window.createTreeView("gomod", {
          treeDataProvider: mt,
        });
      }
    }
  );
}

function focusGomod() {
  if (mt.getRootLen() > 0) {
    d.reveal(mt.getRootFirst(), {
      select: true,
      focus: true,
      expand: false,
    });
  }
}

function openResource(resource: vscode.Uri): void {
  if (process.platform === "win32") {
    vscode.window.showTextDocument(vscode.Uri.file(resource.toString(true)));
  } else {
    vscode.window.showTextDocument(vscode.Uri.parse(resource.toString(true)));
  }
}

// ref: https://github.com/microsoft/vscode/blob/4a130c40ed876644ed8af2943809d08221375408/src/vs/workbench/contrib/searchEditor/browser/searchEditorInput.ts#L36
// export type SearchConfiguration = {
//   query: string;
//   filesToInclude: string;
//   filesToExclude: string;
//   contextLines: number;
//   matchWholeWord: boolean;
//   isCaseSensitive: boolean;
//   isRegexp: boolean;
//   useExcludeSettingsAndIgnoreFiles: boolean;
//   showIncludesExcludes: boolean;
//   onlyOpenEditors: boolean;
// };
function findInFiles(res: any): void {
  let p = resolvePath(res.resource);
  vscode.commands.executeCommand("workbench.action.findInFiles", {
    query: "",
    isRegex: true,
    triggerSearch: true,
    focusResults: true,
    filesToExclude: "",
    filesToInclude: p,
  });
}
