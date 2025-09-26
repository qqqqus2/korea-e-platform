$(window).on('resize', function () {
  vhChk();
});

vhChk();
function vhChk() {
  const $vh = window.innerHeight * 0.01;
  $('html').css('--vh', $vh + 'px');
}

//공통 UI
function commonUi() {
  /* header fixed */
  let prevSclTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  document.addEventListener('scroll', function () {
    const nowSclTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    const sclDirection = nowSclTop > prevSclTop ? 'down' : 'up';
    const sclDistance = Math.abs(nowSclTop - prevSclTop);
    const elArray = [];
    const header = document.querySelector('#header');
    if (header) elArray.push(header);

    if (elArray.length) fixedClassChk(elArray, nowSclTop, sclDirection, sclDistance);

    prevSclTop = nowSclTop;
  });

  // GNB 모바일 메뉴
  const gnbBtn = document.querySelector('#header .btn-gnb');
  const wrap = document.querySelector('#wrap');

  gnbBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    wrap.classList.toggle('mGnbOpen');

    // mGnbOpen 클래스가 있으면 parallax 기능 중단
    if (wrap.classList.contains('mGnbOpen')) {
      if (window.disableParallax) {
        window.disableParallax();
      }
    } else {
      if (window.enableParallax) {
        window.enableParallax();
      }
    }
  });

  //스크롤 탑 버튼
  const $scrollTop = $('.scroll-top');
  const $scrollTopBtn = $scrollTop.children();

  $scrollTopBtn.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });
  $scrollTopBtn.hide();
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $scrollTopBtn.fadeIn();
    } else {
      $scrollTopBtn.fadeOut();
    }
  });

  // 스크롤 다운 버튼
  const $scrollDownBtn = $('.scroll-down');
  let cachedHeaderHeight = 0;

  // 헤더 높이 업데이트 함수 (sub-navigation 포함)
  function updateHeaderHeight() {
    const headerHeight = $('#header').outerHeight() + 80 || 0;
    const subNaviHeight = $('.sub-navigation').outerHeight() - 80 || 0;
    cachedHeaderHeight = headerHeight + subNaviHeight;
    console.log('Total header height:', cachedHeaderHeight);
  }

  // 스크롤 위치에 따라 버튼 상태 업데이트
  function updateScrollDownButton() {
    const sections = $('section[id^="section-"]').toArray();
    if (sections.length === 0) return;

    const currentScrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const documentHeight = $(document).height();
    const viewportMiddle = currentScrollTop + windowHeight / 2;

    // 마지막 섹션 확인
    const lastSection = sections[sections.length - 1];
    const lastSectionTop = $(lastSection).offset().top;
    const lastSectionBottom = lastSectionTop + $(lastSection).outerHeight();

    // 마지막 섹션에 있거나 페이지 끝에 도달한 경우
    if (viewportMiddle >= lastSectionTop || currentScrollTop + windowHeight >= documentHeight - 100) {
      $scrollDownBtn.addClass('scroll-top');
    } else {
      $scrollDownBtn.removeClass('scroll-top');
    }
  }

  // 스크롤 이벤트에 버튼 상태 업데이트 추가
  $(window).scroll(function () {
    updateScrollDownButton();
  });

  // window resize 시 헤더 높이 재계산
  $(window).resize(function () {
    updateHeaderHeight();
  });

  // 초기 상태 설정
  updateHeaderHeight();
  updateScrollDownButton();

  $scrollDownBtn.on('click', function () {
    // scroll-top 클래스가 있으면 페이지 상단으로 이동
    if ($(this).hasClass('scroll-top')) {
      $('html, body').animate({ scrollTop: 0 }, 800, 'swing');
      return;
    }

    // 모든 섹션 요소 가져오기 (section 태그 중 id가 section으로 시작하는 것들)
    const sections = $('section[id^="section-"]').toArray();

    if (sections.length === 0) return;

    // 현재 스크롤 위치
    const currentScrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();

    // 현재 보이는 섹션 찾기 (viewport의 중간 지점 기준)
    const viewportMiddle = currentScrollTop + windowHeight / 2;

    let currentSectionIndex = -1;
    let nextSection = null;

    // 헤더 높이 가져오기
    const headerHeight = $('#header').outerHeight() || 0;

    // 현재 섹션 인덱스 찾기
    // 각 섹션의 시작 위치를 기준으로 현재 위치와 가장 가까운 섹션 찾기
    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionTop = $(sections[i]).offset().top;

      // 현재 스크롤 위치가 섹션 시작점을 지났으면 그 섹션이 현재 섹션
      // 헤더 높이를 고려하여 약간의 여유 추가
      if (currentScrollTop >= sectionTop - cachedHeaderHeight - 50) {
        currentSectionIndex = i;
        break;
      }
    }

    // 다음 섹션 결정
    if (currentSectionIndex === -1) {
      // 현재 위치가 첫 섹션 위에 있는 경우, 첫 섹션으로 이동
      nextSection = sections[0];
    } else if (currentSectionIndex < sections.length - 1) {
      // 다음 섹션이 있는 경우
      nextSection = sections[currentSectionIndex + 1];
    } else {
      // 마지막 섹션인 경우, 페이지 맨 아래로 이동
      $('html, body').animate(
        {
          scrollTop: $(document).height() - $(window).height()
        },
        800,
        'swing'
      );
      return;
    }

    // 다음 섹션으로 스크롤
    if (nextSection) {
      // offering-section 클래스를 가진 섹션 확인
      const isOfferingSection = $(nextSection).hasClass('offering-section');
      // section-01은 헤더 높이를 빼지 않음 (첫 번째 섹션은 상단에 위치)
      const isSection01 = $(nextSection).attr('id') === 'section-01';

      let targetPosition;
      if (isOfferingSection) {
        // offering-section은 페이지 상단에 딱 맞춤
        targetPosition = $(nextSection).offset().top - 100;
      } else if (isSection01) {
        targetPosition = $(nextSection).offset().top;
      } else {
        // 다른 섹션들은 헤더 높이를 고려
        targetPosition = $(nextSection).offset().top - cachedHeaderHeight;
      }

      $('html, body').animate(
        {
          scrollTop: targetPosition
        },
        800,
        'swing'
      );
    }
  });

  // 스크롤 header 고정 스크립트
  function fixedClassChk(elArray, nowSclTop, sclDirection, sclDistance) {
    elArray.forEach(function (item) {
      const itemEnd = getOffset(item).top + item.offsetHeight;
      if (nowSclTop > itemEnd) {
        item.classList.add('fixed');
        if (sclDistance > 5) {
          if (sclDirection === 'down') {
            item.classList.add('is-up');
          } else {
            item.classList.remove('is-up');
          }
        }
      } else {
        item.classList.remove('fixed', 'is-up');
      }
    });
  }
  function getOffset(element) {
    let $el = element;
    let $elX = 0;
    let $elY = 0;
    let isSticky = false;
    while ($el && !Number.isNaN($el.offsetLeft) && !Number.isNaN($el.offsetTop)) {
      let $style = window.getComputedStyle($el);
      // const $matrix = new WebKitCSSMatrix($style.transform);
      if ($style.position === 'sticky') {
        isSticky = true;
        $el.style.position = 'static';
      }
      $elX += $el.offsetLeft;
      // $elX += $matrix.m41; //translateX
      $elY += $el.offsetTop;
      // $elY += $matrix.m42;  //translateY
      if (isSticky) {
        isSticky = false;
        $el.style.position = '';
        if ($el.getAttribute('style') === '') $el.removeAttribute('style');
      }
      $el = $el.offsetParent;
      if ($el !== null) {
        $style = window.getComputedStyle($el);
        $elX += parseInt($style.borderLeftWidth);
        $elY += parseInt($style.borderTopWidth);
      }
    }
    return { left: $elX, top: $elY };
  }

  $scrollTopBtn.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });
  $scrollTopBtn.hide();
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $scrollTopBtn.fadeIn();
    } else {
      $scrollTopBtn.fadeOut();
    }
  });

  // GNB 메뉴 hover/focus 이벤트
  const header = document.getElementById('wrap');
  const gnbLinks = document.querySelectorAll('#gnb .gnb-link');
  const gnbBg = document.querySelector('#gnb .gnb-bg');
  const gnbActiveBar = document.querySelector('.gnb-active-bar');
  const gnbListWrap = document.querySelector('.gnb-list-wrap');
  const gnbLists = document.querySelectorAll('.gnb-list');

  // GNB active bar 위치 및 너비 업데이트
  function updateActiveBar(targetElement, instant = false) {
    if (!gnbActiveBar || !targetElement) return;

    // gnb-list-wrap 기준으로 상대 위치 계산
    const wrapRect = gnbListWrap.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // 상대 위치 계산
    const left = targetRect.left - wrapRect.left;
    const width = targetRect.width;

    // active bar 스타일 적용
    gnbActiveBar.style.left = left + 'px';
    gnbActiveBar.style.width = width + 'px';
    gnbActiveBar.style.opacity = '1';

    if (instant) {
      gnbActiveBar.style.transition = 'none';
    } else {
      gnbActiveBar.style.transition = 'left 0.3s ease, width 0.3s ease, opacity 0.3s ease';
    }
  }

  // Active bar 숨기기
  function hideActiveBar() {
    if (!gnbActiveBar) return;
    gnbActiveBar.style.opacity = '0';
  }

  // 초기 active 메뉴 체크 및 active bar 설정
  function initActiveBar() {
    const activeGnbLink = document.querySelector('.gnb-list > .gnb-link.active');
    if (activeGnbLink) {
      // 즉시 active bar 위치 설정 (애니메이션 없이)
      updateActiveBar(activeGnbLink, true);

      // 약간의 지연 후 트랜지션 활성화
      setTimeout(() => {
        if (gnbActiveBar) {
          gnbActiveBar.style.transition = 'left 0.3s ease, width 0.3s ease, opacity 0.3s ease';
        }
      }, 100);
    } else {
      hideActiveBar();
    }
  }

  // depth-2 메뉴 중 가장 높은 height 계산
  function setGnbBgHeight() {
    const depth2Menus = document.querySelectorAll('#gnb .depth-2');
    const outLinkMenu = document.querySelector('#header .out-link-menu');
    let maxHeight = 0;

    depth2Menus.forEach((menu) => {
      const menuHeight = menu.scrollHeight;
      if (menuHeight > maxHeight) {
        maxHeight = menuHeight;
      }
    });

    // 모든 depth-2 메뉴에 동일한 height 적용
    depth2Menus.forEach((menu) => {
      menu.style.height = maxHeight * 0.1 + 'rem';
    });

    outLinkMenu.style.height = maxHeight * 0.1 + 'rem';

    if (gnbBg) {
      gnbBg.style.height = maxHeight * 0.1 + 'rem';
    }
  }

  // 화면 크기 체크 함수
  function isDesktop() {
    return window.innerWidth >= 1025;
  }

  // 각 gnb-list에 이벤트 추가
  gnbLists.forEach((gnbList) => {
    const mainLink = gnbList.querySelector('.gnb-link');

    // gnb-list에 마우스 오버시 active bar 업데이트 (데스크탑에서만)
    gnbList.addEventListener('mouseenter', () => {
      if (isDesktop()) {
        header.classList.add('gnbOpen');
        setGnbBgHeight();
        updateActiveBar(mainLink);
      }
    });

    mainLink.addEventListener('mousedown', (e) => {
      if (!isDesktop()) {
        // depth-2 내부의 링크는 제외
        if (!e.target.closest('.depth-2')) {
          // 현재 클릭한 gnb-list
          const currentGnbList = gnbList.closest('.gnb-list');

          if (currentGnbList) {
            // 현재 active 상태인지 확인
            const isCurrentlyActive = currentGnbList.classList.contains('active');

            // 모든 gnb-list에서 active 클래스 제거
            document.querySelectorAll('.gnb-list').forEach((list) => {
              list.classList.remove('active');
            });

            // 현재 클릭한 요소가 active가 아니었다면 active 추가 (toggle 효과)
            if (!isCurrentlyActive) {
              currentGnbList.classList.add('active');
            }
          }

          e.preventDefault();
        }
      }
    });

    // 포커스 이벤트 (데스크탑에서만)
    mainLink.addEventListener('focus', () => {
      if (isDesktop()) {
        header.classList.add('gnbOpen');
        wrap.classList.remove('mGnbOpen');
        setGnbBgHeight();
        updateActiveBar(mainLink);
      }
    });
  });

  // header 대신 실제 header 요소에 이벤트 바인딩
  const headerElement = document.getElementById('header');
  const gnb = document.getElementById('gnb');

  // GNB 영역을 벗어날 때 처리 (데스크탑에서만)
  if (headerElement && gnb) {
    // 마우스가 header 영역을 완전히 벗어날 때
    headerElement.addEventListener('mouseleave', (e) => {
      // 데스크탑에서만 처리
      if (isDesktop()) {
        // 마우스가 header 밖으로 나갔을 때만 처리
        if (!headerElement.contains(e.relatedTarget)) {
          header.classList.remove('gnbOpen');

          // 기존에 active 클래스가 있는 메뉴가 있으면 그 위치로 돌아가기
          const activeGnbLink = document.querySelector('.gnb-list > .gnb-link.active');
          if (activeGnbLink) {
            updateActiveBar(activeGnbLink);
          } else {
            hideActiveBar();
          }

          // 모든 depth-2 메뉴의 height 초기화
          const depth2Menus = document.querySelectorAll('#gnb .depth-2');
          depth2Menus.forEach((menu) => {
            menu.style.height = '';
          });
          if (gnbBg) {
            gnbBg.style.height = '';
          }
        }
      }
    });
  }

  // 포커스가 GNB 영역 밖으로 나갈 때 클래스 제거 (데스크탑에서만)
  const lastGnbLink = document.querySelector('#gnb .depth-2:last-child .gnb-link:last-child') || gnbLinks[gnbLinks.length - 1];
  if (lastGnbLink) {
    lastGnbLink.addEventListener('blur', (e) => {
      // 데스크탑에서만 처리
      if (isDesktop()) {
        setTimeout(() => {
          if (!gnb.contains(document.activeElement)) {
            header.classList.remove('gnbOpen');

            // 기존에 active 클래스가 있는 메뉴가 있으면 그 위치로 돌아가기
            const activeGnbLink = document.querySelector('.gnb-list > .gnb-link.active');
            if (activeGnbLink) {
              updateActiveBar(activeGnbLink);
            } else {
              hideActiveBar();
            }

            // 모든 depth-2 메뉴의 height 초기화
            const depth2Menus = document.querySelectorAll('#gnb .depth-2');
            depth2Menus.forEach((menu) => {
              menu.style.height = '';
            });
            if (gnbBg) {
              gnbBg.style.height = '';
            }
          }
        }, 100);
      }
    });
  }
  // 페이지 로드시 초기 active bar 설정
  initActiveBar();

  // window resize 시 active bar 위치 재조정 및 모바일에서 gnbOpen 클래스 제거
  window.addEventListener('resize', () => {
    const activeGnbLink = document.querySelector('.gnb-list > .gnb-link.active');
    if (activeGnbLink && isDesktop()) {
      updateActiveBar(activeGnbLink, true);
    }

    // 모바일로 변경되면 gnbOpen 클래스 제거
    if (!isDesktop()) {
      header.classList.remove('gnbOpen');

      // depth-2 메뉴 height 초기화
      const depth2Menus = document.querySelectorAll('#gnb .depth-2');
      depth2Menus.forEach((menu) => {
        menu.style.height = '';
      });
      if (gnbBg) {
        gnbBg.style.height = '';
      }
    }
  });

  let thumbSwiper;

  //  thumb swiper (모바일에서만 실행)
  function initThumbSwiper() {
    // strength-list 클래스를 가진 thumb-swiper 요소 확인
    const strengthListSwiper = document.querySelector('.thumb-swiper.strength-list'); // 1024
    const isStrengthList = strengthListSwiper !== null;

    // strength-list는 1300px 미만, 그 외는 768px 이하에서 실행
    const breakpoint = isStrengthList ? 1300 : 768;

    if (window.innerWidth < breakpoint) {
      if (!thumbSwiper) {
        thumbSwiper = new Swiper('.thumb-swiper', {
          slidesPerView: 'auto',
          spaceBetween: 24,
          speed: 600,
          grabCursor: true,
          pagination: {
            el: '.thumb-swiper .thumb-pagination',
            type: 'progressbar'
          },
          // Enable swiper on mobile
          observer: true,
          observeParents: true
        });
      }
    } else {
      // 설정된 breakpoint 이상에서는 swiper 제거
      if (thumbSwiper) {
        thumbSwiper.destroy(true, true);
        thumbSwiper = undefined;
      }
    }
  }

  initThumbSwiper();

  $(window).on('resize', function () {
    // resize 시 header의 메뉴 관련 클래스 제거
    const header = document.getElementById('header');
    if (header) {
      header.classList.remove('mGnbOpen', 'gnbOpen');
    }

    initThumbSwiper();
  });
}

