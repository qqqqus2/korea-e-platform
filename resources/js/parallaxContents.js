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

    // scrollTop이 0이면 titleVisual 초기화
    if (scrollTop === 0 && window.innerWidth >= 1025) {
      const mroVisual = document.querySelector('.mro-visual');
      if (mroVisual) {
        const titleVisual = mroVisual.querySelector('.title-visual');
        const infoBox = mroVisual.querySelector('.visual-section .info-box');

        // 변수 초기화
        mroVisualOpacity = 1;
        mroVisualTranslateY = 0;
        infoBoxTranslateY = 100;
        infoOpacity = 0;

        // titleVisual 초기 상태로 복원
        if (titleVisual) {
          titleVisual.style.transform = 'translateY(0%)';
          titleVisual.style.opacity = '1';
          titleVisual.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        }

        // info-box 초기 상태로 복원
        if (infoBox) {
          infoBox.style.transform = 'translateY(100%)';
          infoBox.style.opacity = '0';
          infoBox.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        }

        // 정상 스크롤 상태 유지
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }

    // mro-visual sticky 제어 및 title-visual, info-box 스크롤 효과
    const mroVisual = document.querySelector('.mro-visual');
    if (mroVisual) {
      const titleVisual = mroVisual.querySelector('.title-visual');
      const infoBox = mroVisual.querySelector('.visual-section .info-box');

      if (titleVisual) {
        const titleVisualHeight = titleVisual.offsetHeight;
        const mroVisualTop = mroVisual.offsetTop;

        // header height 만큼 여유를 둔 스크롤 범위 설정
        const headerHeight = header ? header.offsetHeight : 0;
        const adjustedScrollRange = titleVisualHeight + headerHeight;

        // 스크롤 위치에 따라 sticky 설정과 애니메이션
        if (scrollTop < adjustedScrollRange) {
          // 조정된 범위보다 적게 스크롤했을 때
          mroVisual.style.position = 'sticky';
          mroVisual.style.top = '0px';

          // header height 여유를 고려한 스크롤 진행도 계산
          const effectiveScroll = Math.max(0, scrollTop - headerHeight);
          const progress = effectiveScroll / titleVisualHeight; // 0 ~ 1

          // title-visual: 페이드아웃 + 위로 이동
          const titleTranslateY = -100 * progress; // 0% ~ -100%
          const titleOpacity = 1 - progress; // 1 ~ 0

          titleVisual.style.transform = `translateY(${titleTranslateY}%)`;
          titleVisual.style.opacity = titleOpacity;
          titleVisual.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';

          // info-box: 페이드인 + 아래에서 위로 이동
          if (infoBox) {
            const infoTranslateY = 100 * (1 - progress); // 100% ~ 0%
            const infoOpacity = progress; // 0 ~ 1

            infoBox.style.transform = `translateY(${infoTranslateY}%)`;
            infoBox.style.opacity = infoOpacity;
            infoBox.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';
          }
        } else {
          // 조정된 범위만큼 스크롤했을 때 sticky 제거
          //mroVisual.style.position = '';
          mroVisual.style.top = '';

          // title-visual 완전히 위로 사라진 상태로 고정
          titleVisual.style.transform = 'translateY(-100%)';
          titleVisual.style.opacity = '0';

          // info-box 완전히 나타난 상태로 고정
          if (infoBox) {
            infoBox.style.transform = 'translateY(0%)';
            infoBox.style.opacity = '1';
          }
        }
      }
    }

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionCenter = sectionTop + sectionHeight / 2;
      const isLastSection = index === sections.length - 1; // 마지막 섹션 확인

      // position-intro 요소 찾기
      const positionIntros = section.querySelectorAll('.position-intro');
      positionIntros.forEach((positionIntro) => {
        // data-delay 속성 가져오기 (기본값 0)
        const delay = parseFloat(positionIntro.dataset.delay || 0) / 1000; // ms를 초 단위로 변환

        // 섹션의 뷰포트 내 위치 계산
        const startPoint = sectionTop - windowHeight * 0.8; // 섹션이 뷰포트 하단에서 80% 위치에 올 때 시작
        const endPoint = sectionTop - windowHeight * 0.3; // 모든 요소가 같은 지점에서 끝남

        // delay를 고려한 진행도 계산 (시작점만 조정, 끝점은 동일)
        const adjustedStartPoint = startPoint + windowHeight * delay * 0.3; // delay에 따라 시작점만 조정

        let positionProgress = 0;

        if (scrollTop < adjustedStartPoint) {
          // 아직 시작 전
          positionProgress = 0;
        } else if (scrollTop >= adjustedStartPoint && scrollTop <= endPoint) {
          // 애니메이션 진행 중
          positionProgress = (scrollTop - adjustedStartPoint) / (endPoint - adjustedStartPoint);
        } else {
          // 애니메이션 완료
          positionProgress = 1;
        }

        // translateY 값 계산: -50px에서 0으로 변화
        const translateY = 150 * (1 - positionProgress);

        // opacity 값 계산: 0.5에서 1로 변화
        const opacity = 0.5 + 0.5 * positionProgress;

        // position-intro에 translateY와 opacity 적용
        positionIntro.style.transform = `translateY(${translateY}px) scale(1)`;
        positionIntro.style.opacity = opacity;
        positionIntro.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      });

      // scale-intro 요소 찾기
      const scaleIntros = section.querySelectorAll('.scale-intro');
      scaleIntros.forEach((scaleIntro) => {
        // data-delay 속성 가져오기 (기본값 0)
        const delay = parseFloat(scaleIntro.dataset.delay || 0) / 1000; // ms를 초 단위로 변환

        // 섹션의 뷰포트 내 위치 계산
        const sectionBottomFromTop = sectionTop + sectionHeight;
        const viewportCenter = scrollTop + windowHeight / 2;

        // 섹션이 뷰포트에 들어오기 시작할 때부터 30% 지점까지의 진행도
        const startPoint = sectionTop - windowHeight * 0.8; // 섹션이 뷰포트 하단에서 80% 위치에 올 때 시작
        const endPoint = sectionTop - windowHeight * 0.3; // 모든 요소가 같은 지점에서 끝남

        // delay를 고려한 진행도 계산 (시작점만 조정, 끝점은 동일)
        const adjustedStartPoint = startPoint + windowHeight * delay * 0.3; // delay에 따라 시작점만 조정

        let scaleProgress = 0;

        if (scrollTop < adjustedStartPoint) {
          // 아직 시작 전
          scaleProgress = 0;
        } else if (scrollTop >= adjustedStartPoint && scrollTop <= endPoint) {
          // 애니메이션 진행 중
          scaleProgress = (scrollTop - adjustedStartPoint) / (endPoint - adjustedStartPoint);
        } else {
          // 애니메이션 완료
          scaleProgress = 1;
        }

        // scale 값 계산: 1.5에서 1로 변화
        const scale = 1.5 - 0.5 * scaleProgress;

        // opacity 값 계산: 0.5에서 1로 변화
        const opacity = 0.5 + 0.5 * scaleProgress;

        // scale-intro에 scale과 opacity 적용
        scaleIntro.style.transform = `scale(${scale})`;
        scaleIntro.style.opacity = opacity;
        scaleIntro.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      });

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
          let scale = 1; // 살짝 축소
          section.style.opacity = opacity;
          section.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
      } else {
        // 섹션의 상단이 뷰포트 하단에서 얼마나 떨어져 있는지 계산
        const sectionDistanceFromBottom = sectionTop - (scrollTop + windowHeight);

        // 이전 섹션 높이의 절반 지점부터 다음 섹션이 나타나도록 설정
        // 마지막 섹션은 더 일찍 등장 (20% 지점)
        const triggerPoint = index > 0 ? (isLastSection ? sections[index - 1].offsetHeight * 0.2 : sections[index - 1].offsetHeight * 0.3) : 0;

        // opacity 계산을 위한 거리
        const distanceFromCenter = Math.abs(scrollTop + windowHeight / 2 - sectionCenter);

        // opacity 1을 유지하는 구간 설정
        const fadeZone = windowHeight * 0.5; // 페이드 영역을 더 길게
        const fullOpacityZone = windowHeight * 0.3; // opacity 1 유지 구간을 줄여서 더 일찍 사라지기 시작

        let opacity = 1;

        // 섹션이 트리거 포인트를 지났는지 확인 (이전 섹션의 절반 지점)
        if (sectionDistanceFromBottom > -triggerPoint) {
          // 아직 트리거 포인트에 도달하지 않음
          opacity = 0;
        } else {
          // 트리거 포인트를 지났으면 페이드인 시작
          const fadeInDistance = Math.abs(sectionDistanceFromBottom + triggerPoint);
          // 마지막 섹션은 더 빠른 페이드인
          const fadeInSpeed = isLastSection ? windowHeight * 0.15 : windowHeight * 0.3;
          opacity = Math.min(1, fadeInDistance / fadeInSpeed);
          // 마지막 섹션은 더 급격한 커브로 빠르게 나타남
          opacity = Math.pow(opacity, isLastSection ? 1 : 2);

          // 섹션이 화면을 벗어날 때 페이드아웃 (마지막 섹션 제외)
          if (!isLastSection && distanceFromCenter > fullOpacityZone) {
            const fadeDistance = distanceFromCenter - fullOpacityZone;
            const fadeOutOpacity = 1 - fadeDistance / fadeZone;
            opacity = Math.min(opacity, Math.max(0, fadeOutOpacity));
          }
        }

        // 등장/퇴장 애니메이션
        let translateY = 0;
        let scale = 1;
        let rotate = 0;

        if (opacity < 1) {
          // 섹션이 등장 중일 때
          const animProgress = 1 - opacity;
          // 마지막 섹션은 translateY를 0부터 시작
          translateY = isLastSection ? -10 : 150 * animProgress; // 마지막 섹션은 Y 이동 없음
          scale = 0.9 + 0.1 * opacity; // 더 작은 크기에서 시작
        } else if (distanceFromCenter > fullOpacityZone && !isLastSection) {
          // 섹션이 위로 지나갈 때 (퇴장) - 마지막 섹션은 제외
          const animProgress = 1 - opacity;
          translateY = -120 * animProgress; // 더 큰 이동 거리
          scale = 1 - 0.1 * animProgress; // 더 큰 축소
          // rotate = -5 * animProgress; // 더 큰 회전
        } else if (isLastSection && scrollTop + windowHeight / 2 >= sectionCenter) {
          // 마지막 섹션이 화면 중앙을 지난 후에는 transform 고정
          translateY = 0;
          scale = 1;
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

      // Header 배경 제어 - section-01의 opacity에 따라 변경 (#wrap에 main 클래스가 있을 때만)
      if (wrap.classList.contains('main') && header && section.id === 'section-01') {
        const section01Opacity = parseFloat(section.style.opacity) || 0;
        if (section01Opacity > 0.5) {
          header.classList.add('bg-trans');
          // header.classList.remove('is-parallax');
        } else {
          header.classList.remove('bg-trans');
          //header.classList.add('is-parallax');
        }
      }
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

    // 리사이즈 시 mro-visual 상태 초기화
    const mroVisual = document.querySelector('.mro-visual');
    if (mroVisual) {
      const titleVisual = mroVisual.querySelector('.title-visual');
      const infoBox = mroVisual.querySelector('.visual-section .info-box');

      if (window.innerWidth < 1025) {
        // 1025px 미만으로 변경되면 초기화
        mroVisualOpacity = 1;
        mroVisualTranslateY = 0;
        infoBoxTranslateY = 100;
        infoOpacity = 0;

        // 스타일 초기화
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        if (titleVisual) {
          titleVisual.style.transform = '';
          titleVisual.style.opacity = '';
        }

        if (infoBox) {
          infoBox.style.transform = '';
          infoBox.style.opacity = '';
        }
      } else {
        // 1025px 이상으로 변경되면 정상 상태로 설정
        if (titleVisual) {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }

        if (infoBox) {
          infoBox.style.transform = '';
          infoBox.style.opacity = '';
        }
      }
    }
  }

  // 마우스 휠 이벤트 핸들러 (단순화됨)

  // 초기화
  function init() {
    // wrap에 main 클래스가 있으면 header에 bg-trans 추가
    if (wrap.classList.contains('main') && header) {
      header.classList.add('bg-trans');
    }

    // mro-visual 초기 상태 설정
    const mroVisual = document.querySelector('.mro-visual');
    if (mroVisual) {
      const titleVisual = mroVisual.querySelector('.title-visual');
      const infoBox = mroVisual.querySelector('.visual-section .info-box');

      // 정상 스크롤 상태로 설정
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      if (titleVisual) {
        titleVisual.style.transform = '';
        titleVisual.style.opacity = '';
      }

      if (infoBox) {
        infoBox.style.transform = '';
        infoBox.style.opacity = '';
      }
    }

    // 각 섹션의 기본 스타일 설정
    sections.forEach((section) => {
      section.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
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

    // 스크롤 다운 버튼 이벤트 등록 (mro-visual 전용)
    const scrollDownBtn = document.querySelector('.scroll-down');
    if (scrollDownBtn) {
      // 기존 jQuery 이벤트와 충돌 방지를 위해 capture phase에서 실행
      scrollDownBtn.addEventListener(
        'click',
        function (e) {
          // 첫 번째 섹션이 mro-visual인지 확인
          const firstSection = sections[0];
          if (firstSection && firstSection.classList.contains('mro-visual')) {
            e.preventDefault();
            e.stopImmediatePropagation(); // 다른 이벤트 리스너 중단

            const titleVisual = firstSection.querySelector('.title-visual');
            if (titleVisual) {
              const titleVisualHeight = titleVisual.offsetHeight - header.offsetHeight;

              // title-visual 높이만큼만 스크롤
              window.scrollTo({
                top: titleVisualHeight,
                behavior: 'smooth'
              });

              console.log('mro-visual scroll down:', titleVisualHeight);
            }
          }
          // mro-visual이 아닌 경우에는 이벤트를 전파하여 common.js에서 처리하도록 함
        },
        true
      ); // capture phase에서 실행
    }

    // 이벤트 리스너 등록
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    window.addEventListener('resize', handleResize);

    // 페이지 로드시 첫 번째 섹션으로 스크롤
    setTimeout(() => {
      window.scrollTo(0, 0);
      handleScroll();
    }, 300);
  }

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // HTML 요소의 scrollTop을 0으로 초기화
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // 일부 브라우저 호환성
      window.scrollTo(0, 0);

      // init 함수 실행
      init();
    });
  } else {
    // HTML 요소의 scrollTop을 0으로 초기화
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // 일부 브라우저 호환성
    window.scrollTo(0, 0);

    init();
  }
})();
