// ===== كلمة السر الافتراضية =====
const ADMIN_PASSWORD = 'M123Akram';
window.CURRENT_PASSWORD = localStorage.getItem('lord_admin_pw') || ADMIN_PASSWORD;

// ===== المتغيرات العامة =====
let PRODUCTS = {};
let LINES = [];
let users = [];
let settingsUnlocked = false;
let newProductSelectedLines = [];
let newProductSpecs = [];

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

// ===== المواصفات الافتراضية للصنف الجديد =====
const DEFAULT_SPECS = [
  { key: 'moisture', label: 'الرطوبة', unit: '%', min: 1, max: 3 },
  { key: 'density', label: 'الكثافة', unit: 'كغ/م³', min: 400, max: 600 },
  { key: 'flavor', label: 'النكهة', unit: '%', min: 1.5, max: 2.5 }
];

// ===== بناء المنتجات الافتراضية =====
function buildDefaultProducts() {
  return {
    'lord_sticks_cheese': { name: 'أصابع لورد — جبنة', specs: [
      { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.2, max:1.8 },
      { key:'moisture_pre', label:'رطوبة قبل القلاية', unit:'%', min:1.0, max:1.5 }
    ]},
    'lord_sticks_orange': { name: 'أصابع لورد — برتقالي', specs: [
      { key:'moisture_mix', label:'رطوبة الخلطة', unit:'%', min:1.2, max:1.8 }
    ]},
    'tasali_lord': { name: 'تسالي لورد', specs: [
      { key:'moisture_pallet', label:'رطوبة الباليت', unit:'%', min:1.0, max:1.5 }
    ]}
  };
}

// ===== تحميل وحفظ البيانات =====
function loadConfig() {
  // Try load products/lines from backend products API; fallback to localStorage
  fetch('/api/products').then(r => r.json()).then(data => {
    if (Array.isArray(data) && data.length) {
      PRODUCTS = {};
      data.forEach(p => { PRODUCTS[p.key] = { name: p.name, specs: p.specs || [], lines: p.lines || [] }; });
      syncLinesFromProducts();
    } else if (!Object.keys(PRODUCTS).length) {
      PRODUCTS = buildDefaultProducts();
    }
  }).catch(() => {
    try {
      const sp = localStorage.getItem('lord_products');
      const sl = localStorage.getItem('lord_lines');
      if (sp) PRODUCTS = JSON.parse(sp);
      if (sl) LINES = JSON.parse(sl);
    } catch(e) {}
    if (!Object.keys(PRODUCTS).length) PRODUCTS = buildDefaultProducts();
  }).finally(() => {
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
    normalizeProductLines();
  });
}

function saveConfig() {
  // Save locally and attempt to sync products to backend
  try { localStorage.setItem('lord_products', JSON.stringify(PRODUCTS)); } catch(e) {}
  try { localStorage.setItem('lord_lines', JSON.stringify(LINES)); } catch(e) {}
  window.dispatchEvent(new StorageEvent('storage', { key: 'lord_products' }));
  window.dispatchEvent(new StorageEvent('storage', { key: 'lord_lines' }));

  normalizeProductLines();

  // Sync each product to server (upsert by key)
  Object.entries(PRODUCTS).forEach(([key, p]) => {
    fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: key, name: p.name, specs: p.specs || [], lines: p.lines || [] }) })
      .catch(() => {});
  });
}

