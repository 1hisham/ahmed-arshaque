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
    // Screens always present initially
    gatewayScreen: document.getElementById('gateway-screen'),
    viewBtn: document.getElementById('view-invitation-btn'),
    viewBismillah: document.getElementById('view-bismillah'),
    gatewayGroom: document.getElementById('gateway-groom'),
    gatewayBride: document.getElementById('gateway-bride'),

    // Audio always present
    audio: document.getElementById('bg-audio'),
    audioToggle: document.getElementById('audio-toggle'),

    // Canvas always present
    canvas: document.getElementById('petals-canvas'),

    // Dynamic screens (will be bound in ensureDetailsLoaded)
    detailsScreen: null,
    detailsGroom: null,
    detailsBride: null,
    viewAccentHeader: null,
    viewDate: null,
    viewTime: null,
    viewQuote: null,
    viewVenueTitle: null,
    viewAddress: null,
    viewCountdownTitle: null,
    calendarLink: null,
    directionsLink: null,
    callLink: null,
    whatsappLink: null,

    // Dynamic admin drawer (will be bound in ensureAdminDrawerLoaded)
    adminDrawer: null,
    closeDrawer: null,
    editorForm: null,
    resetDefaults: null,
    editGroom: null,
    editBride: null,
    editBismillah: null,
    editAccentHeader: null,
    editDateText: null,
    editTimeText: null,
    editCountdownDate: null,
    editQuote: null,
    editVenueTitle: null,
    editAddress: null,
    editMapsUrl: null,
    editAudioUrl: null,
    editEnablePetals: null,
    editPhone: null,
    editWhatsapp: null
};

let detailsLoaded = false;
let adminDrawerLoaded = false;

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
    // Apply texts to gateway screen (always loaded)
    if (el.viewBismillah) {
        el.viewBismillah.innerHTML = currentSettings.bismillah || "";
        el.viewBismillah.style.display = currentSettings.bismillah ? 'block' : 'none';
    }

    if (el.gatewayGroom) el.gatewayGroom.textContent = currentSettings.groom;
    if (el.gatewayBride) el.gatewayBride.textContent = currentSettings.bride;

    if (detailsLoaded) {
        if (el.detailsGroom) el.detailsGroom.textContent = currentSettings.groom;
        if (el.detailsBride) el.detailsBride.textContent = currentSettings.bride;

        if (el.viewAccentHeader) el.viewAccentHeader.textContent = currentSettings.accentHeader;
        if (el.viewDate) el.viewDate.textContent = currentSettings.dateText;
        if (el.viewTime) el.viewTime.textContent = currentSettings.timeText;
        if (el.viewQuote) el.viewQuote.textContent = currentSettings.quote;
        if (el.viewVenueTitle) el.viewVenueTitle.textContent = currentSettings.venueTitle;
        if (el.viewAddress) el.viewAddress.textContent = currentSettings.address;

        // Apply directions URL
        if (el.directionsLink) el.directionsLink.href = currentSettings.mapsUrl;

        // Apply communications
        if (el.callLink) el.callLink.href = `tel:${currentSettings.phone}`;
        if (el.whatsappLink) el.whatsappLink.href = `https://wa.me/${currentSettings.whatsapp}`;

        // Configure Google Calendar Link
        updateGoogleCalendarLink();

        // Start or reload countdown timer
        startCountdownTimer();
    }

    // Set title
    document.title = `${currentSettings.groom} & ${currentSettings.bride} — Wedding Invitation`;

    // Configure background music source
    if (el.audio) {
        const currentAudioSource = el.audio.querySelector('source').src;
        if (currentAudioSource !== currentSettings.audioUrl) {
            el.audio.src = currentSettings.audioUrl;
            el.audio.load();
            // Restart playback if detail screen is already shown
            if (detailsLoaded && !el.detailsScreen.classList.contains('hidden') && !el.audio.paused) {
                el.audio.play().catch(e => console.log("Playback retry failed", e));
            }
        }
    }

    // Start or Stop Petals animation
    if (currentSettings.enablePetals) {
        startPetalsAnimation();
    } else {
        stopPetalsAnimation();
    }
}

