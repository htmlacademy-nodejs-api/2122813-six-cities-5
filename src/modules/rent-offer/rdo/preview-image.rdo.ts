import { Expose } from 'class-transformer';

export default class PreviewImageRDO {
  @Expose()
  public previewImage!: string;
}
