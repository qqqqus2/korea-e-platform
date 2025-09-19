/* Container 패럴렉스 스크롤 */
(function () {
  let isScrolling = false;
  let currentSection = 0;
  const sections = document.querySelectorAll('.container, #footer');
  const totalSections = sections.length;

  // 각 섹션의 높이를 100vh로 설정
  function setSectionHeights() {
    sections.forEach((section) => {
      if (section.classList.contains('container')) {
        section.style.height = '100dvh';
        //  section.style.overflow = 'hidden';
      }
    });
  }

  // 현재 스크롤 위치에 맞는 섹션 찾기
  function findCurrentSection() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    for (let i = 0; i < totalSections; i++) {
      const sectionTop = sections[i].offsetTop;
      const sectionBottom = sectionTop + sections[i].offsetHeight;

      if (scrollTop >= sectionTop - windowHeight / 2 && scrollTop < sectionBottom - windowHeight / 2) {
        return i;
      }
    }
    return currentSection;
  }

  // 특정 섹션으로 전환 (방향성 덮어쓰기 효과)
  function scrollToSection(index) {
    if (index < 0 || index >= totalSections || isScrolling) return;

    isScrolling = true;
    const prevSectionIndex = currentSection;
    const isGoingDown = index > currentSection; // 아래로 이동하는지 확인
    currentSection = index;
    const targetSection = sections[index];
    const isFooter = targetSection.id === 'footer';
    const lastContainer = document.querySelector('.container:last-of-type');
    const header = document.getElementById('header');

    // 모든 섹션에서 클래스 초기화
    sections.forEach((section, i) => {
      section.classList.remove('active', 'prev', 'next', 'footer-visible');

      // Footer가 아닌 섹션들에 대한 처리
      if (section.id !== 'footer') {
        if (isGoingDown) {
          // 아래로 이동: 현재보다 작은 섹션들은 prev
          if (i < index && !isFooter) {
            section.classList.add('prev');
          }
        } else {
          // 위로 이동: 현재보다 큰 섹션들은 next (아래로 내려감)
          if (i > index && !isFooter) {
            section.classList.add('next');
          }
          // 현재보다 작은 섹션들은 prev (보임 상태)
          if (i < index && !isFooter) {
            section.classList.add('prev');
          }
        }
      }
    });

    // Header 배경 제어 - section-01이 active일 때만 bg-trans 클래스 추가
    if (header) {
      if (targetSection.id === 'section-01') {
        header.classList.add('bg-trans');
        header.classList.remove('is-parallax');
      } else {
        header.classList.remove('bg-trans');
        // 아래로 스크롤할 때 header에 is-up 클래스 추가
        if (isGoingDown) {
          header.classList.add('is-parallax');
        } else {
          header.classList.remove('is-parallax');
        }
      }
    }

    // Footer로 이동하는 경우
    if (isFooter) {
      // Footer를 active로 설정
      targetSection.classList.add('active');
      // 마지막 container를 위로 올림
      if (lastContainer) {
        lastContainer.classList.add('footer-visible');
      }
      // 다른 모든 container들은 prev 상태 유지
      sections.forEach((section, i) => {
        if (section.id !== 'footer' && i < index) {
          section.classList.add('prev');
        }
      });
    } else {
      // 일반 섹션으로 이동하는 경우
      targetSection.classList.add('active');

      // Footer에서 다시 위로 올라가는 경우
      if (prevSectionIndex === totalSections - 1 && index < totalSections - 1) {
        const footer = document.getElementById('footer');
        if (footer) {
          footer.classList.remove('active');
        }
        if (lastContainer) {
          lastContainer.classList.remove('footer-visible');
        }
      }
    }

    // 애니메이션이 끝난 후 플래그 리셋
    setTimeout(() => {
      isScrolling = false;
    }, 800);
  }

  // 마우스 휠 이벤트 핸들러
  function handleWheel(e) {
    e.preventDefault();

    if (isScrolling) return;

    const delta = e.deltaY || e.wheelDelta * -1;

    if (delta > 0) {
      // 아래로 스크롤
      if (currentSection < totalSections - 1) {
        scrollToSection(currentSection + 1);
      }
    } else {
      // 위로 스크롤
      if (currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    }
  }

  // 키보드 이벤트 핸들러 (Page Up/Down, 화살표 키)
  function handleKeydown(e) {
    if (isScrolling) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        if (currentSection < totalSections - 1) {
          scrollToSection(currentSection + 1);
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        if (currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
        break;
    }
  }

  // 터치 이벤트 처리 (모바일)
  let touchStartY = 0;
  let touchEndY = 0;

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    touchEndY = e.changedTouches[0].clientY;

    if (isScrolling) return;

    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentSection < totalSections - 1) {
        // 위로 스와이프 (아래로 스크롤)
        scrollToSection(currentSection + 1);
      } else if (swipeDistance < 0 && currentSection > 0) {
        // 아래로 스와이프 (위로 스크롤)
        scrollToSection(currentSection - 1);
      }
    }
  }

  // 창 크기 변경시 섹션 높이 재설정
  function handleResize() {
    setSectionHeights();
    // 현재 섹션으로 다시 스크롤 (위치 보정)
    if (!isScrolling) {
      const targetPosition = sections[currentSection].offsetTop;
      window.scrollTo(0, targetPosition);
    }
  }

  // 초기화
  function init() {
    setSectionHeights();
    currentSection = findCurrentSection();

    // 첫 번째 섹션에 active 클래스 추가
    if (sections[currentSection]) {
      sections[currentSection].classList.add('active');
    }

    // 첫 번째 섹션이 section-01이면 header에 bg-trans 클래스 추가
    const header = document.getElementById('header');
    if (header && sections[currentSection] && sections[currentSection].id === 'section-01') {
      header.classList.add('bg-trans');
    }

    // 이벤트 리스너 등록
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);

    // 모바일 터치 이벤트
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 페이지 로드시 첫 번째 섹션으로 스크롤
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