function populateFormFields() {
    if (!adminDrawerLoaded) return;
    if (el.editGroom) el.editGroom.value = currentSettings.groom;
    if (el.editBride) el.editBride.value = currentSettings.bride;
    if (el.editBismillah) el.editBismillah.value = currentSettings.bismillah;
    if (el.editAccentHeader) el.editAccentHeader.value = currentSettings.accentHeader;
    if (el.editDateText) el.editDateText.value = currentSettings.dateText;
    if (el.editTimeText) el.editTimeText.value = currentSettings.timeText;
    if (el.editCountdownDate) el.editCountdownDate.value = currentSettings.countdownDate;
    if (el.editQuote) el.editQuote.value = currentSettings.quote;
    if (el.editVenueTitle) el.editVenueTitle.value = currentSettings.venueTitle;
    if (el.editAddress) el.editAddress.value = currentSettings.address;
    if (el.editMapsUrl) el.editMapsUrl.value = currentSettings.mapsUrl;
    if (el.editAudioUrl) el.editAudioUrl.value = currentSettings.audioUrl;
    if (el.editEnablePetals) el.editEnablePetals.checked = currentSettings.enablePetals;
    if (el.editPhone) el.editPhone.value = currentSettings.phone;
    if (el.editWhatsapp) el.editWhatsapp.value = currentSettings.whatsapp;
}

// Format UTC Dates for Google Calendar URL: YYYYMMDDTHHmmSSZ
function updateGoogleCalendarLink() {
    try {
        if (!el.calendarLink) return;
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
function ensureDetailsLoaded() {
    if (detailsLoaded) return;

    const template = document.getElementById('details-template');
    if (template) {
        const clone = template.content.cloneNode(true);
        // Insert details screen into body, right after gateway screen
        el.gatewayScreen.parentNode.insertBefore(clone, el.gatewayScreen.nextSibling);
    }

    // Bind details elements
    el.detailsScreen = document.getElementById('details-screen');
    el.detailsGroom = document.getElementById('details-groom');
    el.detailsBride = document.getElementById('details-bride');
    el.viewAccentHeader = document.getElementById('view-accent-header');
    el.viewDate = document.getElementById('view-date');
    el.viewTime = document.getElementById('view-time');
    el.viewQuote = document.getElementById('view-quote');
    el.viewVenueTitle = document.getElementById('view-venue-title');
    el.viewAddress = document.getElementById('view-address');
    el.viewCountdownTitle = document.getElementById('view-countdown-title');
    el.calendarLink = document.getElementById('calendar-link');
    el.directionsLink = document.getElementById('directions-link');
    el.callLink = document.getElementById('call-link');
    el.whatsappLink = document.getElementById('whatsapp-link');

    detailsLoaded = true;
}

function ensureAdminDrawerLoaded() {
    if (adminDrawerLoaded) return;

    const template = document.getElementById('admin-drawer-template');
    if (template) {
        const clone = template.content.cloneNode(true);
        document.body.appendChild(clone);
    }

    // Bind drawer elements
    el.adminDrawer = document.getElementById('admin-drawer');
    el.closeDrawer = document.getElementById('close-drawer');
    el.editorForm = document.getElementById('editor-form');
    el.resetDefaults = document.getElementById('reset-defaults');

    // Bind inputs
    el.editGroom = document.getElementById('edit-groom');
    el.editBride = document.getElementById('edit-bride');
    el.editBismillah = document.getElementById('edit-bismillah');
    el.editAccentHeader = document.getElementById('edit-accent-header');
    el.editDateText = document.getElementById('edit-date-text');
    el.editTimeText = document.getElementById('edit-time-text');
    el.editCountdownDate = document.getElementById('edit-countdown-date');
    el.editQuote = document.getElementById('edit-quote');
    el.editVenueTitle = document.getElementById('edit-venue-title');
    el.editAddress = document.getElementById('edit-address');
    el.editMapsUrl = document.getElementById('edit-maps-url');
    el.editAudioUrl = document.getElementById('edit-audio-url');
    el.editEnablePetals = document.getElementById('edit-enable-petals');
    el.editPhone = document.getElementById('edit-phone');
    el.editWhatsapp = document.getElementById('edit-whatsapp');

    initDrawerHandlers();

    adminDrawerLoaded = true;
}

function initDrawerHandlers() {
    if (!el.closeDrawer) return;

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

function initAppFlow() {
    // Transition Landing to Details screen
    if (el.viewBtn) {
        el.viewBtn.addEventListener('click', () => {
            // Lazy load the details screen to DOM
            ensureDetailsLoaded();

            // Populate the details screen fields with current settings
            applySettingsToUI();

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
    }

    // Check for editor-toggle in DOM
    const editorToggle = document.getElementById('editor-toggle');
    if (editorToggle) {
        editorToggle.addEventListener('click', () => {
            ensureAdminDrawerLoaded();
            populateFormFields();
            el.adminDrawer.classList.add('active');
        });
    }
}


// Initialize everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initAudio();
    initAppFlow();
});
