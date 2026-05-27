/* ═══════════════════════════════════════════════
   BOOK HOTEL — script.js
═══════════════════════════════════════════════ */

// ── DİL SİSTEMİ / LANGUAGE SYSTEM ────────────────
let currentLang = localStorage.getItem('lang') || 'en';

const LANG = {
  en: {
    // Navbar
    home: 'Home', wishlist: '❤️ Wishlist', myRes: 'My Reservations', profile: '👤 Profile', logout: 'Logout',
    // Search bar
    destination: '✈ Destination', destPlaceholder: 'Where are you going?',
    checkin: '📅 Check-in', checkout: '📅 Check-out',
    guests: '👥 Guests & Rooms',
    searchBtn: '🔍 Search',
    // Guest picker
    adults: 'Adults', adultsAge: 'Age 18+',
    children: 'Children', childrenAge: 'Age 0–17',
    rooms: 'Rooms', done: 'Done ✓',
    // Home
    recommended: '⭐ Top Hotels in Cyprus',
    // Search page
    searchTitle: 'Cyprus Hotels',
    sortLabel: 'Sort by',
    // Hotel detail
    viewRooms: 'View Rooms', bookNow: 'Book Now ›',
    // Booking
    guestInfo: 'Guest Information', proceedPay: 'Continue to Payment →',
    // Chatbot
    chatWelcome: '👋 Hello! I\'m your Cyprus hotel assistant. Tell me which city or type of hotel you\'re looking for! 🏨',
    chatPlaceholder: 'Type your message...',
    chatSugs: ['🏖 Hotels in Kyrenia', '💰 Budget friendly', '🎰 Casino resorts', '🏝 Beach hotels'],
    // Auth
    signIn: 'Sign In', register: 'Register', createAccount: 'Create Account',
    verify: 'Verify Code', logout2: 'Logout',
  },
  tr: {
    home: 'Ana Sayfa', wishlist: '❤️ Favoriler', myRes: 'Rezervasyonlarım', profile: '👤 Profil', logout: 'Çıkış',
    destination: '✈ Hedef', destPlaceholder: 'Nereye gidiyorsunuz?',
    checkin: '📅 Giriş', checkout: '📅 Çıkış',
    guests: '👥 Misafir & Oda',
    searchBtn: '🔍 Ara',
    adults: 'Yetişkin', adultsAge: '18+ yaş',
    children: 'Çocuk', childrenAge: '0–17 yaş',
    rooms: 'Oda', done: 'Tamam ✓',
    recommended: '⭐ Kıbrıs\'ın En İyi Otelleri',
    searchTitle: 'Kıbrıs Otelleri',
    sortLabel: 'Sıralama',
    viewRooms: 'Odaları Gör', bookNow: 'Rezervasyon ›',
    guestInfo: 'Misafir Bilgileri', proceedPay: 'Ödemeye Devam →',
    chatWelcome: '👋 Merhaba! Kıbrıs otel asistanınım. Hangi şehir veya özellikte otel aradığını söyle! 🏨',
    chatPlaceholder: 'Mesajınızı yazın...',
    chatSugs: ['🏖 Girne otelleri', '💰 Uygun fiyatlı', '🎰 Casino resort', '🏝 Plaj oteli'],
    signIn: 'Giriş Yap', register: 'Kayıt Ol', createAccount: 'Hesap Oluştur',
    verify: 'Kodu Doğrula', logout2: 'Çıkış Yap',
  }
};

function t(key) {
  return LANG[currentLang][key] || LANG['en'][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Bayrak butonları güncelle
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll(`#btn${lang.toUpperCase()}`).forEach(btn => btn.classList.add('active'));

  // Tüm data-i18n elementleri güncelle
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Placeholder'ları güncelle
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });

  // Chatbot güncelle
  const chatWel = document.getElementById('chatWelcome');
  if (chatWel) chatWel.textContent = t('chatWelcome');
  const chatInp = document.getElementById('chatInput');
  if (chatInp) chatInp.placeholder = t('chatPlaceholder');
  const sugs = document.querySelectorAll('.chat-sug[data-tr]');
  sugs.forEach((btn, i) => {
    btn.textContent = lang === 'tr' ? btn.getAttribute('data-tr') : btn.getAttribute('data-en');
  });

  // Guest picker
  updateGuestDisplay();

  // App.py'ye dil bilgisi gönder (chatbot için)
  window._chatLang = lang;
}

// ── PAGE NAVIGATION ──────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
}

function showManagerPage(pageId) {
  showPage(pageId);
}

function showAdminPage(pageId) {
  showPage(pageId);
}

// ── 2FA TIMER ────────────────────────────────────
let timerInterval = null;
let activeLoginRole = null;

function startTimer(seconds) {
  clearInterval(timerInterval);
  const el = document.getElementById('twofaTimer');
  if (!el) return;
  timerInterval = setInterval(() => {
    if (seconds <= 0) {
      clearInterval(timerInterval);
      if (el) el.textContent = '00:00';
      return;
    }
    seconds--;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);
}

function resendCode(e) {
  e.preventDefault();
  showMsg('twofaErr', false);
  fetch('/api/resend-2fa', { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        setTwoFAMessage(data.debug_code);
        startTimer(300);
      } else {
        showMsg('twofaErr', true);
      }
    })
    .catch(() => showMsg('twofaErr', true));
}

// ── AUTH: REGISTER ───────────────────────────────
function submitRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const phone    = document.getElementById('regPhone').value.trim();

  let valid = true;

  // Email validation
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError('regEmail', 'regEmailErr', !emailOk);
  if (!emailOk) valid = false;

  // Password validation: 8+ chars, 1 uppercase, 1 number
  const pwOk = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  setFieldError('regPassword', 'regPasswordErr', !pwOk);
  if (!pwOk) valid = false;

  if (password !== confirm) {
    alert('Passwords do not match.');
    valid = false;
  }

  if (!valid) return;

  activeLoginRole = null;
  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      setTwoFAMessage(data.debug_code);
      showPage('twoFAPage');
      startTimer(300);
    } else {
      alert(data.message || 'Registration failed');
    }
  })
  .catch(() => alert('Registration failed. Check Flask/MySQL is running.'));
}

