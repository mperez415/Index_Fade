import ImageLoader from '@squarespace/core/ImageLoader';

/**
 * @private
 * @name loadImage
 * @description passes through an image and watcher.
 *              loads the image with the squarespace ImageLoader.
 * @param {img}   img   the image element
 */
const loadImage = (img) => {
  ImageLoader.load(img, {
    load: true,
    mode: 'fill'
  });
};

export default loadImage;
