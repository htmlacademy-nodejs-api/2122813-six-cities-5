import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CliCommandInterface } from './cli-command.interface.js';

type PackageJSONConfig = {
  version: string;
}

function isPackageJSONConfig(value: unknown): value is PackageJSONConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.hasOwn(value, 'version')
  );
}

export default class VersionCommand implements CliCommandInterface {
  constructor(
    private readonly filePath: string = './package.json'
  ) {}

  public readonly name = '--version';

  private readVersion(): string {
    const contentPageJSON = readFileSync(resolve(this.filePath), 'utf-8');
    const content = JSON.parse(contentPageJSON);

    if (!isPackageJSONConfig(content)) {
      throw new Error('Failed to parse json content.');
    }

    return content.version;
  }

  public async execute(..._parameters: string[]): Promise<void> {
    try {
      const version = this.readVersion();
      console.info(version);
    } catch (error: unknown) {
      console.error(`Failed to read version from ${this.filePath}`);

      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }
}
