  // ===== CONFIGURATION =====
  const INTERVAL_MS = 10 * 60 * 1000; // 10 دقائق

  function getIntervalMs(data) {
    return data && data.intervalMs != null ? data.intervalMs : INTERVAL_MS;
  }

  // ===== DEFAULT PRODUCTS =====
  function buildDefaultProducts() {
    return {
      'lord_sticks_cheese': { name: 'أصابع لورد — جبنة', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة بعد نكهة', unit:'', min:1, max:1 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'', min:1, max:1 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'', min:1, max:1 }
      ]},
      'lord_sticks_orange': { name: 'أصابع لورد — برتقالي', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة المواد مع نكهة', unit:'%', min:1, max:1 },
        { key:'density_pre', label:'كثافة قبل القلاية', unit:'كغ/م³', min:1, max:1 },
        { key:'density_post', label:'كثافة بعد القلاية', unit:'كغ/م³', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1, max:1 }
      ]},
      'lord_sticks_lime': { name: 'أصابع لورد — ليمون حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة بعد نكهة', unit:'', min:1, max:1 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'', min:1, max:1 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'', min:1, max:1 }
      ]},
      'lord_sticks_pepper': { name: 'أصابع لورد — فلفل حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة بعد نكهة', unit:'', min:1, max:1 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'', min:1, max:1 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'', min:1, max:1 }
      ]},
      'spicy_lord_lime': { name: 'سبايسي لورد — ليمون حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'', min:1, max:1 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة المواد مع نكهة', unit:'', min:1, max:1 },
        { key:'moisture_pack', label:'رطوبة التغليف', unit:'', min:1, max:1 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'', min:1, max:1 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1, max:1 }
      ]},
      'spicy_lord_cheese': { name: 'سبايسي لورد — جبنة', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'', min:1, max:1 },
        { key:'moisture_pack', label:'رطوبة تغليف', unit:'', min:1, max:1 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'', min:1, max:1 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'', min:1, max:1 }
      ]},
      'spicy_lord_chili': { name: 'سبايسي لورد — بسياس حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'', min:1, max:1 },
        { key:'moisture_pack', label:'رطوبة تغليف', unit:'', min:1, max:1 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'', min:1, max:1 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'', min:1, max:1 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'', min:1, max:1 }
      ]},
      'tasali_lord': { name: 'تسالي لورد', specs: [
        { key:'moisture_pallet', label:'رطوبة الباليت', unit:'%', min:1, max:1 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'%', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1, max:1 },
        { key:'density_plain', label:'الكثافة (بدون نكهة)', unit:'', min:1, max:1 },
        { key:'density_flavor', label:'كثافة المواد مع نكهة', unit:'', min:1, max:1 }
      ]},
      'alzaeem_popcorn': { name: 'فشار الزعيم', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:1, max:1 },
        { key:'moisture_oven', label:'رطوبة بعد الفرن', unit:'%', min:1, max:1 },
        { key:'density', label:'الكثافة', unit:'', min:1, max:1 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:1, max:1 },
        { key:'moisture_pack', label:'رطوبة بعد تغليف', unit:'%', min:1, max:1 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:1, max:1 }
      ]},
      'lord_popcorn': { name: 'فشار لورد', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1, max:1 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:1, max:1 },
        { key:'moisture_oven', label:'رطوبة بعد الفرن', unit:'%', min:1, max:1 },
        { key:'density', label:'الكثافة', unit:'', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:1, max:1 },
        { key:'moisture_pack', label:'رطوبة التغليف', unit:'%', min:1, max:1 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:1, max:1 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:1 }
      ]},
      'mino': { name: 'بفك مينو', specs: [
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:1, max:1 },
        { key:'moisture_oven', label:'رطوبة الفرن', unit:'%', min:1, max:1 },
        { key:'density', label:'الكثافة', unit:'%', min:1, max:1 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:1, max:1 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:1 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:1, max:1 },
        { key:'moisture_pack', label:'رطوبة بعد تغليف', unit:'%', min:1, max:1 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:1, max:1 }
      ]}
    };
  }

  let PRODUCTS = {};
  let LINES = [];

  function loadConfig() {
    try {
      const sp = localStorage.getItem('lord_products');
      const sl = localStorage.getItem('lord_lines');
      if (sp) PRODUCTS = JSON.parse(sp);
      if (sl) LINES = JSON.parse(sl);
    } catch(e) {}
    if (!Object.keys(PRODUCTS).length) {
      PRODUCTS = buildDefaultProducts();
    }
    if (!LINES.length) {
      LINES = [
        { id: 1, products: ['lord_sticks_cheese','lord_sticks_orange','lord_sticks_lime','lord_sticks_pepper','spicy_lord_lime','spicy_lord_cheese','spicy_lord_chili'] },
        { id: 2, products: ['alzaeem_popcorn','lord_popcorn','mino'] },
        { id: 3, products: ['lord_popcorn','mino'] },
        { id: 4, products: ['alzaeem_popcorn','lord_popcorn','mino'] },
        { id: 5, products: ['tasali_lord'] },
        { id: 6, products: [] }
      ];
    }
  }

  let lineData = {};
  let lineStatus = {};

  function loadData() {
    try {
      const d = localStorage.getItem('lord_qc_data');
      if (d) Object.assign(lineData, JSON.parse(d));
    } catch(e) {}
  }

  function loadStatus() {
    try {
      const d = localStorage.getItem('lord_line_status');
      if (d) lineStatus = JSON.parse(d);
    } catch(e) {}
    for (let i = 1; i <= 6; i++) {
      if (!lineStatus[i]) lineStatus[i] = { state: 'off', since: null, reason: '', stopHistory: [] };
    }
  }

  function formatTime(ts) {
    if (!ts) return '--:--';
    return new Date(ts).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDuration(fromTs, toTs) {
    if (!fromTs) return '';
    const diff = ((toTs || Date.now()) - fromTs) / 1000;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h > 0 ? `${h}س ${m}د` : `${m} دقيقة`;
  }

  function formatRemaining(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return h > 0 ? `${h}س ${m}د` : `${m} دقيقة`;
  }

  function renderDashboard() {
    const grid = document.getElementById('lines-grid');
    if (!grid) return;
    grid.innerHTML = '';
    LINES.forEach(line => {
      const ls = lineStatus[line.id] || { state: 'off' };
      const isRunning = ls.state === 'running';
      const isStopped = ls.state === 'stopped';
      const isOff = ls.state === 'off';

      const data = isOff ? null : lineData[line.id];
      const now = Date.now();
      const elapsed = data ? (now - data.timestamp) : null;
      const intervalMs = getIntervalMs(data);
      const expired = elapsed === null || elapsed > intervalMs;
      const timeLeft = data ? Math.max(0, intervalMs - elapsed) : 0;
      const timerPct = data ? Math.max(0, (timeLeft / intervalMs) * 100) : 0;
      const mins = Math.floor(timeLeft / 60000);
      const secs = Math.floor((timeLeft % 60000) / 1000);

      const activeProduct = data ? PRODUCTS[data.productKey] : null;
      const specs = activeProduct ? activeProduct.specs : null;

      let hasAlert = false;
      let paramsHtml = '';

      if (!data || expired) {
        paramsHtml = `<div class="no-data-msg">لا توجد قراءات${expired && data ? '<br><small>انتهت صلاحية القراءة</small>' : ''}</div>`;
      } else if (specs) {
        specs.forEach(spec => {
          const val = data.values[spec.key];
          const inRange = val !== undefined && val !== '' && parseFloat(val) >= spec.min && parseFloat(val) <= spec.max;
          const outRange = val !== undefined && val !== '' && !inRange;
          if (outRange) hasAlert = true;
          const cls = val === undefined || val === '' ? 'empty' : (inRange ? 'ok' : 'bad');
          paramsHtml += `
            <div class="param-item ${outRange ? 'out-of-range' : (val !== undefined && val !== '' ? 'in-range' : '')}">
              <div class="param-name">${spec.label}</div>
              <div class="param-value ${cls}">${val !== undefined && val !== '' ? val + ' ' + spec.unit : '---'}</div>
              <div class="param-range">${spec.min}–${spec.max} ${spec.unit}</div>
            </div>`;
        });
      } else {
        paramsHtml = `<div class="no-data-msg" style="color:var(--muted);font-size:12px">المواصفات غير محددة</div>`;
      }

      const productName = activeProduct ? activeProduct.name : (line.products.length ? line.products.map(k => PRODUCTS[k]?.name || k).join(' / ') : 'خط ' + line.id);
      const workerName = data && !expired ? (data.worker || '') : '';
      const region = data && !expired ? (data.region || '') : '';
      const regionBadge = region === 'شمال' ? `<span style="background:rgba(0,212,255,0.15);color:var(--accent);padding:2px 9px;border-radius:8px;font-size:10px;font-weight:700;margin-right:6px">⬆️ شمال</span>` : region === 'جنوب' ? `<span style="background:rgba(255,215,64,0.15);color:var(--yellow);padding:2px 9px;border-radius:8px;font-size:10px;font-weight:700;margin-right:6px">⬇️ جنوب</span>` : '';

      const statusHtml = isOff ? `<span class="line-status status-off">⚫ مطفي</span>` : isStopped ? `<span class="line-status status-stopped">🔴 متوقف</span>` : (!data || expired) ? `<span class="line-status status-empty">لا يوجد</span>` : hasAlert ? `<span class="line-status status-alert">⚠️ تنبيه</span>` : `<span class="line-status status-ok">✓ طبيعي</span>`;

      const cardClass = isOff ? 'off' : isStopped ? 'stopped' : (!data||expired ? '' : hasAlert ? 'has-alert' : 'fresh');

      const remainingText = data ? formatRemaining(timeLeft) : '';
      const statusBarHtml = isRunning
        ? `<div class="line-status-bar running">🟢 يشتغل من ${formatTime(ls.since)} — المتبقي ${remainingText}</div>`
        : isStopped
          ? `<div class="line-status-bar stopped">🔴 متوقف — ${ls.reason} — منذ ${formatTime(ls.since)}</div>`
          : `<div class="line-status-bar off">⚫ الخط مطفي</div>`;

      const card = document.createElement('div');
      card.className = `line-card ${cardClass}`;
      card.innerHTML = `
        <div class="line-card-header">
          <div>
            <div class="line-num">LINE ${line.id}</div>
            <div class="line-product">${productName} ${regionBadge}${workerName ? `<span style="color:var(--muted);font-size:11px;font-weight:400;margin-right:6px"> — 👷 ${workerName}</span>` : ''}</div>
          </div>
          ${statusHtml}
        </div>
        ${statusBarHtml}
        <div class="line-timer" id="timer-bar-${line.id}">
          <span style="font-size:11px">تحديث</span>
          <div class="timer-bar-wrap">
            <div class="timer-bar" style="width:${isStopped||isOff ? 0 : timerPct}%"></div>
          </div>
          <span class="timer-text">${data && !expired && isRunning ? `${mins}:${String(secs).padStart(2,'0')}` : '--:--'}</span>
        </div>
        <div class="line-params">${paramsHtml}</div>`;
      grid.appendChild(card);
    });
  }

  function updateTimers() {
    LINES.forEach(line => {
      const timerEl = document.getElementById(`timer-bar-${line.id}`);
      if (!timerEl) return;
      const data = lineData[line.id];
      const ls = lineStatus[line.id] || { state: 'off' };
      const isRunning = ls.state === 'running';
      const isStopped = ls.state === 'stopped';
      const isOff = ls.state === 'off';
      const now = Date.now();
      const elapsed = data ? (now - data.timestamp) : null;
      const intervalMs = getIntervalMs(data);
      const expired = elapsed === null || elapsed > intervalMs;
      const timeLeft = data ? Math.max(0, intervalMs - elapsed) : 0;
      const timerPct = data ? Math.max(0, (timeLeft / intervalMs) * 100) : 0;
      const mins = Math.floor(timeLeft / 60000);
      const secs = Math.floor((timeLeft % 60000) / 1000);
      const barEl = timerEl.querySelector('.timer-bar');
      const textEl = timerEl.querySelector('.timer-text');
      if (barEl) barEl.style.width = (isStopped||isOff ? 0 : timerPct) + '%';
      if (textEl) textEl.textContent = data && !expired && isRunning ? `${mins}:${String(secs).padStart(2,'0')}` : '--:--';
      if (data && !expired && elapsed > intervalMs) renderDashboard();
    });
  }

  function updateClock() {
    const now = new Date();
    const el = document.getElementById('current-time');
    if (el) el.textContent = now.toLocaleTimeString('ar-YE');
    const dateEl = document.getElementById('today-date');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ===== INIT =====
  loadConfig();
  loadData();
  loadStatus();
  renderDashboard();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateTimers, 1000);
  setInterval(() => { loadData(); loadStatus(); renderDashboard(); }, 5000);

  // الاستماع للتحديثات من الصفحات الأخرى
  window.addEventListener('storage', (e) => {
    if (e.key === 'lord_qc_data' || e.key === 'lord_line_status' || e.key === 'lord_products' || e.key === 'lord_lines') {
      loadData();
      loadStatus();
      renderDashboard();
    }
  });
