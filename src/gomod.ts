import * as vscode from "vscode";
import { ModFile } from "./file";
import { readdir, readdirSync, statSync } from "fs";
import { resolvePath } from "./utils";

export interface ModNode {
  isDirectory: boolean;
  resource: vscode.Uri;
  name: string;
}

export class ModTree
  implements
    vscode.TreeDataProvider<ModNode>,
    vscode.TextDocumentContentProvider
{
  data: [];

  rootLength = 0;
  rootFirst: ModNode = {
    isDirectory: false,
    resource: vscode.Uri.parse("./"),
    name: "root: not found anything",
  };

  // Number of root dirs
  getRootLen(): Number {
    return this.rootLength;
  }

  getParent(element: ModNode): ModNode | null {
    if (element.name !== "root: not found anything") {
      return element;
    }
    return null;
  }

  getRootFirst(): ModNode {
    return this.rootFirst;
  }

  constructor(dat: any) {
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
      this.data.forEach((res: ModFile, index: number) => {
        if (index !== 0 && res.Dir !== undefined) {
          ret?.push({
            resource: vscode.Uri.parse(res.Dir),
            isDirectory: res.Dir !== undefined,
            name: res.Path + " " + res.Version,
          });
          // set root len
          this.rootLength = index;
        }
      });

      if (ret.length > 0) {
        this.rootFirst = ret[0];
      }
    } else {
      const result = readdirSync(resolvePath(element.resource));
      result.forEach((res) => {
        ret.push({
          name: res,
          resource:
            process.platform === "win32"
              ? vscode.Uri.parse(element.resource.toString(true) + "\\" + res)
              : vscode.Uri.parse(element.resource.toString(true) + "/" + res),
          isDirectory: !statSync(element.resource.path + "/" + res).isFile(),
        });
      });
    }
    return ret.sort(
      ({ isDirectory: s1 = false }, { isDirectory: s2 = false }) =>
        Number(s2) - Number(s1)
    );
  }

  onDidChange?: vscode.Event<vscode.Uri> | undefined;

  provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    throw new Error("Method not implemented.3");
  }
}
