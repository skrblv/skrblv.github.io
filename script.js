document.addEventListener("DOMContentLoaded", () => {
    
    // --- АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        threshold: 0.1 // Элемент считается видимым при появлении на 10%
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // --- ЛОГИКА ДЛЯ ИНТЕРАКТИВНОЙ ХРОНИКИ "НАСЛЕДИЕ" ---
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

        // Запускаем все видео, чтобы они были готовы к показу
        Object.values(videos).forEach(video => {
            if (video) video.play().catch(e => console.log("Video play failed:", e));
        });

        const handleLegacyScroll = () => {
            const rect = legacySection.getBoundingClientRect();
            // Не производим вычислений, если секция не на экране
            if (rect.top > window.innerHeight || rect.bottom < 0) return;

            const scrollableHeight = rect.height - window.innerHeight;
            const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));

            if (progress <= 0.5) { // Первая фаза: от MoS к BvS
                const phaseProgress = progress / 0.5;
                videos.mos.style.opacity = 1 - phaseProgress;
                wrappers.mos.style.opacity = 1 - phaseProgress;
                videos.bvs.style.opacity = phaseProgress;
                wrappers.bvs.style.opacity = phaseProgress;
                wrappers.zsjl.style.opacity = 0; // Скрываем третий блок
                
                vignetteLeft.style.width = '0%';
                vignetteRight.style.width = '0%';
                wrappers.zsjl.style.paddingLeft = '0%';
                wrappers.zsjl.style.paddingRight = '0%';
            } else { // Вторая фаза: от BvS к ZSJL с виньеткой
                const phaseProgress = (progress - 0.5) / 0.5;
                videos.bvs.style.opacity = 1 - phaseProgress;
                wrappers.bvs.style.opacity = 1 - phaseProgress;
                wrappers.zsjl.style.opacity = phaseProgress;
                videos.mos.style.opacity = 0; // Скрываем первый блок
                wrappers.mos.style.opacity = 0;

                const barWidth = phaseProgress * 13.75; // Ширина черных полос
                vignetteLeft.style.width = `${barWidth}%`;
                vignetteRight.style.width = `${barWidth}%`;

                // Используем padding для центрирования текста, а не width
                wrappers.zsjl.style.paddingLeft = `${barWidth}%`;
                wrappers.zsjl.style.paddingRight = `${barWidth}%`;
            }
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
    const targetVolume = 0.5; // Целевая громкость музыки
    const fadeDuration = 1000; // Длительность затухания/появления (в мс)

    // Функция плавного изменения громкости
    const fadeAudio = (audioKey, toVolume) => {
        const audio = audios[audioKey];
        if (!audio) return;

        clearInterval(audioFadeIntervals[audioKey]);

        if (toVolume > 0 && audio.paused) {
            audio.currentTime = 0; // Начинаем трек заново
            audio.play().catch(e => console.log("Audio play failed:", e));
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
                if (toVolume === 0) audio.pause(); // Ставим на паузу при полной тишине
            }
        }, stepTime);
    };

    // Отслеживание скролла для смены музыки
    const handleAudioScroll = () => {
        let minDistance = Infinity;
        let dominantSectionKey = null;

        audioSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Находим секцию, чей центр ближе всего к центру экрана
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - window.innerHeight / 2);

            if (distance < minDistance) {
                minDistance = distance;
                dominantSectionKey = section.dataset.audio;
            }
        });

        // Если доминантная секция сменилась
        if (dominantSectionKey && dominantSectionKey !== activeAudioKey) {
            const oldAudioKey = activeAudioKey;
            activeAudioKey = dominantSectionKey;

            if (oldAudioKey) fadeAudio(oldAudioKey, 0); // Плавно выключаем старый трек
            fadeAudio(activeAudioKey, targetVolume); // Плавно включаем новый
        }
    };
    
    // -- УЛУЧШЕННАЯ ЛОГИКА РАЗБЛОКИРОВКИ АУДИО ДЛЯ ДЕСКТОПА И МОБИЛЬНЫХ --
    const unlockAudio = () => {
        // Проверяем, был ли аудиоконтекст уже разблокирован
        if (document.body.dataset.audioUnlocked === 'true') return;

        // Пытаемся запустить и сразу остановить все аудиофайлы.
        // Это "регистрирует" их в браузере как разрешенные к воспроизведению.
        Object.values(audios).forEach(audio => {
            const promise = audio.play();
            if (promise !== undefined) {
                promise.then(() => {
                    audio.pause();
                }).catch(error => {
                    // Ошибки могут возникать, если пользователь не взаимодействовал, это нормально
                });
            }
        });
        
        // Отмечаем, что аудио разблокировано
        document.body.dataset.audioUnlocked = 'true';
        
        console.log("Audio context unlocked by user interaction.");

        // После разблокировки запускаем логику отслеживания скролла для аудио
        window.addEventListener('scroll', handleAudioScroll);
        
        // Удаляем слушатели, так как они больше не нужны
        document.body.removeEventListener('click', unlockAudio);
        document.body.removeEventListener('touchstart', unlockAudio);
    };
    
    // Добавляем слушатели и для клика (десктоп) и для касания (мобайл)
    // чтобы разблокировать аудио при первом же взаимодействии пользователя.
    document.body.addEventListener('click', unlockAudio);
    document.body.addEventListener('touchstart', unlockAudio);

});