import TSVFileReader from '../file-reader/tsv-file-reader.js';
import { CliCommandInterface } from './cli-command.interface.js';
import { createOffer } from '../utils/offer.js';
import { getErrorMessage } from '../utils/common.js';
import RentOfferService from '../../modules/rent-offer/rent-offer.service.js';
import PinoLogger from '../logger/pino.logger.js';
import { RentOfferModel } from '../../modules/entities/index.js';
import { UserModel } from '../../modules/entities/index.js';
import UserService from '../../modules/user/user.service.js';
import MongoClientService from '../datdbase-client/mongo-client.service.js';
import { RentOffer } from '../../types/rent-offer.type.js';
import { getRandomArrItem } from '../utils/random.js';
import { passwords } from '../../../mocks/passwords.js';
import { getMongoURI } from '../utils/db-helper.js';

const DEFAULT_DB_PORT = '27017';

export default class ImportCommand implements CliCommandInterface {
  public readonly name = '--import';

  private logger: PinoLogger;
  private userService: UserService;
  private rentOfferService: RentOfferService;
  private databaseService: MongoClientService;
  private salt!: string;

  constructor() {
    this.onNewLine = this.onNewLine.bind(this);
    this.onComplete = this.onComplete.bind(this);

    this.logger = new PinoLogger();
    this.rentOfferService = new RentOfferService(this.logger, RentOfferModel);
    this.userService = new UserService(this.logger, UserModel);
    this.databaseService = new MongoClientService(this.logger);
  }

  private async saveOffer(offer: RentOffer) {
    const user = await this.userService.findOrCreate({...offer.advertiser, password: getRandomArrItem(passwords)}, this.salt);

    await this.rentOfferService.create({
      ...offer,
      advertiserId: user.id
    });
  }

  private async onNewLine(line: string, resolve: () => void) {
    const rentOffer = createOffer(line);
    await this.saveOffer(rentOffer);
    resolve();
  }

  private onComplete(count: number) {
    console.log(`${count} rows has been imported.`);
    this.databaseService.disconnect();
  }

  public async execute(
    filename: string,
    login: string,
    password: string,
    host: string,
    dbname: string,
    salt: string
  ): Promise<void> {
    const DBUriPath = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
    this.salt = salt;

    if (!filename) {
      throw new Error('File doesn\'t exist');
    }

    await this.databaseService.connect(DBUriPath);

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('newline', this.onNewLine);
    fileReader.on('end', this.onComplete);

    await fileReader.read().catch((error) => {
      console.log(`Can't read the file: ${getErrorMessage(error)}`);
    });

  }
}
