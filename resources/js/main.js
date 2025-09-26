/* main ui */
let $mainBanner;
let activeBullet; // 메인 프로그래스

function mainUI() {
  /* 메인 배너 스와이퍼(영상 제어 포함) - 시작 */
  let videoPlayStatus = 'PAUSE';
  let timeout = null;
  let waiting = 8000; // swiper autoplay를 쓰지 못하기 때문에 따로 여기서 지정
  const swiperBanner = document.querySelector('.main-banner');
  const player = videojs('bannerVideo');
  const playerBottom = videojs('bottomVideo');

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
    playerBottom.ready(function () {
      // loop 설정
      playerBottom.loop(true);
      playerBottom.play();
    });

    player.ready(function () {
      setVideoStyles(); // 비디오 스타일 적용
      initializeSwiper();
      player.on('ended', handleVideoEnded);

      // 첫 번째 슬라이드가 이미지면 타이머 시작
      setTimeout(() => {
        let currentSlide = $($mainBanner.slides[$mainBanner.activeIndex]);
        let currentSlideType = currentSlide.data('slide-type');
        if (currentSlideType === 'img') {
          // runNext();
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
}
// strength-list의 list-box 클릭 이벤트
function initStrengthList() {
  const strengthList = document.querySelector('.strength-list');
  if (!strengthList) return;

  const listBoxes = strengthList.querySelectorAll('.list-box');

  // resize 이벤트 핸들러
  function handleResize() {
    if (window.innerWidth > 1300) {
      // 1024 초과일 때: 모든 increase 삭제 후 첫 번째에만 추가
      listBoxes.forEach((item) => {
        item.classList.remove('increase');
      });
      if (listBoxes[0]) {
        listBoxes[0].classList.add('increase');
      }
    } else {
      // 1024 이하일 때: 모든 listBoxes에서 increase 클래스 제거
      listBoxes.forEach((item) => {
        item.classList.remove('increase');
        item.classList.remove('decrease');
      });
    }
  }

  // 초기 실행
  handleResize();

  // resize 이벤트 리스너 추가
  window.addEventListener('resize', handleResize);

  // 클릭 이벤트
  listBoxes.forEach((box) => {
    box.addEventListener('click', function () {
      // 1024px 초과일 때만 increase 클래스 추가
      if (window.innerWidth > 1024) {
        // 모든 list-box에서 increase 클래스 제거
        listBoxes.forEach((item) => {
          item.classList.remove('increase');
        });

        // 클릭한 list-box에 increase 클래스 추가
        this.classList.add('increase');
      }
    });
  });
}
mainUI();
initStrengthList();
