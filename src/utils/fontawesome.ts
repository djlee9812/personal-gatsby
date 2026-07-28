// src/utils/fontawesome.ts
import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  faArrowLeft,
  faArrowRight,
  faArrowDown,
  faChevronLeft,
  faChevronRight,
  faPlane,
} from '@fortawesome/free-solid-svg-icons';
import { faApple, faGithub, faInstagram, faLinkedin, faGoodreads } from '@fortawesome/free-brands-svg-icons';

// Ship FA sizing CSS with the SSR HTML. Default autoAddCss injects styles only
// after client JS runs, so icons briefly render at raw SVG viewBox size.
config.autoAddCss = false;

library.add(
  faArrowLeft,
  faArrowRight,
  faArrowDown,
  faChevronLeft,
  faChevronRight,
  faPlane,
  faApple,
  faGithub,
  faInstagram,
  faLinkedin,
  faGoodreads
);
