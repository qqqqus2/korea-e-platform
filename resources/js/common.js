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
