export interface DocumentModifyInterface {
  canModify(ownerId: string, docId: string): Promise<boolean>;
}
