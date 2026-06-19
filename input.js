  const DEFAULT_INTERVAL_MINUTES = 10;
  const DEFAULT_INTERVAL_MS = DEFAULT_INTERVAL_MINUTES * 60 * 1000;
  
  let PRODUCTS = {};
  let LINES = [];
  let lineData = {};
  let lineStatus = {};
  let selectedLine = null;
  let selectedProduct = null;
  let selectedRegion = null;
  let users = [];
  let currentUser = null;
  let stopModalLineId = null;

  function hashPassword(password) {
    let hash = 0;
    if (!password) return '';
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function normalizeUsers(list) {
    return Array.isArray(list) ? list.map(user => ({
      name: user.name || user.username || '',
      passwordHash: user.passwordHash || (user.password ? hashPassword(user.password) : '')
    })) : [];
  }

  function getIntervalMs(data) {
    return data && data.intervalMs != null ? data.intervalMs : DEFAULT_INTERVAL_MS;
  }

  let selectedReason = '';
  let finishLineId = null;
  const waitTimers = {};

  // ===== المواصفات الكاملة =====
  function buildDefaultProducts() {
    return {
      'lord_sticks_cheese': { name: 'أصابع لورد — جبنة', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.2, max:1.8 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_flavor', label:'رطوبة بعد نكهة', unit:'%', min:0.5, max:1.0 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'كغ/م³', min:450, max:550 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'كغ/م³', min:380, max:450 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:12, max:16 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1.8, max:2.2 }
      ]},
      'lord_sticks_orange': { name: 'أصابع لورد — برتقالي', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.2, max:1.8 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_flavor', label:'رطوبة المواد مع نكهة', unit:'%', min:0.5, max:1.0 },
        { key:'density_pre', label:'كثافة قبل القلاية', unit:'كغ/م³', min:450, max:550 },
        { key:'density_post', label:'كثافة بعد القلاية', unit:'كغ/م³', min:380, max:450 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:12, max:16 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1.8, max:2.2 }
      ]},
      'lord_sticks_lime': { name: 'أصابع لورد — ليمون حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.2, max:1.8 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_flavor', label:'رطوبة بعد نكهة', unit:'%', min:0.5, max:1.0 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'كغ/م³', min:450, max:550 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'كغ/م³', min:380, max:450 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:12, max:16 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1.8, max:2.2 }
      ]},
      'lord_sticks_pepper': { name: 'أصابع لورد — فلفل حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.2, max:1.8 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_flavor', label:'رطوبة بعد نكهة', unit:'%', min:0.5, max:1.0 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'كغ/م³', min:450, max:550 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'كغ/م³', min:380, max:450 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:12, max:16 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1.8, max:2.2 }
      ]},
      'spicy_lord_lime': { name: 'سبايسي لورد — ليمون حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:6, max:8 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.6, max:1.0 },
        { key:'moisture_flavor', label:'رطوبة المواد مع نكهة', unit:'%', min:0.4, max:0.8 },
        { key:'moisture_pack', label:'رطوبة التغليف', unit:'%', min:0.3, max:0.6 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'كغ/م³', min:420, max:520 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'كغ/م³', min:350, max:420 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:14, max:18 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:2.0, max:2.5 }
      ]},
      'spicy_lord_cheese': { name: 'سبايسي لورد — جبنة', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.6, max:1.0 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'%', min:0.4, max:0.8 },
        { key:'moisture_pack', label:'رطوبة تغليف', unit:'%', min:0.3, max:0.6 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'كغ/م³', min:420, max:520 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'كغ/م³', min:350, max:420 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:14, max:18 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:2.0, max:2.5 }
      ]},
      'spicy_lord_chili': { name: 'سبايسي لورد — بسياس حار', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:0.8, max:1.2 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.6, max:1.0 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'%', min:0.4, max:0.8 },
        { key:'moisture_pack', label:'رطوبة تغليف', unit:'%', min:0.3, max:0.6 },
        { key:'density_pre', label:'الكثافة قبل القلاية', unit:'كغ/م³', min:420, max:520 },
        { key:'density_post', label:'الكثافة بعد القلاية', unit:'كغ/م³', min:350, max:420 },
        { key:'oil_absorb', label:'نسبة تشرب الزيت', unit:'%', min:14, max:18 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:2.0, max:2.5 }
      ]},
      'tasali_lord': { name: 'تسالي لورد', specs: [
        { key:'moisture_pallet', label:'رطوبة الباليت', unit:'%', min:1.0, max:1.5 },
        { key:'moisture_post', label:'رطوبة بعد القلاية', unit:'%', min:0.7, max:1.1 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'%', min:0.4, max:0.8 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:1.5, max:2.0 },
        { key:'density_plain', label:'الكثافة (بدون نكهة)', unit:'كغ/م³', min:400, max:500 },
        { key:'density_flavor', label:'كثافة المواد مع نكهة', unit:'كغ/م³', min:380, max:480 }
      ]},
      'alzaeem_popcorn': { name: 'فشار الزعيم', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:10, max:12 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة بعد الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'density', label:'الكثافة', unit:'كغ/م³', min:120, max:160 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:2 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:2, max:3 },
        { key:'moisture_pack', label:'رطوبة بعد تغليف', unit:'%', min:1, max:1.8 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:0.8, max:1.5 }
      ]},
      'lord_popcorn': { name: 'فشار لورد', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:10, max:12 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة بعد الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'density', label:'الكثافة', unit:'كغ/م³', min:120, max:160 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:2, max:3 },
        { key:'moisture_pack', label:'رطوبة التغليف', unit:'%', min:1, max:1.8 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:0.8, max:1.5 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:2 }
      ]},
      'mino': { name: 'بفك مينو', specs: [
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'density', label:'الكثافة', unit:'كغ/م³', min:250, max:350 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:2 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:2, max:3 },
        { key:'moisture_pack', label:'رطوبة بعد تغليف', unit:'%', min:1, max:1.8 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:0.8, max:1.5 }
      ]},
      'mino_alzaeem': { name: 'بفك مينو الزعيم', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:10, max:12 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة بعد الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'density', label:'الكثافة', unit:'كغ/م³', min:250, max:350 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:2 },
        { key:'flavor_pct', label:'نسبة نكهة', unit:'%', min:2, max:3 },
        { key:'moisture_pack', label:'رطوبة بعد تغليف', unit:'%', min:1, max:1.8 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:0.8, max:1.5 }
      ]},
      'mini_habibat': { name: 'ميني حبيبات الزعيم', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:10, max:12 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'density', label:'الكثافة', unit:'كغ/م³', min:300, max:400 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:2, max:3 },
        { key:'moisture_pack', label:'رطوبة التغليف', unit:'%', min:1, max:1.8 },
        { key:'moisture_rotary', label:'رطوبة بعد الدوار', unit:'%', min:0.8, max:1.5 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 },
        { key:'moisture_flavor', label:'رطوبة نكهة', unit:'%', min:1, max:2 }
      ]},
      'alzaeem_bufak': { name: 'بفك الزعيم', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:10, max:12 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'moisture_rotary', label:'رطوبة بعد دوار', unit:'%', min:0.8, max:1.5 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 },
        { key:'moisture_flavor', label:'رطوبة النكهة', unit:'%', min:1, max:2 },
        { key:'density_scour', label:'كثافة الاسكوور', unit:'كغ/م³', min:400, max:500 },
        { key:'density_oven', label:'كثافة الفرن', unit:'كغ/م³', min:250, max:350 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:2, max:3 }
      ]},
      'lord_bufak': { name: 'بفك اللورد', specs: [
        { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:10, max:12 },
        { key:'moisture_scour', label:'رطوبة الاسكوور', unit:'%', min:8, max:10 },
        { key:'moisture_oven', label:'رطوبة الفرن', unit:'%', min:1.5, max:2.5 },
        { key:'moisture_flavor', label:'رطوبة المواد بعد النكهة', unit:'%', min:1, max:2 },
        { key:'density_scour', label:'كثافة الاسكوور', unit:'كغ/م³', min:400, max:500 },
        { key:'density_oven', label:'كثافة الفرن', unit:'كغ/م³', min:250, max:350 },
        { key:'flavor_pct', label:'نسبة النكهة', unit:'%', min:2, max:3 },
        { key:'moisture_pack', label:'رطوبة التغليف', unit:'%', min:1, max:1.8 },
        { key:'moisture_grits', label:'رطوبة الجريش', unit:'%', min:9, max:11 }
      ]}
    };
  }

  // تحميل البيانات
  function loadConfig() {
    try {
      const sp = localStorage.getItem('lord_products');
      const sl = localStorage.getItem('lord_lines');
      if (sp) PRODUCTS = JSON.parse(sp);
      if (sl) LINES = JSON.parse(sl);
    } catch(e) {}
    if (!Object.keys(PRODUCTS).length) PRODUCTS = buildDefaultProducts();
    if (!LINES.length) {
      LINES = [
        { id: 1, products: ['lord_sticks_cheese','lord_sticks_orange','lord_sticks_lime','lord_sticks_pepper','spicy_lord_lime','spicy_lord_cheese','spicy_lord_chili'] },
        { id: 2, products: ['alzaeem_popcorn','lord_popcorn','mino','mino_alzaeem'] },
        { id: 3, products: ['mini_habibat','alzaeem_bufak','lord_bufak'] },
        { id: 4, products: ['alzaeem_popcorn','lord_popcorn','mino','mino_alzaeem','mini_habibat','alzaeem_bufak','lord_bufak'] },
        { id: 5, products: ['tasali_lord'] },
        { id: 6, products: [] }
      ];
    }
  }

  function loadData() { try { const d = localStorage.getItem('lord_qc_data'); if (d) Object.assign(lineData, JSON.parse(d)); } catch(e) {} }
  function saveData() { localStorage.setItem('lord_qc_data', JSON.stringify(lineData)); }
  
  function loadStatus() {
    try { const d = localStorage.getItem('lord_line_status'); if (d) lineStatus = JSON.parse(d); } catch(e) {}
    for (let i = 1; i <= 6; i++) { if (!lineStatus[i]) lineStatus[i] = { state: 'off', since: null, reason: '', stopHistory: [] }; }
  }
  function saveStatus() { localStorage.setItem('lord_line_status', JSON.stringify(lineStatus)); }
  
  function loadUsers() {
    // Load users from backend API; fallback to localStorage
    fetch('/api/users').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        users = data.map(u => ({ id: u.id, name: u.name, passwordHash: u.pass || '', auth: u.auth || 0 }));
        return;
      }
      throw new Error('invalid users');
    }).catch(() => {
      try {
        const d = localStorage.getItem('lord_users');
        if (d) {
          const parsed = JSON.parse(d);
          users = normalizeUsers(parsed);
        }
      } catch(e) { users = []; }
      if (!users.length) {
        users = normalizeUsers([
          { name: 'mm', password: '1234' },
          { name: 'gg', password: '123' }
        ]);
        saveUsers();
      }
    });
  }

  function saveUsers() {
    localStorage.setItem('lord_users', JSON.stringify(users));
  }

  function showToast(msg) { const toast = document.getElementById('toast'); toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
  function getWorkerName() { return currentUser ? currentUser.name : 'مراقب جودة'; }

  // ===== حفظ التقرير في الأرشيف (للمدير) =====
  function saveToArchive(reportData) {
    try {
      let archives = JSON.parse(localStorage.getItem('lord_archives') || '[]');
      archives.unshift(reportData); // إضافة التقرير في البداية
      // الاحتفاظ فقط بآخر 100 تقرير
      if (archives.length > 100) archives = archives.slice(0, 100);
      localStorage.setItem('lord_archives', JSON.stringify(archives));
      window.dispatchEvent(new StorageEvent('storage', { key: 'lord_archives' }));
    } catch(e) {}

    fetch('/api/archives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    }).catch(() => {
      // offline fallback: keep local copy only
    });
  }

  // ===== وظائف تسجيل الدخول =====
  function checkLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');
    
    if (!username || !password) { errorEl.textContent = '❌ يرجى إدخال اسم المستخدم وكلمة السر'; return; }
    // Send credentials to server for verification
    fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: username, pass: password }) })
      .then(r => r.json().then(j => ({ ok: r.ok, body: j })))
      .then(res => {
        if (res.ok && res.body && res.body.ok) {
          currentUser = { id: res.body.id, name: res.body.name, auth: res.body.auth };
          localStorage.setItem('lord_current_user', JSON.stringify({ id: currentUser.id, name: currentUser.name, auth: currentUser.auth }));
          showInputContent();
        } else {
          errorEl.textContent = '❌ اسم المستخدم أو كلمة السر غير صحيحة';
          document.getElementById('login-username').classList.add('error');
          document.getElementById('login-password').classList.add('error');
          setTimeout(() => {
            document.getElementById('login-username').classList.remove('error');
            document.getElementById('login-password').classList.remove('error');
          }, 400);
        }
      }).catch(() => {
        errorEl.textContent = '⚠️ خطأ في الاتصال بالخادم';
      });
  }

  function showInputContent() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('input-content').style.display = 'block';
    document.getElementById('logged-user-name').textContent = currentUser.name;
    loadConfig(); loadData(); loadStatus(); buildLineSelector();
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem('lord_current_user');
    selectedLine = null; selectedProduct = null; selectedRegion = null;
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('input-content').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
    Object.keys(waitTimers).forEach(id => { clearInterval(waitTimers[id]); delete waitTimers[id]; });
  }

  function checkExistingSession() {
    try {
      const savedUser = localStorage.getItem('lord_current_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        const userExists = users.find(u => u.name === userData.name);
        if (userExists) { currentUser = userExists; showInputContent(); return true; }
      }
    } catch(e) {}
    return false;
  }

  // ===== واجهة إدخال البيانات =====
  function buildLineSelector() {
    const grid = document.getElementById('line-select-grid');
    if (!grid) return;
    grid.innerHTML = '';
    LINES.forEach(line => {
      const productNames = line.products.length > 0 ? line.products.map(k => PRODUCTS[k]?.name || k).join(' / ') : 'لا يوجد';
      const btn = document.createElement('button');
      btn.className = 'line-select-btn' + (selectedLine === line.id ? ' selected' : '');
      btn.innerHTML = `<div class="ln">${line.id}</div><div class="lp">${productNames}</div>`;
      btn.onclick = () => selectLine(line.id);
      grid.appendChild(btn);
    });
  }

  function selectLine(id) {
    selectedLine = id;
    selectedProduct = null;
    selectedRegion = null;
    buildLineSelector();
    buildStatusActions(id);
    buildProductSelector(id);
  }

  function buildStatusActions(lineId) {
    const area = document.getElementById('status-actions-area');
    if (!area) return;
    const s = lineStatus[lineId] || { state: 'off' };
    const isOff = s.state === 'off', isRunning = s.state === 'running', isStopped = s.state === 'stopped';
    let statusInfo = isRunning ? `🟢 يشتغل` : isStopped ? `🔴 متوقف — ${s.reason}` : `⚫ مطفي`;
    area.innerHTML = `<div class="form-card"><h3>⚙️ حالة الخط ${lineId}</h3><div style="margin-bottom:14px;padding:10px;background:var(--bg);border-radius:8px;">${statusInfo}</div><div class="status-actions"><button class="action-btn start ${isRunning ? 'active-state' : ''}" onclick="if(!this.classList.contains('active-state')) startLine(${lineId})">🟢<br>بدء التشغيل</button><button class="action-btn stop ${isStopped ? 'active-state' : ''}" onclick="if(!this.classList.contains('active-state')) openStopModal(${lineId})">🔴<br>إيقاف الخط</button><button class="action-btn finish ${isOff ? 'active-state' : ''}" onclick="if(!this.classList.contains('active-state')) finishLine(${lineId})">⚫<br>إطفاء الخط</button></div></div>`;
  }

  function startLine(lineId) {
    const s = lineStatus[lineId];
    const wasStopped = s.state === 'stopped';
    s.state = 'running';
    s.since = Date.now();
    s.reason = '';

    const data = lineData[lineId];
    if (wasStopped) {
      const lastStop = s.stopHistory && s.stopHistory.length ? s.stopHistory[s.stopHistory.length - 1] : null;
      if (lastStop && !lastStop.resumedAt) lastStop.resumedAt = Date.now();
    }
    if (wasStopped && data && data.pauseRemainingMs != null) {
      const intervalMs = getIntervalMs(data);
      data.timestamp = Date.now() - (intervalMs - data.pauseRemainingMs);
      delete data.pauseRemainingMs;
      saveData();
    }

    saveStatus();
    buildStatusActions(lineId);
    if (selectedLine === lineId) buildForm(lineId);
    showToast(`🟢 بدء تشغيل الخط ${lineId}`);
  }
  function openStopModal(lineId) { stopModalLineId = lineId; selectedReason = ''; document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('selected')); document.getElementById('modal-other-text').style.display = 'none'; document.getElementById('stop-modal').style.display = 'flex'; }
  function closeStopModal() { document.getElementById('stop-modal').style.display = 'none'; }
  function selectReason(btn, reason) { document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); selectedReason = reason; document.getElementById('modal-other-text').style.display = reason === 'أخرى' ? 'block' : 'none'; }
  function confirmStop() {
    if (!selectedReason) { showToast('⚠️ اختر سبب التوقف'); return; }
    const reason = selectedReason === 'أخرى' ? document.getElementById('modal-other-text').value.trim() || 'أخرى' : selectedReason;
    const s = lineStatus[stopModalLineId];
    if (!s.stopHistory) s.stopHistory = [];
    s.stopHistory.push({ reason, stoppedAt: Date.now(), resumedAt: null });
    s.state = 'stopped';
    s.since = Date.now();
    s.reason = reason;

    const data = lineData[stopModalLineId];
    if (data) {
      const elapsed = Date.now() - data.timestamp;
      const intervalMs = getIntervalMs(data);
      const remaining = Math.max(0, intervalMs - elapsed);
      if (remaining > 0) {
        data.pauseRemainingMs = remaining;
      } else {
        delete data.pauseRemainingMs;
      }
      saveData();
    }

    if (waitTimers[stopModalLineId]) {
      clearInterval(waitTimers[stopModalLineId]);
      delete waitTimers[stopModalLineId];
    }
    saveStatus();
    closeStopModal();
    buildStatusActions(stopModalLineId);
    if (selectedLine === stopModalLineId) {
      const area = document.getElementById('form-area');
      if (area) area.innerHTML = `<div class="form-card"><div class="no-line-msg">الخط متوقف — أعد التشغيل أولاً لاستمرار الإدخال</div></div>`;
    }
    showToast(`🔴 توقف الخط ${stopModalLineId}`);
  }

  function buildProductSelector(lineId) {
    const line = LINES.find(l => l.id === lineId);
    const area = document.getElementById('form-area');
    if (!line.products || !line.products.length) { area.innerHTML = `<div class="form-card"><div class="no-data-msg">لا توجد منتجات لهذا الخط</div></div>`; return; }
    if (line.products.length === 1) { selectedProduct = line.products[0]; buildRegionSelector(lineId); return; }
    area.innerHTML = `<div class="form-card"><h3>🏭 اختر الصنف</h3><div class="line-select-grid">` + line.products.map(key => `<button class="line-select-btn" onclick="chooseProduct('${key}', ${lineId})"><div class="ln" style="font-size:15px">${PRODUCTS[key]?.name || key}</div></button>`).join('') + `</div></div>`;
  }
  function chooseProduct(key, lineId) { selectedProduct = key; selectedRegion = null; buildRegionSelector(lineId); }
  function buildRegionSelector(lineId) {
    const product = PRODUCTS[selectedProduct];
    const area = document.getElementById('form-area');
    area.innerHTML = `<div class="form-card"><h3>🧭 وجهة الصنف — ${product.name}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><button class="line-select-btn" onclick="chooseRegion('شمال', ${lineId})"><div class="ln">⬆️</div><div>شمال</div></button><button class="line-select-btn" onclick="chooseRegion('جنوب', ${lineId})"><div class="ln">⬇️</div><div>جنوب</div></button></div></div>`;
  }
  function chooseRegion(region, lineId) { selectedRegion = region; buildForm(lineId); }

  function buildForm(lineId) {
    const area = document.getElementById('form-area');
    const data = lineData[lineId];
    const now = Date.now();
    const elapsed = data ? (now - data.timestamp) : null;
    const intervalMs = getIntervalMs(data);
    const expired = !elapsed || elapsed > intervalMs;
    const status = lineStatus[lineId] || { state: 'off' };

    if (status.state === 'stopped') {
      if (area) area.innerHTML = `<div class="form-card"><div class="no-line-msg">الخط متوقف — أعد التشغيل أولاً لاستمرار الإدخال</div></div>`;
      return;
    }

    if (data && !expired) {
      if (!selectedProduct) selectedProduct = data.productKey;
      if (!selectedRegion) selectedRegion = data.region;
      const product = PRODUCTS[data.productKey];
      showWaitingTimer(lineId, Math.max(0, intervalMs - elapsed), product ? product.name : '');
      return;
    }

    const product = PRODUCTS[selectedProduct];
    if (!product) {
      area.innerHTML = `<div class="form-card"><div class="no-line-msg">اختر الصنف أولاً</div></div>`;
      return;
    }
    let fieldsHtml = '';
    product.specs.forEach(spec => {
      fieldsHtml += `<div class="form-group"><label>${spec.label} <span class="range-hint">(${spec.min}-${spec.max} ${spec.unit})</span></label><input type="number" step="0.01" id="inp_${spec.key}" data-min="${spec.min}" data-max="${spec.max}" oninput="validateInput(this)"></div>`;
    });
    area.innerHTML = `<div class="form-card"><h3>📋 قراءات ${product.name}</h3><div class="form-grid">${fieldsHtml}</div><button class="submit-btn" onclick="submitForm(${lineId})">إرسال ✓</button></div>`;
  }

  function validateInput(el) { const val = parseFloat(el.value); const min = parseFloat(el.dataset.min), max = parseFloat(el.dataset.max); if (el.value === '') { el.className = ''; return; } el.classList.remove('valid','invalid'); el.classList.add(val >= min && val <= max ? 'valid' : 'invalid'); }

  function showWaitingTimer(lineId, timeLeftMs, productName) {
    const area = document.getElementById('form-area');
    function render(ms) { const mins = Math.floor(ms/60000), secs = Math.floor((ms%60000)/1000); area.innerHTML = `<div class="form-card" style="text-align:center"><h3>✅ تم الإرسال</h3><div style="font-size:52px;font-family:mono">${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}</div><div>القراءة القادمة بعد</div></div>`; }
    if (waitTimers[lineId]) clearInterval(waitTimers[lineId]);
    let remaining = timeLeftMs; render(remaining);
    waitTimers[lineId] = setInterval(() => { remaining -= 1000; if (selectedLine !== lineId) { clearInterval(waitTimers[lineId]); delete waitTimers[lineId]; return; } if (remaining <= 0) { clearInterval(waitTimers[lineId]); delete waitTimers[lineId]; buildForm(lineId); } else render(remaining); }, 1000);
  }

  function submitForm(lineId) {
    const product = PRODUCTS[selectedProduct];
    const values = {};
    let allFilled = true;
    product.specs.forEach(spec => { const el = document.getElementById('inp_' + spec.key); if (!el || el.value === '') allFilled = false; else values[spec.key] = parseFloat(el.value); });
    if (!allFilled) { alert('تعبئة جميع الحقول مطلوبة'); return; }
    // Enforce fixed interval: always use DEFAULT_INTERVAL_MINUTES
    const intervalMinutes = DEFAULT_INTERVAL_MINUTES;
    const intervalMs = DEFAULT_INTERVAL_MS;

    lineData[lineId] = { productKey: selectedProduct, region: selectedRegion, values, timestamp: Date.now(), worker: getWorkerName(), intervalMs, intervalMinutes };
    saveData(); showToast('✅ تم الإرسال'); showWaitingTimer(lineId, intervalMs, product.name);
  }

  function finishLine(lineId) { if (lineStatus[lineId].state === 'off') return; finishLineId = lineId; document.getElementById('notes-line-num').textContent = lineId; document.getElementById('notes-textarea').value = ''; document.getElementById('notes-modal').style.display = 'flex'; }
  
  function confirmFinish(withNotes) {
    const lineId = finishLineId;
    const notes = withNotes ? document.getElementById('notes-textarea').value.trim() : '';
    document.getElementById('notes-modal').style.display = 'none';
    
    const s = lineStatus[lineId];
    const data = lineData[lineId];
    const product = data ? PRODUCTS[data.productKey] : null;
    const now = new Date();
    
    if (s.stopHistory && s.stopHistory.length) {
      const last = s.stopHistory[s.stopHistory.length - 1];
      if (!last.resumedAt) last.resumedAt = Date.now();
    }
    
    // بناء التقرير الكامل
    let reportText = '';
    reportText += `${'='.repeat(60)}\n`;
    reportText += `  📋 تقرير إطفاء خط الإنتاج رقم ${lineId}\n`;
    reportText += `${'='.repeat(60)}\n\n`;
    reportText += `📅 التاريخ والوقت : ${now.toLocaleString('ar-EG')}\n`;
    reportText += `👷 المراقب المسؤول : ${getWorkerName()}\n`;
    reportText += `🏷️ المنتج : ${product?.name || '—'}\n`;
    reportText += `📍 الوجهة : ${data?.region || '—'}\n`;
    reportText += `⏱️ بداية التشغيل : ${s.since ? new Date(s.since).toLocaleString('ar-EG') : '—'}\n`;
    reportText += `⏱️ نهاية التشغيل : ${now.toLocaleString('ar-EG')}\n\n`;
    
    reportText += `${'─'.repeat(60)}\n`;
    reportText += `📊 القراءات الأخيرة:\n`;
    reportText += `${'─'.repeat(60)}\n`;
    if (data && product) {
      product.specs.forEach(spec => {
        const val = data.values[spec.key];
        const inRange = val >= spec.min && val <= spec.max;
        const status = inRange ? '✓' : '⚠️';
        reportText += `${status} ${spec.label.padEnd(25)} : ${String(val).padStart(8)} ${spec.unit}  (المدى: ${spec.min}–${spec.max})\n`;
      });
    } else {
      reportText += `لا توجد قراءات مسجلة\n`;
    }
    
    if (s.stopHistory && s.stopHistory.length) {
      reportText += `\n${'─'.repeat(60)}\n`;
      reportText += `⏸️ سجل التوقفات:\n`;
      reportText += `${'─'.repeat(60)}\n`;
      s.stopHistory.forEach((stop, i) => {
        reportText += `${i+1}. السبب: ${stop.reason}\n`;
        reportText += `   ⏰ توقف: ${new Date(stop.stoppedAt).toLocaleString('ar-EG')}\n`;
        reportText += `   🔄 استأنف: ${stop.resumedAt ? new Date(stop.resumedAt).toLocaleString('ar-EG') : 'لم يستأنف'}\n`;
      });
    }
    
    reportText += `\n${'─'.repeat(60)}\n`;
    reportText += `📝 ملاحظات المراقب:\n`;
    reportText += `${'─'.repeat(60)}\n`;
    reportText += `${notes || '— لا توجد ملاحظات —'}\n\n`;
    reportText += `${'='.repeat(60)}\n`;
    
    // حفظ في الأرشيف (سيظهر في صفحة الإعدادات)
    const archiveEntry = {
      id: Date.now(),
      lineId: lineId,
      date: now.toISOString(),
      dateFormatted: now.toLocaleString('ar-EG'),
      worker: getWorkerName(),
      productName: product?.name || '—',
      region: data?.region || '—',
      notes: notes || '—',
      fullReport: reportText
    };
    
    saveToArchive(archiveEntry);
    
    // تنظيف البيانات
    delete lineData[lineId];
    saveData();
    
    if (waitTimers[lineId]) { clearInterval(waitTimers[lineId]); delete waitTimers[lineId]; }
    
    s.state = 'off'; s.since = Date.now(); s.reason = ''; s.stopHistory = [];
    saveStatus();
    buildStatusActions(lineId);
    
    if (selectedLine === lineId) {
      selectedProduct = null; selectedRegion = null;
      const area = document.getElementById('form-area');
      if (area) area.innerHTML = `<div class="no-line-msg">الخط مطفي — اضغط "بدء التشغيل" عند تشغيله مجدداً</div>`;
    }
    
    showToast(`⚫ تم إطفاء الخط ${lineId} - تم إرسال التقرير للمدير`);
    finishLineId = null;
  }

  // التهيئة
  loadUsers();
  if (!checkExistingSession()) {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('input-content').style.display = 'none';
  }
  
  window.addEventListener('storage', (e) => { 
    if (e.key === 'lord_qc_data') loadData(); 
    if (e.key === 'lord_line_status') loadStatus(); 
    if (e.key === 'lord_products') loadConfig();
    if (e.key === 'lord_users') { loadUsers(); if (!currentUser) checkExistingSession(); }
  });
