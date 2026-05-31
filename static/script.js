/* ═══════════════════════════════════════════════
   BOOK HOTEL — script.js
═══════════════════════════════════════════════ */

// ── LANGUAGE ────────────────────────────────────
const currentLang = 'en';

const LANG = {
  en: {
    // Navbar
    home: 'Home', wishlist: 'Wishlist', myRes: 'My Reservations', profile: 'Profile', logout: 'Logout',
    // Search bar
    destination: 'Destination', destPlaceholder: 'Where are you going?',
    checkin: 'Check-in', checkout: 'Check-out',
    guests: 'Guests & Rooms',
    searchBtn: 'Search',
    // Guest picker
    adults: 'Adults', adultsAge: 'Age 18+',
    children: 'Children', childrenAge: 'Age 0–17',
    rooms: 'Rooms', done: 'Done',
    // Home
    recommended: 'Top Hotels in Cyprus',
    // Search page
    searchTitle: 'Cyprus Hotels',
    sortLabel: 'Sort by',
    // Hotel detail
    viewRooms: 'View Rooms', bookNow: 'Book Now ›',
    // Booking
    guestInfo: 'Guest Information', proceedPay: 'Continue to Payment →',
    // Chatbot
    chatWelcome: 'Hello! I\'m your Cyprus hotel assistant. Tell me which city or type of hotel you\'re looking for.',
    chatPlaceholder: 'Type your message...',
    chatSugs: ['Hotels in Kyrenia', 'Budget friendly', 'Casino resorts', 'Beach hotels'],
    // Auth
    signIn: 'Sign In', register: 'Register', createAccount: 'Create Account',
    verify: 'Verify Code', logout2: 'Logout',
  },
  tr: {
    home: 'Ana Sayfa', wishlist: 'Favoriler', myRes: 'Rezervasyonlarım', profile: 'Profil', logout: 'Çıkış',
    destination: 'Hedef', destPlaceholder: 'Nereye gidiyorsunuz?',
    checkin: 'Giriş', checkout: 'Çıkış',
    guests: 'Misafir & Oda',
    searchBtn: 'Ara',
    adults: 'Yetişkin', adultsAge: '18+ yaş',
    children: 'Çocuk', childrenAge: '0–17 yaş',
    rooms: 'Oda', done: 'Tamam',
    recommended: 'Kıbrıs\'ın En İyi Otelleri',
    searchTitle: 'Kıbrıs Otelleri',
    sortLabel: 'Sıralama',
    viewRooms: 'Odaları Gör', bookNow: 'Rezervasyon ›',
    guestInfo: 'Misafir Bilgileri', proceedPay: 'Ödemeye Devam →',
    chatWelcome: 'Merhaba! Kıbrıs otel asistanınım. Hangi şehir veya özellikte otel aradığını söyle.',
    chatPlaceholder: 'Mesajınızı yazın...',
    chatSugs: ['Girne otelleri', 'Uygun fiyatlı', 'Casino resort', 'Plaj oteli'],
    signIn: 'Giriş Yap', register: 'Kayıt Ol', createAccount: 'Hesap Oluştur',
    verify: 'Kodu Doğrula', logout2: 'Çıkış Yap',
  }
};

function t(key) {
  return LANG[currentLang][key] || LANG['en'][key] || key;
}

function setLang(lang) {
  // Language switching disabled — app is English only
}

// ── PAGE NAVIGATION ──────────────────────────────
let currentPageId = null;

function showPage(pageId, opts = {}) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
    if (!opts.fromHistory) {
      const state = { pageId };
      const hash = '#' + pageId;
      if (opts.replace || !history.state) history.replaceState(state, '', hash);
      else if (currentPageId !== pageId) history.pushState(state, '', hash);
    }
    currentPageId = pageId;
    if (pageId === 'homePage' && !allHotelsCache.length) loadHotels();
    if (pageId === 'homePage' || pageId === 'mainMenuPage') {
      resetSearchBarState();
      resetLandingSearchBarState();
    }
    if (pageId === 'bookingPage') updateBookingSummary();
    syncFavoriteButtons();
    placeLanguageSwitcher();
    updateStaticTranslations();
    if (window.lucide) lucide.createIcons();
  }
}

function showManagerPage(pageId) {
  showPage(pageId);
}

function showAdminPage(pageId) {
  showPage(pageId);
}

const UI_TEXT = {
  'Home': 'Ana Sayfa',
  'Wishlist': 'Favoriler',
  'My Reservations': 'Rezervasyonlarım',
  'Profile': 'Profil',
  'Personal': 'Kişisel',
  'Logout': 'Çıkış',
  'Sign In': 'Giriş Yap',
  'Sign Up': 'Kayıt Ol',
  'Register': 'Kayıt Ol',
  'Register Free': 'Ücretsiz Kayıt',
  'Staff': 'Personel',
  'Staff Login': 'Personel Girişi',
  'Customer Login': 'Müşteri Girişi',
  'Personal Information': 'Kişisel Bilgiler',
  'My Profile': 'Profilim',
  'Back to Main Menu': 'Ana Menüye Dön',
  'Have an account?': 'Hesabınız var mı?',
  'Don\'t have an account?': 'Hesabınız yok mu?',
  'Already have an account?': 'Zaten hesabınız var mı?',
  'Forgot Password?': 'Şifremi Unuttum?',
  'Create Account': 'Hesap Oluştur',
  'Create Staff Account': 'Personel Hesabı Oluştur',
  'Enter Staff Panel': 'Personel Paneline Gir',
  'Verify Code': 'Kodu Doğrula',
  'Verify Your Account': 'Hesabınızı Doğrulayın',
  'Register securely with 2FA verification.': '2FA doğrulaması ile güvenli kayıt olun.',
  'Access your account securely with 2FA verification.': '2FA doğrulaması ile hesabınıza güvenli erişin.',
  'For Admin & Hotel Manager accounts. Secured with 2FA verification.': 'Admin ve Otel Yöneticisi hesapları için. 2FA ile korunur.',
  'Recommended for you': 'Sizin için önerilenler',
  'Top Hotels in Cyprus': 'Kıbrıs\'ın En İyi Otelleri',
  'Find Your Perfect Stay': 'Mükemmel Konaklamanı Bul',
  'Discover luxury hotels across Cyprus — best prices guaranteed': 'Kıbrıs genelinde lüks otelleri keşfedin — en iyi fiyat garantisi',
  'Where Every Stay': 'Her Konaklama',
  'Becomes a Memory': 'Bir Anıya Dönüşür',
  'Where Every Stay\nBecomes a Memory': 'Her Konaklama\nBir Anıya Dönüşür',
  'Book from handpicked luxury hotels across Cyprus — best prices, no hidden fees.': 'Kıbrıs genelinde seçilmiş lüks otellerden rezervasyon yapın — en iyi fiyatlar, gizli ücret yok.',
  'Northern Cyprus · Premium Hotels': 'Kuzey Kıbrıs · Premium Oteller',
  'Hotels': 'Oteller',
  'Why Us': 'Neden Biz',
  'Handpicked for you': 'Sizin için seçildi',
  'View All Hotels →': 'Tüm Otelleri Gör →',
  'Loading hotels...': 'Oteller yükleniyor...',
  'Search': 'Ara',
  'Destination': 'Hedef',
  'Where are you going?': 'Nereye gidiyorsunuz?',
  'Check-in': 'Giriş',
  'Check-out': 'Çıkış',
  'Add date': 'Tarih ekle',
  'Add guests': 'Misafir ekle',
  'Guests': 'Misafirler',
  'Guests & Rooms': 'Misafir & Oda',
  'Beachfront': 'Denize Sıfır',
  'Pool': 'Havuz',
  'Swimming Pool': 'Yüzme Havuzu',
  'Casino': 'Kumarhane',
  'Spa': 'Spa',
  'Spa & Wellness': 'Spa & Wellness',
  'Family': 'Aile',
  'Family Friendly': 'Aile Dostu',
  'Luxury': 'Lüks',
  'Luxury Hotels': 'Lüks Oteller',
  'Beachfront Hotels': 'Denize Sıfır Oteller',
  'Casino Resorts': 'Kumarhane Otelleri',
  'All': 'Tümü',
  'All Cyprus': 'Tüm Kıbrıs',
  'Search Hotels': 'Otel Ara',
  'City / Region': 'Şehir / Bölge',
  'Recommended': 'Önerilen',
  'Highest Rating': 'En Yüksek Puan',
  'Lowest Rating': 'En Düşük Puan',
  'Price: Low to High': 'Fiyat: Düşükten Yükseğe',
  'Price: High to Low': 'Fiyat: Yüksekten Düşüğe',
  'Most Reviewed': 'En Çok Yorumlanan',
  'Most Popular': 'En Popüler',
  'Newest': 'En Yeni',
  'Cyprus Hotels': 'Kıbrıs Otelleri',
  'Search hotels in Cyprus': 'Kıbrıs otellerinde ara',
  'No hotels found.': 'Otel bulunamadı.',
  'View Details →': 'Detayları Gör →',
  'View →': 'Gör →',
  'Exceptional': 'Olağanüstü',
  'Excellent': 'Mükemmel',
  'Very Good': 'Çok İyi',
  'Good': 'İyi',
  'reviews': 'yorum',
  'review': 'yorum',
  'guest': 'misafir',
  'guests': 'misafir',
  'adult': 'yetişkin',
  'adults': 'yetişkin',
  'room': 'oda',
  'rooms': 'oda',
  'night': 'gece',
  'nights': 'gece',
  '/ night': '/ gece',
  'View Rooms': 'Odaları Gör',
  'Book Now ›': 'Rezervasyon ›',
  'Select Room': 'Oda Seç',
  'Select Date': 'Tarih Seç',
  'Rooms': 'Odalar',
  'Guest Reviews': 'Misafir Yorumları',
  'Recent Reviews': 'Son Yorumlar',
  'See More': 'Daha Fazla',
  'See Less': 'Daha Az',
  'See all amenities ›': 'Tüm olanakları gör ›',
  'See All Reviews': 'Tüm Yorumları Gör',
  'Hide Reviews': 'Yorumları Gizle',
  'See less amenities': 'Daha az olanak göster',
  'See all comments': 'Tüm yorumları gör',
  'Hide comments': 'Yorumları gizle',
  'Guest Information': 'Misafir Bilgileri',
  'Payment Information': 'Ödeme Bilgileri',
  'Confirmation': 'Onay',
  'Proceed to Payment →': 'Ödemeye Devam →',
  'Transportation Services': 'Ulaşım Hizmetleri',
  'Add Flight': 'Uçuş Ekle',
  'Add Transfer': 'Transfer Ekle',
  'Total Price': 'Toplam Fiyat',
  'Room Price': 'Oda Fiyatı',
  'No comments yet': 'Henüz yorum yok',
  'Write a Review': 'Yorum Yaz',
  'Submit Review': 'Yorumu Gönder',
  'No amenities listed': 'Olanak bilgisi yok',
  'Select dates': 'Tarih seçin',
  'Choose check-in and check-out dates': 'Giriş ve çıkış tarihlerini seçin'
};
const UI_TEXT_REVERSE = Object.fromEntries(Object.entries(UI_TEXT).map(([en, tr]) => [tr, en]));

function translateTextValue(text) {
  if (!text || !text.trim()) return text;
  let out = text;
  const pairs = Object.entries(UI_TEXT).sort((a, b) => b[0].length - a[0].length);
  pairs.forEach(([en, tr]) => {
    out = out.split(tr).join(en);
  });
  if (currentLang === 'tr') {
    pairs.forEach(([en, tr]) => {
      out = out.split(en).join(tr);
    });
  }
  return out;
}

function ui(text) {
  return translateTextValue(text);
}

function updateStaticTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.page, .navbar, .lnav, .auth-card, .auth-bar').forEach(root => {
    if (root.closest('#reviewsList') || root.closest('#landingHotelsGrid') || root.closest('#hotelsGrid') || root.closest('#searchResults')) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,#reviewsList,#landingHotelsGrid,#hotelsGrid,#searchResults,.lang-switcher')) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const next = translateTextValue(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  });
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el => {
    const ph = translateTextValue(el.placeholder);
    if (ph !== el.placeholder) el.placeholder = ph;
  });
  document.querySelectorAll('option').forEach(opt => {
    const next = translateTextValue(opt.textContent);
    if (next !== opt.textContent) opt.textContent = next;
  });
}

function normalizeLanguageSwitchers() {}

function placeLanguageSwitcher() {}

window.addEventListener('popstate', e => {
  const pageId = e.state?.pageId || location.hash.replace('#', '') || 'mainMenuPage';
  if (document.getElementById(pageId)) showPage(pageId, { fromHistory: true });
});

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
        startTimer(Number(data.expires_in) || 300);
        const input = document.getElementById('twofaCode');
        if (input) {
          input.value = '';
          input.focus();
        }
      } else {
        setErrorText('twofaErr', data.message || 'Unable to resend code.');
        showMsg('twofaErr', true);
      }
    })
    .catch(() => {
      setErrorText('twofaErr', 'Unable to resend code.');
      showMsg('twofaErr', true);
    });
}

