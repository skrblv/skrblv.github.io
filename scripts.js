document.addEventListener('DOMContentLoaded', () => {
        const heroSection = document.getElementById('hero');
    if (heroSection) {
        const parallaxItems = heroSection.querySelectorAll('[data-depth]');
        let idleTimer;
        
        let lastMouseEvent = null;
        let isParallaxTicking = false;

        const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        function startIdleDrift() {
            parallaxItems.forEach(item => {
                item.classList.add('drifting');
                item.style.transform = ''; 
            });
        }

        function stopIdleDrift() {
            clearTimeout(idleTimer);
            parallaxItems.forEach(item => {
                item.classList.remove('drifting');
            });
            idleTimer = setTimeout(startIdleDrift, 300);
        }
        
        function updateParallax(e) {
            if (!e) return;

            const rect = heroSection.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const offsetX = (e.clientX - centerX) / 50; 
            const offsetY = (e.clientY - centerY) / 50;
            
            parallaxItems.forEach(item => {
                if (!item.classList.contains('drifting')) {
                    const depth = parseFloat(item.getAttribute('data-depth'));
                    const relativeDepthFactor = depth - 1.0;
                    const moveX = offsetX * relativeDepthFactor * -1;
                    const moveY = offsetY * relativeDepthFactor * -1;
                    item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                }
            });
        }

        function onMouseMove(e) {
            if (isTouchDevice() && window.innerWidth <= 1024) return;
            
            stopIdleDrift();
            lastMouseEvent = e;
            
            if (!isParallaxTicking) {
                window.requestAnimationFrame(() => {
                    updateParallax(lastMouseEvent);
                    isParallaxTicking = false;
                });
                isParallaxTicking = true;
            }
        }

        if (!isTouchDevice() || window.innerWidth > 1024) {
            window.addEventListener('mousemove', onMouseMove);
        }
        
        setTimeout(startIdleDrift, 100);
    }
    
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const visualAssets = document.querySelectorAll('.scroll-visual-asset');
        
        let lastScrollY = window.pageYOffset;
        let isScrollTicking = false;

        function updateScrollVisuals() {
            const sectionTop = aboutSection.offsetTop;
            const scrollRelative = lastScrollY - sectionTop;
            
            visualAssets.forEach(asset => {
                const speed = parseFloat(asset.getAttribute('data-scroll-speed'));
                const movement = scrollRelative * speed; 
                asset.style.transform = `translateY(${movement}px)`;
            });
        }
        
        function onScroll() {
            lastScrollY = window.pageYOffset;
            if (!isScrollTicking) {
                window.requestAnimationFrame(() => {
                    updateScrollVisuals();
                    isScrollTicking = false;
                });
                isScrollTicking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        updateScrollVisuals();
    }
    
    const revealElements = document.querySelectorAll('.resume-block');
    if (revealElements.length > 0) {
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
        revealElements.forEach(element => revealObserver.observe(element));
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.classList.contains('shard')) return;

            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const player = document.getElementById('music-player');
    if (player) {
        const vinylIcon = player.querySelector('.vinyl-icon');
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

        function loadTrack(index) {
            audio.src = tracks[index].src;
            trackNameElement.textContent = tracks[index].name;
            audio.load();
        }

        function playTrack() {
            if (audio.src && audio.paused) {
                audio.play().then(() => {
                    isPlaying = true;
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    vinylIcon.classList.add('spinning');
                    player.classList.remove('closed');
                    resetHideTimer(); 
                }).catch(error => {
                    console.warn("Autoplay was prevented by the browser:", error);
                });
            }
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
            if (isPlaying) playTrack();
        }

        function prevTrack() {
            currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
            loadTrack(currentTrackIndex);
            if (isPlaying) playTrack();
        }

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
                if (!audio.src) {
                    loadTrack(currentTrackIndex);
                }
                resetHideTimer();
            } else {
                player.classList.add('closed');
                clearTimeout(hideTimeout);
            }
        }
        
        function handleUserInteraction() {
            resetHideTimer();
        }

        vinylIcon.addEventListener('click', togglePlayerPanel);
        playPauseBtn.addEventListener('click', () => {
            if (!audio.src) loadTrack(currentTrackIndex);
            isPlaying ? pauseTrack() : playTrack();
        });
        nextBtn.addEventListener('click', nextTrack);
        prevBtn.addEventListener('click', prevTrack);
        
        [nextBtn, prevBtn, volumeSlider, playPauseBtn].forEach(el => {
            el.addEventListener('click', handleUserInteraction);
            if (el.tagName === 'INPUT') {
                el.addEventListener('input', handleUserInteraction);
            }
        });
        
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = parseFloat(e.target.value);
        });

        audio.addEventListener('ended', nextTrack);
        
        loadTrack(currentTrackIndex);
        playTrack(); 
    }

    const sceneContainer = document.getElementById('scene-container');
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
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return z * stdev + mean;
        }

        function createFlickeringParticles() {
            const container = document.getElementById('flickering-particles-container');
            if (!container) return;

            const particleCount = 150; 
            const designWidth = 1400;
            const designHeight = 900;
            const centerX = designWidth / 2;
            const centerY = designHeight / 2;
            const standardDeviation = centerX / 2.5;
            const movementStrength = 0.1; 
            
            const fragment = document.createDocumentFragment();

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'flickering-particle';
                const size = Math.random() * 2 + 0.5;
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${gaussianRandom(centerX, standardDeviation)}px;
                    top: ${gaussianRandom(centerY, standardDeviation)}px;
                    --target-x: ${(centerX - parseFloat(particle.style.left)) * movementStrength}px;
                    --target-y: ${(centerY - parseFloat(particle.style.top)) * movementStrength}px;
                    animation: flicker ${Math.random() * 3 + 2}s ${Math.random() * 10}s infinite linear,
                               centerPull ${Math.random() * 10 + 10}s ${Math.random() * 10}s infinite ease-in-out;
                `;
                fragment.appendChild(particle);
            }
            container.appendChild(fragment);
        }

        const designWidth = 1400;
        const designHeight = 900;
        function adjustScale() {
            const scale = Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight);
            document.documentElement.style.setProperty('--scene-scale', scale);
        }

        startBreathing();
        createFlickeringParticles();
        adjustScale();
        window.addEventListener('resize', adjustScale, { passive: true });
    }

    const modalOverlay = document.getElementById('project-modal');
    
    if (modalOverlay) {
        
        const projectsData = {
            'shard-1': {
                title: 'DevProof',
                tags: ['React', 'Django-Rest-Framework', 'Typescript'],
                description: 'A comprehensive coding education platform inspired by the engagement mechanics of Duolingo. It features meticulously designed interactive courses and unique learning features. The journey culminates in a rigorous, IELTS-standard final examination to authentically verify and certify technical proficiency.',
                link: null 

            },
            'shard-2': {
                title: 'Triple Date',
                tags: ['HTML/CSS', 'Django', 'MVP'],
                description: 'A solution born from a personal pain point: the complexity of planning the perfect date. This MVP features a polished UI/UX that allows users to seamlessly schedule dates and discover curated venue recommendations. Designed to remove the stress of logistics, letting users focus on the connection.',
                link: null 

            },
            'shard-3': {
                title: 'ORIENT',
                tags: ['React', 'Django-Rest-Framework', 'Algorithms'],
                description: 'An adaptive Life-OS that acts as a personal strategic engine. It aggregates user profiles, goals, and constraints to generate actionable daily plans. The system dynamically recalibrates schedules based on real-time events and emotional states, providing transparent logic (Why & How) for every adjustment.',
                link: null 
                
            },
            'shard-4': {
                title: 'BSCpetition',
                tags: ['Telegram Bot', 'Aiogram', 'Automation'],
                description: 'An automation tool built to preserve our student group and teaching staff composition. I developed a Telegram bot that collects digital signatures and user data. It automatically generates organized Excel reports for tracking and fully formatted Word petition documents for administration submission.',
                link: null 

            },
            'shard-5': {
                title: 'Finance_bot',
                tags: ['Telegram Bot', 'Business Logic', 'Data Visualization'],
                description: 'A robust financial management tool integrated entirely within Telegram. Functioning as a streamlined, modern alternative to complex systems like 1C, it handles full-cycle accounting—tracking sales, expenses, and income—with perfect logic and a user-friendly interface.',
                link: null 

            },
            'shard-6': {
                title: 'Comtehno',
                tags: ['Production', 'Collaboration', 'College Site'],
                description: 'The official website for the Bishkek College of Computer Systems & Technologies. Developed collaboratively with the faculty during my second year of studies, this project represents my transition from learning to delivering production-grade software for an educational institution.',
                link: 'https://comtehno.kg/'
            }
        };

        const modalTitle = document.getElementById('modal-title');
        const modalTags = document.getElementById('modal-tags');
        const modalDesc = document.getElementById('modal-description');
        const closeModalBtn = modalOverlay.querySelector('.close-modal-btn');
        const modalFooter = modalOverlay.querySelector('.modal-footer'); 
        const shards = document.querySelectorAll('.shard');

        function openModal(projectId) {
            const project = projectsData[projectId];
            if (!project) return;

            modalTitle.textContent = project.title;
            modalDesc.textContent = project.description;
            
            modalTags.innerHTML = '';
            project.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'modal-tag';
                span.textContent = tag;
                modalTags.appendChild(span);
            });

            if (project.link) {
                modalFooter.innerHTML = `<a href="${project.link}" target="_blank" class="status-badge live">View Live Project <i class="fas fa-external-link-alt"></i></a>`;
            } else {
                modalFooter.innerHTML = `<span class="status-badge">Not Deployed</span>`;
            }

            modalOverlay.classList.add('active');
            document.body.classList.add('modal-open'); 
        }

        function closeModal() {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('modal-open');
        }

        shards.forEach(shard => {
            shard.addEventListener('click', (e) => {
                e.preventDefault(); 
                const id = shard.id; 
                openModal(id);
            });
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }
});
