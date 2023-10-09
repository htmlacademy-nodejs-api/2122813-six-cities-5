import { injectable } from 'inversify';

import { CliCommandInterface } from '../core/cli-command/cli-command.interface.js';

type ParsedCommand = Record<string, string[]>

@injectable()
export default class CLIApplication {
  private commands: Record<string, CliCommandInterface> = {};
  private readonly defaultCommand = '--help';

  private parseCommand(cliArguments: string[]): ParsedCommand {
    const parsedCommand: ParsedCommand = {};
    let commandName = '';

    return cliArguments.reduce((acc, item) => {
      if (item.startsWith('--')) {
        acc[item] = [];
        commandName = item;
      } else if (commandName && item) {
        acc[commandName].push(item);
      }

      return acc;
    }, parsedCommand);
  }

  public registerCommands(commandList: CliCommandInterface[]): void {
    this.commands = commandList.reduce((acc, cliCommand) => ({ ...acc, [cliCommand.name]: cliCommand }), {});
  }

  public getCommand(commandName: string): CliCommandInterface {
    return this.commands[commandName] ?? this.commands[this.defaultCommand];
  }

  public executeCommand(argv: string[]): void {
    const parsedCommand = this.parseCommand(argv);
    const [commandName] = Object.keys(parsedCommand);
    const command = this.getCommand(commandName);
    const commandArguments = parsedCommand[commandName] ?? [];
    command.execute(...commandArguments);
  }
}
