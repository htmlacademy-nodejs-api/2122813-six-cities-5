import chalk from 'chalk';
import TSVFileReader from '../file-reader/tsv-file-reader.js';
import { CliCommandInterface } from './cli-command.interface.js';
import type { RentOffer } from '../../types/rent-offer.type.js';


export default class ImportCommand implements CliCommandInterface {
  public readonly name = '--import';
  public execute(filename: string): void {
    if (!filename) {
      throw new Error;
    }

    const fileReader = new TSVFileReader(filename.trim());

    try {
      fileReader.read();
      const offers = fileReader.toArray();

      offers.forEach(({type, city, goods, advertiser, location, ...rest}: RentOffer) => {
        const {username, email, avatarPath, status: isPro} = advertiser;
        console.log('city: ', chalk.green(city));
        console.log('type: ', chalk.blue(type));
        console.log('advertiser: ', chalk.yellow(username, email, avatarPath, isPro));
        console.log('goods: ', chalk.cyan(goods));
        console.log('location: ', chalk.redBright(location.latitude, location.longitude));
        console.log(rest);
      });

    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      console.log(`Не удалось импортировать данные из файла по причине: «${err.message}»`);
    }
  }
}
