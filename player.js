document.addEventListener('DOMContentLoaded', () => {
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

    // --- SVG Icons ---
    const playIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36px" height="36px"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36px" height="36px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    let isPlaying = false;

    // --- Helper Function: Format time (seconds -> MM:SS) ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // --- Update Button Icon and State ---
    function updatePlayPauseIcon() {
        if (isPlaying) {
            playPauseIcon.innerHTML = pauseIconSvg;
            playPauseBtn.setAttribute('aria-label', 'Pause');
        } else {
            playPauseIcon.innerHTML = playIconSvg;
            playPauseBtn.setAttribute('aria-label', 'Play');
        }
    }

    // --- Play/Pause Functionality ---
    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseIcon();
    }

    // --- Update Progress Bar and Time ---
    function updateProgress() {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = `${progressPercent}%`;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        }
         // Handle song ending
        if (audioPlayer.currentTime >= audioPlayer.duration) {
            audioPlayer.pause(); // Stop playback explicitly
            audioPlayer.currentTime = 0; // Reset time
            isPlaying = false;
            updatePlayPauseIcon(); // Show play icon again
            progress.style.width = '0%'; // Reset progress bar visually
            currentTimeEl.textContent = formatTime(0);
        }
    }


    // --- Set Total Duration ---
    function setDuration() {
        if (audioPlayer.duration) {
            totalTimeEl.textContent = formatTime(audioPlayer.duration);
        }
    }

    // --- Seek Functionality ---
    function seek(event) {
        // Check duration is valid before seeking
        if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
             // Calculate click position relative to the progress bar container
            const width = progressContainer.clientWidth; // Get the display width
            const clickX = event.offsetX;            // Get the x coordinate of the click within the element
            const duration = audioPlayer.duration;

            audioPlayer.currentTime = (clickX / width) * duration;

             // If paused when seeking, start playing
             if (!isPlaying) {
                 togglePlayPause();
             }
        } else {
            console.log("Audio duration not available yet for seeking.");
        }
    }

    // --- Change Volume ---
    function changeVolume() {
        // Volume property is between 0.0 and 1.0
        audioPlayer.volume = volumeSlider.value / 100;
    }

    // --- Previous/Next Button (Restart for single song) ---
    function restartSong() {
        audioPlayer.currentTime = 0;
        if (!isPlaying) { // If paused, start playing from beginning
            togglePlayPause();
        } else { // If already playing, just continue from beginning
            audioPlayer.play();
        }
    }


    // --- Event Listeners ---
    playPauseBtn.addEventListener('click', togglePlayPause);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', setDuration); // Use loadedmetadata for duration
    progressContainer.addEventListener('click', seek);
    volumeSlider.addEventListener('input', changeVolume);
    prevBtn.addEventListener('click', restartSong);
    nextBtn.addEventListener('click', restartSong);

     // --- Initial Setup ---
    // Set initial volume based on slider default
    changeVolume();
    // Set initial duration if metadata loaded quickly
    setDuration();
    // Update icon just in case
    updatePlayPauseIcon();

});
// Add this code inside your DOMContentLoaded listener,
// or in a new JS file linked after player.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Music Player Elements & Logic (Keep existing player code here) ---
    const audioPlayer = document.getElementById('audio-player');
    // ... (rest of your player variables and functions)


    // --- Countdown Timer Elements & Logic ---
    const datePicker = document.getElementById('event-date-picker');
    const setDateBtn = document.getElementById('set-date-btn');
    const countdownTimerEl = document.getElementById('countdown-timer');
    const daysNumEl = document.getElementById('days-num');
    const hoursNumEl = document.getElementById('hours-num');
    const minutesNumEl = document.getElementById('minutes-num');
    const secondsNumEl = document.getElementById('seconds-num');

    const calendarViewEl = document.getElementById('calendar-view');
    const calDay1El = document.getElementById('cal-day-1');
    const calDay2El = document.getElementById('cal-day-2'); // The highlighted one
    const calDay3El = document.getElementById('cal-day-3');

    const localStorageKey = 'targetEventDate';
    let targetDate = null; // Holds the Date object
    let countdownInterval = null; // To store the interval ID

    // --- Helper: Pad numbers with leading zero ---
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    // --- Update Calendar Display ---
    function updateCalendarDisplay(dateObj) {
        if (!dateObj || isNaN(dateObj.getTime())) {
             calDay1El.textContent = '--';
             calDay2El.textContent = '--';
             calDay3El.textContent = '--';
             // Reset classes if needed (though default is fine)
             calDay1El.classList.remove('highlight');
             calDay2El.classList.add('highlight'); // Ensure middle is highlighted default
             calDay3El.classList.remove('highlight');
            return;
        }

        const targetDay = dateObj.getDate();

        // Calculate previous day
        const prevDate = new Date(dateObj);
        prevDate.setDate(targetDay - 1);
        calDay1El.textContent = prevDate.getDate();

        // Set target day
        calDay2El.textContent = targetDay;

        // Calculate next day
        const nextDate = new Date(dateObj);
        nextDate.setDate(targetDay + 1);
        calDay3El.textContent = nextDate.getDate();

        // Ensure only the middle one has highlight class
        calDay1El.classList.remove('highlight');
        calDay2El.classList.add('highlight');
        calDay3El.classList.remove('highlight');
    }


    // --- Update Countdown Timer Display ---
    function updateCountdown() {
        if (!targetDate || isNaN(targetDate.getTime())) return; // Exit if no valid target date

        const now = new Date().getTime();
        // We calculate difference to the *start* of the target day
        const difference = targetDate.getTime() - now;

        if (difference <= 0) {
            // Target date reached or passed
            daysNumEl.textContent = '00';
            hoursNumEl.textContent = '00';
            minutesNumEl.textContent = '00';
            secondsNumEl.textContent = '00';
            if (countdownInterval) {
                clearInterval(countdownInterval); // Stop the interval
                countdownInterval = null;
            }
            return; // Stop further calculation
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update the DOM
        daysNumEl.textContent = padZero(days);
        hoursNumEl.textContent = padZero(hours);
        minutesNumEl.textContent = padZero(minutes);
        secondsNumEl.textContent = padZero(seconds);
    }

    // --- Start or Restart the Countdown Interval ---
    function startCountdown() {
        // Clear any existing interval first
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        if (targetDate && !isNaN(targetDate.getTime()) && targetDate.getTime() > new Date().getTime()) {
             // Run immediately once, then set interval
             updateCountdown();
             countdownInterval = setInterval(updateCountdown, 1000); // Update every second
        } else {
             // Handle cases where date is invalid or in the past on initial load/set
             updateCountdown(); // Show 00s or '--'
        }
    }

    // --- Handle Setting a New Date ---
    function handleSetDate() {
        const selectedDateString = datePicker.value; // Format: YYYY-MM-DD

        if (!selectedDateString) {
            alert('Please select a date.');
            return;
        }

        // --- IMPORTANT: Parse correctly to avoid timezone issues ---
        // Create date object based on the input string components
        // This interprets the date as local time at midnight
        const parts = selectedDateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        const potentialTargetDate = new Date(year, month, day); // Sets time to 00:00:00 in local timezone


        if (isNaN(potentialTargetDate.getTime())) {
             alert('Invalid date selected.');
             return;
        }

         // Optional: Prevent selecting past dates
         const today = new Date();
         today.setHours(0, 0, 0, 0); // Set today to midnight for comparison
         if (potentialTargetDate < today) {
             alert('Please select a future date.');
             return;
         }

        // Store the selected date string (YYYY-MM-DD) in localStorage
        localStorage.setItem(localStorageKey, selectedDateString);

        // Update the global targetDate variable
        targetDate = potentialTargetDate;

        // Update displays
        updateCalendarDisplay(targetDate);
        startCountdown(); // Start/Restart the interval timer
    }

    // --- Load Date from Local Storage on Page Load ---
    function loadDateFromStorage() {
        const storedDateString = localStorage.getItem(localStorageKey);
        if (storedDateString) {
            // Parse the stored string back into a Date object (same method as setting)
             const parts = storedDateString.split('-');
             const year = parseInt(parts[0], 10);
             const month = parseInt(parts[1], 10) - 1;
             const day = parseInt(parts[2], 10);
             const loadedDate = new Date(year, month, day);

            if (!isNaN(loadedDate.getTime())) {
                targetDate = loadedDate;
                datePicker.value = storedDateString; // Set input field value
                updateCalendarDisplay(targetDate);
                startCountdown(); // Start countdown based on stored date
            } else {
                // Handle invalid stored data (optional: clear it)
                localStorage.removeItem(localStorageKey);
                updateCalendarDisplay(null); // Reset calendar display
            }
        } else {
             // No date stored, reset displays to default
             updateCalendarDisplay(null);
             daysNumEl.textContent = '--';
             hoursNumEl.textContent = '--';
             minutesNumEl.textContent = '--';
             secondsNumEl.textContent = '--';
        }
    }

    // --- Event Listeners ---
    setDateBtn.addEventListener('click', handleSetDate);

    // --- Initial Load ---
    loadDateFromStorage();

    // ... (rest of your DOMContentLoaded listener, maybe player initial setup calls)

}); // End of DOMContentLoaded listener