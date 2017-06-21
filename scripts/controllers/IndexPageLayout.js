import raf from 'raf';
import Velocity from 'velocity-animate';
import 'velocity-animate/velocity.ui';
import loadImage from '../util/loadImage';

// Register custom animations for Velocity.js
Velocity.RegisterEffect('hide', {
  defaultDuration: 1,
  calls: [[{
    opacity: [0, 1]
  }, 1]]
});

Velocity.RegisterEffect('show', {
  defaultDuration: 1,
  calls: [[{
    opacity: [1, 0]
  }, 1]]
});

// Heavily inspired by https://codyhouse.co/demo/page-scroll-effects/opacity.html
function IndexPageLayout(element) {
  // DOM Elements
  let sectionsAvailable = Array.from(element.querySelectorAll('.index-page'));
  let indexNav = element.querySelector('#index-nav');
  let prevArrow = indexNav.querySelector('a.prev');
  let nextArrow = indexNav.querySelector('a.next');

  // Force loads all index page images.
  const loadSectionImages = () => {
    let indexImages = Array.from(element.querySelectorAll('.index-page img[data-src]'));
    indexImages.forEach((img) => {
      loadImage(img);
    });
  };

  // Finds the currently visible section
  const getVisibleSection = () => {
    for (let i = 0; i < sectionsAvailable.length; i++) {
      if (sectionsAvailable[i].matches('.visible')) {
        return sectionsAvailable[i];
      }
    }
  };

  //update navigation arrows visibility
  const checkNavigation = () => {
    let visibleSection = getVisibleSection();
    if (visibleSection.matches(':first-of-type')) {
      prevArrow.classList.add('inactive');
    } else {
      prevArrow.classList.remove('inactive');
    }
  };

  // Returns opacity value based on input parameters
  const setSectionOpacity = (sectionOffset, windowHeight, isFirst) => {
    // Sets opacity to 1 by default
    let opacity = 1;

    if (sectionOffset >= -windowHeight && sectionOffset <= 0 ) {
      // section entering the viewport
      if (isFirst) {
        // if first section is entring viewport, it should already be visible.
        return opacity;
      }
      opacity = (sectionOffset + windowHeight) / windowHeight;

    } else if (sectionOffset > 0 && sectionOffset <= windowHeight ) {
      //section leaving the viewport - still has the '.visible' class
      opacity = (windowHeight - sectionOffset) / windowHeight;

    } else if (sectionOffset < -windowHeight) {
      //section not yet visible
      opacity = 0;

    } else {
      //section not visible anymore
      opacity = 0;
    }

    return opacity;
  };

  // Transforms the opacity value of an element.
  const transformSection = (el, opacityValue) => {
    Velocity(el, {
      opacity: opacityValue,
    }, 0);
  };

  // Used to animate the opacity of each section. Bound to winodw scroll event.
  const animateSections = () => {
    // Get window values
    let scrollTop = (window.pageYOffset !== undefined) ?
      window.pageYOffset : (document.documentElement ||
      document.body.parentNode ||
      document.body).scrollTop;

    let windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    // loop through each available section to detect whether it's visible and animate it.
    sectionsAvailable.forEach((actualBlock) => {
      let offset = scrollTop - actualBlock.offsetTop;
      let isFirstSection = actualBlock.matches(':first-of-type');
      let isLastSection = actualBlock.matches(':last-of-type');

      //define animation parameters
      let opacityValue = setSectionOpacity(offset, windowHeight, isFirstSection);

      // animates opacity of .index-page-inner sections for each actualBlock
      transformSection(actualBlock.querySelector('.index-page-inner'), opacityValue);

      // Set visible class
      // Checks if element is visible based on offset and window height,
      // or offset and being first section,
      // or offset and being last section
      if ((offset >= 0 && offset < windowHeight) ||
        (offset <= 0 && isFirstSection) ||
        (offset >= windowHeight && isLastSection)) {
        actualBlock.classList.add('visible');
      } else {
        actualBlock.classList.remove('visible');
      }
    });

    checkNavigation();
  };

  // Animates at 60fps
  const scrollAnimation = () => {
    raf(animateSections);
  };

  const bindScroll = () => {
    window.addEventListener('scroll', scrollAnimation);
  };

  // Unbinds scroll animations while scroll hijacking
  const unbindScroll = () => {
    window.removeEventListener('scroll', scrollAnimation);
  };

  // Scrolls window to a section
  const scrollToSection = (targetSection, visibleSection) => {
    // Default options for velocity animations
    let animOptions = {
      duration: 400,
      easing: 'ease'
    };

    // if target section is footer, scroll to footer and stop here.
    if (targetSection.matches('#footer')) {
      Velocity(targetSection, 'scroll', animOptions, 0);
    } else {
      // Create option object for show animation.
      // Includes callback function.
      let showOptions = animOptions;
      showOptions.duration = 600;
      showOptions.complete = () => {
        bindScroll();
      };

      // The guts of the animation.
      // Unbinds scroll event lister.
      // Scrolls window to the new section.
      // Animates the current and new section fade in and fade out.
      // Re-binds scroll event listener.
      // Resets index navigation.
      unbindScroll();
      visibleSection.classList.remove('visible');
      targetSection.classList.add('visible');
      Velocity(targetSection, 'scroll', {
        duration: 0,
        delay: 0,
      }, 0);
      Velocity(visibleSection.querySelector('.index-page-inner'), 'hide', animOptions );
      Velocity(targetSection.querySelector('.index-page-inner'), 'show', showOptions );
      checkNavigation();
    }
  };

  // Bound to prevArrow click
  const prevSection = (event) => {
    // go to previous section
    if (typeof event !== 'undefined') {
      event.preventDefault();
      // gets visible section
      let visibleSection = getVisibleSection();
      let previousSection = visibleSection.previousElementSibling;
      // Animate scroll with Velocity
      scrollToSection(previousSection, visibleSection);
    }
  };

  // Bound to nextArrow click
  const nextSection = (event) => {
    // go to next section
    if (typeof event !== 'undefined') {
      event.preventDefault();
      // gets visible section
      let visibleSection = getVisibleSection();
      let nxtSection = visibleSection.nextElementSibling;
      // checks if nxtSection should be the footer.
      if (visibleSection.matches(':last-of-type')) {
        nxtSection = document.querySelector('#footer');
      }

      // Animate scroll with Velocity
      scrollToSection(nxtSection, visibleSection);
    }
  };

  const bindListeners = () => {
    bindScroll();
    prevArrow.addEventListener('click', prevSection);
    nextArrow.addEventListener('click', nextSection);
  };

  const init = () => {
    loadSectionImages();
    scrollAnimation();
    checkNavigation();
    bindListeners();
  };

  init();
}

export default IndexPageLayout;
