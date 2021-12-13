import { getExtension, imageExtensions } from '../utils.js';
import ImageSource from './ImageSource.js';
import Source from './Source.js';

export default class SourceFactory {
  static factory(link) {
    const extension = getExtension(new URL(link));

    if (imageExtensions.includes(extension)) {
      return ImageSource;
    } else {
      return Source;
    }
  }
}