// ── AUTH: STAFF REGISTER ─────────────────────────
function submitStaffRegister() {
  const name     = document.getElementById('staffName').value.trim();
  const email    = document.getElementById('staffEmail').value.trim();
  const password = document.getElementById('staffPassword').value;
  const confirm  = document.getElementById('staffConfirm').value;
  const role     = document.getElementById('staffRole').value;
  const errEl    = document.getElementById('staffRegErr');

  let valid = true;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError('staffEmail', 'staffEmailErr', !emailOk);
  if (!emailOk) valid = false;

  const pwOk = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  setFieldError('staffPassword', 'staffPasswordErr', !pwOk);
  if (!pwOk) valid = false;

  if (password !== confirm) {
    if (errEl) { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); }
    valid = false;
  }
  if (!valid) return;
  if (errEl) errEl.classList.remove('show');

  fetch('/api/register-staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      setTwoFAMessage(data.debug_code);
      showPage('twoFAPage');
      startTimer(300);
    } else {
      if (errEl) { errEl.textContent = data.message || 'Registration failed.'; errEl.classList.add('show'); }
    }
  })
  .catch(() => {
    if (errEl) { errEl.textContent = 'Connection error.'; errEl.classList.add('show'); }
  });
}

// ── AUTH: LOGIN ──────────────────────────────────
function submitLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  showMsg('loginErr', false);
  activeLoginRole = null;

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      setTwoFAMessage(data.debug_code);
      showPage('twoFAPage');
      startTimer(300);
    } else {
      showMsg('loginErr', true);
      document.getElementById('loginPassword').classList.add('err');
    }
  })
  .catch(() => showMsg('loginErr', true));
}

function submitAdminLogin() {
  const email    = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  showMsg('adminLoginErr', false);
  activeLoginRole = 'ADMIN';

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'ADMIN' })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      setTwoFAMessage(data.debug_code);
      showPage('twoFAPage');
      startTimer(300);
    } else {
      showMsg('adminLoginErr', true);
      document.getElementById('adminPassword').classList.add('err');
    }
  })
  .catch(() => showMsg('adminLoginErr', true));
}

