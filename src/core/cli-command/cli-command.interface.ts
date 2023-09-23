export interface CliCommandInterface {
  readonly name: string;
  execute(...parameters: string[]): Promise<void> | void;
}
