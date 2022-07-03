import {register} from '@shopify/theme-sections';

register('alternate-header', {
  onLoad() {
    document.addEventListener('cart:added', (event) => {
      if (event.detail.sections) {
        const data = event.detail.sections['alternate-header'];
        const parser = new DOMParser();
        const markup = parser.parseFromString(data, 'text/html');
        const newCart = markup.querySelector('#headerCartValue');
        const oldCart = document.querySelector('#headerCartValue');
        oldCart.replaceWith(newCart);
      }
      return true;
    });
  },
  onUnload() {
    document.removeEventListener('cart:added');
  },
});