// ── AUTH: 2FA VERIFY ─────────────────────────────
function verify2FA() {
  const code = document.getElementById('twofaCode').value.trim();
  showMsg('twofaErr', false);

  fetch('/api/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  .then(r => r.json())
  .then(data => {
    if (!data.success) {
      showMsg('twofaErr', true);
      return;
    }
    clearInterval(timerInterval);
    routeByRole(data.role);
  })
  .catch(() => showMsg('twofaErr', true));
}

function routeByRole(role) {
  if (role === 'ADMIN') {
    showPage('adminDashPage');
    loadAdminHotels();
    loadAdminUsers();
  } else if (role === 'HOTEL_MANAGER') {
    showPage('managerDashPage');
    initCharts();
    loadManagerStats();
    loadManagerReservations();
  } else {
    showPage('homePage');
    loadHotels();
  }
}

function setTwoFAMessage(code) {
  const el = document.getElementById('twofaMessage');
  if (!el) return;
  el.textContent = code
    ? `Local test 2FA code: ${code}`
    : 'We sent a 6-digit verification code to your email or phone.';
}

// ── LOGOUT ───────────────────────────────────────
function logout() {
  fetch('/api/logout', { method: 'POST' })
    .then(() => showPage('loginPage'))
    .catch(() => showPage('loginPage'));
}

// ── HOTELS ───────────────────────────────────────
const DEMO_HOTELS = [
  { id:1, hotel_name:'The Landmark Nicosia – Autograph Collection', city:'Lefkoşa, Kıbrıs', score:'9.4', label:'Excellent', reviews:'54 reviews', price:'Price from €303', img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70' },
  { id:2, hotel_name:'Merit Park Hotel – Casino & Spa', city:'Girne, Kıbrıs', score:'9.0', label:'Excellent', reviews:'491 reviews', price:'Price from €748', img:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70' },
  { id:3, hotel_name:'Cratos Premium Hotel – Casino & Spa', city:'Girne, Kıbrıs', score:'9.0', label:'Excellent', reviews:'413 reviews', price:'Starting from €760', img:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=70' },
  { id:4, hotel_name:'Salamis Bay Conti Hotel – Resort & Casino & Spa', city:'Mağusa, Kıbrıs', score:'8.7', label:'Good', reviews:'2.169 reviews', price:'Starting from €292', img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=70' },
];

function loadHotels() {
  fetch('/api/hotels')
    .then(r => r.json())
    .then(hotels => { allHotelsCache = hotels.length ? hotels : DEMO_HOTELS; renderPage(1); })
    .catch(() => { allHotelsCache = DEMO_HOTELS; renderPage(1); });
}

// placeholder — renderPage ve allHotelsCache aşağıda tanımlanıyor

function renderHotels(hotels) {
  const grid = document.getElementById('hotelsGrid');
  if (!grid) return;
  grid.innerHTML = hotels.map(h => `
    <div class="h-card">
      <div style="position:relative">
        <img class="h-card-img" src="${h.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70'}" alt="${h.hotel_name}" onclick="openHotelDetail(${h.id})">
        <button onclick="toggleFavorite(${h.id},'${(h.hotel_name||'').replace(/'/g,"\\'")}','${h.img||''}','${h.city||''}',${h.score||0},'${h.price||''}',this)"
          style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.15)"
          title="${isFavorite(h.id)?'Remove from Wishlist':'Add to Wishlist'}">${isFavorite(h.id)?'❤️':'🤍'}</button>
      </div>
      <div class="h-card-body" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <div class="h-card-type">Otel</div>
        <div class="h-card-name">${h.hotel_name || h.room_type}</div>
        <div class="h-card-loc">${h.city || ''}</div>
        <div class="h-card-bottom">
          <div class="h-score ${parseFloat(h.score) < 9 ? 'good' : ''}">${h.score || ''}</div>
          <div class="h-score-info">
            <span class="h-score-label ${parseFloat(h.score) < 9 ? 'good' : ''}">${h.label || 'Excellent'}</span>
            <span class="h-score-rev">${h.reviews || ''}</span>
          </div>
          <span class="h-card-price">${h.price || ''}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ── SEARCH ───────────────────────────────────────
let selectedHotelId = null;

function goSearch() {
  const dest    = (document.getElementById('searchDest')    || {}).value || '';
  const checkin = (document.getElementById('searchCheckin') || {}).value || '';
  const checkout= (document.getElementById('searchCheckout')|| {}).value || '';

  showPage('searchPage');

  // Değerleri sidebar'a aktar
  const destEl = document.getElementById('sDest');
  if (destEl && dest) destEl.value = dest;

  const ciEl = document.getElementById('sCheckin');
  if (ciEl && checkin) { ciEl.value = checkin; dateState.checkin = checkin; }

  const coEl = document.getElementById('sCheckout');
  if (coEl && checkout) { coEl.value = checkout; dateState.checkout = checkout; }

  updateNightsDisplay();
  fetchAndRenderSearch();
}

function doSearch() {
  fetchAndRenderSearch();
}

function fetchAndRenderSearch() {
  const q        = (document.getElementById('sDest')      || {}).value || '';
  const sort     = (document.getElementById('sSort')      || {}).value || 'score_desc';
  const minPrice = (document.getElementById('sMinPrice')  || {}).value || '';
  const maxPrice = (document.getElementById('sMaxPrice')  || {}).value || '';
  const minScore = (document.getElementById('sMinScore')  || {}).value || '';

  const qs = new URLSearchParams();
  if (q)        qs.set('q', q);
  if (sort)     qs.set('sort', sort);
  if (minPrice) qs.set('min_price', minPrice);
  if (maxPrice) qs.set('max_price', maxPrice);
  if (minScore) qs.set('min_score', minScore);

  // Checkbox filtreleri — sadece seçili olanlar
  const checked = [];
  document.querySelectorAll('.filter-item input[type=checkbox]:checked').forEach(cb => {
    if (cb.value) checked.push(cb.value);
  });
  if (checked.length) qs.set('amenity', checked[0]); // backend tek amenity alıyor

  const el = document.getElementById('searchResults');
  if (el) el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">🔍 Searching...</div>';

  fetch('/api/hotels/search?' + qs.toString())
    .then(r => r.json())
    .then(hotels => {
      // Client-side multi-amenity filter
      let filtered = hotels;
      if (checked.length > 1) {
        filtered = hotels.filter(h => {
          const am = (h.amenities || '').toLowerCase();
          return checked.every(c => am.includes(c.toLowerCase()));
        });
      }
      renderSearchResults(filtered);
      // Sonuç sayısını güncelle
      const info = document.getElementById('searchResultInfo');
      if (info) info.textContent = `${filtered.length} hotel${filtered.length!==1?'s':''} found${q?' for "'+q+'"':''}`;
    })
    .catch(() => renderSearchResults([]));
}

function renderSearchResults(hotels) {
  const el = document.getElementById('searchResults');
  if (!el) return;
  if (!hotels || !hotels.length) {
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">No hotels found.</div>';
    return;
  }
  el.innerHTML = hotels.map(h => {
    const score = parseFloat(h.score) || 0;
    const isExc = score >= 9;
    const ci = dateState.checkin;
    const co = dateState.checkout;
    const nights = (ci && co) ? Math.max(1, Math.round((new Date(co)-new Date(ci))/86400000)) : 1;
    const total  = (parseFloat(h.price_from||0) * nights).toFixed(0);
    return `
    <div class="r-card">
      <div style="position:relative;flex-shrink:0">
        <img class="r-card-img" src="${h.img || ''}" alt="${h.hotel_name}" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <button onclick="toggleFavorite(${h.id},'${(h.hotel_name||'').replace(/'/g,"\\'")}','${h.img||''}','${h.city||''}',${h.score||0},'${h.price||''}',this)"
          style="position:absolute;top:6px;right:6px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:30px;height:30px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.15)">${isFavorite(h.id)?'❤️':'🤍'}</button>
      </div>
      <div class="r-card-body" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <div class="r-card-name">${h.hotel_name}</div>
        <div class="r-card-dist">📍 ${h.city}${h.district ? ', ' + h.district : ''}</div>
        <div class="r-card-tags">${(h.amenities || '').split(',').slice(0,3).join(' · ')}</div>
        <button class="r-card-link">View Details →</button>
      </div>
      <div class="r-card-right">
        <div class="r-score ${isExc ? 'exc' : ''}">${score.toFixed(1)}</div>
        <div class="r-score-lbl ${isExc ? 'exc' : ''}">${h.label || ''}</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:4px">${nights} night${nights>1?'s':''}</div>
        <div class="r-price" style="margin-top:4px">EUR ${total}</div>
        <div style="font-size:10.5px;color:var(--muted)">EUR ${parseFloat(h.price_from||0).toFixed(0)}/night</div>
      </div>
    </div>`;
  }).join('');
}

// ── HOTEL DETAIL ──────────────────────────────────
function openHotelDetail(hotelId) {
  selectedHotelId = hotelId;
  fetch('/api/hotels/' + hotelId)
    .then(r => r.json())
    .then(hotel => {
      // Otel adı
      const nameEl = document.getElementById('detailHotelName');
      if (nameEl) nameEl.textContent = hotel.hotel_name || '';

      // Lokasyon
      const locEl = document.getElementById('detailHotelLoc');
      if (locEl) locEl.textContent = '📍 ' + (hotel.city || '') + (hotel.district ? ', ' + hotel.district : '');

      // Resim
      const imgEl = document.getElementById('detailMainImg');
      if (imgEl && hotel.img) imgEl.src = hotel.img;

      // Açıklama
      const descEl = document.getElementById('detailHotelDesc');
      if (descEl) descEl.textContent = hotel.description || '';

      // Puan
      const scoreEl = document.getElementById('detailHotelScore');
      if (scoreEl) scoreEl.textContent = parseFloat(hotel.score || 0).toFixed(1);

      // Fiyat
      const priceEl = document.getElementById('detailHotelPrice');
      if (priceEl) priceEl.textContent = hotel.price || '';

      // Odalar
      const roomsEl = document.getElementById('detailRoomsList');
      if (roomsEl && hotel.rooms && hotel.rooms.length) {
        roomsEl.innerHTML = hotel.rooms.map(r => `
          <div class="room-row">
            <img class="room-row-img" src="${r.img || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80'}" alt="${r.room_type}">
            <div class="room-row-body">
              <div class="room-row-name">${r.room_type} – Room ${r.room_number}</div>
              <div class="room-row-tag">👥 Max ${r.capacity} guests · ${(r.amenities || '').split(',').slice(0,3).join(' · ')}</div>
            </div>
            <div class="room-row-right">
              <div class="room-nights-lbl">per night</div>
              <div class="room-price-main">EUR ${parseFloat(r.price_per_night).toFixed(0)}</div>
              <button class="btn-book-now" onclick="selectRoomAndBook(${JSON.stringify(r).replace(/"/g,'&quot;')}, ${hotel.id}, '${(hotel.hotel_name||'').replace(/'/g,"\\'")}')">Book Now ›</button>
            </div>
          </div>`).join('');
      }

      // Reviews
      renderReviews(hotel.guest_reviews || [], hotel.id);

      showPage('hotelDetailPage');
    })
    .catch(() => showPage('hotelDetailPage'));
}

// Booking state
const bookingState = { hotel: null, room: null };

function selectRoomAndBook(room, hotelId, hotelName) {
  bookingState.hotel = { id: hotelId, name: hotelName };
  bookingState.room  = room;

  // Order card doldur
  const nameEl = document.getElementById('orderHotelName');
  if (nameEl) nameEl.textContent = hotelName;
  const roomEl = document.getElementById('orderRoomName');
  if (roomEl) roomEl.textContent = room.room_type || '';
  const priceEl = document.getElementById('orderRoomPrice');
  if (priceEl) priceEl.textContent = 'EUR ' + parseFloat(room.price_per_night).toFixed(2);
  const totalEl = document.getElementById('orderTotalPrice');
  if (totalEl) totalEl.textContent = 'EUR ' + parseFloat(room.price_per_night).toFixed(2);

  showPage('bookingPage');
}

function completePayment() {
  const ccNum  = document.getElementById('ccNum')?.value || '';
  const ccName = document.getElementById('ccName')?.value || '';
  if (!ccName.trim() || ccNum.replace(/\D/g,'').length < 12) {
    alert('Please enter valid card details.');
    return;
  }
  const last4 = ccNum.replace(/\D/g,'').slice(-4) || '0000';

  fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reservation_id: bookingState.reservationId,
      amount:         bookingState.totalPrice || 0,
      method:         'credit_card',
      card_last4:     last4,
    }),
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      // Confirmation doldur
      const now = new Date().toLocaleString('en-GB');
      const ref = 'BK-' + new Date().getFullYear() + '-' + String(bookingState.reservationId || Date.now()).slice(-6);
      const setTxt = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
      setTxt('confirmBookingId', ref);
      setTxt('confirmDateTime',  now);
      setTxt('confirmAmount',    'EUR ' + parseFloat(bookingState.totalPrice||0).toFixed(2));
      setTxt('confirmPayMethod', 'Visa ending in ' + last4);
      setTxt('confirmTxnRef',    data.transaction_ref || '');
      showPage('paySuccessPage');
    } else {
      showPage('payFailPage');
    }
  })
  .catch(() => showPage('payFailPage'));
}

// ── CALENDAR ─────────────────────────────────────
function buildCalendar() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  const days = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  let html = days.map(d => `<div class="cal-dh">${d}</div>`).join('');
  // Oct 2026 starts on Thursday (index 3)
  const start = 3;
  const total = 31;
  for (let i = 0; i < start; i++) html += `<div class="cal-d other">${29 + i}</div>`;
  for (let d = 1; d <= total; d++) {
    let cls = 'cal-d';
    if (d === 7) cls += ' today';
    if (d === 14) cls += ' selected';
    if (d >= 15 && d <= 23) cls += ' in-range';
    if (d === 23) cls += ' selected';
    html += `<div class="${cls}">${d}</div>`;
  }
  grid.innerHTML = html;
}

// ── CREDIT CARD LIVE UPDATE ───────────────────────
function updateCard() {
  const num    = document.getElementById('ccNum')?.value || '';
  const holder = document.getElementById('ccName')?.value || '';
  const numEl  = document.getElementById('cardNumDisplay');
  const holderEl = document.getElementById('cardHolderDisplay');
  if (numEl) {
    const clean = num.replace(/\D/g,'').substring(0,16);
    const spaced = clean.replace(/(.{4})/g,'$1 ').trim();
    numEl.textContent = spaced || '0000 0000 0000 0000';
  }
  if (holderEl) holderEl.textContent = holder.toUpperCase() || 'CARDHOLDER';
}

// ── CHARTS (Analytics page) ──────────────────────
function initCharts() {
  // Revenue line chart
  const rCtx = document.getElementById('revenueChart');
  if (rCtx && !rCtx._chartInited) {
    rCtx._chartInited = true;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
    script.onload = () => {
      new Chart(rCtx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May'],
          datasets: [{
            data: [20000, 28000, 36000, 44000, 56000],
            borderColor: '#2D7A6A', backgroundColor: 'rgba(45,122,106,.08)',
            pointBackgroundColor: '#fff', pointBorderColor: '#2D7A6A',
            pointRadius: 5, tension: 0.3, fill: true
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#eee' }, ticks: { color: '#9CA3AF' } },
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
          }
        }
      });

      const bCtx = document.getElementById('bookingChart');
      if (bCtx) {
        new Chart(bCtx, {
          type: 'bar',
          data: {
            labels: ['Jan','Feb','Mar','Apr','May'],
            datasets: [{
              data: [170, 205, 220, 210, 248],
              backgroundColor: '#2D7A6A',
              borderRadius: 20, borderSkipped: false
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              y: { grid: { color: '#eee' }, ticks: { color: '#9CA3AF' }, max: 300 },
              x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
            }
          }
        });
      }
    };
    document.head.appendChild(script);
  }
}

// ── ADMIN PANEL ───────────────────────────────────
function loadAdminHotels() {
  fetch('/api/admin/hotels')
    .then(r => r.json())
    .then(hotels => {
      const tbody = document.querySelector('#adminHotelsPage tbody');
      if (!tbody) return;
      tbody.innerHTML = (hotels || []).map(h => `
        <tr>
          <td>${h.hotel_name}</td>
          <td><span class="td-loc">📍 ${h.city}</span></td>
          <td>${h.stars || 5}⭐</td>
          <td><span class="td-badge ${h.status === 'ACTIVE' ? 'active' : 'pending'}">${h.status}</span></td>
          <td><div class="td-actions">
            <button class="td-edit" title="Edit">✏</button>
            <button class="td-del" onclick="deleteHotel(${h.id})" title="Delete">🗑</button>
          </div></td>
        </tr>`).join('');
    })
    .catch(() => {});
}

function deleteHotel(id) {
  if (!confirm('Deactivate this hotel?')) return;
  fetch('/api/admin/hotels/' + id, { method: 'DELETE' })
    .then(r => r.json())
    .then(() => loadAdminHotels())
    .catch(() => {});
}

function loadAdminUsers() {
  fetch('/api/admin/users')
    .then(r => r.json())
    .then(users => {
      const tbody = document.querySelector('#adminUsersPage .users-card tbody');
      if (!tbody) return;
      tbody.innerHTML = (users || []).map(u => `
        <tr>
          <td><strong>${u.name}</strong><br><small style="color:var(--muted)">${u.email}</small></td>
          <td style="color:var(--muted)">${u.role}</td>
          <td>${u.phone || '—'}</td>
        </tr>`).join('');
    })
    .catch(() => {});
}

// ── YORUMLARl ─────────────────────────────────────
function submitReview(hotelId) {
  const rating  = document.getElementById('reviewRating')?.value;
  const comment = document.getElementById('reviewComment')?.value.trim();
  const name    = document.getElementById('reviewName')?.value.trim();
  if (!rating || !comment || !name) { showToast('Lütfen tüm alanları doldurun.'); return; }
  fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel_id: hotelId, rating, comment, reviewer_name: name }),
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      showToast('Yorumunuz eklendi! ⭐');
      document.getElementById('reviewComment').value = '';
      loadReviews(hotelId);
    } else showToast(d.message || 'Hata oluştu.');
  })
  .catch(() => showToast('Bağlantı hatası.'));
}

function loadReviews(hotelId) {
  fetch('/api/hotels/' + hotelId)
    .then(r => r.json())
    .then(hotel => renderReviews(hotel.guest_reviews || [], hotelId))
    .catch(() => {});
}

function renderReviews(reviews, hotelId) {
  const el = document.getElementById('reviewsList');
  if (!el) return;
  const avg = reviews.length ? (reviews.reduce((s,r)=>s+parseFloat(r.rating||0),0)/reviews.length).toFixed(1) : '—';
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="width:52px;height:52px;background:var(--green);border-radius:10px;color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center">${avg}</div>
      <div><div style="font-size:14px;font-weight:700;color:var(--green)">Guest Rating</div><div style="font-size:12px;color:var(--muted)">${reviews.length} review${reviews.length!==1?'s':''}</div></div>
    </div>
    ${reviews.map(r=>`
    <div style="background:var(--bg);border-radius:10px;padding:12px 14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <strong style="font-size:13px">${r.reviewer_name||'Guest'}</strong>
        <span style="background:var(--green);color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:700">${parseFloat(r.rating||0).toFixed(1)}</span>
      </div>
      <div style="font-size:12.5px;color:var(--sub)">${r.comment||''}</div>
    </div>`).join('')}
    <div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px;margin-top:12px">
      <div style="font-size:14px;font-weight:700;margin-bottom:10px">Write a Review</div>
      <input id="reviewName" type="text" placeholder="Your name" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-size:13px;margin-bottom:8px;outline:none">
      <select id="reviewRating" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-size:13px;margin-bottom:8px;outline:none">
        <option value="">Select rating</option>
        <option value="10">⭐ 10 – Exceptional</option>
        <option value="9">⭐ 9 – Excellent</option>
        <option value="8">⭐ 8 – Very Good</option>
        <option value="7">⭐ 7 – Good</option>
        <option value="6">⭐ 6 – Okay</option>
      </select>
      <textarea id="reviewComment" placeholder="Share your experience..." rows="3" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-size:13px;resize:none;outline:none;margin-bottom:8px"></textarea>
      <button onclick="submitReview(${hotelId})" style="background:var(--green);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13.5px;font-weight:600;cursor:pointer;width:100%">Submit Review ⭐</button>
    </div>`;
}

// ── PROFİL SAYFASI ────────────────────────────────
function loadProfile() {
  fetch('/api/me')
    .then(r => r.json())
    .then(data => {
      if (!data.authenticated) return;
      const u = data.user;
      const setV = (id, v) => { const e = document.getElementById(id); if(e) e.value = v||''; };
      setV('profileName',  u.name);
      setV('profileEmail', u.email);
      setV('profilePhone', u.phone);
      const roleEl = document.getElementById('profileRole');
      if (roleEl) roleEl.textContent = u.role;
    });
}

function saveProfile() {
  const name  = document.getElementById('profileName')?.value.trim();
  const phone = document.getElementById('profilePhone')?.value.trim();
  fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  })
  .then(r => r.json())
  .then(d => showToast(d.message || 'Profile updated!'))
  .catch(() => showToast('Error saving profile.'));
}

