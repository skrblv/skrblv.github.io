// =========================================================================
// == VENUE DATA & CONFIGURATION
// =========================================================================
const venueData = [
  // *** REPLACE with your actual coordinates and venue details ***
  {
    id: 1,
    name: "Cooksoo",
    image:
      "https://i3.photo.2gis.com/images/branch/0/30258560050575435_fc96.jpg",
    dateText: "APRIL 4-6",
    ratingStars: 5,
    ratingText: "Authentic Ramen & Vibes",
    venueIcon1: "🍜",
    venueIcon2: "🥢",
    lat: 42.874928,
    lng: 74.604942,
  },
  {
    id: 2,
    name: "KFC GUM",
    image:
      "https://i2.photo.2gis.com/images/branch/0/30258560173723753_65ee.jpg",
    dateText: "APRIL 4-6",
    ratingStars: 4,
    ratingText: "Fried Chicken Feast!",
    venueIcon1: "🍗",
    venueIcon2: "🍟",
    lat: 42.875401,
    lng: 74.614218,
  },
  {
    id: 3,
    name: "Bublik Cafe",
    image:
      "https://i6.photo.2gis.com/photo-gallery/13966df8-9536-4929-b361-018e85081478.jpg",
    dateText: "APRIL 4-6",
    ratingStars: 3,
    ratingText: "Cozy Coffee & Pastries",
    venueIcon1: "🥐",
    venueIcon2: "☕",
    lat: 42.873594,
    lng: 74.595947,
  },
  {
    id: 4,
    name: "Papa Johns",
    image:
      "https://i8.photo.2gis.com/images/branch/112/15762598728857306_c4f2.jpg",
    dateText: "April 4-6",
    ratingStars: 4,
    ratingText: "Pizza Night!",
    venueIcon1: "🍕",
    venueIcon2: "🥤",
    lat: 42.872577,
    lng: 74.596343,
  },
];
let currentVenueIndex = 0; // Track the currently displayed venue

// --- Constants ---
const DOT_WIDTH = 8; // px
const DOT_MARGIN = 4; // px
const MAP_ZOOM_LEVEL = 15; // Default zoom level for the venue map

// --- Leaflet Map Variables ---
let venueMapInstance = null; // Holds the Leaflet map instance
let venueMarker = null; // Holds the Leaflet marker instance