// ── AUTH: REGISTER ───────────────────────────────
function submitRegister(event) {
  if (event) event.preventDefault();
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

  // Demo-friendly password validation: 6+ characters.
  const pwOk = password.length >= 6;
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
      startTimer(Number(data.expires_in) || 300);
      const input = document.getElementById('twofaCode');
      if (input) {
        input.value = '';
        input.focus();
      }
    } else {
      setErrorText('registerErr', data.message || 'Registration failed.');
      showMsg('registerErr', true);
    }
  })
  .catch(() => {
    setErrorText('registerErr', 'Registration failed. Check Flask/MySQL is running.');
    showMsg('registerErr', true);
  });
}

// ── AUTH: STAFF REGISTER ─────────────────────────
function submitStaffRegister(event) {
  if (event) event.preventDefault();
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

  const pwOk = password.length >= 6;
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
      startTimer(Number(data.expires_in) || 300);
      const input = document.getElementById('twofaCode');
      if (input) {
        input.value = '';
        input.focus();
      }
    } else {
      if (errEl) { errEl.textContent = data.message || 'Registration failed.'; errEl.classList.add('show'); }
    }
  })
  .catch(() => {
    if (errEl) { errEl.textContent = 'Connection error.'; errEl.classList.add('show'); }
  });
}

// ── AUTH: LOGIN ──────────────────────────────────
function submitLogin(event) {
  if (event) event.preventDefault();
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
      startTimer(Number(data.expires_in) || 300);
      const input = document.getElementById('twofaCode');
      if (input) {
        input.value = '';
        input.focus();
      }
    } else {
      setErrorText('loginErr', data.message || 'Invalid email or password!');
      showMsg('loginErr', true);
      document.getElementById('loginPassword').classList.add('err');
    }
  })
  .catch(() => {
    setErrorText('loginErr', 'Login failed. Check backend connection.');
    showMsg('loginErr', true);
  });
}

function submitAdminLogin(event) {
  if (event) event.preventDefault();
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
      const input = document.getElementById('twofaCode');
      if (input) {
        input.value = '';
        input.focus();
      }
    } else {
      setErrorText('adminLoginErr', data.message || 'Invalid admin credentials or role.');
      showMsg('adminLoginErr', true);
      document.getElementById('adminPassword').classList.add('err');
    }
  })
  .catch(() => {
    setErrorText('adminLoginErr', 'Login failed. Check backend connection.');
    showMsg('adminLoginErr', true);
  });
}

// ── AUTH: 2FA VERIFY ─────────────────────────────
function verify2FA(event) {
  if (event) event.preventDefault();
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
      setErrorText('twofaErr', data.message || 'Invalid or expired code');
      showMsg('twofaErr', true);
      return;
    }
    clearInterval(timerInterval);
    routeByRole(data.role);
  })
  .catch(() => {
    setErrorText('twofaErr', 'Invalid or expired code');
    showMsg('twofaErr', true);
  });
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
  const preview = document.getElementById('twofaCodePreview');
  // Demo only: showing 2FA code on screen. Do not use in production.
  if (el) {
    el.textContent = code
      ? `Demo only: showing 2FA code on screen. Do not use in production. Code: ${code}`
      : 'We sent a 6-digit verification code to your email or phone.';
  }
  if (preview) preview.textContent = code || '------';
}

// ── LOGOUT ───────────────────────────────────────
function logout() {
  fetch('/api/logout', { method: 'POST' })
    .then(() => showPage('loginPage'))
    .catch(() => showPage('loginPage'));
}