function changePassword() {
  const current = document.getElementById('currentPassword')?.value;
  const newpw   = document.getElementById('newPassword')?.value;
  const confirm = document.getElementById('confirmNewPassword')?.value;
  if (!current || !newpw || !confirm) { showToast('Tüm alanları doldurun.'); return; }
  if (newpw !== confirm) { showToast('Yeni şifreler eşleşmiyor.'); return; }
  if (newpw.length < 8 || !/[A-Z]/.test(newpw) || !/[0-9]/.test(newpw)) {
    showToast('Şifre: 8+ karakter, 1 büyük harf, 1 rakam.'); return;
  }
  fetch('/api/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password: current, new_password: newpw }),
  })
  .then(r => r.json())
  .then(d => {
    showToast(d.message || (d.success ? 'Şifre değiştirildi!' : 'Hata.'));
    if (d.success) { document.getElementById('currentPassword').value=''; document.getElementById('newPassword').value=''; document.getElementById('confirmNewPassword').value=''; }
  })
  .catch(() => showToast('Bağlantı hatası.'));
}

// ── MANAGER PANEL – GERÇEK VERİ ───────────────────
function loadManagerStats() {
  fetch('/api/manager/stats')
    .then(r => r.json())
    .then(s => {
      const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
      set('mgrTotalBookings',    s.total_reservations || 0);
      set('mgrRevenue',         'EUR ' + parseFloat(s.total_revenue||0).toLocaleString());
      set('mgrOccupancy',       (s.occupancy_rate||0) + '%');
    })
    .catch(() => {});
}

