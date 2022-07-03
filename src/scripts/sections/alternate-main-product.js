import {register} from '@shopify/theme-sections';
import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';

const $productForm = document.querySelector('.product-card__form');
const $option1ValuePlaceholder = document.getElementById('option1Value');
const $option2ValuePlaceholder = document.getElementById('option2Value');
const $option3ValuePlaceholder = document.getElementById('option3Value');
const $btnAddToCard = document.getElementById('btnProductAddToCart');
const $notificationElem = document.querySelector('.product-card__notification');
const $productPrice = document.getElementById('productPrice');

register('alternate-main-product', {
  onLoad() {
    const $inputsQuantity = document.querySelectorAll('.input-quantity');
    if ($inputsQuantity.length) {
      $inputsQuantity.forEach((input) => {
        const $inputField = input.querySelector('.input-quantity__field');
        const $inputBtnIncrease = input.querySelector(
          '.input-quantity__btn[data-action=increase]',
        );
        const $inputBtnDecrease = input.querySelector(
          '.input-quantity__btn[data-action=decrease]',
        );
        $inputBtnIncrease.addEventListener('click', () => {
          const initialValue = Number($inputField.value);
          $inputField.value = initialValue + 1;
        });
        $inputBtnDecrease.addEventListener('click', () => {
          const initialValue = Number($inputField.value);
          if (initialValue > 1) $inputField.value = initialValue - 1;
        });
      });
    }

    const $accordions = document.querySelectorAll('.accordion__item');
    if ($accordions.length) {
      $accordions.forEach((accordion) => {
        const $accordionTitle = accordion.querySelector('.accordion__item-title');
        $accordionTitle.addEventListener('click', () => {
          accordion.classList.toggle('accordion__item_active');
          const $title = accordion.querySelector('.accordion__item-title');
          if (accordion.classList.contains('accordion__item_active')) {
            $title.setAttribute('aria-expanded', 'true');
          } else {
            $title.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    if ($productForm) {
      fetch(`${Shopify.routes.root}products/${$productForm.dataset.handle}.js`)
        .then((response) => {
          return response.json();
        })
        .then((productJSON) => {
          this.productForm = new ProductForm($productForm, productJSON, {
            onOptionChange: this.onOptionChange,
            onFormSubmit: this.onFormSubmit,
          });
        })
        // eslint-disable-next-line no-console
        .catch(console.error);
    }
  },
  onUnload() {
    this.productForm.destroy();
  },

  onOptionChange(event) {
    const option1Value = event.dataset.variant?.option1 ?? 'Unavailable';
    const option2Value = event.dataset.variant?.option2 ?? 'Unavailable';
    const option3Value = event.dataset.variant?.option3 ?? 'Unavailable';

    if ($option1ValuePlaceholder) {
      $option1ValuePlaceholder.innerText = option1Value;
    }
    if ($option2ValuePlaceholder) {
      $option2ValuePlaceholder.innerText = option2Value;
    }
    if ($option3ValuePlaceholder) {
      $option3ValuePlaceholder.innerText = option3Value;
    }

    const showNotification = (text, $elem) => {
      $elem.classList.add('active');
      $elem.innerText = text;
    };

    const hideNotification = ($elem) => {
      $elem.classList.remove('active');
      $elem.innerText = '';
    };

    const setPrice = ($elem, value) => {
      $elem.innerText = Shopify.formatMoney(value);
    };

    const variant = event.dataset.variant;
    if (variant === null) {
      $btnAddToCard.disabled = true;
      showNotification(
        'Please choose another options combination',
        $notificationElem,
      );
      return;
    } else if (variant && !variant.available) {
      showNotification(
        'Please choose another options combination',
        $notificationElem,
      );
      $btnAddToCard.disabled = true;
      return;
    } else if (variant && variant.available) {
      hideNotification($notificationElem);
      setPrice($productPrice, event.dataset.variant.price);
      const url = getUrlWithVariant(window.location.href, variant.id);
      window.history.replaceState({path: url}, '', url);
      $btnAddToCard.disabled = false;
    }
  },

  onFormSubmit(event) {
    event.preventDefault();

    const $errorElem = $productForm.querySelector('.product-card__error');

    const showError = (text, $elem) => {
      $elem.classList.add('active');
      $elem.innerText = text;
    };

    const hideError = ($elem) => {
      $elem.classList.remove('active');
      $elem.innerText = '';
    };

    const formData = new FormData(event.target);
    formData.append('sections', 'alternate-header');
    fetch(`${Shopify.routes.root}cart/add.js`, {
      method: 'POST',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status === 422) {
          showError(`${response.message}. ${response.description}`, $errorElem);
        } else {
          hideError($errorElem);
          const addToCartEvent = new CustomEvent('cart:added', {
            detail: {
              sections: response.sections,
            },
          });
          document.dispatchEvent(addToCartEvent);
        }
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  },
  onBlockSelect(event) {
    const $targetAccordion = document.getElementById(event.detail.blockId);
    $targetAccordion.classList.add('accordion__item_active');
  },
  onBlockDeselect(event) {
    const $targetAccordion = document.getElementById(event.detail.blockId);
    $targetAccordion.classList.remove('accordion__item_active');
  },
});
