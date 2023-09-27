import EventEmitter from 'node:events';
import { createReadStream } from 'node:fs';
import { FileReaderInterface } from './file-reader.interface.js';

const CHUNK_SIZE = 16384; // Это 16KB


export default class TSVFileReader extends EventEmitter implements FileReaderInterface {
  constructor(public filename: string) {
    super();
  }

  public async read(): Promise<void> {
    const stream = createReadStream(this.filename, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf-8',
    });

    let rowStringBuilder = '';
    let nextLinePosition = -1;
    let importedRowCount = 0;

    for await (const chunk of stream) {
      rowStringBuilder += chunk.toString();

      while ((nextLinePosition = rowStringBuilder.indexOf('\n')) >= 0) {
        const completeRow = rowStringBuilder.slice(0, nextLinePosition + 1);
        rowStringBuilder = rowStringBuilder.slice(++nextLinePosition);
        importedRowCount++;

        this.emit('newline', completeRow);
      }
    }

    this.emit('end', importedRowCount);
  }
}
