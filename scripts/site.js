// polyfills
import 'raf/polyfill';
import 'classlist-polyfill';
import '@squarespace/polyfills/Element/matches';
import '@squarespace/polyfills/Element/closest';

// imports for this file
import loadImage from './util/loadImage';
import controller from '@squarespace/controller';
import IndexPageLayout from './controllers/IndexPageLayout';

// register controllers
controller.register('IndexPageLayout', IndexPageLayout);

// Use the sqs-core module to access core Squarespace
// functionality, like Lifecycle and ImageLoader. For
// full documentation, go to:
//
// http://github.com/squarespace/squarespace-core

// window.addEventListener('DOMContentLoaded', function() {
//   let images = Array.from(document.querySelectorAll('img[data-src]'));
//   images.forEach((img) => {
//     loadImage(img);
//   });
// });

window.addEventListener('resize', () => {
  let imagesToLoad = Array.from(document.querySelectorAll('img[src]'));
  imagesToLoad.forEach((img) => {
    loadImage(img);
  });
});
