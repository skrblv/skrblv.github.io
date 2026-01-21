document.addEventListener('DOMContentLoaded', () => {
    
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const parallaxItems = heroSection.querySelectorAll('[data-depth]');
        let idleTimer;
        let lastMouseEvent = null;
        let isParallaxTicking = false;
        
        let heroRect = heroSection.getBoundingClientRect();

        const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        window.addEventListener('resize', () => {
            heroRect = heroSection.getBoundingClientRect();
        }, { passive: true });

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

            const centerX = heroRect.left + heroRect.width / 2;
            const centerY = heroRect.top + heroRect.height / 2;
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
            window.addEventListener('mousemove', onMouseMove, { passive: true });
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
            threshold: 0.2,
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
            // { name: "The Way I Are", src: "assets/music/track3.mp3" },
            // { name: "No 1 Party Anthem", src: "assets/music/track1.mp3" },
            { name: "Ecstasy", src: "assets/music/track4.mp3" },
            // { name: "Lovers Rock", src: "assets/music/track5.mp3" }
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
                    console.warn("Autoplay / Play prevented:", error);
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
            resetHideTimer();
        });

        audio.addEventListener('ended', nextTrack);
        
        loadTrack(currentTrackIndex);
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

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            container.appendChild(canvas);

            let particles = [];
            // На мобилках 40 частиц, на пк 100 - для скорости
            const particleCount = window.innerWidth < 768 ? 40 : 100;
            
            let width, height;

            function resize() {
                width = container.offsetWidth;
                height = container.offsetHeight;
                canvas.width = width;
                canvas.height = height;
            }
            
            window.addEventListener('resize', resize);
            resize();

            // Создаем частицы
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 0.5, // Размер от 0.5 до 2.5px
                    // Фиксированная прозрачность (разная для каждой, но не меняется)
                    alpha: Math.random() * 0.5 + 0.2, 
                    // Медленная скорость дрейфа
                    vx: (Math.random() - 0.5) * 0.5, 
                    vy: (Math.random() - 0.5) * 0.5
                });
            }

            function animate() {
                ctx.clearRect(0, 0, width, height);
                
                particles.forEach(p => {
                    // Просто двигаем координаты
                    p.x += p.vx;
                    p.y += p.vy;

                    // Если улетела за экран - возвращаем с другой стороны
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                    
                    // Легкое статичное свечение (не нагружает так как не меняется)
                    ctx.shadowBlur = 3; 
                    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
                    
                    ctx.fill();
                    ctx.shadowBlur = 0; // Сброс для оптимизации
                });

                requestAnimationFrame(animate);
            }

            animate();
        }


        const designWidth = 1400;
        const designHeight = 900;
        let resizeTimeout;

        function adjustScale() {
            window.requestAnimationFrame(() => {
                const scaleX = window.innerWidth / designWidth;
                const scaleY = window.innerHeight / designHeight;
                
                const scale = Math.min(scaleX, scaleY);
                const finalScale = Math.min(Math.max(scale, 0.40), 1.1); 
                
                document.documentElement.style.setProperty('--scene-scale', finalScale);
            });
        }


        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(adjustScale, 100);
        }, { passive: true });

        startBreathing();
        createFlickeringParticles();
        adjustScale(); 
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
    modalOverlay.removeAttribute('aria-hidden'); // показываем скринридерам
    modalOverlay.removeAttribute('inert');       // делаем интерактивной
    document.body.classList.add('modal-open');

    // Переносим фокус на кнопку закрытия модалки
    closeModalBtn.focus();
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true'); // скрываем скринридерам
    modalOverlay.setAttribute('inert', 'true');       // блокируем интерактивность
    document.body.classList.remove('modal-open');

    // Возвращаем фокус на кнопку открытия модалки
    const firstShard = document.querySelector('.shard');
    if (firstShard) firstShard.focus();
}

// Инициализация
modalOverlay.setAttribute('aria-hidden', 'true');
modalOverlay.setAttribute('inert', 'true');

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

    const inkSection = document.getElementById('inkSection');
    const inkCanvas = document.getElementById('skillsCanvas');
    
    if (inkSection && inkCanvas) {
        const gl = inkCanvas.getContext('webgl');
        if (gl) {
            function createShader(gl, type, src) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                return shader;
            }
            const prog = gl.createProgram();
            const vsSrc = document.getElementById('vertex-shader').text;
            const fsSrc = document.getElementById('fragment-shader').text;
            
            gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vsSrc));
            gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fsSrc));
            gl.linkProgram(prog);
            gl.useProgram(prog);

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
            const posLoc = gl.getAttribLocation(prog, "position");
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            const uRes = gl.getUniformLocation(prog, "u_resolution");
            const uTime = gl.getUniformLocation(prog, "u_time");
            const uProg = gl.getUniformLocation(prog, "u_progress");

            let currentProgress = 0;
            const skillsSection = document.getElementById('skills-hobbies');

            function resize() {
                // ОПТИМИЗАЦИЯ ЗДЕСЬ:
                // Проверяем, мобилка ли это
                const isMobile = window.innerWidth < 768;
                
                // На ПК качество 1.0 (полное), на мобиле 0.35 (примерно треть)
                // Для эффекта дыма/чернил понижение разрешения почти незаметно глазу,
                // но спасает телефон от перегрева.
                const pixelRatio = isMobile ? 0.65 : 1.0; 

                // Устанавливаем внутреннее разрешение канваса меньше реального размера CSS
                inkCanvas.width = inkSection.offsetWidth * pixelRatio;
                inkCanvas.height = inkSection.offsetHeight * pixelRatio;
                
                gl.viewport(0, 0, inkCanvas.width, inkCanvas.height);
                gl.uniform2f(uRes, inkCanvas.width, inkCanvas.height);
            }

            window.addEventListener('resize', resize);
            resize();

            function updateScroll() {
                const rect = skillsSection.getBoundingClientRect();
                const winH = window.innerHeight;
                
                let raw = (winH - rect.top) / (winH + rect.height);
                
                if (raw < 0) raw = 0;
                if (raw > 1) raw = 1;

                const eased = 1 - Math.pow(1 - raw, 1.6);
                currentProgress = eased;
            }

            function render(time) {
                updateScroll();
                gl.uniform1f(uTime, time * 0.0003);
                gl.uniform1f(uProg, currentProgress);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        }
    }
});