// ── HOTELS ───────────────────────────────────────
// IDs match migration.sql insertion order so fallback renders correct hotels
const DEMO_HOTELS = [
  { id:1, hotel_name:'Merit Park Hotel – Casino & Spa', city:'Girne', district:'Kyrenia', score:9.0, label:'Excellent', reviews:'491 reviews', review_count:491, price:'Price from EUR 748', price_from:748, stars:5, img:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', amenities:'Beach,Casino,Spa,Pool,Gym,Restaurant', description:'One of Northern Cyprus most iconic resort hotels, Merit Park offers luxury accommodation, a world-class casino, and a full-service spa on the shores of Kyrenia.' },
  { id:2, hotel_name:'Cratos Premium Hotel – Casino & Spa', city:'Girne', district:'Kyrenia', score:9.0, label:'Excellent', reviews:'413 reviews', review_count:413, price:'Starting from EUR 760', price_from:760, stars:5, img:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', amenities:'Beach,Casino,Spa,Pool,Gym,Kids,Restaurant', description:'A premium beachfront resort in Kyrenia featuring luxury suites, an expansive casino, and multiple restaurants and bars.' },
  { id:3, hotel_name:'The Landmark Nicosia – Autograph Collection', city:'Lefkoşa', district:'Nicosia', score:9.4, label:'Exceptional', reviews:'54 reviews', review_count:54, price:'Price from EUR 303', price_from:303, stars:5, img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', amenities:'Spa,Restaurant,Gym,Business Center', description:'Located in the heart of Nicosia, this boutique hotel combines historic architecture with modern luxury. Perfect for business and leisure travelers.' },
  { id:4, hotel_name:'Salamis Bay Conti Hotel – Resort & Casino & Spa', city:'Gazimağusa', district:'Famagusta', score:8.7, label:'Very Good', reviews:'2169 reviews', review_count:2169, price:'Starting from EUR 292', price_from:292, stars:5, img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', amenities:'Beach,Casino,Spa,Pool,Kids,Restaurant,Waterpark', description:'Set along the beautiful coastline of Famagusta, Salamis Bay Conti is a sprawling all-inclusive resort with a private beach, casino, and water sports.' },
  { id:5, hotel_name:'The Arkın İskele Hotel', city:'İskele', district:'Famagusta', score:9.4, label:'Exceptional', reviews:'312 reviews', review_count:312, price:'Price from EUR 420', price_from:420, stars:5, img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', amenities:'Beach,Spa,Pool,Kids,Restaurant,Gym', description:'Located in the Gazimağusa region of Cyprus, The Arkın İskele Hotel offers guests a full and enjoyable holiday experience with its Ultra All-Inclusive concept.' },
  { id:6, hotel_name:'Acapulco Resort & Convention & Spa', city:'Girne', district:'Kyrenia', score:8.5, label:'Very Good', reviews:'876 reviews', review_count:876, price:'Starting from EUR 215', price_from:215, stars:4, img:'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', amenities:'Beach,Pool,Kids,Restaurant,Waterpark,Gym', description:'A popular family-friendly resort in Kyrenia with extensive facilities including multiple pools, a water park, and a private beach.' },
  { id:7, hotel_name:'Lord Palace Hotel & Casino & Spa', city:'Girne', district:'Kyrenia', score:8.8, label:'Excellent', reviews:'223 reviews', review_count:223, price:'Price from EUR 380', price_from:380, stars:5, img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', amenities:'Casino,Spa,Pool,Restaurant,Gym', description:'An elegant hotel overlooking the Mediterranean with a rooftop pool, casino entertainment, and fine dining experiences.' },
  { id:8, hotel_name:'Concorde Luxury Resort Hotel', city:'İskele', district:'Bafra', score:9.1, label:'Excellent', reviews:'1024 reviews', review_count:1024, price:'Starting from EUR 510', price_from:510, stars:5, img:'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80', amenities:'Beach,Pool,Kids,Casino,Spa,Restaurant,Waterpark,Gym', description:'An all-inclusive mega resort in Bafra featuring 12 restaurants, 6 pools, a beach club, and full entertainment facilities for families and couples.' },
];

// ── DESTINATION AUTOCOMPLETE ─────────────────────────
const STATIC_DESTS = [
  'Girne','Kyrenia','Lefkoşa','Nicosia',
  'Gazimağusa','Famagusta','İskele','Iskele','Bafra',
  'Güzelyurt','Morphou','Dipkarpaz','Karpaz'
];

const DEST_CITY_ALIASES = [
  { value: 'Girne', label: 'Girne / Kyrenia', aliases: ['Kyrenia'] },
  { value: 'Lefkoşa', label: 'Lefkoşa / Nicosia', aliases: ['Nicosia', 'Lefkosa'] },
  { value: 'Gazimağusa', label: 'Gazimağusa / Famagusta', aliases: ['Famagusta', 'Gazimagusa'] },
  { value: 'İskele', label: 'İskele / Iskele', aliases: ['Iskele'] },
  { value: 'Güzelyurt', label: 'Güzelyurt / Morphou', aliases: ['Morphou', 'Guzelyurt'] },
  { value: 'Dipkarpaz', label: 'Dipkarpaz / Karpaz', aliases: ['Karpaz'] },
  { value: 'Bafra', label: 'Bafra', aliases: [] }
];

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function addDestSuggestion(list, seen, item) {
  const key = normalizeSearchText(item.value || item.label);
  if (!key || seen.has(key)) return;
  seen.add(key);
  list.push({
    ...item,
    normalizedValue: key,
    normalizedLabel: normalizeSearchText(item.label),
    normalizedAliases: (item.aliases || []).map(normalizeSearchText),
  });
}

function getDestSuggestions() {
  const list = [];
  const seen = new Set();

  STATIC_DESTS.forEach(dest => addDestSuggestion(list, seen, { type: 'city', value: dest, label: dest, aliases: [] }));
  DEST_CITY_ALIASES.forEach(city => addDestSuggestion(list, seen, { type: 'city', value: city.value, label: city.label, aliases: city.aliases }));

  allHotelsCache.forEach(h => {
    const hotelName = h.hotel_name || h.name || '';
    if (hotelName) addDestSuggestion(list, seen, { type: 'hotel', value: hotelName, label: hotelName, aliases: [] });
    const city = h.city || '';
    if (city) {
      const label = h.district ? `${city} / ${h.district}` : city;
      addDestSuggestion(list, seen, { type: 'city', value: city, label, aliases: h.district ? [h.district] : [] });
    }
    const district = h.district || '';
    if (district) addDestSuggestion(list, seen, { type: 'city', value: district, label: district, aliases: [] });
  });

  return list.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'city' ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
}

function setupDestAutocomplete(inputId) {
  const input = document.getElementById(inputId);
  if (!input || input._destReady) return;
  input._destReady = true;

  const wrap = input.parentNode;
  wrap.style.position = 'relative';

  const drop = document.createElement('div');
  drop.className = 'dest-drop';
  wrap.appendChild(drop);

  function showSuggestions() {
    const q = normalizeSearchText(input.value);
    if (!q) { drop.style.display = 'none'; return; }

    const matches = getDestSuggestions()
      .map(item => {
        const score =
          item.normalizedValue.startsWith(q) ? 0 :
          item.normalizedLabel.startsWith(q) ? 1 :
          item.normalizedAliases.some(a => a.startsWith(q)) ? 2 :
          item.normalizedValue.includes(q) ? 3 :
          item.normalizedLabel.includes(q) ? 4 :
          item.normalizedAliases.some(a => a.includes(q)) ? 5 :
          99;
        return { ...item, score };
      })
      .filter(item => item.score < 99)
      .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
      .slice(0, 8);

    if (!matches.length) {
      drop.innerHTML = '<div class="dest-drop-empty">No results found</div>';
    } else {
      drop.innerHTML = matches.map(s => {
        return `<div class="dest-drop-item" onmousedown="pickDest('${inputId}','${s.value.replace(/'/g,"\\'")}')">` +
          `<svg class="dest-pin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` +
          `<div style="display:flex;flex-direction:column;min-width:0">
            <span>${escapeHtml(s.label)}</span>
            ${s.type === 'hotel' ? '<span style="font-size:11px;color:var(--muted)">Hotel</span>' : ''}
          </div></div>`;
      }).join('');
    }
    drop.style.display = 'block';
  }

  input.addEventListener('input', showSuggestions);
  input.addEventListener('focus', showSuggestions);
  input.addEventListener('blur', () => setTimeout(() => { drop.style.display = 'none'; }, 160));
}

function pickDest(inputId, value) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = value;
  const drop = input.parentNode.querySelector('.dest-drop');
  if (drop) drop.style.display = 'none';
}

function normalizeHotelsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.hotels)) return data.hotels;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getRecommendedHotels(hotels) {
  const source = normalizeHotelsResponse(hotels);
  return [...source].sort((a, b) => {
    const scoreDiff = (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0);
    if (scoreDiff) return scoreDiff;
    return (parseInt(b.review_count) || 0) - (parseInt(a.review_count) || 0);
  });
}

function loadHotels() {
  fetch('/api/hotels')
    .then(r => r.ok ? r.json() : Promise.resolve([]))
    .then(data => {
      allHotelsCache = getRecommendedHotels(data);
      renderPage(1);
    })
    .catch(() => {
      allHotelsCache = [];
      renderPage(1);
    });
}

// placeholder — renderPage ve allHotelsCache aşağıda tanımlanıyor

function renderHotels(hotels) {
  const grid = document.getElementById('hotelsGrid');
  if (!grid) return;
  if (!Array.isArray(hotels) || !hotels.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--sub)">No recommended hotels found right now.</div>';
    return;
  }
  grid.innerHTML = hotels.map(h => {
    const stars = '★'.repeat(Math.min(5, parseInt(h.stars)||4)) + '☆'.repeat(Math.max(0,5-(parseInt(h.stars)||4)));
    const score = parseFloat(h.score)||0;
    const isExc = score >= 9;
    const priceNum = parseFloat(h.price_from||0);
    return `
    <div class="h-card">
      <div style="position:relative">
        <img class="h-card-img" src="${h.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70'}" alt="${h.hotel_name}" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <button data-favorite-id="${h.id}" onclick="toggleFavorite(${h.id},'${(h.hotel_name||'').replace(/'/g,"\\'")}','${h.img||''}','${h.city||''}',${h.score||0},'${h.price||''}',this)"
          style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,.92);border:none;border-radius:50%;width:34px;height:34px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.18);transition:transform .15s"
          title="${isFavorite(h.id)?'Remove from Wishlist':'Add to Wishlist'}">${isFavorite(h.id)?'♥':'♡'}</button>
      </div>
      <div class="h-card-body" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <div class="h-card-stars" title="${h.stars||4} stars">${stars}</div>
        <div class="h-card-name">${h.hotel_name || ''}</div>
        <div class="h-card-loc">${h.city || ''}${h.district?', '+h.district:''}</div>
        <div class="h-card-bottom">
          <div class="h-score ${isExc?'':'good'}">${score.toFixed(1)}</div>
          <div class="h-score-info">
            <span class="h-score-label ${isExc?'':'good'}">${h.label || 'Good'}</span>
            <span class="h-score-rev">${h.reviews || ''}</span>
          </div>
          <div class="h-card-price">
            <strong>EUR ${priceNum.toFixed(0)}</strong>
            <span>${ui('/ night')}</span>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
  syncFavoriteButtons();
}

// ── SEARCH ───────────────────────────────────────
let selectedHotelId = null;

function persistLastSearchState(state) {
  try {
    sessionStorage.setItem('bookhotel:lastSearch', JSON.stringify(state || {}));
  } catch {}
}

function goSearch() {
  const dest    = (document.getElementById('searchDest')    || {}).value || '';
  const checkin = (document.getElementById('searchCheckin') || {}).value || '';
  const checkout= (document.getElementById('searchCheckout')|| {}).value || '';

  showPage('searchPage');

  // Değerleri sidebar'a aktar
  const destEl = document.getElementById('sDest');
  if (destEl && dest) destEl.value = dest;

  const ciEl = document.getElementById('sCheckin');
  if (ciEl && checkin) { setDpValue('sCheckin', checkin); dateState.checkin = checkin; }

  const coEl = document.getElementById('sCheckout');
  if (coEl && checkout) { setDpValue('sCheckout', checkout); dateState.checkout = checkout; }

  persistLastSearchState({
    q: dest,
    checkin,
    checkout,
    adults: guestState.adults,
    children: guestState.children,
    rooms: guestState.rooms,
    guestTouched: guestTouched ? '1' : '0',
  });
  updateNightsDisplay();
  updateSearchGuestDisplay();
  fetchAndRenderSearch();
}

function doSearch() {
  fetchAndRenderSearch();
}

function clientSort(hotels, sort) {
  const h = [...hotels];
  switch (sort) {
    case 'score_desc':   h.sort((a,b) => (parseFloat(b.score)||0)  - (parseFloat(a.score)||0)); break;
    case 'score_asc':    h.sort((a,b) => (parseFloat(a.score)||0)  - (parseFloat(b.score)||0)); break;
    case 'price_asc':    h.sort((a,b) => (parseFloat(a.price_from)||0) - (parseFloat(b.price_from)||0)); break;
    case 'price_desc':   h.sort((a,b) => (parseFloat(b.price_from)||0) - (parseFloat(a.price_from)||0)); break;
    case 'reviews_desc':
    case 'popular':      h.sort((a,b) => (parseInt(b.review_count)||0) - (parseInt(a.review_count)||0)); break;
    case 'newest':       h.sort((a,b) => (parseInt(b.id)||0) - (parseInt(a.id)||0)); break;
    case 'recommended':  h.sort((a,b) => {
      const sa = (parseFloat(a.score)||0)*0.6 + (parseInt(a.review_count)||0)/2000*0.4;
      const sb = (parseFloat(b.score)||0)*0.6 + (parseInt(b.review_count)||0)/2000*0.4;
      return sb - sa;
    }); break;
    default: break;
  }
  return h;
}

function fetchAndRenderSearch() {
  const q        = (document.getElementById('sDest')      || {}).value || '';
  const sort     = (document.getElementById('sSort')      || {}).value || 'recommended';
  const minPrice = (document.getElementById('sMinPrice')  || {}).value || '';
  const maxPrice = (document.getElementById('sMaxPrice')  || {}).value || '';
  const minScore = (document.getElementById('sMinScore')  || {}).value || '';

  const qs = new URLSearchParams();
  if (q)        qs.set('q', q);
  if (sort)     qs.set('sort', sort);
  if (minPrice) qs.set('min_price', minPrice);
  if (maxPrice) qs.set('max_price', maxPrice);
  if (minScore) qs.set('min_score', minScore);

  const checked = [];
  document.querySelectorAll('.filter-item input[type=checkbox]:checked').forEach(cb => {
    if (cb.value) checked.push(cb.value);
  });
  if (checked.length) qs.set('amenity', checked[0]);

  const el = document.getElementById('searchResults');
  if (el) el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">Searching...</div>';

  const aliases = { kyrenia:'girne', nicosia:'lefkoşa', famagusta:'gazimağusa', paphos:'baf', bafra:'iskele' };

  function applyClientFilter(hotels) {
    let result = [...hotels];
    // Amenity filter
    if (checked.length) {
      result = result.filter(h => {
        const am = (h.amenities || '').toLowerCase();
        return checked.every(c => am.includes(c.toLowerCase()));
      });
    }
    // Price filter
    if (minPrice) result = result.filter(h => (parseFloat(h.price_from)||0) >= parseFloat(minPrice));
    if (maxPrice) result = result.filter(h => (parseFloat(h.price_from)||0) <= parseFloat(maxPrice));
    // Score filter
    if (minScore) result = result.filter(h => (parseFloat(h.score)||0) >= parseFloat(minScore));
    // Destination filter
    if (q) {
      let qn = q.toLowerCase();
      qn = aliases[qn] || qn;
      result = result.filter(h => {
        const s = [(h.hotel_name||''),(h.city||''),(h.district||''),(h.description||'')].join(' ').toLowerCase();
        return s.includes(qn);
      });
    }
    return clientSort(result, sort);
  }

  fetch('/api/hotels/search?' + qs.toString())
    .then(r => r.json())
    .then(hotels => {
      let filtered = hotels;
      // Client-side multi-amenity filter
      if (checked.length > 1) {
        filtered = hotels.filter(h => {
          const am = (h.amenities || '').toLowerCase();
          return checked.every(c => am.includes(c.toLowerCase()));
        });
      }
      filtered = clientSort(filtered, sort);
      renderSearchResults(filtered);
      const info = document.getElementById('searchResultInfo');
      if (info) info.textContent = `${filtered.length} hotel${filtered.length!==1?'s':''} found${q?' for "'+q+'"':''}`;
    })
    .catch(() => {
      const filtered = [];
      renderSearchResults(filtered);
      const info = document.getElementById('searchResultInfo');
      if (info) info.textContent = `${filtered.length} hotel${filtered.length!==1?'s':''} found${q?' for "'+q+'"':''}`;
    });
}

function renderSearchResults(hotels) {
  const el = document.getElementById('searchResults');
  if (!el) return;
  if (!hotels || !hotels.length) {
    el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--muted)">${ui('No hotels found.')}</div>`;
    return;
  }
  el.innerHTML = hotels.map(h => {
    const score = parseFloat(h.score) || 0;
    const isExc = score >= 9;
    const ci = dateState.checkin;
    const co = dateState.checkout;
    const nights = (ci && co) ? Math.max(1, Math.round((new Date(co)-new Date(ci))/86400000)) : 1;
    const total  = (parseFloat(h.price_from||0) * nights).toFixed(0);
    const amenList = (h.amenities||'').split(',').slice(0,4).map(a=>a.trim()).filter(Boolean);
    const stars = '★'.repeat(Math.min(5,parseInt(h.stars)||4));
    return `
    <div class="r-card">
      <div class="r-card-media">
        <img class="r-card-img" src="${h.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70'}" alt="${h.hotel_name}" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <button data-favorite-id="${h.id}" onclick="toggleFavorite(${h.id},'${(h.hotel_name||'').replace(/'/g,"\\'")}','${h.img||''}','${h.city||''}',${h.score||0},'${h.price||''}',this)"
          style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,.92);border:none;border-radius:50%;width:32px;height:32px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.18)">${isFavorite(h.id)?'♥':'♡'}</button>
      </div>
      <div class="r-card-body" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
        <div style="color:var(--gold);font-size:12px;margin-bottom:5px;letter-spacing:1px">${stars}</div>
        <div class="r-card-name">${h.hotel_name}</div>
        <div class="r-card-dist">${h.city}${h.district ? ', ' + h.district : ''}</div>
        <div class="r-card-tags">${amenList.map(a=>`<span class="r-card-tag">${a}</span>`).join('')}</div>
        <button class="r-card-link" onclick="openHotelDetail(${h.id})">${ui('View Details →')}</button>
      </div>
      <div class="r-card-right">
        <div class="r-score ${isExc ? 'exc' : ''}">${score.toFixed(1)}</div>
        <div class="r-score-lbl ${isExc ? 'exc' : ''}">${h.label || ''}</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:4px">${h.review_count||0} reviews</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:auto">${nights} night${nights>1?'s':''}</div>
        <div class="r-price">EUR ${total}</div>
        <div class="r-price-night">EUR ${parseFloat(h.price_from||0).toFixed(0)} ${ui('/ night')}</div>
      </div>
    </div>`;
  }).join('');
  syncFavoriteButtons();
}

// ── HOTEL DETAIL ──────────────────────────────────
let currentDetailHotel = null;
let detailDescExpanded = false;
let detailAmenitiesExpanded = false;
let detailCommentsExpanded = false;
let currentDetailReviews = [];
let detailRoomPlans = [{ adults: 2, children: 0 }];
let detailGuestTouched = false;

function setDetailBookingError(message) {
  const el = document.getElementById('detailBookingError');
  if (!el) return;
  el.textContent = message || '';
  el.classList.toggle('show', !!message);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));
}

function splitAmenities(value) {
  return String(value || '').split(',').map(a => a.trim()).filter(Boolean);
}

function renderDetailDescription(description) {
  const descEl = document.getElementById('detailHotelDesc');
  const btn = document.getElementById('detailSeeMoreBtn');
  if (!descEl || !btn) return;

  const text = resolveDetailDescriptionText(currentDetailHotel, description);
  descEl.textContent = text;
  const isLong = text.length > 220;
  descEl.classList.toggle('collapsed', isLong && !detailDescExpanded);
  btn.style.display = isLong ? 'block' : 'none';
  btn.textContent = detailDescExpanded ? 'Show less ↑' : 'Read more ↓';
}

function toggleDetailDescription() {
  detailDescExpanded = !detailDescExpanded;
  renderDetailDescription(currentDetailHotel?.description || '');
}

function resolveDetailDescriptionText(hotel, fallback = '') {
  const raw = (fallback || '').trim();
  if (raw) return raw;
  if (!hotel) return '';
  const name = hotel.hotel_name || 'This hotel';
  const city = hotel.city || 'Northern Cyprus';
  const district = hotel.district || city;
  const amenities = splitAmenities(hotel.amenities || '');
  const amenityText = amenities.join(', ');
  const amenityHints = [];
  if (amenities.some(a => /casino/i.test(a))) amenityHints.push('casino entertainment');
  if (amenities.some(a => /spa/i.test(a))) amenityHints.push('a relaxing spa');
  if (amenities.some(a => /beach/i.test(a))) amenityHints.push('easy access to the beach');
  if (amenities.some(a => /kids|family/i.test(a))) amenityHints.push('family-friendly facilities');
  if (amenities.some(a => /restaurant|breakfast/i.test(a))) amenityHints.push('popular dining options');
  if (amenities.some(a => /pool/i.test(a))) amenityHints.push('a refreshing pool area');
  const typeLine = amenityHints.length
    ? `Guests can enjoy ${amenityHints.slice(0, 3).join(', ')}.`
    : 'Guests can enjoy a comfortable stay with thoughtful services and facilities.';
  return `${name} is a standout hotel in ${district}, ${city}. ${typeLine} The property is designed for travelers who value comfort, convenience, and a polished hotel experience.${amenityText ? ` Key amenities include ${amenityText}.` : ''}`;
}

function renderDetailAmenities(amenities) {
  const list = splitAmenities(amenities);
  const wrap = document.querySelector('#hotelDetailPage .amenity-tags');
  const btn = document.getElementById('detailSeeAllAmenitiesBtn');
  if (wrap) {
    const visible = list.length ? (detailAmenitiesExpanded ? list : list.slice(0, 6)) : [];
    wrap.innerHTML = visible.length
      ? visible.map(a => `<span class="amenity-tag">${escapeHtml(a)}</span>`).join('')
      : `<span class="amenity-tag">${ui('No amenities listed')}</span>`;
  }
  if (btn) {
    btn.style.display = 'flex';
    btn.textContent = detailAmenitiesExpanded ? 'See less amenities' : 'See all amenities ›';
  }
}

function toggleDetailAmenities() {
  detailAmenitiesExpanded = !detailAmenitiesExpanded;
  renderDetailAmenities(currentDetailHotel?.amenities || '');
}

function openAmenitiesModal() {
  const modal = document.getElementById('amenitiesModal');
  const listEl = document.getElementById('amenitiesModalList');
  if (!modal || !listEl) return;
  const amenities = splitAmenities(currentDetailHotel?.amenities || '');
  listEl.innerHTML = (amenities.length ? amenities : [ui('No amenities listed')]).map(a => `<span class="amenity-tag">${escapeHtml(a)}</span>`).join('');
  modal.style.display = 'flex';
}

function closeAmenitiesModal() {
  const modal = document.getElementById('amenitiesModal');
  if (modal) modal.style.display = 'none';
}

function setDpValue(id, value) {
  const input = document.getElementById(id);
  const display = document.getElementById(id + '_d');
  if (input) input.value = value || '';
  if (!display) return;
  if (value) {
    const [y, m, d] = value.split('-');
    display.textContent = `${d}.${m}.${y}`;
    display.className = 'dp-val';
  } else {
    display.textContent = ui('Add date');
    display.className = 'dp-val muted';
  }
}

function updateDetailGuestDisplay() {
  const totals = getDetailRoomTotals();
  const display = document.getElementById('detailGuestDisplay');
  const summary = document.getElementById('detailRoomSummary');
  if (!detailGuestTouched) {
    if (display) {
      display.textContent = ui('Add guests');
      display.style.color = 'var(--muted)';
    }
    if (summary) summary.textContent = ui('Add guests');
    const sGuests = document.getElementById('sGuests');
    if (sGuests) sGuests.value = '';
    return;
  }
  const label = `${totals.rooms} room${totals.rooms > 1 ? 's' : ''}, ${totals.guests} guest${totals.guests > 1 ? 's' : ''}`;
  if (display) {
    display.textContent = label;
    display.style.color = 'var(--text)';
  }
  if (summary) summary.textContent = detailRoomPlans.map((room, idx) => {
    const childText = room.children ? `, ${room.children} child${room.children > 1 ? 'ren' : ''}` : '';
    return `Room ${idx + 1}: ${room.adults} adult${room.adults > 1 ? 's' : ''}${childText}`;
  }).join(' · ');
  const sGuests = document.getElementById('sGuests');
  if (sGuests) sGuests.value = label;
}

function getDetailRoomTotals() {
  const rooms = Array.isArray(bookingState.roomPlans) && bookingState.roomPlans.length
    ? bookingState.roomPlans
    : (Array.isArray(detailRoomPlans) && detailRoomPlans.length ? detailRoomPlans : [{ adults: 2, children: 0 }]);
  const guests = rooms.reduce((sum, room) => sum + Math.max(1, parseInt(room.adults || 1, 10)) + Math.max(0, parseInt(room.children || 0, 10)), 0);
  return { rooms: rooms.length, guests };
}

function toggleDetailGuestPicker() {
  const picker = document.getElementById('detailGuestPicker');
  const trigger = document.getElementById('detailGuestDisplay');
  if (!picker || !trigger) return;
  if (picker.style.display !== 'block') {
    picker.style.display = 'block';
    positionPopover(picker, trigger, 250);
    renderDetailRoomPlans();
  } else {
    picker.style.display = 'none';
  }
}

function renderDetailRoomPlans() {
  const list = document.getElementById('detailRoomPlansList');
  if (!list) return;
  if (!detailRoomPlans.length) detailRoomPlans = [{ adults: 2, children: 0 }];
  list.innerHTML = detailRoomPlans.map((room, idx) => `
    <div class="detail-room-card">
      <div class="detail-room-card-head">
        <strong>Room ${idx + 1}</strong>
        ${detailRoomPlans.length > 1 ? `<button type="button" class="detail-room-remove" onclick="removeDetailRoom(${idx})">Remove</button>` : ''}
      </div>
      <div class="detail-room-controls">
        <div class="detail-room-control">
          <span>Adults</span>
          <div class="detail-room-stepper">
            <button type="button" onclick="changeDetailGuests(${idx}, 'adults', -1)">−</button>
            <strong>${room.adults}</strong>
            <button type="button" onclick="changeDetailGuests(${idx}, 'adults', 1)">+</button>
          </div>
        </div>
        <div class="detail-room-control">
          <span>Children</span>
          <div class="detail-room-stepper">
            <button type="button" onclick="changeDetailGuests(${idx}, 'children', -1)">−</button>
            <strong>${room.children}</strong>
            <button type="button" onclick="changeDetailGuests(${idx}, 'children', 1)">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  updateDetailGuestDisplay();
}

function addDetailRoom() {
  detailGuestTouched = true;
  detailRoomPlans.push({ adults: 1, children: 0 });
  renderDetailRoomPlans();
}

function removeDetailRoom(index) {
  if (detailRoomPlans.length <= 1) return;
  detailRoomPlans.splice(index, 1);
  detailGuestTouched = true;
  renderDetailRoomPlans();
}

function changeDetailGuests(index, type, delta) {
  const room = detailRoomPlans[index];
  if (!room) return;
  const min = type === 'adults' ? 1 : 0;
  const max = type === 'adults' ? 8 : 8;
  room[type] = Math.max(min, Math.min(max, (room[type] || 0) + delta));
  detailGuestTouched = true;
  updateDetailGuestDisplay();
}

function doDetailSearch() {
  const dest = document.getElementById('detailDest')?.value || '';
  const checkin = document.getElementById('detailCheckin')?.value || '';
  const checkout = document.getElementById('detailCheckout')?.value || '';
  if (checkin && checkout && checkout <= checkin) {
    showToast('Check-out date must be after check-in.');
    return;
  }

  const destEl = document.getElementById('sDest');
  if (destEl) destEl.value = dest;
  const ciEl = document.getElementById('sCheckin');
  if (ciEl) ciEl.value = checkin;
  const coEl = document.getElementById('sCheckout');
  if (coEl) coEl.value = checkout;
  dateState.checkin = checkin || null;
  dateState.checkout = checkout || null;
  const submittedRooms = detailGuestTouched ? detailRoomPlans : [{ adults: 2, children: 0 }];
  const totals = submittedRooms.reduce((sum, room) => ({
    adults: sum.adults + Math.max(1, parseInt(room.adults || 1, 10)),
    children: sum.children + Math.max(0, parseInt(room.children || 0, 10)),
    rooms: sum.rooms + 1,
  }), { adults: 0, children: 0, rooms: 0 });
  guestState.adults = totals.adults;
  guestState.children = totals.children;
  guestState.rooms = totals.rooms;
  bookingState.roomPlans = submittedRooms.map(room => ({ adults: Math.max(1, parseInt(room.adults || 1, 10)), children: Math.max(0, parseInt(room.children || 0, 10)) }));
  guestTouched = detailGuestTouched;
  persistLastSearchState({
    q: dest,
    checkin,
    checkout,
    adults: guestState.adults,
    children: guestState.children,
    rooms: guestState.rooms,
    guestTouched: guestTouched ? '1' : '0',
  });
  updateDetailGuestDisplay();
  updateNightsDisplay();
  updateSearchGuestDisplay();
  showPage('searchPage');
  fetchAndRenderSearch();
}

function openBookingPage() {
  const checkin = document.getElementById('detailCheckin')?.value || '';
  const checkout = document.getElementById('detailCheckout')?.value || '';
  if (!checkin || !checkout || checkout <= checkin) {
    setDetailBookingError('Please select check-in and check-out dates before booking.');
    return;
  }
  setDetailBookingError('');
  bookingState.roomPlans = detailGuestTouched ? detailRoomPlans.map(room => ({ adults: Math.max(1, parseInt(room.adults || 1, 10)), children: Math.max(0, parseInt(room.children || 0, 10)) })) : [{ adults: 2, children: 0 }];
  bookingCalState._ready = false;
  buildCalendar();
  updateBookingSummary();
  showPage('bookingPage');
}

function _populateHotelDetail(hotel) {
  currentDetailHotel = hotel;
  detailDescExpanded = false;
  detailAmenitiesExpanded = false;
  detailCommentsExpanded = false;
  detailRoomPlans = [{ adults: 2, children: 0 }];
  detailGuestTouched = false;
  setDetailBookingError('');
  let storedSearch = {};
  try {
    storedSearch = JSON.parse(sessionStorage.getItem('bookhotel:lastSearch') || '{}') || {};
  } catch {}

  const nameEl = document.getElementById('detailHotelName');
  if (nameEl) nameEl.textContent = hotel.hotel_name || '';
  const destEl = document.getElementById('detailDest');
  const searchDest = document.getElementById('sDest')?.value || document.getElementById('searchDest')?.value || storedSearch.q || '';
  if (destEl) destEl.value = searchDest;

  const locEl = document.getElementById('detailHotelLoc');
  if (locEl) locEl.textContent = (hotel.city || '') + (hotel.district ? ', ' + hotel.district : '');

  const imgEl = document.getElementById('detailMainImg');
  if (imgEl && hotel.img) imgEl.src = hotel.img;

  renderDetailDescription(hotel.description || '');
  renderDetailAmenities(hotel.amenities || '');
  setDpValue('detailCheckin', dateState.checkin || document.getElementById('searchCheckin')?.value || '');
  setDpValue('detailCheckout', dateState.checkout || document.getElementById('searchCheckout')?.value || '');
  if (guestTouched || storedSearch.guestTouched === '1' || storedSearch.guestTouched === 1) {
    const rooms = Math.max(1, parseInt(guestState.rooms || 1, 10));
    let adults = Math.max(rooms, parseInt(guestState.adults || rooms, 10));
    let children = Math.max(0, parseInt(guestState.children || 0, 10));
    detailRoomPlans = Array.from({ length: rooms }, () => ({ adults: 1, children: 0 }));
    let adultsLeft = adults - rooms;
    let i = 0;
    while (adultsLeft > 0) {
      detailRoomPlans[i % rooms].adults += 1;
      adultsLeft -= 1;
      i += 1;
    }
    i = 0;
    while (children > 0) {
      detailRoomPlans[i % rooms].children += 1;
      children -= 1;
      i += 1;
    }
    detailGuestTouched = true;
  }
  renderDetailRoomPlans();
  updateDetailGuestDisplay();

  const scoreEl = document.getElementById('detailHotelScore');
  if (scoreEl) scoreEl.textContent = parseFloat(hotel.score || 0).toFixed(1);

  const priceEl = document.getElementById('detailHotelPrice');
  if (priceEl) priceEl.textContent = hotel.price || '';

  const roomsEl = document.getElementById('detailRoomsList');
  if (roomsEl) {
    if (hotel.rooms && hotel.rooms.length) {
      roomsEl.innerHTML = hotel.rooms.map(r => `
        <div class="room-row">
          <img class="room-row-img" src="${r.img || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80'}" alt="${r.room_type}">
          <div class="room-row-body">
            <div class="room-row-name">${r.room_type} – Room ${r.room_number}</div>
            <div class="room-row-tag">Max ${r.capacity} guests · ${(r.amenities || '').split(',').slice(0,3).join(' · ')}</div>
          </div>
          <div class="room-row-right">
            <div class="room-nights-lbl">per night</div>
            <div class="room-price-main">EUR ${parseFloat(r.price_per_night).toFixed(0)}</div>
            <button class="btn-book-now" onclick="selectRoomAndBook(${JSON.stringify(r).replace(/"/g,'&quot;')}, ${hotel.id}, '${(hotel.hotel_name||'').replace(/'/g,"\\'")}')">Book Now ›</button>
          </div>
        </div>`).join('');
    } else {
      roomsEl.innerHTML = '<div style="padding:20px;color:var(--muted);text-align:center">No rooms available. Please contact the hotel directly.</div>';
    }
  }

  renderReviews(hotel.guest_reviews || [], hotel.id, {
    review_count: hotel.review_count || (hotel.guest_reviews || []).length,
    average_rating: hotel.score || null,
    recommend_count: Math.round((hotel.review_count || (hotel.guest_reviews || []).length || 0) * 0.7),
  });
  loadReviews(hotel.id);
  buildCalendar();
}

function showHotelNotFound() {
  currentDetailHotel = null;
  selectedHotelId = null;
  currentDetailReviews = [];
  detailDescExpanded = false;
  detailAmenitiesExpanded = false;
  detailCommentsExpanded = false;

  const nameEl = document.getElementById('detailHotelName');
  if (nameEl) nameEl.textContent = 'Hotel not found';

  const locEl = document.getElementById('detailHotelLoc');
  if (locEl) locEl.innerHTML = '<i data-lucide="map-pin" class="lbl-ico"></i>';

  const imgEl = document.getElementById('detailMainImg');
  if (imgEl) imgEl.src = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80';

  const destEl = document.getElementById('detailDest');
  if (destEl) destEl.value = '';

  const descEl = document.getElementById('detailHotelDesc');
  if (descEl) {
    descEl.textContent = 'Hotel not found.';
    descEl.classList.remove('collapsed');
  }
  const moreBtn = document.getElementById('detailSeeMoreBtn');
  if (moreBtn) moreBtn.style.display = 'none';

  const amenWrap = document.querySelector('#hotelDetailPage .amenity-tags');
  if (amenWrap) amenWrap.innerHTML = `<span class="amenity-tag">${ui('No amenities listed')}</span>`;
  const amenBtn = document.getElementById('detailSeeAllAmenitiesBtn');
  if (amenBtn) amenBtn.style.display = 'none';

  const scoreEl = document.getElementById('detailHotelScore');
  if (scoreEl) scoreEl.textContent = '';
  const priceEl = document.getElementById('detailHotelPrice');
  if (priceEl) priceEl.textContent = '';

  const roomsEl = document.getElementById('detailRoomsList');
  if (roomsEl) roomsEl.innerHTML = '<div style="padding:20px;color:var(--muted);text-align:center">Hotel not found.</div>';

  const reviewsEl = document.getElementById('reviewsList');
  if (reviewsEl) reviewsEl.innerHTML = '<div style="padding:20px;color:var(--muted);text-align:center">Hotel not found.</div>';
}

function openHotelDetail(hotelId) {
  selectedHotelId = hotelId;
  fetch('/api/hotels/' + hotelId)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(hotel => {
      _populateHotelDetail(hotel);
      showPage('hotelDetailPage');
    })
    .catch(() => {
      showHotelNotFound();
      showPage('hotelDetailPage');
    });
}

// Booking state
const bookingState = { hotel: null, room: null, roomPlans: [{ adults: 2, children: 0 }], transports: [], paymentTab: 'single', multiCards: [] };

function toggleTransportForm(type) {
  const flight = document.getElementById('flightForm');
  const transfer = document.getElementById('transferForm');
  if (flight && type === 'flight') flight.style.display = flight.style.display === 'block' ? 'none' : 'block';
  if (transfer && type === 'transfer') transfer.style.display = transfer.style.display === 'block' ? 'none' : 'block';
}

function saveTransport(type) {
  const item = type === 'flight'
    ? {
        type,
        title: 'Flight',
        number: document.getElementById('flightNumber')?.value.trim() || '',
        airline: document.getElementById('flightAirline')?.value.trim() || '',
        date: document.getElementById('flightDate')?.value || '',
        time: document.getElementById('flightTime')?.value || '',
        location: document.getElementById('flightAirport')?.value.trim() || ''
      }
    : {
        type,
        title: 'Transfer',
        pickup: document.getElementById('transferPickup')?.value.trim() || '',
        dropoff: document.getElementById('transferDropoff')?.value.trim() || '',
        date: document.getElementById('transferDate')?.value || '',
        time: document.getElementById('transferTime')?.value || '',
        passengers: document.getElementById('transferPassengers')?.value || ''
      };
  const hasValue = Object.entries(item).some(([k, v]) => !['type','title'].includes(k) && String(v).trim());
  if (!hasValue) { showToast('Please enter service details.'); return; }
  const existing = bookingState.transports.findIndex(t => t.type === type);
  if (existing >= 0) bookingState.transports[existing] = item;
  else bookingState.transports.push(item);
  renderTransports();
  const form = document.getElementById(type === 'flight' ? 'flightForm' : 'transferForm');
  if (form) form.style.display = 'none';
}

function removeTransport(type) {
  bookingState.transports = bookingState.transports.filter(t => t.type !== type);
  renderTransports();
}

function editTransport(type) {
  const form = document.getElementById(type === 'flight' ? 'flightForm' : 'transferForm');
  if (form) form.style.display = 'block';
}

function renderTransports() {
  const el = document.getElementById('transportList');
  if (!el) return;
  el.innerHTML = bookingState.transports.map(t => {
    const details = t.type === 'flight'
      ? `${t.airline || 'Airline'} ${t.number || ''} · ${t.date || 'Date'} ${t.time || ''} · ${t.location || 'Airport'}`
      : `${t.pickup || 'Pickup'} → ${t.dropoff || 'Drop-off'} · ${t.date || 'Date'} ${t.time || ''} · ${t.passengers || 1} passenger(s)`;
    return `<div class="transport-item">
      <div><strong>${t.title}</strong><br>${escapeHtml(details)}</div>
      <div class="transport-actions">
        <button class="mini-action" onclick="editTransport('${t.type}')">Edit</button>
        <button class="mini-action secondary" onclick="removeTransport('${t.type}')">Remove</button>
      </div>
    </div>`;
  }).join('');
}

function toggleAdultAccordion() {
  const body = document.getElementById('adultAccordionBody');
  const arrow = document.getElementById('adultAccordionArrow');
  if (!body) return;
  const open = body.style.display !== 'block';
  body.style.display = open ? 'block' : 'none';
  if (arrow) arrow.textContent = open ? '⌃' : '⌄';
}

function getRoomCount() {
  const plans = bookingState.roomPlans && bookingState.roomPlans.length ? bookingState.roomPlans : detailRoomPlans;
  return Array.isArray(plans) && plans.length ? plans.length : 1;
}

function getRoomPrice() {
  const roomPrice = parseFloat(bookingState.room?.price_per_night);
  if (roomPrice > 0) return roomPrice;
  const hotelPrice = parseFloat(currentDetailHotel?.price_from || String(currentDetailHotel?.price || '').replace(/[^0-9.]/g, ''));
  if (hotelPrice > 0) return hotelPrice;
  return 0;
}

function recalcBookingTotal() {
  const price = getRoomPrice();
  const nights = dateState.checkin && dateState.checkout
    ? Math.max(1, Math.round((new Date(dateState.checkout) - new Date(dateState.checkin)) / 86400000))
    : 1;
  const rooms = getRoomCount();
  bookingState.nights = nights;
  bookingState.totalPrice = price * nights * rooms;
  const roomTxt = price > 0 ? 'EUR ' + price.toFixed(2) : 'Select room';
  const totalTxt = price > 0 ? 'EUR ' + bookingState.totalPrice.toFixed(2) : 'Select room';
  ['orderRoomPrice','payOrderRoomPrice'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = roomTxt; });
  ['orderTotalPrice','orderTotalPrice2'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = totalTxt; });
}

function selectRoomAndBook(room, hotelId, hotelName) {
  const checkin = document.getElementById('detailCheckin')?.value || dateState.checkin || '';
  const checkout = document.getElementById('detailCheckout')?.value || dateState.checkout || '';
  if (!checkin || !checkout || checkout <= checkin) {
    setDetailBookingError('Please select check-in and check-out dates before booking.');
    return;
  }
  setDetailBookingError('');
  bookingState.hotel = { id: hotelId, name: hotelName };
  bookingState.room  = room;
  bookingState.roomPlans = detailGuestTouched ? detailRoomPlans.map(room => ({ adults: Math.max(1, parseInt(room.adults || 1, 10)), children: Math.max(0, parseInt(room.children || 0, 10)) })) : [{ adults: 2, children: 0 }];

  const hotel = currentDetailHotel || {};
  const loc = (hotel.city || '') + (hotel.district ? ', ' + hotel.district : '');

  const nameEl = document.getElementById('orderHotelName');
  if (nameEl) nameEl.textContent = hotelName;
  const locEl = document.getElementById('orderHotelLoc');
  if (locEl && loc) locEl.innerHTML = `<i data-lucide="map-pin" class="lbl-ico"></i> ${loc}`;

  const payNameEl = document.getElementById('payOrderHotelName');
  if (payNameEl) payNameEl.textContent = hotelName;
  const payLocEl = document.getElementById('payOrderHotelLoc');
  if (payLocEl && loc) payLocEl.innerHTML = `<i data-lucide="map-pin" class="lbl-ico"></i> ${loc}`;

  const roomEl = document.getElementById('orderRoomName');
  if (roomEl) roomEl.textContent = room.room_type || '';
  const priceEl = document.getElementById('orderRoomPrice');
  if (priceEl) priceEl.textContent = 'EUR ' + parseFloat(room.price_per_night).toFixed(2);
  recalcBookingTotal();

  openBookingPage();
}

function setPaymentTab(tab) {
  bookingState.paymentTab = tab;
  document.getElementById('singleCardTab')?.classList.toggle('active', tab === 'single');
  document.getElementById('multiCardTab')?.classList.toggle('active', tab === 'multi');
  const single = document.getElementById('singleCardPanel');
  const multi = document.getElementById('multiCardPanel');
  if (single) single.style.display = tab === 'single' ? 'grid' : 'none';
  if (multi) multi.style.display = tab === 'multi' ? 'block' : 'none';
  if (tab === 'multi' && bookingState.multiCards.length < 2) {
    while (bookingState.multiCards.length < 2) bookingState.multiCards.push({});
    renderMultiCards();
  }
}

function addMultiCard() {
  bookingState.multiCards.push({});
  renderMultiCards();
}

function removeMultiCard(index) {
  bookingState.multiCards.splice(index, 1);
  renderMultiCards();
}

function renderMultiCards() {
  const el = document.getElementById('multiCardsList');
  if (!el) return;
  el.innerHTML = bookingState.multiCards.map((card, i) => `
    <div class="multi-card">
      <div class="multi-card-head"><span>Card ${i + 1}</span>${bookingState.multiCards.length > 1 ? `<button class="mini-action secondary" onclick="removeMultiCard(${i})">Remove</button>` : ''}</div>
      <div class="form-grid">
        <input class="form-inp" placeholder="Cardholder name" value="${card.name || ''}" oninput="bookingState.multiCards[${i}].name=this.value">
        <input class="form-inp" placeholder="Card number" maxlength="19" value="${card.num || ''}" oninput="this.value=formatCardNumber(this.value);bookingState.multiCards[${i}].num=this.value">
        <input class="form-inp" placeholder="Expiry MM/YY" value="${card.expiry || ''}" onclick="openExpiryPicker('multiExpiry${i}')" id="multiExpiry${i}" oninput="formatExpiryInput(this);bookingState.multiCards[${i}].expiry=this.value">
        <input class="form-inp" placeholder="CVV" maxlength="4" value="${card.cvc || ''}" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,4);bookingState.multiCards[${i}].cvc=this.value">
        <input class="form-inp full" placeholder="Amount" type="number" min="0" value="${card.amount || ''}" oninput="bookingState.multiCards[${i}].amount=this.value">
      </div>
    </div>
  `).join('');
}

function formatCardNumber(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiryInput(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
  input.value = v;
}

function isFutureExpiry(value) {
  const m = String(value || '').match(/^(\d{2})\/(\d{2}|\d{4})$/);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  let year = parseInt(m[2], 10);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return false;
  const end = new Date(year, month, 0, 23, 59, 59);
  return end >= new Date();
}

function luhnOk(num) {
  const digits = String(num || '').replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0, dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n; dbl = !dbl;
  }
  return sum % 10 === 0;
}

function showPaymentError(message, multi = false) {
  const el = document.getElementById(multi ? 'multiPaymentError' : 'paymentError');
  if (!el) { showToast(message); return; }
  el.textContent = message;
  el.classList.add('show');
}

function clearPaymentErrors() {
  document.querySelectorAll('.payment-error').forEach(e => e.classList.remove('show'));
}

function validateCard(card) {
  if (!String(card.name || '').trim()) return 'Cardholder name is required.';
  if (!luhnOk(card.num)) return 'Please enter a valid card number.';
  if (!isFutureExpiry(card.expiry)) return 'Please select a valid future expiry date.';
  if (!/^\d{3,4}$/.test(String(card.cvc || ''))) return 'CVV must be 3 or 4 digits.';
  return '';
}

function collectPrimaryCard() {
  return {
    name: document.getElementById('ccName')?.value.trim() || '',
    num: document.getElementById('ccNum')?.value || '',
    expiry: document.getElementById('ccExpiry')?.value || '',
    cvc: document.getElementById('ccCvc')?.value || ''
  };
}

function completePayment() {
  clearPaymentErrors();
  const agree = document.getElementById('agreePayment')?.checked;
  if (!agree) { showPaymentError('Please accept the service agreement.', bookingState.paymentTab === 'multi'); return; }

  let cards = [];
  if (bookingState.paymentTab === 'multi') {
    cards = bookingState.multiCards.filter(c => c && (c.name || c.num || c.expiry || c.cvc || c.amount));
    if (cards.length < 2) { showPaymentError('Please add at least two cards.', true); return; }
    for (const card of cards) {
      const err = validateCard(card);
      if (err) { showPaymentError(err, true); return; }
    }
  } else {
    const card = collectPrimaryCard();
    const err = validateCard(card);
    if (err) { showPaymentError(err); return; }
    cards = [card];
  }
  const last4 = cards[0].num.replace(/\D/g,'').slice(-4) || '0000';
  recalcBookingTotal();

  fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reservation_id: bookingState.reservationId,
      amount:         bookingState.totalPrice || 0,
      method:         'credit_card',
      card_last4:     last4,
      split_cards:    bookingState.paymentTab === 'multi' ? cards.length : 1,
    }),
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      showPaymentSuccess(last4, data.transaction_ref || '');
    } else {
      showPaymentError(data.message || 'Payment failed. Please check your details.', bookingState.paymentTab === 'multi');
    }
  })
  .catch(() => showPaymentSuccess(last4, 'LOCAL-' + Date.now()));
}

function showPaymentSuccess(last4, txnRef) {
  const now = new Date().toLocaleString('en-GB');
  const ref = 'BK-' + new Date().getFullYear() + '-' + String(bookingState.reservationId || Date.now()).slice(-6);
  const setTxt = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  setTxt('confirmBookingId', ref);
  setTxt('confirmDateTime',  now);
  setTxt('confirmAmount',    'EUR ' + parseFloat(bookingState.totalPrice||0).toFixed(2));
  setTxt('confirmPayMethod', (bookingState.paymentTab === 'multi' ? 'Multiple cards' : 'Card') + ' ending in ' + last4);
  setTxt('confirmTxnRef',    txnRef);
  showPage('paySuccessPage');
}

let expiryTargetId = null;

function openExpiryPicker(inputId) {
  expiryTargetId = inputId;
  const picker = document.getElementById('expiryPicker');
  const input = document.getElementById(inputId);
  if (!picker || !input) return;
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 9 }, (_, i) => now.getFullYear() + i);
  picker.innerHTML = `
    <div class="expiry-grid">${months.map(m => `<button onclick="pickExpiryMonth(${m})">${String(m).padStart(2,'0')}</button>`).join('')}</div>
    <div class="expiry-years">${years.map(y => `<button onclick="pickExpiryYear(${y})">${String(y).slice(-2)}</button>`).join('')}</div>
  `;
  picker.dataset.month = '';
  picker.style.display = 'block';
  positionPopover(picker, input, 230);
  setTimeout(() => document.addEventListener('click', closeExpiryOutside, { once: true }), 0);
}

function closeExpiryOutside(e) {
  const picker = document.getElementById('expiryPicker');
  const input = expiryTargetId ? document.getElementById(expiryTargetId) : null;
  if (!picker) return;
  if (!picker.contains(e.target) && e.target !== input) picker.style.display = 'none';
  else setTimeout(() => document.addEventListener('click', closeExpiryOutside, { once: true }), 0);
}

function pickExpiryMonth(month) {
  const picker = document.getElementById('expiryPicker');
  if (picker) picker.dataset.month = String(month).padStart(2, '0');
}

function pickExpiryYear(year) {
  const picker = document.getElementById('expiryPicker');
  const month = picker?.dataset.month || String(new Date().getMonth() + 1).padStart(2, '0');
  const value = `${month}/${String(year).slice(-2)}`;
  if (!isFutureExpiry(value)) { showToast('Please select a future expiry date.'); return; }
  const input = expiryTargetId ? document.getElementById(expiryTargetId) : null;
  if (input) {
    input.value = value;
    if (expiryTargetId.startsWith('multiExpiry')) {
      const idx = parseInt(expiryTargetId.replace('multiExpiry', ''), 10);
      if (!Number.isNaN(idx) && bookingState.multiCards[idx]) bookingState.multiCards[idx].expiry = value;
    }
  }
  if (picker) picker.style.display = 'none';
  updateCard();
}

// ── CALENDAR ─────────────────────────────────────
const bookingCalState = { y: new Date().getFullYear(), m: new Date().getMonth(), selecting: 'checkin' };

function syncBookingCalMonth() {
  const base = dateState.checkin || dateState.checkout;
  if (base) {
    const d = new Date(base + 'T00:00:00');
    bookingCalState.y = d.getFullYear();
    bookingCalState.m = d.getMonth();
  }
}

function buildCalendar() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  if (!bookingCalState._ready) {
    syncBookingCalMonth();
    bookingCalState._ready = true;
  }
  const days = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  let html = days.map(d => `<div class="cal-dh">${d}</div>`).join('');
  const y = bookingCalState.y;
  const m = bookingCalState.m;
  const monthName = new Date(y, m, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  const lbl = document.getElementById('bookingCalMonth');
  if (lbl) lbl.textContent = monthName;
  const start = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const prevTotal = new Date(y, m, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const ci = dateState.checkin || '';
  const co = dateState.checkout || '';
  for (let i = 0; i < start; i++) html += `<div class="cal-d other">${prevTotal - start + i + 1}</div>`;
  for (let d = 1; d <= total; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dt = new Date(y, m, d);
    let cls = 'cal-d';
    if (dt.toDateString() === today.toDateString()) cls += ' today';
    if ((ci && ds === ci) || (co && ds === co)) cls += ' selected';
    else if (ci && co && ds > ci && ds < co) cls += ' in-range';
    html += `<div class="${cls}" onclick="bookingCalPick('${ds}')">${d}</div>`;
  }
  grid.innerHTML = html;
  updateBookingSummary();
}

function bookingCalNav(dir) {
  bookingCalState._ready = true;
  bookingCalState.m += dir;
  if (bookingCalState.m < 0) { bookingCalState.m = 11; bookingCalState.y--; }
  if (bookingCalState.m > 11) { bookingCalState.m = 0; bookingCalState.y++; }
  buildCalendar();
}

function bookingCalPick(dateStr) {
  if (!dateState.checkin || (dateState.checkin && dateState.checkout) || dateStr < dateState.checkin) {
    dateState.checkin = dateStr;
    dateState.checkout = null;
    bookingCalState.selecting = 'checkout';
  } else if (dateStr > dateState.checkin) {
    dateState.checkout = dateStr;
    bookingCalState.selecting = 'checkin';
  }
  setDpValue('detailCheckin', dateState.checkin || '');
  setDpValue('detailCheckout', dateState.checkout || '');
  setDpValue('searchCheckin', dateState.checkin || '');
  setDpValue('searchCheckout', dateState.checkout || '');
  setDpValue('sCheckin', dateState.checkin || '');
  setDpValue('sCheckout', dateState.checkout || '');
  setDetailBookingError('');
  updateNightsDisplay();
  buildCalendar();
}

function formatBookingDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function updateBookingSummary() {
  recalcBookingTotal();
  const datesEl = document.getElementById('orderDates');
  const infoEl = document.getElementById('orderCheckinInfo');
  const totals = getDetailRoomTotals();
  const roomLine = `${totals.rooms} room${totals.rooms > 1 ? 's' : ''}, ${totals.guests} guest${totals.guests > 1 ? 's' : ''}`;
  const ci = dateState.checkin;
  const co = dateState.checkout;
  if (datesEl) datesEl.textContent = ci && co ? `${formatBookingDate(ci)} – ${formatBookingDate(co)}` : 'Select dates';
  const payDatesEl = document.getElementById('payOrderDates');
  if (payDatesEl) payDatesEl.textContent = datesEl?.textContent || (ci && co ? `${formatBookingDate(ci)} – ${formatBookingDate(co)}` : 'Select dates');
  if (infoEl) {
    infoEl.textContent = ci && co
      ? `Check-in: ${formatBookingDate(ci)}, Check-out: ${formatBookingDate(co)} · ${roomLine}`
      : 'Choose check-in and check-out dates';
  }
  const payInfoEl = document.getElementById('payOrderCheckinInfo');
  if (payInfoEl) payInfoEl.textContent = infoEl?.textContent || (ci && co ? `Check-in: ${formatBookingDate(ci)}, Check-out: ${formatBookingDate(co)} · ${roomLine}` : 'Choose check-in and check-out dates');
  const payHotel = document.getElementById('payOrderHotelName');
  if (payHotel && bookingState.hotel?.name) payHotel.textContent = bookingState.hotel.name;
  const payRoom = document.getElementById('payOrderRoomName');
  if (payRoom && bookingState.room?.room_type) payRoom.textContent = bookingState.room.room_type;
}

// ── CREDIT CARD LIVE UPDATE ───────────────────────
function updateCard() {
  const numInput = document.getElementById('ccNum');
  if (numInput) numInput.value = formatCardNumber(numInput.value);
  const num    = numInput?.value || '';
  const holder = document.getElementById('ccName')?.value || '';
  const expiry = document.getElementById('ccExpiry')?.value || '';
  const cvc = document.getElementById('ccCvc')?.value || '';
  const numEl  = document.getElementById('cardNumDisplay');
  const holderEl = document.getElementById('cardHolderDisplay');
  const expEl = document.getElementById('cardExpiryDisplay');
  const cvcEl = document.getElementById('cardCvcDisplay');
  if (numEl) {
    const clean = num.replace(/\D/g,'').substring(0,16);
    const spaced = clean.replace(/(.{4})/g,'$1 ').trim();
    numEl.textContent = spaced || '0000 0000 0000 0000';
  }
  if (holderEl) holderEl.textContent = holder.toUpperCase() || 'CARDHOLDER';
  if (expEl) expEl.textContent = expiry || 'MM/YY';
  if (cvcEl) cvcEl.textContent = cvc ? '***' : 'CVV';
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
          <td><span class="td-loc">${h.city}</span></td>
          <td>${h.stars || 5} stars</td>
          <td><span class="td-badge ${h.status === 'ACTIVE' ? 'active' : 'pending'}">${h.status}</span></td>
          <td><div class="td-actions">
            <button class="td-edit" title="Edit">✏</button>
            <button class="td-del" onclick="deleteHotel(${h.id})" title="Delete">✕</button>
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

function loadReviews(hotelId) {
  fetch('/api/hotels/' + hotelId + '/reviews')
    .then(r => r.json())
    .then(data => renderReviews(data.reviews || [], hotelId, data.stats || {}))
    .catch(() => {
      fetch('/api/hotels/' + hotelId)
        .then(r => r.json())
        .then(hotel => renderReviews(hotel.guest_reviews || [], hotelId, {
          review_count: (hotel.guest_reviews || []).length,
          average_rating: (hotel.guest_reviews || []).length
            ? (hotel.guest_reviews || []).reduce((s, r) => s + (parseFloat(r.rating) || 0), 0) / (hotel.guest_reviews || []).length
            : null,
          recommend_count: Math.round(((hotel.guest_reviews || []).length || 0) * 0.7),
        }))
        .catch(() => {});
    });
}

function buildGuestHighlightsStatic() {
  const amenities = splitAmenities(currentDetailHotel?.amenities || '');
  const highlights = [];
  const push = (item) => { if (item && !highlights.includes(item)) highlights.push(item); };
  const amenityText = amenities.join(' ').toLowerCase();
  const hotelText = `${currentDetailHotel?.hotel_name || ''} ${currentDetailHotel?.description || ''} ${amenityText}`.toLowerCase();

  if (hotelText.includes('beach')) push('Great location');
  if (amenityText.includes('spa')) push('Relaxing spa area');
  if (amenityText.includes('casino')) push('Popular entertainment options');
  if (amenityText.includes('pool')) push('Relaxing pool area');
  if (amenityText.includes('kids') || amenityText.includes('family')) push('Popular with families');
  if (amenityText.includes('restaurant') || amenityText.includes('breakfast')) push('Highly rated breakfast');
  if ((parseFloat(currentDetailHotel?.score || 0) || 0) >= 8.5) push('Friendly staff');
  if ((parseFloat(currentDetailHotel?.score || 0) || 0) >= 9) push('Clean and spacious rooms');
  if ((parseInt(currentDetailHotel?.review_count || 0, 10) || 0) >= 100) push('Recommended by guests');
  if (currentDetailHotel?.city || currentDetailHotel?.district) push('Good value for money');

  return highlights.slice(0, 8);
}

function renderReviews(reviews, hotelId, meta = {}) {
  const el = document.getElementById('reviewsList');
  if (!el) return;
  currentDetailReviews = Array.isArray(reviews) ? reviews : [];
  const shownReviews = detailCommentsExpanded ? currentDetailReviews : currentDetailReviews.slice(0, 2);
  const btn = document.querySelector('.detail-comments-link');
  if (btn) btn.textContent = detailCommentsExpanded ? 'Hide Reviews' : 'See All Reviews';
  const avg = meta.average_rating !== undefined && meta.average_rating !== null
    ? parseFloat(meta.average_rating).toFixed(1)
    : (currentDetailReviews.length ? (currentDetailReviews.reduce((s,r)=>s+parseFloat(r.rating||0),0)/currentDetailReviews.length).toFixed(1) : '—');
  const reviewCount = parseInt(meta.review_count || currentDetailReviews.length || 0, 10) || 0;
  const recommendCount = parseInt(meta.recommend_count || Math.round(reviewCount * 0.7), 10) || 0;
  const recommendLabel = reviewCount > 0 ? `${Math.round((recommendCount / reviewCount) * 100)}% Recommends` : 'No reviews yet';
  const guestHighlights = buildGuestHighlightsStatic();
  const goodToKnow = [
    'Check-in starts at 14:00',
    'Check-out until 12:00',
    'Free cancellation may be available depending on room type',
    'Breakfast options are available',
    'Special requests are subject to availability',
  ];
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="width:52px;height:52px;background:var(--green);border-radius:10px;color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center">${avg}</div>
      <div><div style="font-size:14px;font-weight:700;color:var(--green)">Guest Rating</div><div style="font-size:12px;color:var(--muted)">${reviewCount} review${reviewCount!==1?'s':''} · ${recommendLabel}</div></div>
    </div>
    ${shownReviews.length ? shownReviews.map(r=>`
    <div style="background:var(--bg);border-radius:10px;padding:12px 14px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <strong style="font-size:13px">${r.reviewer_name||'Guest'}</strong>
        <span style="background:var(--green);color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:700">${parseFloat(r.rating||0).toFixed(1)}</span>
      </div>
      <div style="font-size:12.5px;color:var(--sub)">${r.comment||''}</div>
      </div>`).join('') : '<div style="background:var(--bg);border-radius:10px;padding:14px;color:var(--muted);font-size:13px;margin-bottom:8px">No reviews yet. Be the first to review this hotel.</div>'}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:12px">
      <div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px">
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">Guest Highlights</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${guestHighlights.length ? guestHighlights.map(item => `<span style="background:var(--green-light);color:var(--green-dark);border:1px solid rgba(26,107,90,.14);border-radius:999px;padding:8px 12px;font-size:12.5px;font-weight:700">${item}</span>`).join('') : '<span style="color:var(--muted);font-size:13px">Good location and guest-friendly service.</span>'}
        </div>
      </div>
      <div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px">
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">Good to Know</div>
        <div style="display:grid;gap:10px">
          ${goodToKnow.map(item => `<div style="display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--sub);line-height:1.5"><span style="color:var(--green);font-weight:900;line-height:1.1;margin-top:2px">✓</span><span>${item}</span></div>`).join('')}
        </div>
      </div>
    </div>`;
  updateStaticTranslations();
}

