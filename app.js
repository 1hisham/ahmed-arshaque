// ==========================================================================
// DEFAULT SETTINGS & STATE MANAGER
// ==========================================================================
const DEFAULT_SETTINGS = {
    groom: "AHMED ARSHAQUE",
    bride: "FATHIMA RIMA",
    bismillah: "بِسْمِ ٱللهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    accentHeader: "Save our Date",
    dateText: "AUG 09, 2026",
    timeText: "11 AM - 2 PM",
    countdownDate: "2026-08-09T11:00",
    quote: "“As two hearts come together by the will of Allah, we cordially invite you to join us on this blessed and joyous occasion...”",
    venueTitle: "OUR RESIDENCE",
    address: "PLAZA CONVENTION CENTER",
    mapsUrl: "https://maps.app.goo.gl/DpFue5Px6KcyQJPFA?g_st=ic",
    audioUrl: "https://cdn.zelebrio.com/zelebrio/af49abaf-6e34-493c-91f1-6db75c2f8330/95394535-5bb1-4cf3-8eaa-2f66579a910b.mp3",
    enablePetals: true,
    phone: "9496083275",
    whatsapp: "9496083275"
};

let currentSettings = { ...DEFAULT_SETTINGS };
let countdownInterval = null;
let animationFrameId = null;

// Select DOM elements
const el = {
    // Screens
    gatewayScreen: document.getElementById('gateway-screen'),
    detailsScreen: document.getElementById('details-screen'),
    viewBtn: document.getElementById('view-invitation-btn'),

    // Custom display fields
    viewBismillah: document.getElementById('view-bismillah'),
    gatewayGroom: document.getElementById('gateway-groom'),
    gatewayBride: document.getElementById('gateway-bride'),
    detailsGroom: document.getElementById('details-groom'),
    detailsBride: document.getElementById('details-bride'),
    viewAccentHeader: document.getElementById('view-accent-header'),
    viewDate: document.getElementById('view-date'),
    viewTime: document.getElementById('view-time'),
    viewQuote: document.getElementById('view-quote'),
    viewVenueTitle: document.getElementById('view-venue-title'),
    viewAddress: document.getElementById('view-address'),
    viewCountdownTitle: document.getElementById('view-countdown-title'),

    // Links
    calendarLink: document.getElementById('calendar-link'),
    directionsLink: document.getElementById('directions-link'),
    callLink: document.getElementById('call-link'),
    whatsappLink: document.getElementById('whatsapp-link'),

    // Audio
    audio: document.getElementById('bg-audio'),
    audioToggle: document.getElementById('audio-toggle'),

    // Canvas
    canvas: document.getElementById('petals-canvas'),

    // Drawer
    editorToggle: document.getElementById('editor-toggle'),
    adminDrawer: document.getElementById('admin-drawer'),
    closeDrawer: document.getElementById('close-drawer'),
    editorForm: document.getElementById('editor-form'),
    resetDefaults: document.getElementById('reset-defaults'),

    // Inputs
    editGroom: document.getElementById('edit-groom'),
    editBride: document.getElementById('edit-bride'),
    editBismillah: document.getElementById('edit-bismillah'),
    editAccentHeader: document.getElementById('edit-accent-header'),
    editDateText: document.getElementById('edit-date-text'),
    editTimeText: document.getElementById('edit-time-text'),
    editCountdownDate: document.getElementById('edit-countdown-date'),
    editQuote: document.getElementById('edit-quote'),
    editVenueTitle: document.getElementById('edit-venue-title'),
    editAddress: document.getElementById('edit-address'),
    editMapsUrl: document.getElementById('edit-maps-url'),
    editAudioUrl: document.getElementById('edit-audio-url'),
    editEnablePetals: document.getElementById('edit-enable-petals'),
    editPhone: document.getElementById('edit-phone'),
    editWhatsapp: document.getElementById('edit-whatsapp')
};

// ==========================================================================
// LOCAL STORAGE LOGIC
// ==========================================================================
const STORAGE_KEY = 'zelebrio_clone_settings';

function loadSettings() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch (e) {
            console.error("Failed to parse settings from LocalStorage, falling back to defaults", e);
            currentSettings = { ...DEFAULT_SETTINGS };
        }
    } else {
        currentSettings = { ...DEFAULT_SETTINGS };
    }
    applySettingsToUI();
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    currentSettings = { ...settings };
    applySettingsToUI();
}