function loadManagerReservations() {
  fetch('/api/manager/reservations')
    .then(r => r.json())
    .then(list => {
      const el = document.getElementById('managerResList');
      if (!el) return;
      if (!list || !list.length) { el.innerHTML='<div style="color:var(--muted);padding:20px;text-align:center">No reservations.</div>'; return; }
      el.innerHTML = list.map(r => `
        <div class="activity-item">
          <div>
            <div class="act-title">${r.guest_name||'Guest'} — ${r.hotel_name||''}</div>
            <div class="act-sub">${r.room_type||''} · ${r.check_in_date} → ${r.check_out_date} · EUR ${parseFloat(r.total_price||0).toFixed(0)}</div>
          </div>
          <span class="td-badge ${r.status==='CONFIRMED'?'active':'pending'}">${r.status}</span>
        </div>`).join('');
    })
    .catch(() => {});
}

// ── ADMİN – OTEL EKLE/DÜZENLE FORMU ──────────────
function showAddHotelModal() {
  const modal = document.getElementById('addHotelModal');
  if (modal) { modal.style.display='flex'; }
}

function hideAddHotelModal() {
  const modal = document.getElementById('addHotelModal');
  if (modal) modal.style.display='none';
}

function submitAddHotel() {
  const get = id => (document.getElementById(id)||{}).value||'';
  const data = {
    hotel_name:  get('ahName'),
    city:        get('ahCity'),
    district:    get('ahDistrict'),
    stars:       parseInt(get('ahStars'))||5,
    price_from:  parseFloat(get('ahPrice'))||0,
    price:       'Price from EUR ' + get('ahPrice'),
    score:       parseFloat(get('ahScore'))||8.0,
    label:       parseFloat(get('ahScore'))>=9.5?'Exceptional':parseFloat(get('ahScore'))>=9?'Excellent':parseFloat(get('ahScore'))>=8.5?'Very Good':'Good',
    img:         get('ahImg'),
    description: get('ahDesc'),
    amenities:   get('ahAmenities'),
  };
  if (!data.hotel_name || !data.city) { showToast('Otel adı ve şehir zorunlu.'); return; }
  fetch('/api/admin/hotels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  .then(r => r.json())
  .then(d => { showToast(d.message||'Otel eklendi.'); hideAddHotelModal(); loadAdminHotels(); })
  .catch(() => showToast('Hata.'));
}

// ── CHATBOT – DÜZELTİLMİŞ ────────────────────────
function sendChatMsg() {
  const input = document.getElementById('chatInput');
  const msgs  = document.getElementById('chatMsgs');
  const text  = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user';
  userDiv.textContent = text;
  msgs.appendChild(userDiv);
  input.value = '';

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.innerHTML = '<span style="opacity:.6">typing...</span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  })
  .then(r => r.json())
  .then(data => {
    typing.remove();
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot';
    botDiv.textContent = data.reply || 'Sizi en iyi otellerle buluşturayım!';
    msgs.appendChild(botDiv);

    // Otel kartlarını göster
    if (data.hotels && data.hotels.length) {
      data.hotels.forEach(h => {
        const card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);border-radius:8px;padding:8px;margin-top:5px;cursor:pointer';
        card.innerHTML = `
          <img src="${h.img||''}" style="width:42px;height:42px;border-radius:6px;object-fit:cover;flex-shrink:0">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.hotel_name}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,.75)">📍 ${h.city} · ${h.price||''}</div>
          </div>
          <div style="background:rgba(255,255,255,.2);border-radius:5px;color:#fff;font-size:12px;font-weight:700;padding:3px 7px;flex-shrink:0">${parseFloat(h.score||0).toFixed(1)}</div>`;
        card.onclick = () => { openHotelDetail(h.id); toggleChatbot(); };
        msgs.appendChild(card);
      });
    }
    msgs.scrollTop = msgs.scrollHeight;
  })
  .catch(() => {
    typing.remove();
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot';
    botDiv.textContent = 'Kıbrıs\'taki oteller için şehir, bütçe veya özellik belirtebilirsiniz!';
    msgs.appendChild(botDiv);
    msgs.scrollTop = msgs.scrollHeight;
  });
}

