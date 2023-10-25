export interface DocumentExistsInterface {
  exists(docId: string): Promise<boolean>;
}
