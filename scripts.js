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
    startIdleDrift();


    // ======================================
    // 1.5. SCROLL-DRIVEN VISUAL ASSETS (BLOOD BUBBLES)
    // ======================================
    
    const visualAssets = document.querySelectorAll('.scroll-visual-asset');
    const aboutSection = document.getElementById('about');

    function updateScrollVisuals() {
        
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
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
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
    
    // IMPORTANT: Make sure these paths point to your files in /assets/music/
    const tracks = [
        { name: "Neon Lights (Synthwave)", src: "assets/music/track1.mp3" },
        { name: "Deep Focus (Lo-Fi)", src: "assets/music/track2.mp3" },
        { name: "Code Flow (Ambient)", src: "assets/music/track3.mp3" },
        { name: "Kybernetica (Electronic)", src: "assets/music/track4.mp3" },
        { name: "Digital Nomad (Beat)", src: "assets/music/track5.mp3" }
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
});
