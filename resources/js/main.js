/* main ui */
let $mainBanner;
let activeBullet;
function mainUI() {
  /* 메인 배너 스와이퍼(영상 제어 포함) - 시작 */
  let videoPlayStatus = 'PAUSE';
  let timeout = null;
  let waiting = 5000; // swiper autoplay를 쓰지 못하기 때문에 따로 여기서 지정
  const swiperBanner = document.querySelector('.main-banner');
  const player = videojs('bannerVideo');

  // Video.js 플레이어 스타일 적용
  function setVideoStyles() {
    // Video.js는 원본 video 요소를 div로 감싸므로 플레이어 준비 후 스타일 적용
    const videoWrapper = document.querySelector('.video-js');
    const videoTech = document.querySelector('.vjs-tech');

    if (videoWrapper && videoTech) {
      // 화면 너비에 맞춰 비디오 크기 조정
      const screenWidth = window.innerWidth;
      const videoWidth = 3840;

      // Video.js 래퍼 스타일
      videoWrapper.style.width = '100%';
      videoWrapper.style.height = '100%';

      // 실제 video 요소 스타일
      if (screenWidth < videoWidth) {
        // 화면이 비디오보다 작을 때 - 화면에 꽉 차도록
        videoTech.style.width = '100%';
        videoTech.style.height = '100%';
        videoTech.style.objectFit = 'cover';
        videoTech.style.objectPosition = 'center center';
      } else {
        // 화면이 비디오보다 클 때
        videoTech.style.width = '100%';
        videoTech.style.height = '100%';
        videoTech.style.objectFit = 'contain';
        videoTech.style.objectPosition = 'center center';
      }
    }
  }

  let swiperInitialized = false;

  function initializeSwiper() {
    if (swiperInitialized) return; // 초기화되었다면 다시 초기화 안함

    $mainBanner = new Swiper('.main-banner', {
      loop: true,
      allowTouchMove: false,
      allowSlideNext: true,
      allowSlidePrev: false,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      preventInteractionOnTransition: false,
      pagination: {
        el: '.swiper-pagination',
        clickable: false,
        renderBullet: function (index, className) {
          return '<span class="' + className + '" data-index="' + index + '"><em>' + (index + 1) + '</em><strong class="progressbar"><i class="progress"></i></strong></span>';
        },
        type: 'bullets'
      },

      on: {
        init() {
          clearTimeout(timeout);
          player.currentTime(0);
          player.play();
          videoPlayStatus = 'PLAYING';

          const activeBullet = document.querySelector('.swiper-pagination-bullet-active .progress');
          if (activeBullet) {
            activeBullet.style.width = '0%';
            setTimeout(function () {
              activeBullet.style.width = '100%';
            }, 100);
          }
        },
        slideChangeTransitionStart() {
          let index = $mainBanner.activeIndex;
          let currentSlide = $($mainBanner.slides[index]);
          let currentSlideType = currentSlide.data('slide-type');
          const activeBullet = document.querySelector('.swiper-pagination-bullet-active .progress');
          if (activeBullet) {
            activeBullet.style.width = '0%';
          }

          if (videoPlayStatus === 'PLAYING') {
            player.pause();
          }

          clearTimeout(timeout);

          switch (currentSlideType) {
            case 'img':
              runNext();
              break;
            case 'vdo':
              player.currentTime(0);
              player.play();
              videoPlayStatus = 'PLAYING';
              break;
            default:
              throw new Error('Invalid slide type');
          }
        },
        slideChangeTransitionEnd() {
          const activeBullet = document.querySelector('.swiper-pagination-bullet-active .progress');
          if (activeBullet) {
            activeBullet.style.width = '100%';
          }
        }
      }
    });

    swiperInitialized = true; // Swiper 초기화
  }

  function handleVideoEnded() {
    next();
  }

  function next() {
    if (!swiperBanner.classList.contains('pause')) {
      $mainBanner.slideNext();
    }
  }

  function runNext() {
    timeout = setTimeout(function () {
      next();
    }, waiting);
  }

  // 비디오 플레이어 준비가 완료되면 실행될 함수
  $(document).ready(function () {
    player.ready(function () {
      setVideoStyles(); // 비디오 스타일 적용
      initializeSwiper();
      player.on('ended', handleVideoEnded);

      // 첫 번째 슬라이드가 이미지면 타이머 시작
      setTimeout(() => {
        let currentSlide = $($mainBanner.slides[$mainBanner.activeIndex]);
        let currentSlideType = currentSlide.data('slide-type');
        if (currentSlideType === 'img') {
          runNext();
        }
      }, 1000);

      // 화면 크기 변경 시 비디오 스타일 재적용
      $(window).on('resize', function () {
        setVideoStyles();
      });
    });
  });

  const controlSwiper = document.querySelector('.swiper-control');
  if (controlSwiper) {
    controlSwiper.addEventListener('click', function () {
      swiperBanner.classList.toggle('pause');

      // 일시정지 상태
      if (swiperBanner.classList.contains('pause')) {
        // 비디오가 재생 중이면 일시정지
        if (videoPlayStatus === 'PLAYING') {
          player.pause();
          videoPlayStatus = 'PAUSED';
        }
        // 자동 슬라이드 타이머 제거
        clearTimeout(timeout);
      } else {
        // 재생 상태
        let index = $mainBanner.activeIndex;
        let currentSlide = $($mainBanner.slides[index]);
        let currentSlideType = currentSlide.data('slide-type');

        // 현재 슬라이드가 비디오인 경우
        if (currentSlideType === 'vdo' && videoPlayStatus === 'PAUSED') {
          player.play();
          videoPlayStatus = 'PLAYING';
        } else if (currentSlideType === 'img') {
          // 이미지 슬라이드인 경우 타이머 재시작
          runNext();
        }
      }
    });
  }
  /* 메인 배너 스와이퍼(영상 제어 포함) - 끝 */

  /* strength-list 스와이퍼 - 시작 */
  $(document).ready(function () {
    const strengthSwiper = new Swiper('.strength-list', {
      slidesPerView: 'auto',
      spaceBetween: 0,
      centeredSlides: true,
      loop: true,
      loopFillGroupWithBlank: false,
      speed: 600,
      grabCursor: true,
      observer: true,
      observeParents: true
    });
  });
  /* strength-list 스와이퍼 - 끝 */
}
mainUI();

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
        section.style.height = '100vh';
        section.style.overflow = 'hidden';
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
      } else {
        header.classList.remove('bg-trans');
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
