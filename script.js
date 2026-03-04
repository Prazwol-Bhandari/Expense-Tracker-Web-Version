var CATS = {
  Food:          { dot: '#4ade80', bg: '#f0fdf4', text: '#15803d' },
  Transport:     { dot: '#60a5fa', bg: '#eff6ff', text: '#1d4ed8' },
  Shopping:      { dot: '#fb923c', bg: '#fff7ed', text: '#c2410c' },
  Bills:         { dot: '#facc15', bg: '#fefce8', text: '#a16207' },
  Health:        { dot: '#f87171', bg: '#fef2f2', text: '#b91c1c' },
  Entertainment: { dot: '#c084fc', bg: '#faf5ff', text: '#7e22ce' },
  Education:     { dot: '#34d399', bg: '#ecfdf5', text: '#065f46' },
  Housing:       { dot: '#818cf8', bg: '#eef2ff', text: '#3730a3' },
  Other:         { dot: '#a8a29e', bg: '#f5f5f4', text: '#57534e' }
};

var ICONS = {
  Food:          '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  Transport:     '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  Shopping:      '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  Bills:         '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  Health:        '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  Entertainment: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  Education:     '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  Housing:       '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  Other:         '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
};

var expenses = JSON.parse(localStorage.getItem('ledger_expenses') || '[]');

function save() {
  localStorage.setItem('ledger_expenses', JSON.stringify(expenses));
}

function nextId() {
  if (expenses.length === 0) return 1;
  return Math.max.apply(null, expenses.map(function(e) { return e.id; })) + 1;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function dateLabel(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function style(cat) { return CATS[cat] || CATS.Other; }
function icon(cat)  { return ICONS[cat] || ICONS.Other; }

function setError(id, state) {
  document.getElementById(id).classList.toggle('err', state);
}

function addExpense() {
  var descEl = document.getElementById('desc');
  var catEl  = document.getElementById('category');
  var amtEl  = document.getElementById('amount');

  var desc   = descEl.value.trim();
  var cat    = catEl.value;
  var amount = parseFloat(amtEl.value);

  setError('f-desc', !desc);
  setError('f-cat',  !cat);
  setError('f-amt',  !amount || amount <= 0);

  if (!desc || !cat || !amount || amount <= 0) return;

  expenses.unshift({ id: nextId(), desc: desc, cat: cat, amount: amount, date: today() });
  save();

  descEl.value = ''; catEl.value = ''; amtEl.value = '';
  descEl.focus();
  renderAll();
}

function deleteExpense(id) {
  expenses = expenses.filter(function(e) { return e.id !== id; });
  save();
  renderAll();
}

function renderSummary() {
  var total = 0;
  var monthTotal = 0;
  var thisMonth = today().slice(0, 7);

  for (var i = 0; i < expenses.length; i++) {
    total += expenses[i].amount;
    if (expenses[i].date.slice(0, 7) === thisMonth) monthTotal += expenses[i].amount;
  }

  document.getElementById('statTotal').textContent = money(total);
  document.getElementById('statMonth').textContent = money(monthTotal);
  document.getElementById('statCount').textContent = expenses.length;
}

function renderList() {
  var q = document.getElementById('searchInput').value.trim().toLowerCase();

  var list = q
    ? expenses.filter(function(e) { return e.desc.toLowerCase().includes(q) || e.cat.toLowerCase().includes(q); })
    : expenses;

  var el = document.getElementById('txList');

  if (list.length === 0) {
    el.innerHTML = emptyHTML(q ? 'No results found.' : 'No transactions yet.<br>Add your first entry above.');
    return;
  }

  var html = '';
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    var s = style(e.cat);
    html +=
      '<div class="tx-row">' +
        '<div class="tx-icon" style="background:' + s.bg + '">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + s.text + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + icon(e.cat) + '</svg>' +
        '</div>' +
        '<div class="tx-info">' +
          '<div class="tx-name">' + esc(e.desc) + '<span class="tx-badge" style="background:' + s.bg + ';color:' + s.text + '">' + esc(e.cat) + '</span></div>' +
          '<div class="tx-sub">' + dateLabel(e.date) + ' &middot; #' + e.id + '</div>' +
        '</div>' +
        '<div class="tx-amt">' + money(e.amount) + '</div>' +
        '<button class="btn-del" onclick="deleteExpense(' + e.id + ')" title="Remove">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>';
  }
  el.innerHTML = html;
}

function renderBreakdown() {
  var el = document.getElementById('breakdown');

  if (expenses.length === 0) {
    el.innerHTML = '<div class="empty" style="padding:12px 0"><p>No data yet</p></div>';
    return;
  }

  var totals = {};
  for (var i = 0; i < expenses.length; i++) {
    var cat = expenses[i].cat;
    totals[cat] = (totals[cat] || 0) + expenses[i].amount;
  }

  var sorted = Object.entries(totals).sort(function(a, b) { return b[1] - a[1]; });
  var max    = sorted[0][1];
  var html   = '';

  for (var i = 0; i < sorted.length; i++) {
    var cat   = sorted[i][0];
    var amt   = sorted[i][1];
    var s     = style(cat);
    var pct   = ((amt / max) * 100).toFixed(1);
    html +=
      '<div class="cat-row">' +
        '<div class="cat-dot" style="background:' + s.dot + '"></div>' +
        '<div class="cat-name">' + cat + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + s.dot + '"></div></div>' +
        '<div class="cat-total">' + money(amt) + '</div>' +
      '</div>';
  }
  el.innerHTML = html;
}

function emptyHTML(msg) {
  return '<div class="empty">' +
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<line x1="8" y1="13" x2="16" y2="13"/>' +
      '<line x1="8" y1="17" x2="12" y2="17"/>' +
    '</svg><p>' + msg + '</p></div>';
}

function renderAll() {
  renderSummary();
  renderList();
  renderBreakdown();
}

function setDate() {
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function scheduleNextDay() {
  var now  = new Date();
  var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  setTimeout(function() { setDate(); scheduleNextDay(); }, next - now);
}

document.getElementById('addBtn').addEventListener('click', addExpense);
document.getElementById('searchInput').addEventListener('input', renderList);

['desc', 'category', 'amount'].forEach(function(id) {
  document.getElementById(id).addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addExpense();
  });
});

setDate();
scheduleNextDay();
renderAll();
