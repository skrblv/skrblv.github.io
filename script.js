document.addEventListener("DOMContentLoaded", () => {
    // --- Анимация появления элементов ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(element => observer.observe(element));

    // --- ЛОГИКА ДЛЯ ИНТЕРАКТИВНОЙ ХРОНИКИ (ИСПРАВЛЕННЫЙ ВАРИАНТ) ---
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
            if (video) video.play().catch(e => {});
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
                wrappers.zsjl.style.opacity = 0;
                vignetteLeft.style.width = '0%';
                vignetteRight.style.width = '0%';

                // Центрирование текста — сбрасываем отступы
                wrappers.zsjl.style.paddingLeft = '0%';
                wrappers.zsjl.style.paddingRight = '0%';
            } else {
                const phaseProgress = (progress - 0.5) / 0.5;
                videos.bvs.style.opacity = 1 - phaseProgress;
                wrappers.bvs.style.opacity = 1 - phaseProgress;
                wrappers.zsjl.style.opacity = phaseProgress;
                videos.mos.style.opacity = 0;
                wrappers.mos.style.opacity = 0;

                const barWidth = phaseProgress * 13.75;
                vignetteLeft.style.width = `${barWidth}%`;
                vignetteRight.style.width = `${barWidth}%`;

                // Заменили width на отступы — теперь текст по центру
                wrappers.zsjl.style.paddingLeft = `${barWidth}%`;
                wrappers.zsjl.style.paddingRight = `${barWidth}%`;
            }

            wrappers.mos.style.zIndex = (wrappers.mos.style.opacity > 0.5) ? 10 : 5;
            wrappers.bvs.style.zIndex = (wrappers.bvs.style.opacity > 0.5) ? 10 : 5;
            wrappers.zsjl.style.zIndex = (wrappers.zsjl.style.opacity > 0.5) ? 10 : 5;
        };
        window.addEventListener('scroll', handleLegacyScroll);
    }

    // --- ЛОГИКА ДЛЯ УПРАВЛЕНИЯ ФОНОВОЙ МУЗЫКОЙ ---
    const audioSections = document.querySelectorAll('.audio-section');
    const audios = {
        song1: document.getElementById('audio-song1'),
        song2: document.getElementById('audio-song2'),
        song3: document.getElementById('audio-song3'),
        song4: document.getElementById('audio-song4'),
        song5: document.getElementById('audio-song5')
    };

    let activeAudioKey = null;
    let audioFadeIntervals = {};
    const targetVolume = 0.5;
    const fadeDuration = 1000;

    const fadeAudio = (audioKey, toVolume) => {
        const audio = audios[audioKey];
        if (!audio) return;

        clearInterval(audioFadeIntervals[audioKey]);

        if (toVolume > 0 && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(e => {});
        }

        const fromVolume = audio.volume;
        const steps = 50;
        const stepTime = fadeDuration / steps;
        const volumeChange = (toVolume - fromVolume) / steps;

        let currentStep = 0;
        audioFadeIntervals[audioKey] = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(0, Math.min(1, audio.volume + volumeChange));
            if (currentStep >= steps) {
                clearInterval(audioFadeIntervals[audioKey]);
                audio.volume = toVolume;
                if (toVolume === 0) audio.pause();
            }
        }, stepTime);
    };

    const handleAudioScroll = () => {
        let minDistance = Infinity;
        let dominantSectionKey = null;

        audioSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - window.innerHeight / 2);
            if (distance < minDistance) {
                minDistance = distance;
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
    window.addEventListener('scroll', handleAudioScroll);

    const unlockAudio = () => {
        Object.values(audios).forEach(audio => {
            audio.play().then(() => audio.pause()).catch(e => {});
        });
        document.body.removeEventListener('click', unlockAudio);
    };
    document.body.addEventListener('click', unlockAudio);
});