function toggleAllComments() {
  detailCommentsExpanded = !detailCommentsExpanded;
  renderReviews(currentDetailReviews, currentDetailHotel?.id || selectedHotelId);
  const el = document.getElementById('reviewsList');
  if (detailCommentsExpanded && el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  if (!current || !newpw || !confirm) { showToast('Please fill in all fields.'); return; }
  if (newpw !== confirm) { showToast('New passwords do not match.'); return; }
  if (newpw.length < 8 || !/[A-Z]/.test(newpw) || !/[0-9]/.test(newpw)) {
    showToast('Password must be 8+ chars, 1 uppercase, 1 number.'); return;
  }
  fetch('/api/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password: current, new_password: newpw }),
  })
  .then(r => r.json())
  .then(d => {
    showToast(d.message || (d.success ? 'Password changed!' : 'Error.'));
    if (d.success) { document.getElementById('currentPassword').value=''; document.getElementById('newPassword').value=''; document.getElementById('confirmNewPassword').value=''; }
  })
  .catch(() => showToast('Connection error.'));
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
  if (!data.hotel_name || !data.city) { showToast('Hotel name and city are required.'); return; }
  fetch('/api/admin/hotels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  .then(r => r.json())
  .then(d => { showToast(d.message||'Hotel added.'); hideAddHotelModal(); loadAdminHotels(); })
  .catch(() => showToast('Error.'));
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
    botDiv.textContent = data.reply || 'Let me find the best hotels for you!';
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
            <div style="font-size:10.5px;color:rgba(255,255,255,.75)">${h.city} · ${h.price||''}</div>
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
    botDiv.textContent = 'You can specify city, budget, or features for hotels in Cyprus!';
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
    showToast('Please select check-in and check-out dates!');
    return;
  }
  const nights = Math.round((new Date(co)-new Date(ci))/86400000);
  if (nights <= 0) {
    showToast('Check-out date must be after check-in!');
    return;
  }

  const guestName  = (document.getElementById('guestFirstName')?.value||'').trim()
                   + ' ' + (document.getElementById('guestLastName')?.value||'').trim();
  const guestEmail = document.getElementById('guestEmail')?.value.trim()||'';

  if (!guestName.trim() || !guestEmail) {
    showToast('First name, last name, and email are required!');
    return;
  }

  bookingState.checkin    = ci;
  bookingState.checkout   = co;
  bookingState.nights     = nights;
  recalcBookingTotal();

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
  const total = Math.max(1, Math.ceil(allHotelsCache.length / HOTELS_PER_PAGE));
  currentPage = Math.max(1, Math.min(page, total));
  const slice = allHotelsCache.slice((currentPage-1)*HOTELS_PER_PAGE, currentPage*HOTELS_PER_PAGE);
  renderHotels(slice);
  const el = document.getElementById('pageInfo');
  if (el) el.textContent = `${currentPage} of ${total}`;
}

