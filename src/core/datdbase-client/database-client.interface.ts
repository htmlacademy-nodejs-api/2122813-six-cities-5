export interface DatabaseClientInterface {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
}