// fadeIn 방향 애니메이션 적용 함수
function applyFadeInUpAnimation(section) {
  // data-fade 속성을 가진 요소들을 선택
  const fadeElements = section.querySelectorAll('[data-fade]');

  fadeElements.forEach((element, index) => {
    // 방향 설정 (기본값: up)
    const direction = element.getAttribute('data-fade') || 'up';

    // 애니메이션 클래스 매핑
    const animationClasses = {
      up: 'fadeInUp',
      down: 'fadeInDown',
      left: 'fadeInLeft',
      right: 'fadeInRight',
      zoom: 'fadeInZoom',
      fade: 'fadeIn'
    };

    // 기존 애니메이션 클래스 제거
    Object.values(animationClasses).forEach((className) => {
      element.classList.remove(className);
    });
    element.classList.remove('animated');

    // 지연 시간 설정 (순차적 애니메이션을 위해)
    const delay = element.getAttribute('data-fade-delay') || index * 100;

    // 선택된 방향의 애니메이션 클래스 적용
    const animationClass = animationClasses[direction] || 'fadeInUp';

    setTimeout(() => {
      element.classList.add('animated', animationClass);
    }, delay);
  });
}

// 애니메이션 초기화 함수
function resetAnimations(section) {
  const fadeElements = section.querySelectorAll('[data-fade]');

  // 모든 애니메이션 클래스 목록
  const animationClasses = ['fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'fadeInZoom', 'fadeIn', 'animated'];

  fadeElements.forEach((element) => {
    animationClasses.forEach((className) => {
      element.classList.remove(className);
    });
  });
  // 섹션 자체의 애니메이션 클래스는 제거하지 않음 (data-fade가 있는 요소만 처리)
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  commonUi();
  // initThumbSwiper();
});