// =========================================================================
// == DOMContentLoaded EVENT LISTENER (Main Execution Block)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // == MUSIC PLAYER LOGIC
  // =========================================================================
  const audioPlayer = document.getElementById("audio-player");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressContainer = document.getElementById("progress-container");
  const progress = document.getElementById("progress");
  const currentTimeEl = document.getElementById("current-time");
  const totalTimeEl = document.getElementById("total-time");
  const volumeSlider = document.getElementById("volume-slider");

  if (
    audioPlayer &&
    playPauseBtn &&
    playPauseIcon &&
    prevBtn &&
    nextBtn &&
    progressContainer &&
    progress &&
    currentTimeEl &&
    totalTimeEl &&
    volumeSlider
  ) {
    const playIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36px" height="36px"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36px" height="36px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    let isPlaying = false;

    function formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) seconds = 0;
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }
    function updatePlayPauseIcon() {
      playPauseIcon.innerHTML = isPlaying ? pauseIconSvg : playIconSvg;
      playPauseBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    }
    function togglePlayPause() {
      if (audioPlayer.paused) {
        audioPlayer.play().catch((e) => console.error("Audio play failed:", e));
        isPlaying = true;
      } else {
        audioPlayer.pause();
        isPlaying = false;
      }
      updatePlayPauseIcon();
    }
    function updateProgress() {
      if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const progressPercent =
          (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      } else {
        progress.style.width = "0%";
        currentTimeEl.textContent = "0:00";
      }
    }
    function setDuration() {
      if (
        audioPlayer.duration &&
        !isNaN(audioPlayer.duration) &&
        audioPlayer.duration > 0
      ) {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
      } else {
        totalTimeEl.textContent = "0:00";
      }
    }
    function seek(event) {
      if (isNaN(audioPlayer.duration) || audioPlayer.duration <= 0) return;
      const rect = progressContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = progressContainer.clientWidth;
      const seekRatio = Math.max(0, Math.min(1, clickX / width));
      audioPlayer.currentTime = seekRatio * audioPlayer.duration;
    }
    function changeVolume() {
      audioPlayer.volume = volumeSlider.value / 100;
    }
    function restartSong() {
      audioPlayer.currentTime = 0;
      if (!isPlaying) {
        togglePlayPause();
      } else {
        audioPlayer.play().catch((e) => console.error("Audio play failed:", e));
      }
    }

    playPauseBtn.addEventListener("click", togglePlayPause);
    audioPlayer.addEventListener("timeupdate", updateProgress);
    audioPlayer.addEventListener("loadedmetadata", setDuration);
    audioPlayer.addEventListener("durationchange", setDuration);
    audioPlayer.addEventListener("ended", () => {
      audioPlayer.currentTime = 0;
      isPlaying = false;
      updatePlayPauseIcon();
      progress.style.width = "0%";
      currentTimeEl.textContent = formatTime(0);
    });
    audioPlayer.addEventListener("error", (e) => {
      console.error("Audio Player Error:", e);
      totalTimeEl.textContent = "Error";
    });
    progressContainer.addEventListener("click", seek);
    volumeSlider.addEventListener("input", changeVolume);
    prevBtn.addEventListener("click", restartSong);
    nextBtn.addEventListener("click", restartSong);

    changeVolume();
    setDuration();
    updatePlayPauseIcon();
  } else {
    console.warn("Music player elements not found.");
  }

  // =========================================================================
  // == COUNTDOWN TIMER LOGIC
  // =========================================================================
  const datePicker = document.getElementById("event-date-picker");
  const setDateBtn = document.getElementById("set-date-btn");
  const daysNumEl = document.getElementById("days-num");
  const hoursNumEl = document.getElementById("hours-num");
  const minutesNumEl = document.getElementById("minutes-num");
  const secondsNumEl = document.getElementById("seconds-num");
  const calDay1El = document.getElementById("cal-day-1");
  const calDay2El = document.getElementById("cal-day-2");
  const calDay3El = document.getElementById("cal-day-3");

  if (
    datePicker &&
    setDateBtn &&
    daysNumEl &&
    hoursNumEl &&
    minutesNumEl &&
    secondsNumEl &&
    calDay1El &&
    calDay2El &&
    calDay3El
  ) {
    const localStorageKey = "targetEventDate";
    let targetDate = null;
    let countdownInterval = null;

    function padZero(num) {
      return num < 10 ? "0" + num : num;
    }
    function updateCalendarDisplay(dateObj) {
      if (!dateObj || isNaN(dateObj.getTime())) {
        calDay1El.textContent = "--";
        calDay2El.textContent = "--";
        calDay3El.textContent = "--";
        calDay1El.classList.remove("highlight");
        calDay2El.classList.add("highlight");
        calDay3El.classList.remove("highlight");
        return;
      }
      const targetDay = dateObj.getDate();
      const prevDate = new Date(dateObj);
      prevDate.setDate(targetDay - 1);
      const nextDate = new Date(dateObj);
      nextDate.setDate(targetDay + 1);
      calDay1El.textContent = prevDate.getDate();
      calDay2El.textContent = targetDay;
      calDay3El.textContent = nextDate.getDate();
      calDay1El.classList.remove("highlight");
      calDay2El.classList.add("highlight");
      calDay3El.classList.remove("highlight");
    }
    function updateCountdown() {
      if (!targetDate || isNaN(targetDate.getTime())) {
        daysNumEl.textContent = "--";
        hoursNumEl.textContent = "--";
        minutesNumEl.textContent = "--";
        secondsNumEl.textContent = "--";
        return;
      }
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      if (difference <= 0) {
        daysNumEl.textContent = "00";
        hoursNumEl.textContent = "00";
        minutesNumEl.textContent = "00";
        secondsNumEl.textContent = "00";
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      daysNumEl.textContent = padZero(days);
      hoursNumEl.textContent = padZero(hours);
      minutesNumEl.textContent = padZero(minutes);
      secondsNumEl.textContent = padZero(seconds);
    }
    function startCountdown() {
      if (countdownInterval) clearInterval(countdownInterval);
      if (
        targetDate &&
        !isNaN(targetDate.getTime()) &&
        targetDate.getTime() > new Date().getTime()
      ) {
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
      } else {
        updateCountdown();
      }
    }
    function handleSetDate() {
      const selectedDateString = datePicker.value;
      if (!selectedDateString) {
        alert("Please select a date.");
        return;
      }
      const parts = selectedDateString.split("-");
      if (parts.length !== 3) {
        alert("Invalid date format.");
        return;
      }
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        alert("Invalid date components.");
        return;
      }
      const potentialTargetDate = new Date(year, month, day);
      if (isNaN(potentialTargetDate.getTime())) {
        alert("Invalid date selected.");
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (potentialTargetDate < today) {
        alert("Please select a future date (or today).");
        return;
      }
      localStorage.setItem(localStorageKey, selectedDateString);
      targetDate = potentialTargetDate;
      updateCalendarDisplay(targetDate);
      startCountdown();
    }
    function loadDateFromStorage() {
      const storedDateString = localStorage.getItem(localStorageKey);
      if (storedDateString) {
        const parts = storedDateString.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const loadedDate = new Date(year, month, day);
            if (!isNaN(loadedDate.getTime())) {
              targetDate = loadedDate;
              datePicker.value = storedDateString;
              updateCalendarDisplay(targetDate);
              startCountdown();
              return;
            }
          }
        }
        localStorage.removeItem(localStorageKey);
      }
      updateCalendarDisplay(null);
      updateCountdown();
    }

    setDateBtn.addEventListener("click", handleSetDate);
    loadDateFromStorage();
  } else {
    console.warn("Countdown timer elements not found.");
  }

  // =========================================================================
  // == LEAFLET MAP INITIALIZATION (Inside Suggestion Card)
  // =========================================================================
  const venueMapContainer = document.getElementById("venue-map");
  if (venueMapContainer && typeof L !== "undefined" && venueData.length > 0) {
    try {
      const initialCoords =
        venueData[0] && venueData[0].lat && venueData[0].lng
          ? [venueData[0].lat, venueData[0].lng]
          : [0, 0]; // Default to [0,0] if first venue lacks coords
      venueMapInstance = L.map(venueMapContainer, {
        zoomControl: false,
      }).setView(initialCoords, MAP_ZOOM_LEVEL); // Disable default zoom +/-
      L.control.zoom({ position: "bottomright" }).addTo(venueMapInstance); // Add zoom control to bottom right

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(venueMapInstance);

      venueMarker = L.marker(initialCoords).addTo(venueMapInstance);
      if (venueData[0] && venueData[0].name) {
        venueMarker.bindPopup(`<b>${venueData[0].name}</b>`);
      }

      setTimeout(() => {
        if (venueMapInstance) venueMapInstance.invalidateSize();
      }, 200);
    } catch (error) {
      console.error("Error initializing Leaflet map:", error);
      if (venueMapContainer)
        venueMapContainer.innerHTML =
          "<p style='padding:10px; text-align:center; font-size:0.9em;'>Map Error</p>";
    }
  } else {
    /* Warnings logged in original block */
  }

  // =========================================================================
  // == VENUE SWIPER LOGIC
  // =========================================================================
  const venueCard = document.getElementById("venue-details-card");
  const chooseVenueCard = document.getElementById("choose-venue-card");
  const suggestionCard = document.querySelector(".venue-suggestion");

  if (
    venueCard &&
    chooseVenueCard &&
    suggestionCard &&
    typeof venueData !== "undefined" &&
    venueData.length > 0
  ) {
    const venueWrapper = venueCard.querySelector(".card-content-wrapper");
    const chooseWrapper = chooseVenueCard.querySelector(
      ".card-content-wrapper"
    );
    const suggestionWrapper = suggestionCard.querySelector(
      ".card-content-wrapper"
    );
    const allDotsInnerContainers = document.querySelectorAll(".dots-inner");
    const venueNameEl = venueWrapper?.querySelector(".venue-name");
    const venueDateEl = venueWrapper?.querySelector(".venue-date");
    const ratingEl = chooseWrapper?.querySelector(".rating");
    const ratingTextEl = chooseWrapper?.querySelector(".rating-text");
    const venueIcon1El = chooseWrapper?.querySelector(".venue-icon-1");
    const venueIcon2El = chooseWrapper?.querySelector(".venue-icon-2");

    if (
      venueWrapper &&
      chooseWrapper &&
      suggestionWrapper &&
      venueNameEl &&
      venueDateEl &&
      ratingEl &&
      ratingTextEl &&
      venueIcon1El &&
      venueIcon2El &&
      allDotsInnerContainers.length > 0
    ) {
      let isDragging = false,
        startX = 0,
        currentX = 0,
        diffX = 0,
        cardWidth = venueCard.offsetWidth;

      function generateDots() {
        allDotsInnerContainers.forEach((c) => {
          if (c) {
            c.innerHTML = "";
            venueData.forEach(() =>
              c.appendChild(document.createElement("span"))
            );
          }
        });
      }
      function updateDots(activeIndex) {
        /* ... (Dot sliding logic as before) ... */ allDotsInnerContainers.forEach(
          (container) => {
            if (!container) return;
            const dots = container.querySelectorAll("span");
            const dotsContainer = container.parentElement;
            if (
              !dotsContainer ||
              dots.length !== venueData.length ||
              dots.length === 0
            )
              return;
            dots.forEach((dot, index) =>
              dot.classList.toggle("active", index === activeIndex)
            );
            const dotTotalWidth = DOT_WIDTH + DOT_MARGIN * 2;
            const containerVisibleWidth = dotsContainer.offsetWidth;
            const containerCenter = containerVisibleWidth / 2;
            const activeDotCenterOffset =
              activeIndex * dotTotalWidth + dotTotalWidth / 2;
            let translateX = containerCenter - activeDotCenterOffset;
            const maxTranslate = 0;
            const totalInnerWidth = venueData.length * dotTotalWidth;
            const minTranslate = containerVisibleWidth - totalInnerWidth;
            if (totalInnerWidth > containerVisibleWidth) {
              translateX = Math.min(
                maxTranslate,
                Math.max(minTranslate, translateX)
              );
            } else {
              translateX = (containerVisibleWidth - totalInnerWidth) / 2;
            }
            container.style.transform = `translateX(${translateX}px)`;
          }
        );
      }
      function updateVenueMap(lat, lng, venueName) {
        if (
          venueMapInstance &&
          venueMarker &&
          typeof lat === "number" &&
          typeof lng === "number"
        ) {
          const newLatLng = [lat, lng];
          venueMapInstance.setView(newLatLng, MAP_ZOOM_LEVEL, {
            animate: true,
            pan: { duration: 0.5 },
          });
          venueMarker.setLatLng(newLatLng);
          if (venueName) {
            venueMarker.setPopupContent(`<b>${venueName}</b>`);
          }
          setTimeout(() => {
            if (venueMapInstance) venueMapInstance.invalidateSize();
          }, 150);
        } else {
          /* Warning logged in original block */
        }
      }

      function displayVenue(index) {
        if (index < 0 || index >= venueData.length) return;
        const data = venueData[index];
        venueNameEl.textContent = data.name;
        venueCard.style.backgroundImage = `url('${data.image}')`;
        venueDateEl.textContent = data.dateText;
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
          starsHTML += `<span class="${
            i <= data.ratingStars ? "filled" : ""
          }">${i <= data.ratingStars ? "★" : "☆"}</span>`;
        }
        ratingEl.innerHTML = starsHTML;
        ratingTextEl.textContent = data.ratingText;
        venueIcon1El.textContent = data.venueIcon1 || "";
        venueIcon2El.textContent = data.venueIcon2 || "";
        updateVenueMap(data.lat, data.lng, data.name); // Update map to current venue
        updateDots(index);
      }

      function handleSwipeStart(e) {
        if (e.target.closest("button, input, a, .dots, .leaflet-container"))
          return;
        isDragging = true;
        startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        diffX = 0;
        cardWidth = venueCard.offsetWidth;
        venueWrapper.classList.add("is-swiping");
        chooseWrapper.classList.add("is-swiping");
        suggestionWrapper.classList.add("is-swiping");
        if (e.type.includes("touch")) e.preventDefault();
      }
      function handleSwipeMove(e) {
        if (!isDragging) return;
        currentX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        diffX = currentX - startX;
        const transformValue = `translateX(${diffX}px)`;
        venueWrapper.style.transform = transformValue;
        chooseWrapper.style.transform = transformValue;
        suggestionWrapper.style.transform = transformValue;
        if (e.type.includes("touch")) e.preventDefault();
      }
      function handleSwipeEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        venueWrapper.classList.remove("is-swiping");
        chooseWrapper.classList.remove("is-swiping");
        suggestionWrapper.classList.remove("is-swiping");
        const threshold = cardWidth / 4;
        let newIndex = currentVenueIndex;
        if (diffX < -threshold && currentVenueIndex < venueData.length - 1)
          newIndex++;
        else if (diffX > threshold && currentVenueIndex > 0) newIndex--;
        const snapBackValue = `translateX(0px)`;
        venueWrapper.style.transform = snapBackValue;
        chooseWrapper.style.transform = snapBackValue;
        suggestionWrapper.style.transform = snapBackValue;
        if (newIndex !== currentVenueIndex) {
          currentVenueIndex = newIndex;
          displayVenue(currentVenueIndex);
        }
        diffX = 0;
      }

      venueCard.addEventListener("mousedown", handleSwipeStart);
      venueCard.addEventListener("touchstart", handleSwipeStart, {
        passive: false,
      });
      chooseVenueCard.addEventListener("mousedown", handleSwipeStart);
      chooseVenueCard.addEventListener("touchstart", handleSwipeStart, {
        passive: false,
      });
      suggestionCard.addEventListener("mousedown", handleSwipeStart);
      suggestionCard.addEventListener("touchstart", handleSwipeStart, {
        passive: false,
      });
      document.addEventListener("mousemove", handleSwipeMove);
      document.addEventListener("touchmove", handleSwipeMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleSwipeEnd);
      document.addEventListener("touchend", handleSwipeEnd);
      document.addEventListener("mouseleave", handleSwipeEnd);

      generateDots();
      displayVenue(currentVenueIndex); // Initial display

      window.addEventListener("resize", () => {
        if (venueCard) cardWidth = venueCard.offsetWidth;
        updateDots(currentVenueIndex);
        if (venueMapInstance) {
          setTimeout(() => {
            venueMapInstance.invalidateSize();
          }, 150);
        }
      });
    } else {
      console.error("Swiper setup failed: Essential elements missing.");
    }
  } else {
    console.warn("Swiper base elements or venueData missing.");
  }

  // =========================================================================
  // == INTERACTIVE CHECKLIST LOGIC (with localStorage persistence)
  // =========================================================================
  const checklistKey = "interactiveChecklistState"; // Key for localStorage
  const checklistItems = document.querySelectorAll(
    '.interactive-checklist input[type="checkbox"]'
  ); // Get all checkboxes in the list

  // Function to save the current state of all checkboxes to localStorage
  function saveChecklistState() {
    const state = {}; // Create an object to hold states
    checklistItems.forEach((item) => {
      // Store the checked status (true/false) using the item's ID as the key
      state[item.id] = item.checked;
    });
    // Convert the state object to a JSON string and save it
    localStorage.setItem(checklistKey, JSON.stringify(state));
  }

  // Function to load the saved state from localStorage and apply it
  function loadChecklistState() {
    const savedState = localStorage.getItem(checklistKey); // Get the saved JSON string
    if (savedState) {
      // Check if there is any saved state
      try {
        const state = JSON.parse(savedState); // Parse the JSON string back into an object
        // Loop through the checkboxes found on the page
        checklistItems.forEach((item) => {
          // If this checkbox's ID exists in the saved state object
          if (state[item.id] !== undefined) {
            // Set the checkbox's 'checked' property to the saved value (true/false)
            item.checked = state[item.id];
          }
        });
      } catch (e) {
        // Handle potential errors during JSON parsing (e.g., corrupted data)
        console.error("Error parsing checklist state from localStorage", e);
        localStorage.removeItem(checklistKey); // Clear corrupted data to prevent future errors
      }
    }
  }

  // Add event listeners to each checkbox
  if (checklistItems.length > 0) {
    // Only proceed if checkboxes were found
    checklistItems.forEach((item) => {
      // When any checkbox's state changes ('change' event)...
      item.addEventListener("change", saveChecklistState); // ...call the function to save the new state
    });

    // Load the initial state from localStorage when the page loads
    loadChecklistState();
  }
  // --- End Checklist Logic ---
}); // --- End DOMContentLoaded ---
