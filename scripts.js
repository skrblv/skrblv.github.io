document.addEventListener('DOMContentLoaded', () => {
    
    // ======================================
    // 1. MOUSE PARALLAX EFFECT & IDLE DRIFT (REVISED FOR DIFFERENTIAL DEPTH)
    // ======================================

    const heroSection = document.getElementById('hero');
    const parallaxItems = heroSection.querySelectorAll('[data-depth]');
    const heroArea = document.querySelector('.main-content-area'); 
    let idleTimer; 

    // --- Функция для проверки сенсорного устройства ---
    const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // --- Функция: Запускает дрейф ---
    function startIdleDrift() {
        parallaxItems.forEach(item => {
            // 1. Добавляем класс, который меняет transition и запускает CSS-анимацию
            item.classList.add('drifting');
            
            // 2. Очищаем transform, заданный JS. 
            // Это позволяет CSS-анимации (которая теперь имеет !important transition) взять контроль.
            item.style.transform = ''; 
        });
    }

    function mouseParallax(e) {
        // --- ЛОГИКА: Отключаем mouseParallax, если это сенсорное устройство ---
        if (isTouchDevice() && window.innerWidth <= 1024) return;
        
        // 1. Сбрасываем таймер при любом движении
        clearTimeout(idleTimer);

        // 2. Немедленно убираем класс дрейфа. 
        parallaxItems.forEach(item => {
            item.classList.remove('drifting');
        });

        // 3. Запускаем новый таймер. Если он сработает, запускаем дрейф.
        // Задержка 200 мс — это стандартное время для определения "бездействия"
        idleTimer = setTimeout(startIdleDrift, 200);
        // ------------------------------------

        if (!heroArea) return;
        
        const rect = heroSection.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Чувствительность параллакса
        const offsetX = (e.clientX - centerX) / 50; 
        const offsetY = (e.clientY - centerY) / 50;
        
        parallaxItems.forEach(item => {
            const depth = parseFloat(item.getAttribute('data-depth'));
            
            // ===============================================
            // ЛОГИКА ДИФФЕРЕНЦИАЛЬНОГО ПАРАЛЛАКСА (Depth 1.0 = 0 движение)
            const relativeDepthFactor = depth - 1.0;

            const moveX = offsetX * relativeDepthFactor * -1;
            const moveY = offsetY * relativeDepthFactor * -1;
            // ===============================================

            // 4. JS-transform немедленно применяется (с transition 0.1s, определенным в CSS)
            item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
    }

    // Включаем слушатель только для не-тач устройств
    if (!isTouchDevice()) {
        window.addEventListener('mousemove', mouseParallax);
    }
    
    // Запускаем дрейф при первоначальной загрузке страницы
setTimeout(startIdleDrift, 100); // 100 миллисекунд (0.1с) более чем достаточно


    // ======================================
    // 1.5. SCROLL-DRIVEN VISUAL ASSETS (BLOOD BUBBLES)
    // ======================================
    
    const visualAssets = document.querySelectorAll('.scroll-visual-asset');
    const aboutSection = document.getElementById('about');

    function updateScrollVisuals() {
        if (!aboutSection) return;
        const scrollY = window.pageYOffset; 
        const sectionTop = aboutSection.offsetTop;
        const scrollRelative = scrollY - sectionTop;
        
        visualAssets.forEach(asset => {
            const speed = parseFloat(asset.getAttribute('data-scroll-speed'));
            
            let movement = scrollRelative * speed; 
            
            asset.style.transform = `translateY(${movement}px)`;
        });
    }

    // Привязываем функцию к событию прокрутки
    window.addEventListener('scroll', updateScrollVisuals);
    updateScrollVisuals();


    // ======================================
    // 2. SCROLL REVEAL & SMOOTH SCROLL
    // ======================================
    
    const revealElements = document.querySelectorAll('.resume-block');
    
    const observerOptions = {
        root: null, 
        threshold: 0.3,
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(observerCallback, observerOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // --- Smooth Scroll for navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });


    // ======================================
    // 3. MUSIC PLAYER LOGIC (Auto Play & Auto Hide)
    // ======================================

    const player = document.getElementById('music-player');
    const vinylIcon = document.querySelector('.vinyl-icon');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const trackNameElement = document.getElementById('current-track-name');
    
    const tracks = [
        { name: "Judas Electric Guitar", src: "assets/music/track2.mp3" },
        { name: "The Way I Are", src: "assets/music/track3.mp3" },
        { name: "No 1 Party Anthem", src: "assets/music/track1.mp3" },
        { name: "Ecstasy", src: "assets/music/track4.mp3" },
        { name: "Lovers Rock", src: "assets/music/track5.mp3" }
    ];

    let currentTrackIndex = 0;
    const audio = new Audio();
    audio.volume = parseFloat(volumeSlider.value); 
    let isPlaying = false;
    let hideTimeout;

    // --- Core Functions ---

    function loadTrack(index) {
        audio.src = tracks[index].src;
        trackNameElement.textContent = tracks[index].name;
        audio.load();
    }

    function playTrack() {
        audio.play().then(() => {
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            vinylIcon.classList.add('spinning');
            player.classList.remove('closed');
            resetHideTimer(); 
        }).catch(error => {
             console.warn("Autoplay prevented:", error);
        });
    }

    function pauseTrack() {
        audio.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        vinylIcon.classList.remove('spinning');
        clearTimeout(hideTimeout);
    }
    
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            playTrack();
        }
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            playTrack();
        }
    }

    // --- Auto Hide Logic ---
    function hidePlayerPanel() {
        player.classList.add('closed');
    }

    function resetHideTimer() {
        clearTimeout(hideTimeout);
        if (isPlaying) {
            hideTimeout = setTimeout(hidePlayerPanel, 5000); 
        }
    }

    function togglePlayerPanel() {
        if (player.classList.contains('closed')) {
             player.classList.remove('closed');
             if (audio.src === "") {
                loadTrack(currentTrackIndex);
            }
            resetHideTimer();
        } else {
            player.classList.add('closed');
            clearTimeout(hideTimeout);
        }
    }

    // --- Event Listeners ---

    vinylIcon.addEventListener('click', togglePlayerPanel);

    playPauseBtn.addEventListener('click', () => {
        if (audio.src === "") { 
            loadTrack(currentTrackIndex);
        }
        
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    });

    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Reset timer on control interaction
    nextBtn.addEventListener('click', resetHideTimer);
    prevBtn.addEventListener('click', resetHideTimer);
    volumeSlider.addEventListener('input', resetHideTimer);
    
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = parseFloat(e.target.value);
    });

    audio.addEventListener('ended', nextTrack); // Auto advance
    
    // Initial setup: Load the first track and attempt to play
    loadTrack(currentTrackIndex);
    playTrack(); 


    // ======================================
    // 4. SHARDS SECTION LOGIC (НОВЫЙ КОД)
    // ======================================

    const sceneContainer = document.getElementById('scene-container');

    // Выполняем код для осколков, только если их секция существует на странице
    if (sceneContainer) {
        const shards = document.querySelectorAll('.shard');

        function startBreathing() {
            shards.forEach(shard => {
                const depth = parseFloat(shard.getAttribute('data-depth')) || 0;
                const baseTransform = `translateZ(${depth * 40}px)`;
                
                shard.style.setProperty('--base-transform', baseTransform);
                shard.classList.add('is-breathing');
            });
        }

        function gaussianRandom(mean = 0, stdev = 1) {
            let u = 1 - Math.random();
            let v = Math.random();
            let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return z * stdev + mean;
        }

        function createFlickeringParticles() {
            const container = document.getElementById('flickering-particles-container');
            if (!container) return;

            const particleCount = 150; 
            const centerX = 1400 / 2;
            const centerY = 900 / 2;
            const standardDeviation = centerX / 2.5;
            const movementStrength = 0.1; 

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'flickering-particle';
                const size = Math.random() * 2 + 0.5;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                const x = gaussianRandom(centerX, standardDeviation);
                const y = gaussianRandom(centerY, standardDeviation);
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                const fullTargetX = centerX - x;
                const fullTargetY = centerY - y;
                const targetX = fullTargetX * movementStrength;
                const targetY = fullTargetY * movementStrength;
                particle.style.setProperty('--target-x', `${targetX}px`);
                particle.style.setProperty('--target-y', `${targetY}px`);
                const flickerDuration = Math.random() * 3 + 2;
                const pullDuration = Math.random() * 10 + 10;
                const delay = Math.random() * 10;
                particle.style.animation = `
                    flicker ${flickerDuration}s ${delay}s infinite linear,
                    centerPull ${pullDuration}s ${delay}s infinite ease-in-out
                `;
                container.appendChild(particle);
            }
        }

        // --- НАДЕЖНЫЙ КОД ДЛЯ АДАПТИВНОСТИ ОСКОЛКОВ ---
        const designWidth = 1400;
        const designHeight = 900;

        function adjustScale() {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            const scaleX = screenWidth / designWidth;
            const scaleY = screenHeight / designHeight;

            const scale = Math.min(scaleX, scaleY);
            
            document.documentElement.style.setProperty('--scene-scale', scale);
        }

        // Запускаем все функции для секции с осколками
        startBreathing();
        createFlickeringParticles();
        adjustScale();
        window.addEventListener('resize', adjustScale);
    }
    
});
