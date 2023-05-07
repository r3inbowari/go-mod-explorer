# A base `go work` test project

TODO: A comprehensive coverage testing is required


#### Implementation: 
1. API: Read all `go.work` file
2. The `root go.work` has the highest priority. If the `root go.work` use those packages which in the `nested go.work`, these packages will be moved from the `nested go.work` to the `root go.work`.
3. Unlike `GoLand IDE`, we will skip the above two steps, and calculate the number of main directly by `go list`.(when len(main.package) > 1, We treat it as a workspace)
4. The first main.package is considered the root. instead we use it as the description name of this workspace.
5. The second main starts, we treat them as local packages referenced by the main project.
6. Changed title Go Modules to Go Workspace.
7. Add a new special icon for all local packages.
8. Add go.work file jump shortcut.