function changePage(dir) {
  const total = Math.ceil(allHotelsCache.length / HOTELS_PER_PAGE);
  const next  = Math.max(1, Math.min(total, currentPage + dir));
  if (next !== currentPage) renderPage(next);
}

function filterByCategory(cat, btn) {
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const titleEl = document.getElementById('secTitle');
  if (cat === 'all') {
    renderPage(1);
    if (titleEl) titleEl.textContent = ui('Recommended for you');
    return;
  }
  const labels = {luxury:ui('Luxury Hotels'),beach:ui('Beachfront Hotels'),casino:ui('Casino Resorts'),spa:ui('Spa & Wellness'),family:ui('Family Friendly')};
  if (titleEl) titleEl.textContent = labels[cat] || 'Hotels';
  const filtered = allHotelsCache.filter(h => {
    const a = (h.amenities || '').toLowerCase();
    if (cat === 'beach')  return a.includes('beach');
    if (cat === 'casino') return a.includes('casino');
    if (cat === 'spa')    return a.includes('spa');
    if (cat === 'family') return a.includes('kids') || a.includes('waterpark');
    if (cat === 'luxury') return (h.stars || 0) >= 5;
    return true;
  });
  renderHotels(filtered.length ? filtered : allHotelsCache);
}
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function normalizeFavoriteId(id) {
  return String(id);
}

