$(document).ready(function () {
  let offeringValueSwiper;
  let categorySwiper;

  // 제공가치 swiper (모바일에서만)
  function initOfferingValueSwiper() {
    if (window.innerWidth <= 768) {
      if (!offeringValueSwiper) {
        offeringValueSwiper = new Swiper('.value-swiper', {
          slidesPerView: 1.06,
          spaceBetween: 24,
          speed: 600,
          grabCursor: true,
          pagination: {
            el: '.value-pagination',
            type: 'progressbar'
          }
        });
      }
    } else {
      // pc에서는 swiper 제거 (768 이상)
      if (offeringValueSwiper) {
        offeringValueSwiper.destroy(true, true);
        offeringValueSwiper = undefined;
      }
    }
  }

  // 취급항목 swiper (모바일에서만)
  function initCategorySwiper() {
    if (window.innerWidth <= 768) {
      if (!categorySwiper) {
        categorySwiper = new Swiper('.category-swiper', {
          slidesPerView: 2.1,
          spaceBetween: 16,
          speed: 600,
          grabCursor: true,
          observer: true,
          observeParents: true,
          pagination: {
            el: '.category-pagination',
            type: 'progressbar'
          }
        });
      }
    } else {
      // pc에서는 swiper 제거 (768 이상)
      if (categorySwiper) {
        categorySwiper.destroy(true, true);
        categorySwiper = undefined;
      }
    }
  }

  function initSwipers() {
    initOfferingValueSwiper();
    initCategorySwiper();
  }

  initSwipers();

  $(window).on('resize', function () {
    initSwipers();
  });
});
