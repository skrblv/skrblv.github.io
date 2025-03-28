// --- Venue Data for Swiper ---
const venueData = [
    {
        id: 1,
        name: "Cooksoo",
        image: "https://i3.photo.2gis.com/images/branch/0/30258560050575435_fc96.jpg", // Loads from web
        dateText: "APRIL 4-6",
        ratingStars: 5,
        ratingText: "Рамен.",
        venueIcon1: "🍜",
        venueIcon2: "🥢"
    },
    {
        id: 2,
        name: "Kentucky Fried Chicken",
        image: "https://i2.photo.2gis.com/images/branch/0/30258560173723753_65ee.jpg", // Placeholder
        dateText: "APRIL 4-6",
        ratingStars: 4,
        ratingText: "Excellent view and food!",
         venueIcon1: "🍗",
         venueIcon2: "🍟"
    },
    {
        id: 3,
        name: "Бублик",
        image: "https://i6.photo.2gis.com/photo-gallery/13966df8-9536-4929-b361-018e85081478.jpg", // Placeholder
        dateText: "APRIL 4-6",
        ratingStars: 3,
        ratingText: "Comfy seats, good popcorn.",
         venueIcon1: "🥐",
         venueIcon2: "🍪"
    },
     {
        id: 4,
        name: "Papa Johns",
        image: "https://i8.photo.2gis.com/images/branch/112/15762598728857306_c4f2.jpg", // Placeholder
        dateText: "April 4-6",
        ratingStars: 4,
        ratingText: "Nice trails, relaxing.",
         venueIcon1: "🍕",
         venueIcon2: "🍦"
    }
];
let currentVenueIndex = 0; // Keep track of the displayed venue

// --- Constants for Dot Sliding ---
const DOT_WIDTH = 8; // px
const DOT_MARGIN = 4; // px (margin on one side)