function resetSettings() {
    localStorage.removeItem(STORAGE_KEY);
    currentSettings = { ...DEFAULT_SETTINGS };
    applySettingsToUI();
    populateFormFields();
}

function applySettingsToUI() {
    // Apply texts
    el.viewBismillah.innerHTML = currentSettings.bismillah || "";
    el.viewBismillah.style.display = currentSettings.bismillah ? 'block' : 'none';

    el.gatewayGroom.textContent = currentSettings.groom;
    el.gatewayBride.textContent = currentSettings.bride;
    el.detailsGroom.textContent = currentSettings.groom;
    el.detailsBride.textContent = currentSettings.bride;

    el.viewAccentHeader.textContent = currentSettings.accentHeader;
    el.viewDate.textContent = currentSettings.dateText;
    el.viewTime.textContent = currentSettings.timeText;
    el.viewQuote.textContent = currentSettings.quote;
    el.viewVenueTitle.textContent = currentSettings.venueTitle;
    el.viewAddress.textContent = currentSettings.address;

    // Set title
    document.title = `${currentSettings.groom} & ${currentSettings.bride} — Wedding Invitation`;

    // Apply directions URL
    el.directionsLink.href = currentSettings.mapsUrl;

    // Apply communications
    el.callLink.href = `tel:${currentSettings.phone}`;
    el.whatsappLink.href = `https://wa.me/${currentSettings.whatsapp}`;

    // Configure background music source
    const currentAudioSource = el.audio.querySelector('source').src;
    if (currentAudioSource !== currentSettings.audioUrl) {
        el.audio.src = currentSettings.audioUrl;
        el.audio.load();
        // Restart playback if detail screen is already shown
        if (!el.detailsScreen.classList.contains('hidden') && !el.audio.paused) {
            el.audio.play().catch(e => console.log("Playback retry failed", e));
        }
    }

    // Configure Google Calendar Link
    updateGoogleCalendarLink();

    // Start or Stop Petals animation
    if (currentSettings.enablePetals) {
        startPetalsAnimation();
    } else {
        stopPetalsAnimation();
    }

    // Start or reload countdown timer
    startCountdownTimer();
}

function populateFormFields() {
    el.editGroom.value = currentSettings.groom;
    el.editBride.value = currentSettings.bride;
    el.editBismillah.value = currentSettings.bismillah;
    el.editAccentHeader.value = currentSettings.accentHeader;
    el.editDateText.value = currentSettings.dateText;
    el.editTimeText.value = currentSettings.timeText;
    el.editCountdownDate.value = currentSettings.countdownDate;
    el.editQuote.value = currentSettings.quote;
    el.editVenueTitle.value = currentSettings.venueTitle;
    el.editAddress.value = currentSettings.address;
    el.editMapsUrl.value = currentSettings.mapsUrl;
    el.editAudioUrl.value = currentSettings.audioUrl;
    el.editEnablePetals.checked = currentSettings.enablePetals;
    el.editPhone.value = currentSettings.phone;
    el.editWhatsapp.value = currentSettings.whatsapp;
}

