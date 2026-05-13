/* ═══════════════════════════════════════════════
   BOOK HOTEL — script.js
   Connects to Flask backend (app.py)
═══════════════════════════════════════════════ */

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
  startTimer(90);
  showMsg('twofaErr', false);
}

// ── AUTH: REGISTER ───────────────────────────────
function submitRegister() {
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

  if (!valid) return;

  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, phone })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      showPage('twoFAPage');
      startTimer(90);
    } else {
      alert(data.message || 'Registration failed');
    }
  })
  .catch(() => {
    // Demo fallback: go directly to 2FA
    showPage('twoFAPage');
    startTimer(90);
  });
}

// ── AUTH: LOGIN ──────────────────────────────────
function submitLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  showMsg('loginErr', false);

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      showPage('twoFAPage');
      startTimer(90);
    } else {
      showMsg('loginErr', true);
      document.getElementById('loginPassword').classList.add('err');
    }
  })
  .catch(() => {
    // Demo fallback
    showPage('twoFAPage');
    startTimer(90);
  });
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
  .catch(() => {
    // Demo: route to home
    clearInterval(timerInterval);
    routeByRole('USER');
  });
}

function routeByRole(role) {
  if (role === 'ADMIN') {
    showPage('adminDashPage');
  } else if (role === 'HOTEL_MANAGER') {
    showPage('managerDashPage');
    initCharts();
  } else {
    showPage('homePage');
    loadHotels();
  }
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
    .then(hotels => renderHotels(hotels.length ? hotels : DEMO_HOTELS))
    .catch(() => renderHotels(DEMO_HOTELS));
}

function renderHotels(hotels) {
  const grid = document.getElementById('hotelsGrid');
  if (!grid) return;
  grid.innerHTML = hotels.map(h => `
    <div class="h-card" onclick="showPage('hotelDetailPage')">
      <img class="h-card-img" src="${h.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70'}" alt="${h.hotel_name || h.room_type}">
      <div class="h-card-body">
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

let currentPage = 1;
const totalPages = 4;
function changePage(dir) {
  currentPage = Math.max(1, Math.min(totalPages, currentPage + dir));
  document.getElementById('pageInfo').textContent = `${currentPage} of ${totalPages}`;
  loadHotels();
}

// ── SEARCH ───────────────────────────────────────
function goSearch() {
  const dest = document.getElementById('searchDest').value;
  if (dest) document.getElementById('sDest').value = dest;
  showPage('searchPage');
  renderSearchResults();
}

function doSearch() {
  renderSearchResults();
}

const SEARCH_RESULTS = [
  { name:"Noah's Ark Deluxe Hotel & Spa", dist:'30 km from city center', tags:'Free cancellation · Breakfast included', score:'8.5', label:'Good', priceOld:'194.304,00 ₺', price:'97.152,00 ₺', img:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&q=70' },
  { name:'Concorde Luxury Resort & Casino', dist:'28 km from city center', tags:'Free cancellation · Breakfast included', score:'9.7', label:'Excellent', priceOld:'216.000,00 ₺', price:'129.600,00 ₺', img:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&q=70' },
  { name:'Kaya Artemis Resort', dist:'25 km from city center', tags:'Free airport shuttle · Breakfast included', score:'8.9', label:'Good', priceOld:'194.600,00 ₺', price:'117.884,00 ₺', img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=70' },
  { name:'Limak Cyprus Deluxe Hotel', dist:'27 km from city center', tags:'Breakfast included', score:'9.8', label:'Excellent', priceOld:'232.500,00 ₺', price:'139.500,00 ₺', img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70' },
  { name:'The Arkın İskele Hotel', dist:'23 km from city center', tags:'Free airport shuttle · Breakfast included', score:'9.3', label:'Excellent', priceOld:'272.000,00 ₺', price:'144.600,00 ₺', img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&q=70' },
];

function renderSearchResults() {
  const el = document.getElementById('searchResults');
  if (!el) return;
  el.innerHTML = SEARCH_RESULTS.map(r => `
    <div class="r-card" onclick="showPage('hotelDetailPage')">
      <img class="r-card-img" src="${r.img}" alt="${r.name}">
      <div class="r-card-body">
        <div class="r-card-name">${r.name}</div>
        <div class="r-card-dist">${r.dist}</div>
        <div class="r-card-tags">${r.tags}</div>
        <button class="r-card-link">View Details</button>
      </div>
      <div class="r-card-right">
        <div class="r-score ${r.label === 'Excellent' ? 'exc' : ''}">${r.score}</div>
        <div class="r-score-lbl ${r.label === 'Excellent' ? 'exc' : ''}">${r.label}</div>
        <div class="r-price-old">${r.priceOld}</div>
        <div class="r-price">${r.price}</div>
      </div>
    </div>
  `).join('');
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

// ── CHATBOT ──────────────────────────────────────
function toggleChatbot() {
  document.getElementById('chatbotPanel').classList.toggle('open');
}

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
  msgs.scrollTop = msgs.scrollHeight;

  // Bot reply
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot';
    botDiv.textContent = 'I can help you find the best hotels! Please search using the search bar above or let me know your destination and dates.';
    msgs.appendChild(botDiv);
    msgs.scrollTop = msgs.scrollHeight;
  }, 800);
}

function chatSuggest(btn) {
  document.getElementById('chatInput').value = btn.textContent.trim();
  sendChatMsg();
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
  renderSearchResults();

  // Start on login page (change to 'homePage' for dev)
  showPage('loginPage');
});