// ===== إدارة المستخدمين =====
function loadUsers() {
  // Try loading users from backend API; fallback to localStorage
  fetch('/api/users').then(r => r.json()).then(data => {
    if (Array.isArray(data)) {
      users = data.map(u => ({ id: u.id, name: u.name, passwordHash: u.pass || '', auth: u.auth || 0 }));
      renderUsersList();
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
  // For now keep localStorage as a fallback copy
  try { localStorage.setItem('lord_users', JSON.stringify(users)); } catch(e) {}
  window.dispatchEvent(new StorageEvent('storage', { key: 'lord_users' }));
}

function renderUsersList() {
  const list = document.getElementById('users-list');
  if (!list) return;
  if (!users.length) {
    list.innerHTML = '<div class="empty-message">👈 لا يوجد مراقبون مضافون بعد</div>';
    return;
  }
  // Render every row from the DB table (hide password)
  list.innerHTML = users.map((u) => `
      <div class="user-row">
        <div class="user-info"><div class="user-name">${u.auth == 1 ? '👑' : '👷'} ${escapeHtml(u.name)} <span style="font-size:11px;color:var(--muted);margin-right:8px">(#${u.id})</span></div><div class="user-role">${u.auth == 1 ? 'مدير' : 'مراقب جودة'}</div></div>
        <div style="font-family:var(--mono);font-size:12px;color:var(--muted)">${u.pass ? 'hashed' : '—'}</div>
        <div style="display:flex;gap:8px">
          <button class="user-delete" onclick="deleteUser(${u.id})">🗑️ حذف</button>
          <button class="save-btn" style="padding:6px 10px;border-radius:6px;height:auto;margin-left:6px;background:transparent;border:1px solid var(--border);color:var(--muted);font-weight:600" onclick="toggleAuth(${u.id}, ${u.auth == 1 ? 0 : 1})">${u.auth == 1 ? 'نزّل من مدير' : 'ارفع إلى مدير'}</button>
        </div>
      </div>
    `).join('');
}

function toggleAuth(id, newAuth) {
  fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ auth: newAuth }) })
    .then(r => { if (!r.ok) throw r; return r.json(); })
    .then(() => { showToast('✅ تم تحديث الصلاحية'); loadUsers(); })
    .catch(() => showToast('⚠️ حدث خطأ أثناء تحديث الصلاحية'));
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function addUser() {
  const name = document.getElementById('new-user-name').value.trim();
  const pw = document.getElementById('new-user-pw').value.trim();
  if (!name) { showToast('⚠️ أدخل اسم المراقب'); return; }
  if (pw.length < 3) { showToast('⚠️ كلمة السر قصيرة — ٣ أحرف على الأقل'); return; }
  if (users.find(u => u.name === name)) { showToast('⚠️ هذا الاسم موجود مسبقاً'); return; }
  // Send to backend API
  const payload = { name: name, auth: 0, pass: hashPassword(pw) };
  fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(r => { if (!r.ok) throw r; return r.json(); })
    .then(() => {
      document.getElementById('new-user-name').value = '';
      document.getElementById('new-user-pw').value = '';
      showToast(`✅ تم إضافة المراقب: ${name}`);
      // reload from server
      loadUsers();
    }).catch(() => {
      showToast('⚠️ حدث خطأ أثناء إضافة المراقب');
    });
}

function deleteUser(id) {
  const u = users.find(x => x.id === id);
  const name = u ? u.name : id;
  if (confirm(`هل أنت متأكد من حذف المراقب "${name}"؟`)) {
    fetch(`/api/users/${id}`, { method: 'DELETE' }).then(r => r.json()).then(() => {
      showToast(`🗑️ تم حذف ${name}`);
      loadUsers();
    }).catch(() => showToast('⚠️ حدث خطأ أثناء الحذف'));
  }
}

// ===== عرض وتحرير المواصفات =====
function renderSpecsEditor() {
  const editor = document.getElementById('specs-editor');
  if (!editor) return;
  editor.innerHTML = '';
  Object.entries(PRODUCTS).forEach(([key, product]) => {
    if (!product.lines) product.lines = [];
    let specsHtml = '';
    product.specs.forEach((spec, idx) => {
      specsHtml += `<div class="spec-row"><div class="spec-label">${escapeHtml(spec.label)} <span class="spec-unit">${spec.unit ? '('+spec.unit+')' : ''}</span></div>
          <div class="spec-input-group"><label>الحد الأدنى</label><input type="number" step="0.01" id="min_${key}_${idx}" value="${spec.min}"></div>
          <div class="spec-input-group"><label>الحد الأقصى</label><input type="number" step="0.01" id="max_${key}_${idx}" value="${spec.max}"></div></div>`;
    });
    editor.innerHTML += `<div class="product-card"><h4>🏷️ ${escapeHtml(product.name)} <span style="font-size:11px;color:var(--muted);">(${key})</span></h4>
        ${renderProductLineButtons(key, product)}
        ${specsHtml}
      </div>`;
  });
}

function renderProductLineButtons(key, product) {
  const lines = Array.from({ length: 6 }, (_, i) => i + 1);
  return `<div class="line-assign-grid product-line-grid">${lines.map(lineId => `
      <button type="button" class="line-assign-btn ${product.lines && product.lines.includes(lineId) ? 'on' : ''}" onclick="toggleProductLine('${key}', ${lineId})">📦 خط ${lineId}</button>
    `).join('')}</div>`;
}