function chatSuggest(btn) {
  document.getElementById('chatInput').value = btn.textContent.trim();
  sendChatMsg();
}

// ── REZERVASYONDA TARİH ZORUNLULUĞU ──────────────
function proceedToPayment() {
  const ci = dateState.checkin || document.getElementById('searchCheckin')?.value;
  const co = dateState.checkout || document.getElementById('searchCheckout')?.value;

  if (!ci || !co) {
    showToast('Lütfen giriş ve çıkış tarihi seçin! 📅');
    return;
  }
  const nights = Math.round((new Date(co)-new Date(ci))/86400000);
  if (nights <= 0) {
    showToast('Çıkış tarihi girişten sonra olmalı!');
    return;
  }

  const guestName  = (document.getElementById('guestFirstName')?.value||'').trim()
                   + ' ' + (document.getElementById('guestLastName')?.value||'').trim();
  const guestEmail = document.getElementById('guestEmail')?.value.trim()||'';

  if (!guestName.trim() || !guestEmail) {
    showToast('Ad, soyad ve email zorunludur!');
    return;
  }

  bookingState.checkin    = ci;
  bookingState.checkout   = co;
  bookingState.nights     = nights;
  if (bookingState.room) {
    bookingState.totalPrice = parseFloat(bookingState.room.price_per_night) * nights;
  }

  const payload = {
    room_id:        bookingState.room?.id,
    hotel_id:       bookingState.hotel?.id,
    check_in_date:  ci,
    check_out_date: co,
    guest_count:    2,
    guest_name:     guestName.trim(),
    guest_email:    guestEmail,
    guest_phone:    document.getElementById('guestPhone')?.value.trim()||'',
  };

  fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(r => r.json())
  .then(data => {
    bookingState.reservationId = data.reservation_id;
    bookingState.totalPrice    = data.total_price || bookingState.totalPrice || 0;
    const txt = 'EUR ' + parseFloat(bookingState.totalPrice).toFixed(2);
    ['orderTotalPrice','orderTotalPrice2'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=txt; });
    showPage('paymentPage');
  })
  .catch(() => showPage('paymentPage'));
}