// Format UTC Dates for Google Calendar URL: YYYYMMDDTHHmmSSZ
function updateGoogleCalendarLink() {
    try {
        const startDate = new Date(currentSettings.countdownDate);
        if (isNaN(startDate.getTime())) return;

        // Assume duration is 3 hours if not specified
        const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        const timeFormatted = `${formatDate(startDate)}/${formatDate(endDate)}`;
        const eventTitle = `Wedding of ${currentSettings.groom} & ${currentSettings.bride}`;
        const detailsText = currentSettings.quote;
        const location = currentSettings.address;

        const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${timeFormatted}&details=${encodeURIComponent(detailsText)}&location=${encodeURIComponent(location)}`;

        el.calendarLink.href = gCalUrl;
    } catch (e) {
        console.error("Error setting Google Calendar Link: ", e);
    }
}

// ==========================================================================
// COUNTDOWN TIMER LOGIC
// ==========================================================================
function startCountdownTimer() {
    if (countdownInterval) clearInterval(countdownInterval);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    const targetTime = new Date(currentSettings.countdownDate).getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (isNaN(targetTime) || distance < 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minsEl.textContent = minutes.toString().padStart(2, '0');
        secsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}


// ==========================================================================
// FALLING PETALS ANIMATION
// ==========================================================================
const canvas = el.canvas;
const ctx = canvas.getContext('2d');
let particlesArray = [];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1 - 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        // Determine type: 80% pink sakura petal, 20% warm leaf
        this.isLeaf = Math.random() > 0.8;
        this.opacity = Math.random() * 0.4 + 0.5;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 30) * 0.3; // Gentle wind swing
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.isLeaf) {
            // Draw warm gold/light-brown leaf outline or shape
            ctx.fillStyle = '#8a7a6a';
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size / 2, 0, 0, this.size);
            ctx.quadraticCurveTo(-this.size / 2, 0, 0, -this.size);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw pink sakura petal
            ctx.fillStyle = 'rgba(247, 200, 205, 0.85)';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.restore();
    }
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    animationFrameId = requestAnimationFrame(animateParticles);
}

function startPetalsAnimation() {
    if (animationFrameId) return; // Already running
    window.addEventListener('resize', handleResize);
    handleResize();
    initParticles();
    animateParticles();
}

function stopPetalsAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    window.removeEventListener('resize', handleResize);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// ==========================================================================
// AUDIO PLAYBACK HANDLERS
// ==========================================================================
function initAudio() {
    // Load settings url
    el.audio.src = currentSettings.audioUrl;

    el.audioToggle.addEventListener('click', () => {
        if (el.audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    });
}

function playAudio() {
    el.audio.play()
        .then(() => {
            el.audioToggle.classList.add('playing');
        })
        .catch(err => {
            console.warn("Audio autoplay blocked or failed:", err);
        });
}

function pauseAudio() {
    el.audio.pause();
    el.audioToggle.classList.remove('playing');
}


// ==========================================================================
// INTERACTIVE FLOW HANDLERS (VIEW INVITATION, ADMIN PANEL)
// ==========================================================================
function initAppFlow() {
    // Transition Landing to Details screen
    el.viewBtn.addEventListener('click', () => {
        // Fade out gateway
        el.gatewayScreen.classList.add('hidden');

        // Frame Details transition
        el.detailsScreen.classList.remove('hidden');
        el.detailsScreen.scrollIntoView({ behavior: 'smooth' });

        // Play Background Audio
        playAudio();

        // Show Mute floating widget
        el.audioToggle.classList.remove('hidden');
    });

    // Drawer handlers
    el.editorToggle.addEventListener('click', () => {
        populateFormFields();
        el.adminDrawer.classList.add('active');
    });

    el.closeDrawer.addEventListener('click', () => {
        el.adminDrawer.classList.remove('active');
    });

    // Close drawer when clicking outside it
    el.adminDrawer.addEventListener('click', (e) => {
        if (e.target === el.adminDrawer) {
            el.adminDrawer.classList.remove('active');
        }
    });

    // Handle Form Submit
    el.editorForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const settings = {
            groom: el.editGroom.value.trim(),
            bride: el.editBride.value.trim(),
            bismillah: el.editBismillah.value.trim(),
            accentHeader: el.editAccentHeader.value.trim(),
            dateText: el.editDateText.value.trim(),
            timeText: el.editTimeText.value.trim(),
            countdownDate: el.editCountdownDate.value,
            quote: el.editQuote.value.trim(),
            venueTitle: el.editVenueTitle.value.trim(),
            address: el.editAddress.value.trim(),
            mapsUrl: el.editMapsUrl.value.trim(),
            audioUrl: el.editAudioUrl.value.trim(),
            enablePetals: el.editEnablePetals.checked,
            phone: el.editPhone.value.trim(),
            whatsapp: el.editWhatsapp.value.trim()
        };

        saveSettings(settings);
        el.adminDrawer.classList.remove('active');
    });

    // Handle Reset Details
    el.resetDefaults.addEventListener('click', () => {
        if (confirm("Are you sure you want to restore default details?")) {
            resetSettings();
            el.adminDrawer.classList.remove('active');
        }
    });
}


// Initialize everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initAudio();
    initAppFlow();
});