function normalizeProductLines() {
  // Preserve product-to-line membership from old LINES data if products have no explicit lines.
  Object.entries(PRODUCTS).forEach(([key, product]) => {
    if (!product.lines || !product.lines.length) {
      product.lines = [];
      LINES.forEach(line => {
        if (Array.isArray(line.products) && line.products.includes(key)) {
          product.lines.push(line.id);
        }
      });
    }
  });

  LINES = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, products: [] }));
  Object.entries(PRODUCTS).forEach(([key, product]) => {
    (product.lines || []).forEach(lineId => {
      const line = LINES.find(l => l.id === lineId);
      if (line && !line.products.includes(key)) line.products.push(key);
    });
  });
}

function saveSpecs() {
  Object.entries(PRODUCTS).forEach(([key, product]) => {
    product.specs.forEach((spec, idx) => {
      const minEl = document.getElementById(`min_${key}_${idx}`);
      const maxEl = document.getElementById(`max_${key}_${idx}`);
      if (minEl && maxEl) { spec.min = parseFloat(minEl.value); spec.max = parseFloat(maxEl.value); }
    });
  });
  saveConfig();
  showToast('💾 تم حفظ المواصفات بنجاح!');
  renderSpecsEditor();
}

// ===== إدارة الأرشيف =====
async function loadArchives() {
  try {
    const res = await fetch('/api/archives');
    if (res.ok) {
      const archives = await res.json();
      return Array.isArray(archives) ? archives : [];
    }
  } catch (e) {}
  try { return JSON.parse(localStorage.getItem('lord_archives') || '[]'); } catch(e) { return []; }
}

function saveArchives(archives) {
  localStorage.setItem('lord_archives', JSON.stringify(archives));
  window.dispatchEvent(new StorageEvent('storage', { key: 'lord_archives' }));
  renderArchiveList();
}

async function renderArchiveList() {
  const container = document.getElementById('archive-list');
  const statsEl = document.getElementById('archive-stats');
  if (!container) return;
  const archives = await loadArchives();
  statsEl.textContent = `${archives.length} تقرير`;
  if (archives.length === 0) {
    container.innerHTML = '<div class="empty-archive">📭 لا توجد تقارير بعد. سيظهر هنا التقارير عند إطفاء خطوط الإنتاج.</div>';
    return;
  }
  container.innerHTML = archives.map(archive => `
      <div class="archive-item">
        <div class="archive-item-header">
          <div class="archive-title">📋 تقرير خط الإنتاج ${archive.lineId}</div>
          <div class="archive-date">${archive.dateFormatted}</div>
        </div>
        <div class="archive-details">
          <div class="archive-detail"><span class="archive-detail-label">👷 المراقب:</span> <span class="archive-detail-value">${escapeHtml(archive.worker)}</span></div>
          <div class="archive-detail"><span class="archive-detail-label">🏷️ المنتج:</span> <span class="archive-detail-value">${escapeHtml(archive.productName)}</span></div>
          <div class="archive-detail"><span class="archive-detail-label">📍 الوجهة:</span> <span class="archive-detail-value">${archive.region || '—'}</span></div>
        </div>
        ${archive.notes ? `<div class="archive-notes">📝 ${escapeHtml(archive.notes.substring(0, 100))}${archive.notes.length > 100 ? '...' : ''}</div>` : ''}
        <div class="archive-actions">
          <button class="view-report-btn" onclick="viewReport(${archive.id})">📄 عرض التقرير كاملاً</button>
          <button class="delete-report-btn" onclick="deleteReport(${archive.id})">🗑️ حذف</button>
        </div>
      </div>
    `).join('');
}

async function viewReport(id) {
  const archives = await loadArchives();
  const report = archives.find(a => a.id === id);
  if (report && report.fullReport) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>تقرير خط ${report.lineId}</title>
        <style>body { font-family: monospace; background: #0a0e1a; color: #e8f0fe; padding: 20px; direction: rtl; } pre { white-space: pre-wrap; }</style>
        </head>
        <body><pre>${report.fullReport}</pre></body>
        </html>
      `);
    win.document.close();
  } else {
    showToast('⚠️ لا يمكن عرض التقرير');
  }
}

function deleteReport(id) {
  if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
    fetch(`/api/archives/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('delete failed');
        return res.json();
      })
      .then(() => {
        showToast('🗑️ تم حذف التقرير');
        renderArchiveList();
      })
      .catch(() => {
        let archives = loadArchives();
        archives = archives.filter(a => a.id !== id);
        saveArchives(archives);
        showToast('🗑️ تم حذف التقرير');
      });
  }
}

