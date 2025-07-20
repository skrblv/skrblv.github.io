/*
 * Ждем, пока вся HTML-структура страницы (DOM) будет полностью загружена и готова к работе,
 * прежде чем выполнять любой JavaScript-код. Это стандартная и важная практика.
 */
document.addEventListener("DOMContentLoaded", () => {
    
    // ===================================================================
    // --- БЛОК 1: АНИМАЦИЯ ПЛАВНОГО ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ ---
    // ===================================================================

    // Находим все элементы на странице, которые должны появляться при скролле.
    const fadeElements = document.querySelectorAll('.fade-in');

    // Создаем "наблюдателя" (IntersectionObserver), который будет следить за появлением
    // этих элементов в видимой области экрана.
    const observer = new IntersectionObserver((entries) => {
        // Эта функция будет вызываться каждый раз, когда элемент пересекает границу видимости.
        entries.forEach(entry => {
            // Если элемент стал видимым (isIntersecting === true)...
            if (entry.isIntersecting) {
                // ...добавляем ему CSS-класс 'is-visible'.
                entry.target.classList.add('is-visible');
                // После того как анимация сработала один раз, можно перестать следить за элементом,
                // чтобы не тратить ресурсы.
                observer.unobserve(entry.target);
            }
        });
    }, { 
        // Наблюдатель сработает, когда элемент будет виден хотя бы на 10%.
        threshold: 0.1 
    });

    // Запускаем наблюдение за каждым найденным элементом.
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // ===================================================================
    // --- БЛОК 2: ЛОГИКА ДЛЯ ИНТЕРАКТИВНОЙ ХРОНИКИ "НАСЛЕДИЕ" ---
    // ===================================================================

    const legacySection = document.querySelector('.legacy-section');
    // Выполняем этот код, только если секция "Наследие" существует на странице.
    if (legacySection) {
        // Находим все необходимые элементы: видео, текстовые блоки и боковые "шторки".
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

        // Запускаем воспроизведение всех видео в этой секции, чтобы они были готовы к показу.
        // muted и playsinline в HTML позволяют им проигрываться автоматически.
        Object.values(videos).forEach(video => {
            if (video) video.play().catch(e => {});
        });

        // Создаем функцию, которая будет управлять анимацией во время прокрутки.
        const handleLegacyScroll = () => {
            const rect = legacySection.getBoundingClientRect();
            // Для оптимизации не выполняем никаких расчетов, если секция находится вне экрана.
            if (rect.top > window.innerHeight || rect.bottom < 0) return;

            // Вычисляем прогресс прокрутки внутри секции от 0 (начало) до 1 (конец).
            const scrollableHeight = rect.height - window.innerHeight;
            const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));

            // Первая половина анимации (прогресс от 0 до 0.5): переход от "Человека из стали" к "БпС".
            if (progress <= 0.5) {
                const phaseProgress = progress / 0.5; // Прогресс внутри этой фазы (от 0 до 1).
                wrappers.mos.style.opacity = 1 - phaseProgress;
                wrappers.bvs.style.opacity = phaseProgress;
                // Сбрасываем стили для третьей сцены на случай, если пользователь скроллит обратно.
                wrappers.zsjl.style.opacity = 0;
                vignetteLeft.style.width = '0%';
                vignetteRight.style.width = '0%';
                wrappers.zsjl.style.paddingLeft = '0%';
                wrappers.zsjl.style.paddingRight = '0%';
            } 
            // Вторая половина анимации (прогресс от 0.5 до 1): переход от "БпС" к "Лиге Справедливости".
            else {
                const phaseProgress = (progress - 0.5) / 0.5; // Прогресс внутри этой фазы (от 0 до 1).
                wrappers.bvs.style.opacity = 1 - phaseProgress;
                wrappers.zsjl.style.opacity = phaseProgress;
                // Скрываем первую сцену.
                wrappers.mos.style.opacity = 0;

                // Рассчитываем ширину черных "шторок" и отступов для текста.
                const barWidth = phaseProgress * 13.75;
                vignetteLeft.style.width = `${barWidth}%`;
                vignetteRight.style.width = `${barWidth}%`;
                wrappers.zsjl.style.paddingLeft = `${barWidth}%`;
                wrappers.zsjl.style.paddingRight = `${barWidth}%`;
            }
        };
        // Привязываем нашу функцию к событию прокрутки окна.
        window.addEventListener('scroll', handleLegacyScroll);
    }

    // ===================================================================
    // --- БЛОК 3: ЛОГИКА УПРАВЛЕНИЯ ФОНОВОЙ МУЗЫКОЙ ---
    // ===================================================================

    const audioSections = document.querySelectorAll('.audio-section');
    const audios = {
        song1: document.getElementById('audio-song1'),
        song2: document.getElementById('audio-song2'),
        song3: document.getElementById('audio-song3'),
        song4: document.getElementById('audio-song4'),
        song5: document.getElementById('audio-song5')
    };

    let activeAudioKey = null;
    let audioFadeIntervals = {}; // Объект для хранения интервалов анимации громкости.
    const targetVolume = 0.5;    // Целевая громкость музыки (от 0 до 1).
    const fadeDuration = 1000;   // Длительность смены трека в миллисекундах.

    // Функция для плавного изменения громкости аудио.
    const fadeAudio = (audioKey, toVolume) => {
        const audio = audios[audioKey];
        if (!audio) return;

        clearInterval(audioFadeIntervals[audioKey]);

        // Пытаемся запустить аудио, только если целевая громкость > 0.
        if (toVolume > 0 && audio.paused) {
            audio.play().catch(e => console.error("Audio play was blocked:", e));
        }

        // Логика плавной смены громкости с помощью setInterval.
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
                if (toVolume === 0) {
                    audio.pause();       // Ставим на паузу при полной тишине.
                    audio.currentTime = 0; // Сбрасываем трек на начало.
                }
            }
        }, stepTime);
    };

    // Функция, определяющая, какую музыку включать в зависимости от прокрутки.
    const handleAudioScroll = () => {
        let minDistance = Infinity;
        let dominantSectionKey = null;
        // Находим секцию, чей центр ближе всего к центру экрана.
        audioSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - window.innerHeight / 2);
            if (distance < minDistance) {
                minDistance = distance;
                dominantSectionKey = section.dataset.audio;
            }
        });
        // Если активная секция сменилась, плавно переключаем треки.
        if (dominantSectionKey && dominantSectionKey !== activeAudioKey) {
            const oldAudioKey = activeAudioKey;
            activeAudioKey = dominantSectionKey;
            if (oldAudioKey) fadeAudio(oldAudioKey, 0); // Выключаем старый трек.
            fadeAudio(activeAudioKey, targetVolume);   // Включаем новый.
        }
    };

    // ФИНАЛЬНАЯ, НАДЕЖНАЯ ЛОГИКА РАЗБЛОКИРОВКИ АУДИО
    const unlockAudio = () => {
        // Если аудио уже разблокировано, ничего не делаем.
        if (document.body.dataset.audioUnlocked === 'true') return;
        document.body.dataset.audioUnlocked = 'true';

        // "Прогреваем" все аудиофайлы: пытаемся запустить и сразу ставим на паузу.
        // Это действие дает браузеру понять, что мы собираемся использовать аудио.
        Object.values(audios).forEach(audio => {
            audio.play().then(() => audio.pause()).catch(() => {});
        });

        console.log("Audio context unlocked. Activating scroll-based audio.");

        // !!! ВАЖНО: Вешаем слушатель прокрутки для аудио ТОЛЬКО ПОСЛЕ разблокировки.
        window.addEventListener('scroll', handleAudioScroll);

        // Сразу же вызываем функцию один раз, чтобы включить музыку для текущей секции.
        handleAudioScroll();
        
        // Удаляем слушатели взаимодействия, они больше не нужны.
        document.body.removeEventListener('click', unlockAudio);
        document.body.removeEventListener('touchstart', unlockAudio);
    };

    // Ждем первого взаимодействия пользователя со страницей (клик или касание).
    document.body.addEventListener('click', unlockAudio);
    document.body.addEventListener('touchstart', unlockAudio);
});