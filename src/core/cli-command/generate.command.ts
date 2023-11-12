import got from 'got';

import { CliCommandInterface } from './cli-command.interface.js';
import OfferGenerator from '../../modules/mock-generators/offer-generator.js';
import TSVFileWriter from '../file-writer/ftsv-file-writer.js';

import type { MockData } from '../../types/mock-data.type.js';

const RADIX = 10;

export default class GenerateCommand implements CliCommandInterface {
  public readonly name = '--generate';
  private initialData!: MockData;

  public async execute(...params: string[]): Promise<void> {
    const [count, filepath, url] = params;

    if (params.length !== 3) {
      throw new Error('Invalid command params length');
    }

    const offerCount = Number.parseInt(count, RADIX);

    this.initialData = await got.get(url).json().catch(() => {
      throw new Error(url ? `Can't fetch data from ${url}.` : 'incorrect filepath');
    }) as MockData;

    const offerGenerator = new OfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(offerGenerator.generate());
    }

    console.log(`File ${filepath} was created!`);
  }
}