function exportAllReports() {
  const archives = loadArchives();
  if (archives.length === 0) { showToast('⚠️ لا توجد تقارير لتصديرها'); return; }
  let allReports = '';
  archives.forEach(archive => {
    allReports += archive.fullReport + '\n\n' + '='.repeat(80) + '\n\n';
  });
  const blob = new Blob([allReports], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `all_reports_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 تم تصدير جميع التقارير');
}

function clearAllReports() {
  if (confirm('⚠️ تحذير: هل أنت متأكد من حذف جميع التقارير؟ لا يمكن التراجع عن هذا الإجراء.')) {
    fetch('/api/archives', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
      .then(res => {
        if (!res.ok) throw new Error('clear failed');
        return res.json();
      })
      .then(() => {
        showToast('🗑️ تم حذف جميع التقارير');
        renderArchiveList();
      })
      .catch(() => {
        saveArchives([]);
        showToast('🗑️ تم حذف جميع التقارير');
      });
  }
}

// ===== إضافة صنف جديد =====
function addNewSpecRow() {
  newProductSpecs.push({ key: `spec_${Date.now()}_${newProductSpecs.length}`, label: '', unit: '', min: 0, max: 0 });
  renderNewProductSpecsList();
}

function removeNewSpecRow(index) { newProductSpecs.splice(index, 1); renderNewProductSpecsList(); }
function updateNewSpecValue(index, field, value) { if (field === 'min' || field === 'max') { newProductSpecs[index][field] = parseFloat(value) || 0; } else { newProductSpecs[index][field] = value; } }

function renderNewProductSpecsList() {
  const container = document.getElementById('new-product-specs-list');
  if (!container) return;
  if (newProductSpecs.length === 0) { container.innerHTML = '<div class="empty-message">لا توجد مواصفات، أضف مواصفة جديدة</div>'; return; }
  container.innerHTML = newProductSpecs.map((spec, idx) => `
      <div class="spec-row-input">
        <input type="text" placeholder="اسم المواصفة" value="${escapeHtml(spec.label)}" onchange="updateNewSpecValue(${idx}, 'label', this.value)">
        <input type="text" placeholder="الوحدة" value="${escapeHtml(spec.unit)}" onchange="updateNewSpecValue(${idx}, 'unit', this.value)">
        <div style="display:flex;gap:6px;"><input type="number" step="0.01" placeholder="الحد الأدنى" value="${spec.min}" onchange="updateNewSpecValue(${idx}, 'min', this.value)" style="width:50%"><input type="number" step="0.01" placeholder="الحد الأقصى" value="${spec.max}" onchange="updateNewSpecValue(${idx}, 'max', this.value)" style="width:50%"></div>
        <button class="remove-spec-btn" onclick="removeNewSpecRow(${idx})">🗑️ حذف</button>
      </div>
    `).join('');
}

function renderNewProductLines() {
  const grid = document.getElementById('new-product-lines');
  if (!grid) return;
  grid.innerHTML = '';
  newProductSelectedLines = [];
  LINES.forEach(line => {
    const btn = document.createElement('button');
    btn.className = 'line-assign-btn';
    btn.textContent = `📦 خط ${line.id}`;
    btn.onclick = () => {
      btn.classList.toggle('on');
      const id = line.id;
      if (btn.classList.contains('on')) newProductSelectedLines.push(id);
      else newProductSelectedLines = newProductSelectedLines.filter(x => x !== id);
    };
    grid.appendChild(btn);
  });
}

function addNewProduct() {
  const name = document.getElementById('new-product-name').value.trim();
  let key = document.getElementById('new-product-key').value.trim().toLowerCase().replace(/\s+/g, '_');
  if (!name || !key) { alert('⚠️ أدخل اسم الصنف والكود'); return; }
  if (PRODUCTS[key]) { alert('⚠️ هذا الكود موجود مسبقاً'); return; }
  const validSpecs = newProductSpecs.filter(s => s.label.trim() !== '');
  if (validSpecs.length === 0) { alert('⚠️ يرجى إضافة مواصفة واحدة على الأقل'); return; }
  PRODUCTS[key] = {
    name: name,
    specs: validSpecs.map(s => ({ key: s.key, label: s.label, unit: s.unit || '', min: s.min || 0, max: s.max || 0 })),
    lines: newProductSelectedLines.slice()
  };
  newProductSelectedLines.forEach(lineId => { const line = LINES.find(l => l.id === lineId); if (line && !line.products.includes(key)) line.products.push(key); });
  saveConfig();
  showToast(`✅ تم إضافة "${name}" بنجاح!`);
  document.getElementById('new-product-name').value = '';
  document.getElementById('new-product-key').value = '';
  newProductSelectedLines = [];
  newProductSpecs = [{ key: `spec_${Date.now()}_0`, label: 'الرطوبة', unit: '%', min: 1, max: 3 }, { key: `spec_${Date.now()}_1`, label: 'الكثافة', unit: 'كغ/م³', min: 400, max: 600 }];
  renderNewProductSpecsList();
  renderNewProductLines();
  renderSpecsEditor();
}

function toggleProductLine(key, lineId) {
  const product = PRODUCTS[key];
  if (!product) return;
  if (!product.lines) product.lines = [];
  const idx = product.lines.indexOf(lineId);
  if (idx >= 0) product.lines.splice(idx, 1);
  else product.lines.push(lineId);
  syncLinesFromProducts();
  saveConfig();
  renderSpecsEditor();
}

function syncLinesFromProducts() {
  LINES = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, products: [] }));
  Object.entries(PRODUCTS).forEach(([key, product]) => {
    (product.lines || []).forEach(lineId => {
      const line = LINES.find(l => l.id === lineId);
      if (line && !line.products.includes(key)) line.products.push(key);
    });
  });
}

function changePassword() {
  const current = document.getElementById('pw-current').value;
  const newPw = document.getElementById('pw-new').value;
  const confirm = document.getElementById('pw-confirm').value;
  const errEl = document.getElementById('pw-error');
  errEl.textContent = '';
  if (current !== window.CURRENT_PASSWORD) { errEl.textContent = '❌ كلمة السر الحالية غير صحيحة'; return; }
  if (newPw.length < 4) { errEl.textContent = '❌ كلمة السر الجديدة قصيرة — ٤ أحرف على الأقل'; return; }
  if (newPw !== confirm) { errEl.textContent = '❌ كلمة السر الجديدة وتأكيدها غير متطابقين'; return; }
  localStorage.setItem('lord_admin_pw', newPw);
  window.CURRENT_PASSWORD = newPw;
  document.getElementById('pw-current').value = '';
  document.getElementById('pw-new').value = '';
  document.getElementById('pw-confirm').value = '';
  showToast('🔑 تم تغيير كلمة السر بنجاح!');
}

function checkPassword() {
  const val = document.getElementById('lock-input').value;
  if (val === window.CURRENT_PASSWORD) {
    settingsUnlocked = true;
    showSettingsPanel();
  } else {
    document.getElementById('lock-input').classList.add('error');
    document.getElementById('lock-error').textContent = '❌ كلمة السر غير صحيحة';
    setTimeout(() => document.getElementById('lock-input').classList.remove('error'), 400);
  }
}

function lockSettings() {
  settingsUnlocked = false;
  document.getElementById('settings-lock').style.display = 'block';
  document.getElementById('settings-panel').style.display = 'none';
}

function showSettingsPanel() {
  document.getElementById('settings-lock').style.display = 'none';
  document.getElementById('settings-panel').style.display = 'block';
  renderUsersList();
  renderSpecsEditor();
  renderNewProductLines();
  renderArchiveList();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function initNewProductSpecs() {
  newProductSpecs = [
    { key: `spec_${Date.now()}_0`, label: 'الرطوبة', unit: '%', min: 1, max: 3 },
    { key: `spec_${Date.now()}_1`, label: 'الكثافة', unit: 'كغ/م³', min: 400, max: 600 },
    { key: `spec_${Date.now()}_2`, label: 'النكهة', unit: '%', min: 1.5, max: 2.5 }
  ];
}

initNewProductSpecs();
loadConfig();
loadUsers();

window.addEventListener('storage', (e) => {
  if (e.key === 'lord_archives') renderArchiveList();
});