function saveFavorites() {
  const seen = new Set();
  favorites = favorites.filter(f => {
    const id = normalizeFavoriteId(f.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(hotelId, hotelName, hotelImg, hotelCity, hotelScore, hotelPrice, btn) {
  const id = normalizeFavoriteId(hotelId);
  const idx = favorites.findIndex(f => normalizeFavoriteId(f.id) === id);
  if (idx === -1) {
    favorites.push({ id: hotelId, name: hotelName, img: hotelImg, city: hotelCity, score: hotelScore, price: hotelPrice });
    showToast('Added to Wishlist');
  } else {
    favorites.splice(idx, 1);
    showToast('Removed from Wishlist');
  }
  saveFavorites();
  syncFavoriteButtons();
  if (document.getElementById('wishlistPage')?.classList.contains('active')) renderWishlist();
}

function isFavorite(hotelId) {
  const id = normalizeFavoriteId(hotelId);
  return favorites.some(f => normalizeFavoriteId(f.id) === id);
}

function removeFavorite(hotelId) {
  const id = normalizeFavoriteId(hotelId);
  favorites = favorites.filter(f => normalizeFavoriteId(f.id) !== id);
  saveFavorites();
  syncFavoriteButtons();
  renderWishlist();
}

function syncFavoriteButtons() {
  document.querySelectorAll('[data-favorite-id]').forEach(btn => {
    const active = isFavorite(btn.dataset.favoriteId);
    btn.textContent = active ? '♥' : '♡';
    btn.title = active ? 'Remove from Wishlist' : 'Add to Wishlist';
    btn.classList.toggle('active', active);
  });
}

function renderWishlist() {
  const el = document.getElementById('wishlistList');
  if (!el) return;
  if (!favorites.length) {
    el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--sub)"><div style="font-size:40px;margin-bottom:12px">♡</div><div style="font-size:16px;font-weight:600">Your wishlist is empty</div><div style="font-size:13px;margin-top:4px">Click the heart icon on any hotel to save it</div></div>';
    return;
  }
  el.innerHTML = favorites.map(h => `
    <div class="r-card" style="margin-bottom:12px">
      <div class="r-card-media">
        <img class="r-card-img" src="${h.img||''}" alt="${h.name}">
      </div>
      <div class="r-card-body">
        <div class="r-card-name">${h.name}</div>
        <div class="r-card-dist">${h.city||''}</div>
      </div>
      <div class="r-card-right">
        <div class="r-score exc">${parseFloat(h.score||0).toFixed(1)}</div>
        <div class="r-price" style="margin-top:auto">${h.price||''}</div>
        <button onclick="removeFavorite(${h.id})" style="margin-top:8px;background:none;border:1px solid var(--red);color:var(--red);border-radius:6px;padding:4px 10px;font-size:11.5px;cursor:pointer">Remove</button>
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
        el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--sub)"><div style="font-size:16px;font-weight:600;margin-top:8px">No reservations yet</div></div>';
        return;
      }
      el.innerHTML = list.map(r => `
        <div style="background:var(--white);border-radius:12px;padding:16px 18px;margin-bottom:10px;box-shadow:var(--shadow-sm)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:15px;font-weight:700;margin-bottom:3px">${r.hotel_name||'Hotel'}</div>
              <div style="font-size:12.5px;color:var(--sub);margin-bottom:2px">${r.room_type||''} · Room ${r.room_number||''}</div>
              <div style="font-size:12.5px;color:var(--sub);margin-bottom:2px">${r.check_in_date} → ${r.check_out_date}</div>
              <div style="font-size:12px;color:var(--muted)">${r.guest_count} guests · <strong>EUR ${parseFloat(r.total_price||0).toFixed(2)}</strong></div>
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

function initDatePicker() { /* replaced by custom date picker below */ }

// ── CUSTOM DATE PICKER ────────────────────────────────
const dpCtx = { anchorId: null, pairedId: null, isCheckout: false, y: 0, m: 0 };

function positionPopover(panel, triggerEl, preferredWidth) {
  if (!panel || !triggerEl) return;
  const r = triggerEl.getBoundingClientRect();
  const gap = 6;
  const width = preferredWidth || panel.offsetWidth || 280;
  const height = panel.offsetHeight || 320;
  const spaceBelow = window.innerHeight - r.bottom - gap;
  const spaceAbove = r.top - gap;
  const top = spaceBelow < height && spaceAbove > spaceBelow
    ? Math.max(gap, r.top - height - gap)
    : Math.min(window.innerHeight - height - gap, r.bottom + gap);

  panel.style.position = 'fixed';
  if (preferredWidth) panel.style.width = preferredWidth + 'px';
  panel.style.top = Math.max(gap, top) + 'px';
  panel.style.left = Math.max(gap, Math.min(r.left, window.innerWidth - width - gap)) + 'px';
}

function positionActiveDatePicker() {
  const dp = document.getElementById('customDp');
  if (!dp || dp.style.display !== 'block' || !dpCtx.anchorId) return;
  const trigger = document.getElementById(dpCtx.anchorId + '_d');
  const ref = trigger?.closest('.lsearch-field,.sbar-field,.db-field,.s-inp-wrap');
  positionPopover(dp, ref || trigger, 280);
}

function openDp(anchorId, pairedId) {
  const today = new Date();
  const currentValue = document.getElementById(anchorId)?.value || '';
  const pairedValue = document.getElementById(pairedId)?.value || '';
  const baseValue = currentValue || (anchorId.toLowerCase().includes('checkout') ? (dateState.checkin || pairedValue) : (dateState.checkin || pairedValue)) || '';
  const baseDate = baseValue ? new Date(baseValue + 'T00:00:00') : today;
  dpCtx.anchorId   = anchorId;
  dpCtx.pairedId   = pairedId;
  dpCtx.isCheckout = anchorId.toLowerCase().includes('checkout') || anchorId === 'lcheckout';
  dpCtx.y = baseDate.getFullYear();
  dpCtx.m = baseDate.getMonth();

  const dp = document.getElementById('customDp');
  if (!dp) return;

  dp.style.display = 'block';
  renderDp();
  positionActiveDatePicker();

  setTimeout(() => document.addEventListener('click', dpOutside, { once: true }), 0);
}

function dpOutside(e) {
  const dp = document.getElementById('customDp');
  if (dp && !dp.contains(e.target)) dp.style.display = 'none';
}

function dpNav(dir) {
  dpCtx.m += dir;
  if (dpCtx.m < 0) { dpCtx.m = 11; dpCtx.y--; }
  if (dpCtx.m > 11) { dpCtx.m = 0; dpCtx.y++; }
  renderDp();
}

function dpPick(dateStr) {
  const inp = document.getElementById(dpCtx.anchorId);
  if (inp) inp.value = dateStr;

  const disp = document.getElementById(dpCtx.anchorId + '_d');
  if (disp) {
    const [y, m, d] = dateStr.split('-');
    disp.textContent = `${d}.${m}.${y}`;
    disp.className = 'dp-val';
  }

  if (!dpCtx.isCheckout) {
    // Clear checkout if now invalid
    const coInp = document.getElementById(dpCtx.pairedId);
    if (coInp && coInp.value && coInp.value <= dateStr) {
      coInp.value = '';
      const coDisp = document.getElementById(dpCtx.pairedId + '_d');
      if (coDisp) { coDisp.textContent = ui('Add date'); coDisp.className = 'dp-val muted'; }
    }
    dateState.checkin = dateStr;
    // Auto-advance to checkout
    const tmp = dpCtx.anchorId;
    dpCtx.anchorId   = dpCtx.pairedId;
    dpCtx.pairedId   = tmp;
    dpCtx.isCheckout = true;
    renderDp();
    positionActiveDatePicker();
    return;
  }

  dateState.checkout = dateStr;
  updateNightsDisplay();
  document.getElementById('customDp').style.display = 'none';
}

function renderDp() {
  const dp = document.getElementById('customDp');
  if (!dp) return;
  const { y, m, isCheckout, anchorId, pairedId } = dpCtx;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dim = new Date(y, m + 1, 0).getDate();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const today = new Date(); today.setHours(0,0,0,0);
  const ciVal = document.getElementById(isCheckout ? pairedId : anchorId)?.value || '';
  const coVal = document.getElementById(isCheckout ? anchorId : pairedId)?.value || '';

  let html = `<div class="dp-head">
    <button class="dp-nav-btn" onclick="dpNav(-1)">‹</button>
    <span class="dp-month-lbl">${MONTHS[m]} ${y}</span>
    <button class="dp-nav-btn" onclick="dpNav(1)">›</button>
  </div>
  <div class="dp-hint">${isCheckout ? 'Check-out' : 'Check-in'}</div>
  <div class="dp-grid">
    ${['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => `<div class="dp-dh">${d}</div>`).join('')}`;

  for (let i = 0; i < first; i++) html += '<div></div>';
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dt = new Date(y, m, d);
    const dis = dt < today || (isCheckout ? (ciVal && ds <= ciVal) : (coVal && ds >= coVal));
    let cls = 'dp-day';
    if (dis) cls += ' dp-dis';
    if (dt.toDateString() === today.toDateString()) cls += ' dp-today';
    if ((ciVal && ds === ciVal) || (coVal && ds === coVal)) cls += ' dp-sel';
    else if (ciVal && coVal && ds > ciVal && ds < coVal) cls += ' dp-range';
    html += `<div class="${cls}"${!dis ? ` onclick="dpPick('${ds}')"` : ''}>${d}</div>`;
  }
  html += '</div>';
  dp.innerHTML = html;
  positionActiveDatePicker();
}

// ── LANDING GUEST PICKER ─────────────────────────────
const lgState = { guests: 1, rooms: 1 };
let lgTouched = false;

function resetLandingSearchBarState() {
  lgTouched = false;
  lgState.guests = 1;
  lgState.rooms = 1;
  const dest = document.getElementById('ldestInput');
  if (dest) dest.value = '';
  const ci = document.getElementById('lcheckin');
  if (ci) ci.value = '';
  const co = document.getElementById('lcheckout');
  if (co) co.value = '';
  const guestsCount = document.getElementById('lg_guests');
  if (guestsCount) guestsCount.textContent = '1';
  const roomsCount = document.getElementById('lg_rooms');
  if (roomsCount) roomsCount.textContent = '1';
  updateLGuestDisplay();
}

function toggleLGuestPicker() {
  const p = document.getElementById('lguestPicker');
  if (!p) return;
  if (p.style.display !== 'block') {
    const trigger = document.getElementById('lguestDisplay');
    p.style.display = 'block';
    positionPopover(p, trigger, 240);
    setTimeout(() => document.addEventListener('click', lgOutside, { once: true }), 0);
  } else {
    p.style.display = 'none';
  }
}

function lgOutside(e) {
  const p = document.getElementById('lguestPicker');
  const d = document.getElementById('lguestDisplay');
  if (!p) return;
  if (!p.contains(e.target) && e.target !== d) {
    p.style.display = 'none';
  } else {
    setTimeout(() => document.addEventListener('click', lgOutside, { once: true }), 0);
  }
}

function changeLGuest(type, delta) {
  lgState[type] = Math.max(1, lgState[type] + delta);
  const el = document.getElementById('lg_' + type);
  if (el) el.textContent = lgState[type];
  lgTouched = true;
  updateLGuestDisplay();
}

function updateLGuestDisplay() {
  const el = document.getElementById('lguestDisplay');
  if (!el) return;
  if (!lgTouched) { el.textContent = ui('Add guests'); el.style.color = 'var(--muted)'; return; }
  const g = lgState.guests, r = lgState.rooms;
  el.textContent = `${g} guest${g > 1 ? 's' : ''} · ${r} room${r > 1 ? 's' : ''}`;
  el.style.color = 'var(--text)';
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
  bookingCalState._ready = false;
  buildCalendar();
  updateBookingSummary();
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
  toast.style.cssText = 'background:var(--white);border-radius:10px;padding:12px 20px;font-size:13.5px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,.15);border:1px solid var(--border);opacity:0;transform:translateX(20px);transition:all .3s;max-width:320px;color:var(--text)';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='1'; toast.style.transform='translateX(0)'; }, 10);
  setTimeout(() => { toast.style.opacity='0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ── GUEST PICKER ─────────────────────────────────
const guestState = { adults: 2, children: 0, rooms: 1 };
let guestTouched = false;

function resetSearchBarState() {
  guestTouched = false;
  dateState.checkin = null;
  dateState.checkout = null;

  const searchDest = document.getElementById('searchDest');
  if (searchDest) searchDest.value = '';
  const searchCheckin = document.getElementById('searchCheckin');
  if (searchCheckin) searchCheckin.value = '';
  const searchCheckout = document.getElementById('searchCheckout');
  if (searchCheckout) searchCheckout.value = '';

  setDpValue('searchCheckin', '');
  setDpValue('searchCheckout', '');
  updateSearchGuestDisplay();
}

function toggleGuestPicker() {
  const picker = document.getElementById('guestPicker');
  if (!picker) return;
  if (picker.style.display !== 'block') {
    const trigger = document.getElementById('guestDisplay');
    picker.style.display = 'block';
    positionPopover(picker, trigger, 260);
    setTimeout(() => document.addEventListener('click', guestOutside, { once: true }), 0);
  } else {
    picker.style.display = 'none';
  }
}

function guestOutside(e) {
  const picker = document.getElementById('guestPicker');
  const d = document.getElementById('guestDisplay');
  if (!picker) return;
  if (!picker.contains(e.target) && e.target !== d) {
    picker.style.display = 'none';
  } else {
    setTimeout(() => document.addEventListener('click', guestOutside, { once: true }), 0);
  }
}

function changeGuests(type, delta) {
  const min = type === 'adults' ? 1 : 0;
  const max = type === 'rooms' ? 9 : 20;
  guestState[type] = Math.max(min, Math.min(max, guestState[type] + delta));
  const el = document.getElementById(type + 'Count');
  if (el) el.textContent = guestState[type];
  guestTouched = true;
  updateGuestDisplay();
}

function updateGuestDisplay() {
  const el = document.getElementById('guestDisplay');
  if (!el) return;
  if (!guestTouched) {
    el.textContent = 'Add guests';
    el.style.color = 'var(--muted)';
    return;
  }
  el.style.color = 'var(--text)';
  const a = guestState.adults, c = guestState.children, r = guestState.rooms;
  let txt = a + ' adult' + (a > 1 ? 's' : '');
  if (c > 0) txt += ' · ' + c + ' child' + (c > 1 ? 'ren' : '');
  txt += ' · ' + r + ' room' + (r > 1 ? 's' : '');
  el.textContent = txt;
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

function updateSearchGuestDisplay() {
  const el = document.getElementById('sGuestDisplay');
  if (!el) return;
  if (!guestTouched) {
    el.textContent = 'Add guests';
    el.style.color = 'var(--muted)';
    const adults = document.getElementById('sAdultsCount');
    const rooms = document.getElementById('sRoomsCount');
    if (adults) adults.textContent = guestState.adults;
    if (rooms) rooms.textContent = guestState.rooms;
    return;
  }
  el.style.color = 'var(--text)';
  const a = guestState.adults;
  const r = guestState.rooms;
  el.textContent = `${a} adult${a > 1 ? 's' : ''}, ${r} room${r > 1 ? 's' : ''}`;
  const adults = document.getElementById('sAdultsCount');
  const rooms = document.getElementById('sRoomsCount');
  if (adults) adults.textContent = a;
  if (rooms) rooms.textContent = r;
}

function toggleSearchGuestPicker() {
  const picker = document.getElementById('sGuestPicker');
  const trigger = document.getElementById('sGuestDisplay');
  if (!picker || !trigger) return;
  const willOpen = picker.style.display !== 'block';
  picker.style.display = willOpen ? 'block' : 'none';
  if (willOpen) positionPopover(picker, trigger, 250);
  updateSearchGuestDisplay();
}

function changeSearchGuests(type, delta) {
  const min = 1;
  const max = type === 'rooms' ? 9 : 20;
  guestState[type] = Math.max(min, Math.min(max, guestState[type] + delta));
  guestTouched = true;
  updateGuestDisplay();
  updateSearchGuestDisplay();
}

function toggleSortMenu() {
  const menu = document.getElementById('sSortMenu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function selectSortOption(btn) {
  const input = document.getElementById('sSort');
  const label = document.getElementById('sSortBtn');
  const menu = document.getElementById('sSortMenu');
  if (input) input.value = btn.dataset.value || 'recommended';
  if (label) label.textContent = btn.textContent;
  document.querySelectorAll('#sSortMenu button').forEach(b => b.classList.toggle('active', b === btn));
  if (menu) menu.style.display = 'none';
  fetchAndRenderSearch();
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

// Close pickers when clicking outside
document.addEventListener('click', e => {
  const link = e.target.closest('a[href="#"]');
  if (link) e.preventDefault();

  const gp = document.getElementById('guestPicker');
  const gd = document.getElementById('guestDisplay');
  if (gp && gd && !gp.contains(e.target) && !gd.contains(e.target)) gp.style.display = 'none';

  const lgp = document.getElementById('lguestPicker');
  const lgd = document.getElementById('lguestDisplay');
  if (lgp && lgd && !lgp.contains(e.target) && !lgd.contains(e.target)) lgp.style.display = 'none';

  const dgp = document.getElementById('detailGuestPicker');
  const dgd = document.getElementById('detailGuestDisplay');
  if (dgp && dgd && !dgp.contains(e.target) && !dgd.contains(e.target)) dgp.style.display = 'none';

  const sgp = document.getElementById('sGuestPicker');
  const sgd = document.getElementById('sGuestDisplay');
  if (sgp && sgd && !sgp.contains(e.target) && !sgd.contains(e.target)) sgp.style.display = 'none';

  const sm = document.getElementById('sSortMenu');
  const sb = document.getElementById('sSortBtn');
  if (sm && sb && !sm.contains(e.target) && !sb.contains(e.target)) sm.style.display = 'none';
});

window.addEventListener('scroll', positionActiveDatePicker, true);
window.addEventListener('resize', positionActiveDatePicker);

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

function setErrorText(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined) el.textContent = text;
}

// ── LANDING PAGE ─────────────────────────────────
function renderLandingGrid(hotels) {
  const grid = document.getElementById('landingHotelsGrid');
  if (!grid) return;
  const list = (Array.isArray(hotels) ? hotels : []).slice(0, 6);
  grid.innerHTML = list.map(h => {
    const stars = '★'.repeat(Math.min(5, parseInt(h.stars) || 4)) + '☆'.repeat(Math.max(0, 5 - (parseInt(h.stars) || 4)));
    const score = parseFloat(h.score) || 0;
    const isExc = score >= 9;
    const priceNum = parseFloat(h.price_from) || parseFloat((h.price || '').replace(/[^0-9.]/g, '')) || 0;
    const fav = isFavorite(h.id);
    return `
    <div class="lh-card" onclick="openHotelDetail(${h.id})" style="cursor:pointer">
      <div class="lh-card-img-wrap">
        <img src="${h.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'}" alt="${h.hotel_name}">
        <div class="lh-card-score ${isExc ? '' : 'good'}">${score.toFixed(1)}</div>
        <button class="lh-card-fav ${fav ? 'active' : ''}" data-favorite-id="${h.id}" onclick="event.stopPropagation();toggleFavorite(${h.id},'${(h.hotel_name || '').replace(/'/g, "\\'")}','${h.img || ''}','${h.city || ''}',${h.score || 0},'${h.price || ''}',this)" title="${fav ? 'Remove from Wishlist' : 'Add to Wishlist'}">${fav ? '♥' : '♡'}</button>
      </div>
      <div class="lh-card-body">
        <div class="lh-card-stars">${stars}</div>
        <div class="lh-card-name">${h.hotel_name || ''}</div>
        <div class="lh-card-loc">${h.city || ''}${h.district ? ', ' + h.district : ''}</div>
        <div class="lh-card-footer">
          <div class="lh-card-price"><span>${ui(isExc ? 'Exceptional' : h.label || 'Good')}</span><strong>EUR ${priceNum > 0 ? priceNum.toFixed(0) : '—'}</strong> ${ui('/ night')}</div>
          <button class="lh-card-btn" onclick="event.stopPropagation();openHotelDetail(${h.id})">${ui('View →')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
  syncFavoriteButtons();
  if (window.lucide) lucide.createIcons();
}

function loadLandingHotels() {
  fetch('/api/hotels')
    .then(r => r.ok ? r.json() : Promise.resolve([]))
    .then(hotels => renderLandingGrid(getRecommendedHotels(hotels)))
    .catch(() => renderLandingGrid([]));
}

function doLandingSearch() {
  const dest     = (document.getElementById('ldestInput')  || {}).value || '';
  const checkin  = (document.getElementById('lcheckin')    || {}).value || '';
  const checkout = (document.getElementById('lcheckout')   || {}).value || '';
  const guests   = lgState.guests;
  const rooms    = lgState.rooms;
  guestState.adults = guests;
  guestState.children = 0;
  guestState.rooms = rooms;
  guestTouched = lgTouched;

  showPage('searchPage');

  const destEl = document.getElementById('sDest');
  if (destEl && dest) destEl.value = dest;

  const ciEl = document.getElementById('sCheckin');
  if (ciEl && checkin) { setDpValue('sCheckin', checkin); dateState.checkin = checkin; }

  const coEl = document.getElementById('sCheckout');
  if (coEl && checkout) { setDpValue('sCheckout', checkout); dateState.checkout = checkout; }

  persistLastSearchState({
    q: dest,
    checkin,
    checkout,
    adults: guestState.adults,
    children: guestState.children,
    rooms: guestState.rooms,
    guestTouched: detailGuestTouched ? '1' : '0',
  });
  updateNightsDisplay();
  updateGuestDisplay();
  updateSearchGuestDisplay();
  fetchAndRenderSearch();
}

function quickFilter(amenity) {
  showPage('searchPage');
  const destEl = document.getElementById('sDest');
  if (destEl) destEl.value = amenity;
  fetchAndRenderSearch();
}

function portalFloatingPickers() {
  ['lguestPicker', 'guestPicker', 'detailGuestPicker', 'sGuestPicker'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentElement !== document.body) document.body.appendChild(el);
  });
}

// ── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  normalizeLanguageSwitchers();
  saveFavorites();
  portalFloatingPickers();
  buildCalendar();
  initDatePicker();
  checkOllamaStatus();
  setLang(currentLang);
  const initialPage = location.hash.replace('#', '') || 'mainMenuPage';
  showPage(document.getElementById(initialPage) ? initialPage : 'mainMenuPage', { replace: true });
  loadLandingHotels();
  setupDestAutocomplete('ldestInput');
  setupDestAutocomplete('searchDest');
  setupDestAutocomplete('detailDest');
  updateSearchGuestDisplay();
  if (window.lucide) lucide.createIcons();
});