// --- Wait for DOM to Load ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Music Player Logic ---
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressContainer = document.getElementById('progress-container');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const volumeSlider = document.getElementById('volume-slider');

    // Check all player elements exist before adding listeners
    if (audioPlayer && playPauseBtn && playPauseIcon && prevBtn && nextBtn && progressContainer && progress && currentTimeEl && totalTimeEl && volumeSlider) {
        const playIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36px" height="36px"><path d="M8 5v14l11-7z"/></svg>`;
        const pauseIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36px" height="36px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        let isPlaying = false;

        function formatTime(seconds) {
            if (isNaN(seconds) || seconds < 0) seconds = 0;
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function updatePlayPauseIcon() {
            playPauseIcon.innerHTML = isPlaying ? pauseIconSvg : playIconSvg;
            playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
        }

        function togglePlayPause() {
            if (audioPlayer.paused) {
                audioPlayer.play().catch(e => console.error("Audio play failed:", e));
                isPlaying = true;
            } else {
                audioPlayer.pause();
                isPlaying = false;
            }
            updatePlayPauseIcon();
        }

        function updateProgress() {
            if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                progress.style.width = `${progressPercent}%`;
                currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            } else {
                 progress.style.width = '0%';
                 currentTimeEl.textContent = '0:00';
            }
        }

        function setDuration() {
            if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                totalTimeEl.textContent = formatTime(audioPlayer.duration);
            } else {
                 totalTimeEl.textContent = '0:00';
            }
        }

        function seek(event) {
            if (isNaN(audioPlayer.duration) || audioPlayer.duration <= 0) return;
            const width = progressContainer.clientWidth;
            const clickX = event.offsetX;
            audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
            if (!isPlaying && audioPlayer.paused) {
                togglePlayPause();
            }
        }

        function changeVolume() {
            audioPlayer.volume = volumeSlider.value / 100;
        }

        function restartSong() {
            audioPlayer.currentTime = 0;
            if (!isPlaying) togglePlayPause();
            else audioPlayer.play().catch(e => console.error("Audio play failed:", e));
        }

        // --- Player Event Listeners ---
        playPauseBtn.addEventListener('click', togglePlayPause);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', setDuration);
        audioPlayer.addEventListener('durationchange', setDuration);
        audioPlayer.addEventListener('ended', () => {
             audioPlayer.currentTime = 0;
             isPlaying = false;
             updatePlayPauseIcon();
             progress.style.width = '0%';
             currentTimeEl.textContent = formatTime(0);
        });
         audioPlayer.addEventListener('error', (e) => {
            console.error("Audio Player Error:", e);
            totalTimeEl.textContent = "Error";
        });
        progressContainer.addEventListener('click', seek);
        volumeSlider.addEventListener('input', changeVolume);
        prevBtn.addEventListener('click', restartSong);
        nextBtn.addEventListener('click', restartSong);

        // --- Initial Player Setup ---
        changeVolume();
        setDuration();
        updatePlayPauseIcon();

    } else {
        console.warn("One or more music player elements not found.");
    }


    // --- Countdown Timer Logic ---
    const datePicker = document.getElementById('event-date-picker');
    const setDateBtn = document.getElementById('set-date-btn');
    const countdownTimerEl = document.getElementById('countdown-timer');
    const daysNumEl = document.getElementById('days-num');
    const hoursNumEl = document.getElementById('hours-num');
    const minutesNumEl = document.getElementById('minutes-num');
    const secondsNumEl = document.getElementById('seconds-num');
    const calendarViewEl = document.getElementById('calendar-view');
    const calDay1El = document.getElementById('cal-day-1');
    const calDay2El = document.getElementById('cal-day-2');
    const calDay3El = document.getElementById('cal-day-3');

    // Check all countdown elements exist
    if (datePicker && setDateBtn && daysNumEl && hoursNumEl && minutesNumEl && secondsNumEl && calDay1El && calDay2El && calDay3El) {
        const localStorageKey = 'targetEventDate';
        let targetDate = null;
        let countdownInterval = null;

        function padZero(num) {
            return num < 10 ? '0' + num : num;
        }

        function updateCalendarDisplay(dateObj) {
            if (!dateObj || isNaN(dateObj.getTime())) {
                 calDay1El.textContent = '--'; calDay2El.textContent = '--'; calDay3El.textContent = '--';
                 calDay1El.classList.remove('highlight'); calDay2El.classList.add('highlight'); calDay3El.classList.remove('highlight');
                return;
            }
            const targetDay = dateObj.getDate();
            const prevDate = new Date(dateObj); prevDate.setDate(targetDay - 1);
            const nextDate = new Date(dateObj); nextDate.setDate(targetDay + 1);
            calDay1El.textContent = prevDate.getDate(); calDay2El.textContent = targetDay; calDay3El.textContent = nextDate.getDate();
            calDay1El.classList.remove('highlight'); calDay2El.classList.add('highlight'); calDay3El.classList.remove('highlight');
        }

        function updateCountdown() {
             if (!targetDate || isNaN(targetDate.getTime())) {
                 daysNumEl.textContent = '--'; hoursNumEl.textContent = '--'; minutesNumEl.textContent = '--'; secondsNumEl.textContent = '--';
                 return;
             }
            const now = new Date().getTime();
            // Use Date.UTC or consistent local time for targetDate creation
            const difference = targetDate.getTime() - now;
            if (difference <= 0) {
                daysNumEl.textContent = '00'; hoursNumEl.textContent = '00'; minutesNumEl.textContent = '00'; secondsNumEl.textContent = '00';
                if (countdownInterval) clearInterval(countdownInterval);
                countdownInterval = null;
                return;
            }
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            daysNumEl.textContent = padZero(days); hoursNumEl.textContent = padZero(hours); minutesNumEl.textContent = padZero(minutes); secondsNumEl.textContent = padZero(seconds);
        }

        function startCountdown() {
            if (countdownInterval) clearInterval(countdownInterval);
            if (targetDate && !isNaN(targetDate.getTime()) && targetDate.getTime() > new Date().getTime()) {
                 updateCountdown();
                 countdownInterval = setInterval(updateCountdown, 1000);
            } else {
                 updateCountdown();
            }
        }

        function handleSetDate() {
            const selectedDateString = datePicker.value;
            if (!selectedDateString) { alert('Please select a date.'); return; }
            const parts = selectedDateString.split('-');
            if (parts.length !== 3) { alert('Invalid date format.'); return; }
            const year = parseInt(parts[0], 10); const month = parseInt(parts[1], 10) - 1; const day = parseInt(parts[2], 10);
            if (isNaN(year) || isNaN(month) || isNaN(day)) { alert('Invalid date components.'); return; }
             // IMPORTANT: Create date representing START of the selected day in LOCAL timezone for comparison/display
             const potentialTargetDate = new Date(year, month, day); // Time will be 00:00:00 local

            if (isNaN(potentialTargetDate.getTime())) { alert('Invalid date selected.'); return; }
            const today = new Date(); today.setHours(0, 0, 0, 0); // Start of today local
            if (potentialTargetDate < today) { alert('Please select a future date.'); return; }

            localStorage.setItem(localStorageKey, selectedDateString); // Store YYYY-MM-DD
            targetDate = potentialTargetDate; // Use the local Date object
            updateCalendarDisplay(targetDate);
            startCountdown();
        }

        function loadDateFromStorage() {
            const storedDateString = localStorage.getItem(localStorageKey);
            if (storedDateString) {
                 const parts = storedDateString.split('-');
                 if (parts.length === 3) {
                     const year = parseInt(parts[0], 10); const month = parseInt(parts[1], 10) - 1; const day = parseInt(parts[2], 10);
                     if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                         // Recreate the Date object the same way it was created in handleSetDate
                         const loadedDate = new Date(year, month, day); // Local time 00:00:00
                         if (!isNaN(loadedDate.getTime())) {
                            targetDate = loadedDate;
                            datePicker.value = storedDateString; // Set input correctly
                            updateCalendarDisplay(targetDate);
                            startCountdown();
                         } else { localStorage.removeItem(localStorageKey); updateCalendarDisplay(null); updateCountdown();}
                     } else { localStorage.removeItem(localStorageKey); updateCalendarDisplay(null); updateCountdown();}
                 } else { localStorage.removeItem(localStorageKey); updateCalendarDisplay(null); updateCountdown();}
            } else {
                 updateCalendarDisplay(null); updateCountdown();
            }
        }

        // --- Countdown Event Listeners & Initial Load ---
        setDateBtn.addEventListener('click', handleSetDate);
        loadDateFromStorage();

    } else {
        console.warn("One or more countdown timer elements not found.");
    }


    // --- Venue Swiper Logic ---
    const venueCard = document.getElementById('venue-details-card');
    const chooseVenueCard = document.getElementById('choose-venue-card');

    // Check base swiper elements and venueData exist
    if (venueCard && chooseVenueCard && typeof venueData !== 'undefined' && venueData.length > 0) {
        const venueWrapper = venueCard.querySelector('.card-content-wrapper');
        const chooseWrapper = chooseVenueCard.querySelector('.card-content-wrapper');
        const allDotsInnerContainers = document.querySelectorAll('.dots-inner'); // Select ALL dot containers

        // Get references AND check they exist for content elements
        const venueNameEl = venueWrapper?.querySelector('.venue-name');
        const venueDateEl = venueWrapper?.querySelector('.venue-date');
        const ratingEl = chooseWrapper?.querySelector('.rating');
        const ratingTextEl = chooseWrapper?.querySelector('.rating-text');
        const venueIcon1El = chooseWrapper?.querySelector('.venue-icon-1');
        const venueIcon2El = chooseWrapper?.querySelector('.venue-icon-2');

        // Ensure ALL required elements for swiper content update are present
        if (venueWrapper && chooseWrapper && venueNameEl && venueDateEl && ratingEl && ratingTextEl && venueIcon1El && venueIcon2El && allDotsInnerContainers.length > 0) {

            let isDragging = false;
            let startX = 0;
            let currentX = 0;
            let diffX = 0;
            let cardWidth = venueCard.offsetWidth;

            // --- Generate Dots Function ---
             function generateDots() {
                allDotsInnerContainers.forEach(container => {
                    if (!container) return; // Skip if container not found
                    container.innerHTML = ''; // Clear existing
                    venueData.forEach((_, index) => {
                        const dot = document.createElement('span');
                        // dot.setAttribute('data-index', index); // Optional
                        container.appendChild(dot);
                    });
                });
            }

            // --- Update Dots Function ---
            function updateDots(activeIndex) {
                 allDotsInnerContainers.forEach(container => {
                    if (!container) return; // Skip if container not found
                    const dots = container.querySelectorAll('span');
                    const dotsContainer = container.parentElement; // The '.dots' div
                    if (!dotsContainer || dots.length !== venueData.length) return;

                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === activeIndex);
                    });

                    // Calculate translation
                    const totalDotSpace = DOT_WIDTH + (DOT_MARGIN * 2);
                    const activeDotCenter = activeIndex * totalDotSpace + (DOT_WIDTH / 2) + DOT_MARGIN;
                    const containerWidth = dotsContainer.offsetWidth; // Use actual width of '.dots'
                    const containerCenter = containerWidth / 2;
                    let translateX = containerCenter - activeDotCenter;

                    // Boundary check (optional: prevents excessive sliding if few dots)
                    const maxTranslate = 0;
                    const minTranslate = containerWidth - (venueData.length * totalDotSpace);
                    translateX = Math.min(maxTranslate, Math.max(minTranslate, translateX));


                    container.style.transform = `translateX(${translateX}px)`;
                 });
            }

            // --- Display Venue Function ---
            function displayVenue(index) {
                if (index < 0 || index >= venueData.length) return;
                const data = venueData[index];

                // Update Venue Details Card
                venueNameEl.textContent = data.name;
                venueCard.style.backgroundImage = `url('${data.image}')`;
                venueDateEl.textContent = data.dateText;

                // Update Choose Venue Card
                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<span class="${i <= data.ratingStars ? 'filled' : ''}">${i <= data.ratingStars ? '★' : '☆'}</span>`;
                }
                ratingEl.innerHTML = starsHTML;
                ratingTextEl.textContent = data.ratingText;
                venueIcon1El.textContent = data.venueIcon1 || '';
                venueIcon2El.textContent = data.venueIcon2 || '';

                // Update dots
                updateDots(index);
            }

            // --- Swipe Handlers ---
            function handleSwipeStart(e) {
                isDragging = true;
                startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                currentX = startX;
                cardWidth = venueCard.offsetWidth;
                venueWrapper.classList.add('is-swiping');
                chooseWrapper.classList.add('is-swiping');
                // Prevent default to avoid text selection/image drag issues
                 if (!e.target.closest('button, input, a')) { // Allow interaction with buttons/inputs
                    e.preventDefault();
                }
            }

            function handleSwipeMove(e) {
                if (!isDragging) return;
                currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                diffX = currentX - startX;
                venueWrapper.style.transform = `translateX(${diffX}px)`;
                chooseWrapper.style.transform = `translateX(${diffX}px)`;
            }

            function handleSwipeEnd(e) {
                if (!isDragging) return;
                isDragging = false;
                venueWrapper.classList.remove('is-swiping');
                chooseWrapper.classList.remove('is-swiping');
                const threshold = cardWidth / 4;
                let newIndex = currentVenueIndex;

                if (diffX < -threshold && currentVenueIndex < venueData.length - 1) newIndex++;
                else if (diffX > threshold && currentVenueIndex > 0) newIndex--;

                // Snap card content back first
                venueWrapper.style.transform = `translateX(0px)`;
                chooseWrapper.style.transform = `translateX(0px)`;

                // Update content and dots only if index changed
                if (newIndex !== currentVenueIndex) {
                     currentVenueIndex = newIndex;
                     displayVenue(currentVenueIndex); // This calls updateDots
                }
                // No 'else' needed to reset dots, as they only move when displayVenue is called

                diffX = 0;
            }

            // --- Attach Swipe Event Listeners ---
            venueCard.addEventListener('mousedown', handleSwipeStart);
            venueCard.addEventListener('touchstart', handleSwipeStart, { passive: false });
            document.addEventListener('mousemove', handleSwipeMove);
            document.addEventListener('touchmove', handleSwipeMove, { passive: false });
            document.addEventListener('mouseup', handleSwipeEnd);
            document.addEventListener('mouseleave', handleSwipeEnd);
            document.addEventListener('touchend', handleSwipeEnd);

            // --- Initial Swiper Setup ---
            generateDots(); // Generate dots HTML
            displayVenue(currentVenueIndex); // Display first item and set dots

            // --- Resize Handler ---
            window.addEventListener('resize', () => {
                if(venueCard) cardWidth = venueCard.offsetWidth;
                updateDots(currentVenueIndex); // Recalculate dot position on resize
            });

        } else {
            console.error("Swiper initialisation failed: One or more required elements or containers not found.");
        }

    } else {
        console.warn("Venue swiper base elements (venueCard, chooseVenueCard) or venueData not found. Swiping disabled.");
    }

}); // --- End DOMContentLoaded ---