// ── PAGİNATİON ────────────────────────────────────
let currentPage = 1;
let allHotelsCache = [];
const HOTELS_PER_PAGE = 8;

function renderPage(page) {
  currentPage = page;
  const total = Math.ceil(allHotelsCache.length / HOTELS_PER_PAGE);
  const slice = allHotelsCache.slice((page-1)*HOTELS_PER_PAGE, page*HOTELS_PER_PAGE);
  renderHotels(slice);
  const el = document.getElementById('pageInfo');
  if (el) el.textContent = `${page} of ${total}`;
}

function changePage(dir) {
  const total = Math.ceil(allHotelsCache.length / HOTELS_PER_PAGE);
  const next  = Math.max(1, Math.min(total, currentPage + dir));
  if (next !== currentPage) renderPage(next);
}
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function toggleFavorite(hotelId, hotelName, hotelImg, hotelCity, hotelScore, hotelPrice, btn) {
  const idx = favorites.findIndex(f => f.id === hotelId);
  if (idx === -1) {
    favorites.push({ id: hotelId, name: hotelName, img: hotelImg, city: hotelCity, score: hotelScore, price: hotelPrice });
    if (btn) { btn.textContent = '❤️'; btn.title = 'Remove from Wishlist'; }
    showToast('Added to Wishlist ❤️');
  } else {
    favorites.splice(idx, 1);
    if (btn) { btn.textContent = '🤍'; btn.title = 'Add to Wishlist'; }
    showToast('Removed from Wishlist');
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  if (document.getElementById('wishlistPage')?.classList.contains('active')) renderWishlist();
}

function isFavorite(hotelId) {
  return favorites.some(f => f.id === hotelId);
}

function renderWishlist() {
  const el = document.getElementById('wishlistList');
  if (!el) return;
  if (!favorites.length) {
    el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--sub)"><div style="font-size:48px;margin-bottom:12px">🤍</div><div style="font-size:16px;font-weight:600">Your wishlist is empty</div><div style="font-size:13px;margin-top:4px">Click the heart icon on any hotel to save it</div></div>';
    return;
  }
  el.innerHTML = favorites.map(h => `
    <div class="r-card" style="margin-bottom:12px">
      <img class="r-card-img" src="${h.img||''}" alt="${h.name}">
      <div class="r-card-body">
        <div class="r-card-name">${h.name}</div>
        <div class="r-card-dist">📍 ${h.city||''}</div>
      </div>
      <div class="r-card-right">
        <div class="r-score exc">${parseFloat(h.score||0).toFixed(1)}</div>
        <div class="r-price" style="margin-top:auto">${h.price||''}</div>
        <button onclick="toggleFavorite(${h.id},'${h.name}','${h.img}','${h.city}',${h.score},'${h.price}',null);renderWishlist()" style="margin-top:8px;background:none;border:1px solid var(--red);color:var(--red);border-radius:6px;padding:4px 10px;font-size:11.5px;cursor:pointer">Remove</button>
      </div>
    </div>`).join('');
}

// ── MY RESERVATIONS ───────────────────────────────
function loadMyReservations() {
  const el = document.getElementById('myResList');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">Loading...</div>';

  fetch('/api/reservations')
    .then(r => r.json())
    .then(list => {
      if (!list || !list.length) {
        el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--sub)"><div style="font-size:48px;margin-bottom:12px">📋</div><div style="font-size:16px;font-weight:600">No reservations yet</div></div>';
        return;
      }
      el.innerHTML = list.map(r => `
        <div style="background:var(--white);border-radius:12px;padding:16px 18px;margin-bottom:10px;box-shadow:var(--shadow-sm)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:15px;font-weight:700;margin-bottom:3px">${r.hotel_name||'Hotel'}</div>
              <div style="font-size:12.5px;color:var(--sub);margin-bottom:2px">🛏 ${r.room_type||''} · Room ${r.room_number||''}</div>
              <div style="font-size:12.5px;color:var(--sub);margin-bottom:2px">📅 ${r.check_in_date} → ${r.check_out_date}</div>
              <div style="font-size:12px;color:var(--muted)">👥 ${r.guest_count} guests · <strong>EUR ${parseFloat(r.total_price||0).toFixed(2)}</strong></div>
            </div>
            <div style="text-align:right">
              <span class="td-badge ${r.status==='CONFIRMED'?'active':'pending'}" style="display:inline-block;margin-bottom:8px">${r.status}</span>
              ${r.status==='CONFIRMED' ? `<br><button onclick="cancelReservation(${r.id})" style="background:none;border:1px solid var(--red);color:var(--red);border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer;font-weight:600">Cancel ✕</button>` : ''}
            </div>
          </div>
        </div>`).join('');
    })
    .catch(() => {
      el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">Could not load reservations.</div>';
    });
}

