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

  gnbBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    document.body.classList.toggle('gnbOpen');
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

  // GNB 메뉴 hover/focus 이벤트
  const header = document.getElementById('wrap');
  const gnbLinks = document.querySelectorAll('#gnb .gnb-link');
  const gnbBg = document.querySelector('#gnb .gnb-bg');

  // depth-2 메뉴 중 가장 높은 height 계산
  function setGnbBgHeight() {
    const depth2Menus = document.querySelectorAll('#gnb .depth-2');
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

    if (gnbBg) {
      gnbBg.style.height = maxHeight * 0.1 + 'rem';
    }
  }

  gnbLinks.forEach((link) => {
    // 마우스 오버 이벤트
    link.addEventListener('mouseenter', () => {
      header.classList.add('gnbOpen');
      setGnbBgHeight();
    });

    // 포커스 이벤트
    link.addEventListener('focus', () => {
      header.classList.add('gnbOpen');
      setGnbBgHeight();
    });
  });

  // header 대신 실제 header 요소에 이벤트 바인딩
  const headerElement = document.getElementById('header');
  const gnb = document.getElementById('gnb');

  // GNB 영역을 벗어날 때 처리
  if (headerElement && gnb) {
    // 마우스가 header 영역을 완전히 벗어날 때
    headerElement.addEventListener('mouseleave', (e) => {
      // 마우스가 header 밖으로 나갔을 때만 처리
      if (!headerElement.contains(e.relatedTarget)) {
        header.classList.remove('gnbOpen');
        // 모든 depth-2 메뉴의 height 초기화
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

  // 포커스가 GNB 영역 밖으로 나갈 때 클래스 제거
  gnbLinks[gnbLinks.length - 1].addEventListener('blur', (e) => {
    setTimeout(() => {
      if (!gnb.contains(document.activeElement)) {
        header.classList.remove('gnbOpen');
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
  });
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', commonUi);
