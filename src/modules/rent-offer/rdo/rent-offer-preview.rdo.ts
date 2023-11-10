import { Expose } from 'class-transformer';

export default class RentOfferPreviewRDO {
  @Expose()
  public previewImage!: string;
}
