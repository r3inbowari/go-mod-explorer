import * as vscode from "vscode";
import { ModFile } from "./file";
import { readdirSync, statSync } from "fs";
import { userInfo } from "os";

export interface ModNode {
  isDirectory: boolean;
  resource: vscode.Uri;
  name: string;
}

const pat =
  userInfo().homedir.replace(new RegExp("\\\\", "g"), "/") + "/go/pkg/mod/";

export class ModTree
  implements
    vscode.TreeDataProvider<ModNode>,
    vscode.TextDocumentContentProvider
{
  data: ModFile;
  active: boolean = false;

  constructor(dat: any) {
    if (!this.active) {
      this.active = true;
    }
    this.data = dat;
  }

  onDidChangeTreeData?:
    | vscode.Event<void | ModNode | null | undefined>
    | undefined;

  getTreeItem(element: ModNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return {
      label: element.name,
      resourceUri: element.resource,
      collapsibleState: element.isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : void 0,
      command: element.isDirectory
        ? void 0
        : {
            command: "gomod.openResource",
            arguments: [element.resource],
            title: "Open Resource",
          },
    };
  }

  getChildren(element?: ModNode): vscode.ProviderResult<ModNode[]> {
    let ret: ModNode[] = [];
    if (element === undefined) {
      // root
      this.data.require.forEach((res) => {
        ret?.push({
          resource: vscode.Uri.parse(
            pat + res.mod.path + "@" + res.mod.version
          ),
          isDirectory: true,
          name: res.mod.path + "@" + res.mod.version,
        });
      });
    } else {
      const result = readdirSync(element.resource.path);
      result.forEach((res) => {
        ret.push({
          name: res,
          resource: vscode.Uri.parse(element.resource.path + "/" + res),
          isDirectory: !statSync(element.resource.path + "/" + res).isFile(),
        });
      });
    }
    return ret;
  }

  onDidChange?: vscode.Event<vscode.Uri> | undefined;

  provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    throw new Error("Method not implemented.3");
  }
}
