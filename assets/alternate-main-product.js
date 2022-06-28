window.addEventListener("DOMContentLoaded", () => {
  Shopify.theme.sections.load('alternate-main-product');

  const $inputsColor = document.querySelectorAll('input[name=product_color]');
  const $formColorLabel = document.getElementById('productColorValue');
  $inputsColor.forEach((input) => {
    input.addEventListener('change', (e) => {
      $formColorLabel.innerText = e.target.dataset.nameDisplay;
    });
  });

  const $inputsQuantity = document.querySelectorAll('.input-quantity');
  $inputsQuantity.forEach((input) => {
    const $inputField = input.querySelector('.input-quantity__field');
    const $inputBtnIncrease = input.querySelector('.input-quantity__btn[data-action=increase]');
    const $inputBtnDecrease = input.querySelector('.input-quantity__btn[data-action=decrease]');
    $inputBtnIncrease.addEventListener('click', () => {
      const initialValue = $inputField.value * 1;
      $inputField.value = initialValue + 1; 
    });
    $inputBtnDecrease.addEventListener('click', () => {
      const initialValue = $inputField.value * 1;
      if (initialValue > 1) $inputField.value = initialValue - 1;
    });    
  });

  const $accordions = document.querySelectorAll('.accordion__item');
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

  // CART
  const $productForm = document.querySelector('.product-card__form');
  if ($productForm) {
    //const $errorElem = $productForm.querySelector('.product-card__error');
    $productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      formData.append('sections', 'alternate-header');
      fetch(Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        const event = new CustomEvent('cart:added', {
          detail: {
            sections: response.sections
          }
        });
        document.dispatchEvent(event);
      })
      .catch((e) => {
        console.error(e);
      });
    });
  }
});

Shopify.theme.sections.register('alternate-main-product', {
  onBlockSelect: function(e) {
    const $targetAccordion = document.getElementById(e.detail.blockId);
    $targetAccordion.classList.add('accordion__item_active');
  },
  onBlockDeselect: function(e) {
    const $targetAccordion = document.getElementById(e.detail.blockId);
    $targetAccordion.classList.remove('accordion__item_active');
  }  
});