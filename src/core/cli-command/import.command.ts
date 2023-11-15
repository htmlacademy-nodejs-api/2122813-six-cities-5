import TSVFileReader from '../file-reader/tsv-file-reader.js';
import { CliCommandInterface } from './cli-command.interface.js';
import { createOffer } from '../utils/offer.js';
import { getErrorMessage } from '../utils/common.js';
import RentOfferService from '../../modules/rent-offer/rent-offer.service.js';
import PinoLogger from '../logger/pino.logger.js';
import { RentOfferModel, UserModel } from '../../modules/entities/index.js';
import UserService from '../../modules/user/user.service.js';
import MongoClientService from '../datdbase-client/mongo-client.service.js';
import { RentOffer } from '../../types/rent-offer.type.js';
import { getRandomArrItem } from '../utils/random.js';
import { passwords } from '../../../mocks/passwords.js';
import ConfigService from '../config/config.service.js';

const REQUIRED_PARAMS_COUNT = 1;

export default class ImportCommand implements CliCommandInterface {
  public readonly name = '--import';

  private logger: PinoLogger;
  private userService: UserService;
  private rentOfferService: RentOfferService;
  private databaseService: MongoClientService;
  private configService: ConfigService;
  private salt!: string;

  constructor() {
    this.onNewLine = this.onNewLine.bind(this);
    this.onComplete = this.onComplete.bind(this);

    this.logger = new PinoLogger();
    this.configService = new ConfigService(this.logger);
    this.rentOfferService = new RentOfferService(this.logger, RentOfferModel, this.configService);
    this.userService = new UserService(this.logger, UserModel, this.configService);
    this.databaseService = new MongoClientService(this.logger, this.configService);
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

  public async execute(...params: string[]): Promise<void> {
    if (params.length !== REQUIRED_PARAMS_COUNT) {
      throw new Error('Invalid command params length');
    }

    const [filename] = params;

    this.salt = this.configService.get('SALT');

    if (!filename) {
      throw new Error('File doesn\'t exist');
    }

    await this.databaseService.connect(this.configService.get('CLI_CONNECT_DB_PATH'));

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('newline', this.onNewLine);
    fileReader.on('end', this.onComplete);

    await fileReader.read().catch((error) => {
      console.log(`Can't read the file: ${getErrorMessage(error)}`);
    });
  }
}
