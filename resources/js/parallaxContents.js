/* Container 패럴렉스 스크롤 */
(function () {
  let isScrolling = false;
  let parallaxEnabled = true;
  let currentSection = 0;
  const wrap = document.querySelector('#wrap');
  const sections = document.querySelectorAll('.container, #footer');
  const totalSections = sections.length;
  wrap.classList.add('overflow-hidden');
  // 각 섹션의 높이를 100vh로 설정
  function setSectionHeights() {
    sections.forEach((section) => {
      if (section.classList.contains('container')) {
        // 먼저 높이를 설정
        section.style.height = '100vh';

        // 임시로 overflow를 visible로 설정하여 실제 컨텐츠 높이 측정
        const originalOverflow = section.style.overflow;
        section.style.overflow = 'visible';

        // 모든 자식 요소들의 실제 높이 계산
        let totalHeight = 0;
        const children = section.children;

        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const rect = child.getBoundingClientRect();
          const styles = window.getComputedStyle(child);
          const marginTop = parseInt(styles.marginTop);
          const marginBottom = parseInt(styles.marginBottom);
          totalHeight += rect.height + marginTop + marginBottom;
        }

        // 패딩 추가
        const sectionStyles = window.getComputedStyle(section);
        const paddingTop = parseInt(sectionStyles.paddingTop);
        const paddingBottom = parseInt(sectionStyles.paddingBottom);
        totalHeight += paddingTop + paddingBottom;

        const viewportHeight = window.innerHeight;

        console.log(`Section ${section.id}: total content height = ${totalHeight}px, viewport = ${viewportHeight}px`);

        // 컨텐츠가 뷰포트보다 큰 경우 스크롤 설정
        if (totalHeight > viewportHeight + 50) {
          // 50px 여유를 둠
          section.style.overflowY = 'auto';
          section.style.overflowX = 'hidden';
        }

        // 디버깅: 현재 섹션의 클래스 목록 출력
        console.log(`${section.id} classes:`, section.classList.toString());
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

  // fadeInUp 애니메이션 적용 함수
  function applyFadeInUpAnimation(section) {
    // fadeInUp 클래스를 적용할 요소들을 선택 (data-fade 속성을 가진 요소들)
    const fadeElements = section.querySelectorAll('[data-fade]');

    fadeElements.forEach((element, index) => {
      // 기존 애니메이션 클래스 제거
      element.classList.remove('fadeInUp', 'animated');

      // 지연 시간 설정 (순차적 애니메이션을 위해)
      const delay = element.getAttribute('data-fade-delay') || index * 100;

      setTimeout(() => {
        element.classList.add('animated', 'fadeInUp');
      }, delay);
    });

    // data-fade 속성이 없는 경우, 섹션 전체에 적용
    if (fadeElements.length === 0) {
      section.classList.add('animated', 'fadeInUp');
    }
  }

  // 애니메이션 초기화 함수
  function resetAnimations(section) {
    const fadeElements = section.querySelectorAll('[data-fade]');
    fadeElements.forEach((element) => {
      element.classList.remove('fadeInUp', 'animated');
    });
    section.classList.remove('fadeInUp', 'animated');
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

    // section-02가 active 되면 swiper autoplay 시작
    if (targetSection.id === 'section-02') {
      // window 객체에서 strengthSwiper 접근
      if (window.strengthSwiper && window.strengthSwiper.autoplay) {
        console.log('Starting autoplay for section-02');
        window.strengthSwiper.autoplay.start();
      }
    } else {
      // 다른 섹션으로 이동시 autoplay 정지
      if (window.strengthSwiper && window.strengthSwiper.autoplay) {
        console.log('Stopping autoplay');
        window.strengthSwiper.autoplay.stop();
      }
    }

    // 모든 섹션에서 클래스 초기화 및 애니메이션 리셋
    sections.forEach((section, i) => {
      section.classList.remove('active', 'prev', 'next', 'footer-visible');
      resetAnimations(section);

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

      // active 섹션에 fadeInUp 애니메이션 적용
      setTimeout(() => {
        applyFadeInUpAnimation(targetSection);
      }, 100);

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
    if (!parallaxEnabled) {
      return; // parallax가 비활성화되면 기본 스크롤 동작 허용
    }

    if (isScrolling) {
      e.preventDefault();
      return;
    }

    const activeSection = sections[currentSection];
    const delta = e.deltaY || e.wheelDelta * -1;

    // 디버깅: 현재 섹션 정보 출력
    console.log(`Current section: ${activeSection.id}, has scrollable: ${activeSection.classList.contains('scrollable-section')}`);
    console.log(`Section classes: ${activeSection.classList.toString()}`);

    // 현재 섹션이 스크롤 가능한지 확인
    if (activeSection && activeSection.classList.contains('scrollable-section')) {
      const scrollTop = activeSection.scrollTop;
      const scrollHeight = activeSection.scrollHeight;
      const clientHeight = activeSection.clientHeight;
      const isAtTop = scrollTop <= 1;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      console.log(`Scrollable section detected!`);
      console.log(`Scroll: top=${scrollTop}, height=${scrollHeight}, client=${clientHeight}, atTop=${isAtTop}, atBottom=${isAtBottom}`);

      // 섹션 내부에서 스크롤 중이면 기본 동작 허용
      if (delta > 0 && !isAtBottom) {
        // 아래로 스크롤 중이고 바닥에 도달하지 않음
        console.log('섹션 내부 아래로 스크롤 - 기본 스크롤 허용');
        // preventDefault 호출하지 않음 - 기본 스크롤 허용
        return;
      } else if (delta < 0 && !isAtTop) {
        // 위로 스크롤 중이고 상단에 도달하지 않음
        console.log('섹션 내부 위로 스크롤 - 기본 스크롤 허용');
        // preventDefault 호출하지 않음 - 기본 스크롤 허용
        return;
      }
    } else {
      console.log('Not a scrollable section');
    }

    // 섹션 전환이 필요한 경우에만 preventDefault
    e.preventDefault();

    if (delta > 0) {
      // 아래로 스크롤
      if (currentSection < totalSections - 1) {
        console.log('다음 섹션으로 이동');
        scrollToSection(currentSection + 1);
      }
    } else {
      // 위로 스크롤
      if (currentSection > 0) {
        console.log('이전 섹션으로 이동');
        scrollToSection(currentSection - 1);
      }
    }
  }

  // 키보드 이벤트 핸들러 (Page Up/Down, 화살표 키)
  function handleKeydown(e) {
    if (!parallaxEnabled) return;
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
  let touchStartScrollTop = 0;

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    const activeSection = sections[currentSection];
    if (activeSection && activeSection.classList.contains('container')) {
      touchStartScrollTop = activeSection.scrollTop;
    }
  }

  function handleTouchEnd(e) {
    touchEndY = e.changedTouches[0].clientY;

    if (!parallaxEnabled) return;
    if (isScrolling) return;

    const activeSection = sections[currentSection];
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    // 현재 섹션이 스크롤 가능한지 확인
    if (activeSection && activeSection.classList.contains('container')) {
      const hasScroll = activeSection.scrollHeight > activeSection.clientHeight;

      if (hasScroll) {
        const scrollTop = activeSection.scrollTop;
        const scrollHeight = activeSection.scrollHeight;
        const clientHeight = activeSection.clientHeight;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        // 섹션 내부에서 스크롤 중이면 기본 동작 허용
        if (swipeDistance > 0 && !isAtBottom) {
          // 위로 스와이프 (아래로 스크롤) 중이고 바닥에 도달하지 않음
          return;
        } else if (swipeDistance < 0 && !isAtTop) {
          // 아래로 스와이프 (위로 스크롤) 중이고 상단에 도달하지 않음
          return;
        }
      }
    }

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

  // 수동으로 스크롤 가능한 섹션 설정 (테스트용)
  window.setScrollableSection = function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('scrollable-section');
      section.style.overflowY = 'auto';
      section.style.overflowX = 'hidden';
      console.log(`${sectionId} is manually set as scrollable`);
      console.log(`Classes: ${section.classList.toString()}`);
    }
  };

  // Parallax 비활성화
  window.disableParallax = function () {
    parallaxEnabled = false;
    wrap.classList.remove('overflow-hidden');
    console.log('Parallax disabled');
  };

  // Parallax 활성화
  window.enableParallax = function () {
    parallaxEnabled = true;
    wrap.classList.add('overflow-hidden');
    console.log('Parallax enabled');
  };

  // 초기화
  function init() {
    setSectionHeights();
    currentSection = findCurrentSection();

    // 첫 번째 섹션에 active 클래스 추가
    if (sections[currentSection]) {
      sections[currentSection].classList.add('active');
    }

    // 페이지 로드 후 섹션 높이 재계산 (DOM이 완전히 로드된 후)
    setTimeout(() => {
      setSectionHeights();

      // 테스트: 특정 섹션을 강제로 스크롤 가능하게 설정
      // 예: section-03이 컨텐츠가 많은 경우
      // window.setScrollableSection('section-03');
    }, 1000);

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
