import chalk from 'chalk';
import TSVFileReader from '../file-reader/tsv-file-reader.js';
import { CliCommandInterface } from './cli-command.interface.js';
import { createOffer } from '../utils/offer.js';
import { getErrorMessage } from '../utils/common.js';

export default class ImportCommand implements CliCommandInterface {
  public readonly name = '--import';

  private onNewLine(line: string) {
    const rentOffer = createOffer(line);
    const {type, city, goods, advertiser, location, ...rest} = rentOffer;
    const {username, email, avatarPath, status: isPro} = advertiser;

    console.log('city: ', chalk.green(city));
    console.log('type: ', chalk.blue(type));
    console.log('advertiser: ', chalk.yellow(username, email, avatarPath, isPro));
    console.log('goods: ', chalk.cyan(goods));
    console.log('location: ', chalk.redBright(location.latitude, location.longitude));
    console.log(rest);
  }

  private onComplete(count: number) {
    console.log(`${count} rows has been imported.`);
  }

  public async execute(filename: string): Promise<void> {
    if (!filename) {
      throw new Error('File doesn\'t exist');
    }

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('newline', this.onNewLine);
    fileReader.on('end', this.onComplete);

    try {
      await fileReader.read();
    } catch(err) {
      console.log(`Can't read the file: ${getErrorMessage(err)}`);
    }
  }
}
