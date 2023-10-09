import { CliCommandInterface } from './cli-command.interface.js';
import chalk from 'chalk';

export default class HelpCommand implements CliCommandInterface {
  public readonly name = '--help';

  public async execute(): Promise<void> {
    console.log(
      `
      Программа для подготовки данных для REST API сервера.
      Пример:
          ${chalk.green('main.cli.js --<command> [--arguments]')}
      Команды:
          ${chalk.green('--version:')}                   ${chalk.gray('# выводит номер версии')}
          ${chalk.green('--help:')}                      ${chalk.gray('# печатает этот текст')}
          ${chalk.green('--import <filepath>:')}             ${chalk.gray('# импортирует данные из TSV')}
          ${chalk.green('--generate <n> <filepath> <url>')}  ${chalk.gray('# генерирует произвольное количество тестовых объявлений об аренде')}
      `
    );
  }
}
