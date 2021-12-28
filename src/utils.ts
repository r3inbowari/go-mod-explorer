import { Uri } from "vscode";

// resolve the file system path in different operating system
export function resolvePath(resource: Uri): string {
  return process.platform === "win32" ? resource.toString(true) : resource.path;
}

export function getParentNode(path: string): string {
  let n =
    process.platform === "win32"
      ? path.lastIndexOf("\\")
      : path.lastIndexOf("/");
  return path.substring(0, n);
}
