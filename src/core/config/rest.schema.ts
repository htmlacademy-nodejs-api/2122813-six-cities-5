import convict from 'convict';
import validator from 'convict-format-with-validator';
convict.addFormats(validator);

export type RestSchema = {
  SERVICE_HOST: string;
  SERVICE_PORT: number;
  SALT: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_NAME: string;
  UPLOAD_DIRECTORY_PATH: string;
  STATIC_DIRECTORY_PATH: string;
  JWT_SECRET: string;
  CLI_CONNECT_DB_PATH: string;
}

export const configRestSchema = convict<RestSchema>({
  SERVICE_HOST: {
    doc: 'Host for service launch',
    format: String,
    env: 'SERVICE_HOST',
    default: 'localhost'
  },
  SERVICE_PORT: {
    doc: 'Port for incoming connections',
    format: 'port',
    env: 'SERVICE_PORT',
    default: null
  },
  SALT: {
    doc: 'Random string for password hash',
    format: String,
    env: 'SALT',
    default: null
  },
  DB_HOST: {
    doc: 'IP address of the database server (MongoDB)',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: null
  },
  DB_USER: {
    doc: 'Username to connect to the database',
    format: String,
    env: 'DB_USER',
    default: null,
  },
  DB_PASSWORD: {
    doc: 'Password to connect to the database',
    format: String,
    env: 'DB_PASSWORD',
    default: null,
  },
  DB_PORT: {
    doc: 'Port to connect to the database (MongoDB)',
    format: 'port',
    env: 'DB_PORT',
    default: '27017',
  },
  DB_NAME: {
    doc: 'Database name (MongoDB)',
    format: String,
    env: 'DB_NAME',
    default: 'six-cities-db'
  },
  UPLOAD_DIRECTORY_PATH: {
    doc: 'Directory for upload files from users',
    format: String,
    env: 'UPLOAD_DIRECTORY_PATH',
    default: null
  },
  STATIC_DIRECTORY_PATH: {
    doc: 'Path to directory with static resources',
    format: String,
    env: 'STATIC_DIRECTORY_PATH',
    default: 'static'
  },
  JWT_SECRET: {
    doc: 'Secret for sign JWT token',
    format: String,
    env: 'JWT_SECRET',
    default: null
  },
  CLI_CONNECT_DB_PATH: {
    doc: 'Path for connecting to DB via CLI',
    format: String,
    env: 'CLI_CONNECT_DB_PATH',
    default: null
  }
});
