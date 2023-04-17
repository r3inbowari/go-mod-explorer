```go
// A Go is the go statement.
export interface Go {
  version: string;
  syntax: number;
}

export interface GoModule {
  mod: Version;
  deprecated: string;
  syntax: number;
}

export interface GoRequire {
  mod: Version;
  indirect: boolean;
  syntax: number;
}

export interface GoExclude {
  mod: Version;
  syntax: number;
}

export interface GoReplace {
  old: Version;
  new: Version;
  syntax: number;
}

export interface GoRetract {
  // A VersionInterval represents a range of versions with upper and lower bounds.
  // Intervals are closed: both bounds are included. When Low is equal to High,
  // the interval may refer to a single version ('v1.2.3') or an interval
  // ('[v1.2.3, v1.2.3]'); both have the same representation.
  low: string;
  high: string;
  rationale: string;
  syntax: number;
}

export interface Version {
  // Path is a module path, like "golang.org/x/text" or "rsc.io/quote/v2".
  path: string;
  // Version is usually a semantic version in canonical form.
  // There are three exceptions to this general rule.
  // First, the top-level target of a build has no specific version
  // and uses Version = "".
  // Second, during MVS calculations the version "none" is used
  // to represent the decision to take no version of a given module.
  // Third, filesystem paths found in "replace" directives are
  // represented by a path with an empty version.
  version: string;
}
```
