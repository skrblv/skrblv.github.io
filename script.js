document.addEventListener("DOMContentLoaded", () => {
    // --- Анимация появления элементов (работает на всех устройствах) ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(element => observer.observe(element));

    // --- ЛОГИКА ДЛЯ ИНТЕРАКТИВНОЙ ХРОНИКИ (РАБОТАЕТ ВЕЗДЕ) ---
    const legacySection = document.querySelector('.legacy-section');
    if (legacySection) {
        const videos = {
            mos: document.querySelector('.legacy-video.mos'),
            bvs: document.querySelector('.legacy-video.bvs'),
            zsjl: document.querySelector('.legacy-video.zsjl')
        };
        const wrappers = {
            mos: document.querySelector('.legacy-content-wrapper.mos'),
            bvs: document.querySelector('.legacy-content-wrapper.bvs'),
            zsjl: document.querySelector('.legacy-content-wrapper.zsjl')
        };
        const vignetteLeft = document.querySelector('.vignette-bar.left');
        const vignetteRight = document.querySelector('.vignette-bar.right');

        Object.values(videos).forEach(video => {
            if (video) video.play().catch(e => console.error("Video play failed:", e));
        });

        const handleLegacyScroll = () => {
            const rect = legacySection.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) return;

            const scrollableHeight = rect.height - window.innerHeight;
            const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));

            if (progress <= 0.5) {
                const phaseProgress = progress / 0.5;
                videos.mos.style.opacity = 1 - phaseProgress;
                wrappers.mos.style.opacity = 1 - phaseProgress;
                videos.bvs.style.opacity = phaseProgress;
                wrappers.bvs.style.opacity = phaseProgress;
                videos.zsjl.style.opacity = 0;
                wrappers.zsjl.style.opacity = 0;
                vignetteLeft.style.width = '0%';
                vignetteRight.style.width = '0%';
                wrappers.zsjl.style.paddingLeft = '0%';
                wrappers.zsjl.style.paddingRight = '0%';
            } else {
                const phaseProgress = (progress - 0.5) / 0.5;
                videos.bvs.style.opacity = 1 - phaseProgress;
                wrappers.bvs.style.opacity = 1 - phaseProgress;
                
                // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
                videos.zsjl.style.opacity = phaseProgress; // Добавлена эта строка
                wrappers.zsjl.style.opacity = phaseProgress;
                
                videos.mos.style.opacity = 0;
                wrappers.mos.style.opacity = 0;
                
                const barWidth = phaseProgress * 13.75;
                vignetteLeft.style.width = `${barWidth}%`;
                vignetteRight.style.width = `${barWidth}%`;
                wrappers.zsjl.style.paddingLeft = `${barWidth}%`;
                wrappers.zsjl.style.paddingRight = `${barWidth}%`;
            }

            wrappers.mos.style.zIndex = (wrappers.mos.style.opacity > 0.5) ? 10 : 5;
            wrappers.bvs.style.zIndex = (wrappers.bvs.style.opacity > 0.5) ? 10 : 5;
            wrappers.zsjl.style.zIndex = (wrappers.zsjl.style.opacity > 0.5) ? 10 : 5;
        };
        window.addEventListener('scroll', handleLegacyScroll, { passive: true });
    }

    // --- ЛОГИКА ДЛЯ УПРАВЛЕНИЯ ФОНОВОЙ МУЗЫКОЙ (Адаптированная) ---
    const audioSections = document.querySelectorAll('.audio-section');
    const audios = {
        song1: document.getElementById('audio-song1'),
        song2: document.getElementById('audio-song2'),
        song3: document.getElementById('audio-song3'),
        song4: document.getElementById('audio-song4'),
        song5: document.getElementById('audio-song5')
    };
    const audioModalOverlay = document.getElementById('audio-modal-overlay');
    const enableAudioBtn = document.getElementById('enable-audio-btn');

    let activeAudioKey = null;
    let audioFadeIntervals = {};
    const targetVolume = 0.5;
    const fadeDuration = 1000;
    let audioUnlocked = false;

    const fadeAudio = (audioKey, toVolume) => {
        const audio = audios[audioKey];
        if (!audio || !audioUnlocked) return;

        clearInterval(audioFadeIntervals[audioKey]);

        if (toVolume > 0 && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play was interrupted."));
        }

        const fromVolume = audio.volume;
        const steps = 50;
        const stepTime = fadeDuration / steps;
        const volumeChange = (toVolume - fromVolume) / steps;

        let currentStep = 0;
        audioFadeIntervals[audioKey] = setInterval(() => {
            currentStep++;
            let newVolume = fromVolume + volumeChange * currentStep;
            
            if (newVolume < 0) newVolume = 0;
            if (newVolume > 1) newVolume = 1;
            
            audio.volume = newVolume;

            if (currentStep >= steps) {
                clearInterval(audioFadeIntervals[audioKey]);
                audio.volume = toVolume;
                if (toVolume === 0) {
                    audio.pause();
                }
            }
        }, stepTime);
    };

    const handleAudioScroll = () => {
        if (!audioUnlocked) return;

        let dominantSectionKey = null;
        let maxVisibleArea = 0;

        audioSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const visibleArea = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
            
            if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                dominantSectionKey = section.dataset.audio;
            }
        });

        if (dominantSectionKey && dominantSectionKey !== activeAudioKey) {
            const oldAudioKey = activeAudioKey;
            activeAudioKey = dominantSectionKey;

            if (oldAudioKey) fadeAudio(oldAudioKey, 0);
            fadeAudio(activeAudioKey, targetVolume);
        }
    };
    
    const unlockAndStartAudio = () => {
        if (audioUnlocked) return;
        audioUnlocked = true;

        Object.values(audios).forEach(audio => {
            if(audio) {
              audio.volume = 0;
              audio.play().catch(e => {});
              audio.pause();
            }
        });
        
        if(audioModalOverlay) {
          audioModalOverlay.style.opacity = '0';
          setTimeout(() => {
            audioModalOverlay.style.display = 'none';
          }, 300);
        }

        window.addEventListener('scroll', handleAudioScroll, { passive: true });
        handleAudioScroll();
    };

    if (enableAudioBtn) {
        enableAudioBtn.addEventListener('click', unlockAndStartAudio);
    }
});
