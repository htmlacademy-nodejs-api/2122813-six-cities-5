import { Expose } from 'class-transformer';

export class RentOfferImagesRDO {
  @Expose()
  public images!: string[];
}
