// see https://github.com/golang/go/blob/fad67f8a5342f4bc309f26f0ae021ce9d21724e6/src/cmd/vendor/golang.org/x/mod/modfile/rule.go#L85
export interface ModProvider {
  modFile: ModObject;
}

export interface ModObject {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Arch: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Platform: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Dir: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GoMod: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GoVersion: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Main: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Path: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Version: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Indirect: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SDK: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Time: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Replace: ModObject | undefined;
}
