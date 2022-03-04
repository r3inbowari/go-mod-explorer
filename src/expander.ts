import {
  CancellationToken,
  Definition,
  DefinitionProvider,
  LocationLink,
  Position,
  ProviderResult,
  TextDocument,
} from "vscode";

export default class ExpanderProvider implements DefinitionProvider {
  constructor() {}

  provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Definition | LocationLink[]> {
    console.log("test", document);
    console.log("pos", position);
    console.log("token", token);
    return null;
  }
}
