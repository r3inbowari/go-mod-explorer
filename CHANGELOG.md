# Change Log

[0.1.0]  
basic function realization.

[0.1.1]  
fix: load error path on linux/mac.

[0.1.1]  
add: support open by file explorer.

[0.1.5]  
add: support focus explorer.

[0.1.6]  
add: support find in files.

[0.1.7]  
add: support show/hide hostname and version tag.

[0.1.8]  
fix: json parsing error when nested.
change: update dependencies.

[0.1.9]  
fix: redundant items in #15.  
fix: cannot read properties of undefined (reading 'getRootLen') in #16.  
add: check go env at first in #17.

[0.2.0]  
chore: code logic optimization.  
chore: update readme.  
fix: sometimes the library cannot be loaded.  
fix: other minor bugs.  
add: go standard library display support.  
add: two icons(.svg) from GoLand.

[0.2.3]  
fix: failed to get parent on linux.  
fix: failed to get go dir on linux.  
fix: check goroot error on linux.  
fix: failed to get parent.  
add: support "Reveal in Explorer View".  
chore: update readme.

[0.2.4]  
fix: heap overflow by getParents no return.  
add: one icon(.svg) from GoLand.  
change: the current it will start with the official extension.  
update readme.  
chore: more detail for package.json.

[0.2.5]  
add: one icon(.svg) from GoLand.  
add: classify packages for (in)direct by icon color.  
chore: fix typos.

[0.2.6]  
add: packages sorting.

[0.3.0]  
This patch is come from #32.

support: multiple go.mod file.  
support: goto go.mod file.  
support: hover display.  
support: collapse all.  
support: load dynamically for multiple go.mod files.  
remove: hide hostname option.  
add find in files inline button.  
fix: sometime it can't load anytings.  
fix: probability of abnormal go envs.  
fix: wrong start timing  
fix: expanded an empty modules.  
fix: load error go exec, when switch to a new go path.  
fix: find in files not work. remove: find in files menu context.  
chore: add some code comments.  
chore: typos fix.  
chore: update readme.  
change: no longer catch the err package when loading modules.  
change: the moditem api has been change.

[0.3.4]  
This patch is base on #33, #34, #36, #37 and #39.

chore: update readme and add an additional LICENCE from JetBrains s.r.o.
support: replaced packages indicator (The version tag still shows the original).  
add: button for go mod tidy.  
add: hover display with arch info.  
change: new extension icon.  
fix: link to documents with trusted domain.  
fix: The explorer will not be updated when modifying the "go.mod" file and then use "go get" (strict order).

[0.3.10]  
fix: scheme missing when open Go SDK in win32.  
fix: typos fix.  
fix: use exec option to change pwd.  
fix: replace local packages with showing undefined.  
change: discard search button.  
fix: collapse display with an exception symbol.  
chore: vsce cli update.  
support: replace packages indicator and fix bugs.

[0.3.11]  
feat: support go work title with GO Workspace #38 #55.  
feat: support gowork module with marking icon #38 #55.  
chore: update dependencies.  
chore: update README.md.

[0.3.12]  
feat: add new function `actionReveal2` #61  
feat: shortcut quick collapse.  
feat: shortcut Reveal the current activate in the Editor.  
feat: configuration `gomod.focusMode` allow user reveal without focusing.

[0.3.13]
fix: reveal error caused by missing target.

[0.3.14]
fix: missing conf gomod.focusMode.

[0.3.15]
chore: refine shortcuts rules.

[0.3.16]
chore: typos fix.

[0.3.17]
chore: typos fix.

[0.3.18]
fix: CVE-2024-4068.