function cancelReservation(id) {
  if (!confirm('Are you sure you want to cancel this reservation?')) return;
  fetch('/api/reservations/' + id + '/cancel', { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      showToast(data.message || 'Reservation cancelled.');
      loadMyReservations();
    })
    .catch(() => showToast('Error cancelling reservation.'));
}

// ── ÇALIŞAN TARİH SEÇİCİ ─────────────────────────
const dateState = { checkin: null, checkout: null, selecting: 'checkin' };

function initDatePicker() {
  const ci = document.getElementById('searchCheckin');
  const co = document.getElementById('searchCheckout');
  if (ci) ci.addEventListener('change', () => {
    dateState.checkin = ci.value;
    updateNightsDisplay();
  });
  if (co) co.addEventListener('change', () => {
    dateState.checkout = co.value;
    updateNightsDisplay();
  });
}

function updateNightsDisplay() {
  const ci = dateState.checkin;
  const co = dateState.checkout;
  if (!ci || !co) return;
  const nights = Math.round((new Date(co) - new Date(ci)) / 86400000);
  if (nights <= 0) return;
  const el = document.getElementById('nightsDisplay');
  if (el) el.textContent = nights + ' night' + (nights > 1 ? 's' : '');
  bookingState.checkin  = ci;
  bookingState.checkout = co;
  bookingState.nights   = nights;
  // Fiyatı güncelle
  if (bookingState.room) {
    const total = parseFloat(bookingState.room.price_per_night) * nights;
    bookingState.totalPrice = total;
    const txt = 'EUR ' + total.toFixed(2);
    const p1 = document.getElementById('orderRoomPrice');
    const p2 = document.getElementById('orderTotalPrice');
    const p3 = document.getElementById('orderTotalPrice2');
    if (p1) p1.textContent = txt;
    if (p2) p2.textContent = txt;
    if (p3) p3.textContent = txt;
  }
}

// ── TOAST ─────────────────────────────────────────
function showToast(msg) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'background:var(--white);border-radius:10px;padding:12px 18px;font-size:13.5px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,.18);border-left:4px solid var(--green);opacity:0;transform:translateX(20px);transition:all .3s;max-width:320px';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='1'; toast.style.transform='translateX(0)'; }, 10);
  setTimeout(() => { toast.style.opacity='0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ── GUEST PICKER ─────────────────────────────────
const guestState = { adults: 2, children: 0, rooms: 1 };

function toggleGuestPicker() {
  const picker = document.getElementById('guestPicker');
  if (!picker) return;
  picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

function changeGuests(type, delta) {
  const min = type === 'adults' ? 1 : 0;
  const max = type === 'rooms' ? 9 : 20;
  guestState[type] = Math.max(min, Math.min(max, guestState[type] + delta));
  const el = document.getElementById(type + 'Count');
  if (el) el.textContent = guestState[type];
  updateGuestDisplay();
}

function updateGuestDisplay() {
  const el = document.getElementById('guestDisplay');
  if (!el) return;
  const a = guestState.adults, c = guestState.children, r = guestState.rooms;
  if (currentLang === 'tr') {
    let txt = a + ' yetişkin';
    if (c > 0) txt += ' · ' + c + ' çocuk';
    txt += ' · ' + r + ' oda';
    el.textContent = txt;
  } else {
    let txt = a + ' adult' + (a > 1 ? 's' : '');
    if (c > 0) txt += ' · ' + c + ' child' + (c > 1 ? 'ren' : '');
    txt += ' · ' + r + ' room' + (r > 1 ? 's' : '');
    el.textContent = txt;
  }
  // Guest picker labels
  const labels = {
    adultsLabel: t('adults'), adultsAgeLabel: t('adultsAge'),
    childrenLabel: t('children'), childrenAgeLabel: t('childrenAge'),
    roomsLabel: t('rooms'), doneBtn: t('done'),
  };
  Object.entries(labels).forEach(([id, val]) => {
    const e = document.getElementById(id);
    if (e) e.textContent = val;
  });
}

// ── CHATBOT ───────────────────────────────────────
function toggleChatbot() {
  const panel = document.getElementById('chatbotPanel');
  const btn   = document.getElementById('chatbotFloatBtn');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (btn) btn.style.transform = isOpen ? 'scale(0.88) rotate(10deg)' : 'scale(1) rotate(0deg)';
}

function checkOllamaStatus() {
  fetch('/api/chatbot/status')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('chatStatus');
      if (!el) return;
      if (data.online) {
        el.textContent = '● AI Online';
        el.style.color = '#90EE90';
      } else {
        el.textContent = '● Fallback mode';
        el.style.color = '#FFB347';
      }
    })
    .catch(() => {});
}

// Close guest picker when clicking outside
document.addEventListener('click', e => {
  const picker  = document.getElementById('guestPicker');
  const display = document.getElementById('guestDisplay');
  if (picker && display && !picker.contains(e.target) && !display.contains(e.target)) {
    picker.style.display = 'none';
  }
});

// ── HELPERS ──────────────────────────────────────
function setFieldError(inputId, errId, show) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (inp) inp.classList.toggle('err', show);
  if (err) err.classList.toggle('show', show);
}

function showMsg(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', show);
}

// ── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildCalendar();
  initDatePicker();
  checkOllamaStatus();
  setLang(currentLang);
  showPage('mainMenuPage');
});