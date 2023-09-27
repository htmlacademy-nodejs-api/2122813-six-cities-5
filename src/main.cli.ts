#!/usr/bin/env node

import CLIApplication from './app/cli.js';
import HelpCommand from './core/cli-command/help.command.js';
import ImportCommand from './core/cli-command/import.command.js';
import VersionCommand from './core/cli-command/version.command.js';
import GenerateCommand from './core/cli-command/generate.command.js';

function bootstrap() {
  const cliApp = new CLIApplication();
  cliApp.registerCommands([
    new HelpCommand(), new VersionCommand(), new ImportCommand(), new GenerateCommand()
  ]);

  cliApp.executeCommand(process.argv);
}

bootstrap();
