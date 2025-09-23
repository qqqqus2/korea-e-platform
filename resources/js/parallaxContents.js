/* Container 스크롤 기반 페이드 효과 */
(function () {
  const wrap = document.querySelector('#wrap');
  const sections = document.querySelectorAll('.container'); // footer 제외
  const header = document.getElementById('header');

  // overflow-hidden 제거하여 스크롤 가능하게
  wrap.classList.remove('overflow-hidden');

  // 각 섹션의 애니메이션 실행 상태 추적
  const sectionAnimationState = new Map();

  // 초기 애니메이션 완료 여부
  let initialAnimationComplete = false;

  // 스크롤 이벤트 핸들러
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionCenter = sectionTop + sectionHeight / 2;

      if (section.id === 'section-01') {
        // 초기 애니메이션이 완료된 후에만 스크롤 효과 적용
        if (initialAnimationComplete) {
          // section-01은 스크롤이 시작되면 fade out + 위로 이동
          let progress = scrollTop / (sectionHeight * 0.7);
          progress = Math.min(1, progress);

          let opacity = 1 - progress;
          opacity = Math.max(0, opacity);

          // 위로 이동하며 사라지는 효과
          let translateY = -50 * progress; // 최대 -50px까지 이동
          let scale = 1 - 0.05 * progress; // 살짝 축소

          section.style.opacity = opacity;
          section.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
      } else {
        // 섹션의 중앙이 화면 중앙에서 얼마나 떨어져 있는지 계산
        const distanceFromCenter = Math.abs(scrollTop + windowHeight / 2 - sectionCenter);

        // opacity 1을 유지하는 구간을 더 길게 설정 (화면 높이의 40% 범위)
        const fadeZone = windowHeight * 0.3; // 페이드 영역을 줄임 (빠른 전환)
        const fullOpacityZone = windowHeight * 0.4; // opacity 1 유지 구간

        let opacity = 1;

        if (distanceFromCenter > fullOpacityZone) {
          // fullOpacityZone을 벗어난 거리만큼 페이드
          const fadeDistance = distanceFromCenter - fullOpacityZone;
          opacity = 1 - fadeDistance / fadeZone;
          opacity = Math.max(0, Math.min(1, opacity));

          // 더 급격한 페이드 커브 적용
          opacity = Math.pow(opacity, 2);
        }

        // 등장/퇴장 애니메이션
        let translateY = 0;
        let scale = 1;
        let rotate = 0;

        if (scrollTop + windowHeight / 2 < sectionCenter) {
          // 섹션이 아래에 있을 때 (등장 전)
          const animProgress = 1 - opacity;
          translateY = 150 * animProgress; // 더 큰 이동 거리
          scale = 0.9 + 0.1 * opacity; // 더 작은 크기에서 시작
        } else if (distanceFromCenter > fullOpacityZone) {
          // 섹션이 위로 지나갈 때 (퇴장)
          const animProgress = 1 - opacity;
          translateY = -80 * animProgress; // 더 큰 이동 거리
          scale = 1 + 0.1 * animProgress; // 더 큰 축소
          // rotate = -5 * animProgress; // 더 큰 회전
        }

        section.style.opacity = opacity;
        section.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;

        // opacity가 1이 되면 fadeInUp 애니메이션 실행
        if (opacity >= 0.99 && !sectionAnimationState.get(section)) {
          // common.js의 applyFadeInUpAnimation 함수 사용
          if (typeof applyFadeInUpAnimation === 'function') {
            applyFadeInUpAnimation(section);
          }
          sectionAnimationState.set(section, true);
        } else if (opacity < 0.5 && sectionAnimationState.get(section)) {
          // opacity가 0.5 이하로 떨어지면 애니메이션 리셋
          if (typeof resetAnimations === 'function') {
            resetAnimations(section);
          }
          sectionAnimationState.set(section, false);
        }
      }

      // z-index 조정 (현재 보이는 섹션이 위에 오도록)
      const opacity = parseFloat(section.style.opacity) || 0;
      if (opacity > 0.5) {
        section.style.zIndex = 10;
      } else {
        section.style.zIndex = 5;
      }

      // section-02가 활성화되면 swiper autoplay 시작
      if (section.id === 'section-02' && opacity > 0.8) {
        if (window.strengthSwiper && window.strengthSwiper.autoplay) {
          window.strengthSwiper.autoplay.start();
        }
      } else if (section.id === 'section-02' && opacity < 0.3) {
        if (window.strengthSwiper && window.strengthSwiper.autoplay) {
          window.strengthSwiper.autoplay.stop();
        }
      }

      // Header 배경 제어 - section-01의 opacity에 따라 변경
      // if (header && section.id === 'section-01') {
      //   const section01Opacity = parseFloat(section.style.opacity) || 0;
      //   if (section01Opacity > 0.5) {
      //     header.classList.add('bg-trans');
      //     header.classList.remove('is-parallax');
      //   } else {
      //     header.classList.remove('bg-trans');
      //     header.classList.add('is-parallax');
      //   }
      // }
    });
  }

  // 디바운스 함수 (성능 최적화)
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 최적화된 스크롤 핸들러
  const optimizedScrollHandler = debounce(handleScroll, 10);

  // 창 크기 변경시 재계산
  function handleResize() {
    handleScroll();
  }

  // 초기화
  function init() {
    // 각 섹션의 기본 스타일 설정
    sections.forEach((section) => {
      section.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out'; // 더 빠른 전환
      section.style.willChange = 'opacity, transform';
    });

    // section-01 초기 애니메이션 적용
    const section01 = document.getElementById('section-01');
    if (section01) {
      // 초기 상태 설정 (숨김)
      section01.style.opacity = '0';
      section01.style.transform = 'scale(0.5)';

      // 페이지 로드 후 애니메이션 시작
      setTimeout(() => {
        section01.style.transition = 'opacity .5s ease-in, transform .5s ease-in';
        section01.style.opacity = '1';
        section01.style.transform = 'scale(1)';

        // section-01의 data-fade 요소들에도 애니메이션 적용
        if (typeof applyFadeInUpAnimation === 'function') {
          setTimeout(() => {
            applyFadeInUpAnimation(section01);
          }, 300);
        }

        // 초기 애니메이션 완료 표시
        setTimeout(() => {
          initialAnimationComplete = true;
        }, 1000);
      }, 200);
    } else {
      // section-01이 없으면 바로 완료 표시
      initialAnimationComplete = true;
    }

    // 초기 스크롤 위치에 따른 opacity 설정 (section-01 제외)
    sections.forEach((section) => {
      if (section.id !== 'section-01') {
        handleScroll();
        return;
      }
    });

    // 이벤트 리스너 등록
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    window.addEventListener('resize', handleResize);

    // 페이지 로드시 첫 번째 섹션으로 스크롤
    setTimeout(() => {
      window.scrollTo(0, 0);
      handleScroll();
    }, 100);
  }

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
