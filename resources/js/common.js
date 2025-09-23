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
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', commonUi);
