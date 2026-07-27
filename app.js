// FitPulse Pro - Vanilla JavaScript Core Application

// Default Exercises Catalog from PDF Specs
const DEFAULT_EXERCISES = [
  // Chest
  { id: 'def-chest-1', name: 'Incline Dumbbell Press', category: 'Chest', type: 'Weight' },
  { id: 'def-chest-2', name: 'Flat Dumbbell Press', category: 'Chest', type: 'Weight' },
  { id: 'def-chest-3', name: 'Incline Barbell Press', category: 'Chest', type: 'Weight' },
  { id: 'def-chest-4', name: 'Flat Barbell Press', category: 'Chest', type: 'Weight' },
  { id: 'def-chest-5', name: 'Dips', category: 'Chest', type: 'Weight' },
  { id: 'def-chest-6', name: 'Push-Up', category: 'Chest', type: 'Weight' },

  // Back
  { id: 'def-back-1', name: 'Lat Pulldowns', category: 'Back', type: 'Weight' },
  { id: 'def-back-2', name: 'Dumbbell Row', category: 'Back', type: 'Weight' },
  { id: 'def-back-3', name: 'Seated Row', category: 'Back', type: 'Weight' },
  { id: 'def-back-4', name: 'T-Bar Row', category: 'Back', type: 'Weight' },

  // Abs
  { id: 'def-abs-1', name: 'Plank', category: 'Abs', type: 'Weight' },
  { id: 'def-abs-2', name: 'Leg Raises', category: 'Abs', type: 'Weight' },
  { id: 'def-abs-3', name: 'Hanging Leg Raises', category: 'Abs', type: 'Weight' },
  { id: 'def-abs-4', name: 'Flutter Kick', category: 'Abs', type: 'Weight' },
  { id: 'def-abs-5', name: 'Crunches', category: 'Abs', type: 'Weight' },
  { id: 'def-abs-6', name: 'Russian Twist', category: 'Abs', type: 'Weight' },
  { id: 'def-abs-7', name: 'Bicycle Crunch', category: 'Abs', type: 'Weight' },

  // Biceps
  { id: 'def-biceps-1', name: 'Hammer Curl', category: 'Biceps', type: 'Weight' },
  { id: 'def-biceps-2', name: 'Decline Bicep Curl', category: 'Biceps', type: 'Weight' },

  // Triceps
  { id: 'def-triceps-1', name: 'Tricep Pushdown', category: 'Triceps', type: 'Weight' },
  { id: 'def-triceps-2', name: 'Overhead Extension', category: 'Triceps', type: 'Weight' },

  // Legs
  { id: 'def-legs-1', name: 'Squats', category: 'Legs', type: 'Weight' },
  { id: 'def-legs-2', name: 'Lunges', category: 'Legs', type: 'Weight' },
  { id: 'def-legs-3', name: 'Romanian Deadlifts', category: 'Legs', type: 'Weight' },

  // Cardio
  { id: 'def-cardio-1', name: 'Walking', category: 'Cardio', type: 'Cardio' },
  { id: 'def-cardio-2', name: 'Running', category: 'Cardio', type: 'Cardio' },
  { id: 'def-cardio-3', name: 'Cycling', category: 'Cardio', type: 'Cardio' },
];

// App State
let state = {
  currentUser: null,
  selectedDate: new Date().toISOString().split('T')[0],
  unit: 'kg',
  selectedCategory: 'ALL',
  searchQuery: '',
  activeExercise: null,
  editingRecordId: null,
};

// Storage Service
const Storage = {
  getUsers() {
    const data = localStorage.getItem('fitpulse_users');
    if (!data) {
      const defaultUser = { id: 'usr_default', username: 'Athlete', pin: '1234' };
      localStorage.setItem('fitpulse_users', JSON.stringify([defaultUser]));
      localStorage.setItem('fitpulse_curr_id', defaultUser.id);
      return [defaultUser];
    }
    return JSON.parse(data);
  },

  getCurrentUser() {
    const users = this.getUsers();
    const currId = localStorage.getItem('fitpulse_curr_id');
    return users.find(u => u.id === currId) || users[0];
  },

  loginOrRegister(username, pin) {
    const users = this.getUsers();
    let u = users.find(x => x.username.toLowerCase() === username.trim().toLowerCase());
    if (u) {
      if (u.pin !== pin.trim()) throw new Error('Incorrect PIN');
    } else {
      u = { id: 'usr_' + Math.random().toString(36).substr(2, 7), username: username.trim(), pin: pin.trim() };
      users.push(u);
      localStorage.setItem('fitpulse_users', JSON.stringify(users));
    }
    localStorage.setItem('fitpulse_curr_id', u.id);
    return u;
  },

  getDailyLogs(userId) {
    const data = localStorage.getItem('fitpulse_logs_' + userId);
    return data ? JSON.parse(data) : [];
  },

  saveDailyWeight(userId, dateStr, weight) {
    const logs = this.getDailyLogs(userId);
    let log = logs.find(l => l.date === dateStr);
    if (log) {
      log.bodyWeight = weight;
    } else {
      logs.push({ id: 'log_' + Math.random().toString(36).substr(2, 7), userId, date: dateStr, bodyWeight: weight });
    }
    localStorage.setItem('fitpulse_logs_' + userId, JSON.stringify(logs));
  },

  getCustomExercises(userId) {
    const data = localStorage.getItem('fitpulse_custom_' + userId);
    return data ? JSON.parse(data) : [];
  },

  getAllExercises(userId) {
    return [...DEFAULT_EXERCISES, ...this.getCustomExercises(userId)];
  },

  addCustomExercise(userId, name, category) {
    const custom = this.getCustomExercises(userId);
    const newEx = {
      id: 'cust_' + Math.random().toString(36).substr(2, 7),
      name: name.trim(),
      category,
      type: category === 'Cardio' ? 'Cardio' : 'Weight',
      isCustom: true
    };
    custom.push(newEx);
    localStorage.setItem('fitpulse_custom_' + userId, JSON.stringify(custom));
    return newEx;
  },

  getWorkoutRecords(userId) {
    const data = localStorage.getItem('fitpulse_records_' + userId);
    return data ? JSON.parse(data) : [];
  },

  saveWorkoutRecord(userId, recordData) {
    const records = this.getWorkoutRecords(userId);
    if (recordData.id) {
      const idx = records.findIndex(r => r.id === recordData.id);
      if (idx !== -1) records[idx] = recordData;
    } else {
      recordData.id = 'rec_' + Math.random().toString(36).substr(2, 7);
      records.push(recordData);
    }
    localStorage.setItem('fitpulse_records_' + userId, JSON.stringify(records));
  },

  deleteWorkoutRecord(userId, recordId) {
    let records = this.getWorkoutRecords(userId);
    records = records.filter(r => r.id !== recordId);
    localStorage.setItem('fitpulse_records_' + userId, JSON.stringify(records));
  },

  seedInitialData(userId) {
    const logs = this.getDailyLogs(userId);
    const recs = this.getWorkoutRecords(userId);
    if (logs.length === 0 && recs.length === 0) {
      const today = new Date();
      const formatDate = (d) => d.toISOString().split('T')[0];

      const dates = [4, 3, 2, 1, 0].map(i => {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        return formatDate(d);
      });

      const sampleLogs = [
        { id: 'log_1', userId, date: dates[0], bodyWeight: 74.5 },
        { id: 'log_2', userId, date: dates[1], bodyWeight: 74.2 },
        { id: 'log_3', userId, date: dates[2], bodyWeight: 73.9 },
        { id: 'log_4', userId, date: dates[3], bodyWeight: 73.7 },
        { id: 'log_5', userId, date: dates[4], bodyWeight: 73.4 },
      ];
      localStorage.setItem('fitpulse_logs_' + userId, JSON.stringify(sampleLogs));

      const sampleRecs = [
        // Multi-category sample logs
        { id: 'rec_1', userId, date: dates[0], exerciseId: 'def-chest-2', exerciseName: 'Flat Dumbbell Press', category: 'Chest', type: 'Weight', weight: 24, sets: 4, reps: 10 },
        { id: 'rec_2', userId, date: dates[0], exerciseId: 'def-biceps-1', exerciseName: 'Hammer Curl', category: 'Biceps', type: 'Weight', weight: 14, sets: 3, reps: 12 },
        { id: 'rec_3', userId, date: dates[2], exerciseId: 'def-back-1', exerciseName: 'Lat Pulldowns', category: 'Back', type: 'Weight', weight: 60, sets: 4, reps: 10 },
        { id: 'rec_4', userId, date: dates[2], exerciseId: 'def-cardio-2', exerciseName: 'Running', category: 'Cardio', type: 'Cardio', distance: 3.5, pace: '5:30', calories: 280 },
        { id: 'rec_5', userId, date: dates[4], exerciseId: 'def-chest-1', exerciseName: 'Incline Dumbbell Press', category: 'Chest', type: 'Weight', weight: 26, sets: 4, reps: 10 },
        { id: 'rec_6', userId, date: dates[4], exerciseId: 'def-triceps-1', exerciseName: 'Tricep Pushdown', category: 'Triceps', type: 'Weight', weight: 30, sets: 3, reps: 12 },
      ];
      localStorage.setItem('fitpulse_records_' + userId, JSON.stringify(sampleRecs));
    }
  }
};

// UI Renderers
function initApp() {
  state.currentUser = Storage.getCurrentUser();
  Storage.seedInitialData(state.currentUser.id);
  
  document.getElementById('nav-username').textContent = state.currentUser.username;
  document.getElementById('date-picker-input').value = state.selectedDate;

  setupEventListeners();
  renderAll();
}

function renderAll() {
  renderDateDisplay();
  renderWeightCard();
  renderLoggedToday();
  renderExerciseGrid();
  renderHistory();
  renderLibrary();
}

function renderDateDisplay() {
  const isToday = state.selectedDate === new Date().toISOString().split('T')[0];
  document.getElementById('date-display-text').textContent = isToday ? 'Today' : state.selectedDate;
}

function renderWeightCard() {
  const logs = Storage.getDailyLogs(state.currentUser.id);
  const currentLog = logs.find(l => l.date === state.selectedDate);
  const input = document.getElementById('input-daily-weight');
  input.value = currentLog ? currentLog.bodyWeight : '';

  // Weight diff calculation
  const sortedLogs = logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  const idx = sortedLogs.findIndex(l => l.date === state.selectedDate);
  const badge = document.getElementById('weight-diff-badge');

  if (idx > 0 && currentLog) {
    const diff = (currentLog.bodyWeight - sortedLogs[idx - 1].bodyWeight).toFixed(1);
    badge.textContent = `${diff > 0 ? '+' : ''}${diff} ${state.unit}`;
  } else {
    badge.textContent = '--';
  }
}

function renderLoggedToday() {
  const records = Storage.getWorkoutRecords(state.currentUser.id).filter(r => r.date === state.selectedDate);
  document.getElementById('count-logged-today').textContent = records.length;

  const container = document.getElementById('container-logged-exercises');
  const badgesContainer = document.getElementById('active-categories-badges');
  
  const categories = [...new Set(records.map(r => r.category))];
  badgesContainer.innerHTML = categories.map(c => `<span class="badge-pro">${c}</span>`).join('');

  if (records.length === 0) {
    container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 12px;">No exercise logged yet today. Select a movement below!</p>`;
    return;
  }

  container.innerHTML = records.map(r => {
    const isCardio = r.type === 'Cardio';
    const detail = isCardio
      ? `${r.distance} km • ${r.pace} pace • ${r.calories} kcal`
      : `${r.sets} Sets × ${r.reps} Reps @ ${r.weight} ${state.unit}`;
    
    return `
      <div class="exercise-card logged" onclick="openLoggerForEdit('${r.id}')">
        <div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="badge-pro">${r.category}</span>
            <strong style="font-size: 13px;">${r.exerciseName}</strong>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${detail}</div>
        </div>
        <span style="font-size: 14px;">✏️</span>
      </div>
    `;
  }).join('');
}

function renderExerciseGrid() {
  const allEx = Storage.getAllExercises(state.currentUser.id);
  const records = Storage.getWorkoutRecords(state.currentUser.id).filter(r => r.date === state.selectedDate);

  const filtered = allEx.filter(e => {
    const matchesCat = state.selectedCategory === 'ALL' || e.category === state.selectedCategory;
    const matchesSearch = e.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const container = document.getElementById('container-exercise-grid');
  container.innerHTML = filtered.map(ex => {
    const isLogged = records.some(r => r.exerciseId === ex.id);
    return `
      <div class="exercise-card ${isLogged ? 'logged' : ''}" onclick="openLoggerForNew('${ex.id}')">
        <div>
          <div style="font-size: 13px; font-weight: 700;">${ex.name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${ex.category} ${ex.isCustom ? '• Custom' : ''}</div>
        </div>
        <span style="font-size: 16px;">${isLogged ? '✅' : '➕'}</span>
      </div>
    `;
  }).join('');
}

function renderHistory() {
  const logs = Storage.getDailyLogs(state.currentUser.id);
  const records = Storage.getWorkoutRecords(state.currentUser.id);
  const filterCat = document.getElementById('select-history-filter').value;

  const dateMap = {};
  logs.forEach(l => { dateMap[l.date] = { weight: l.bodyWeight, records: [] }; });
  records.forEach(r => {
    if (!dateMap[r.date]) dateMap[r.date] = { weight: null, records: [] };
    dateMap[r.date].records.push(r);
  });

  let sortedDates = Object.keys(dateMap).sort((a, b) => new Date(b) - new Date(a));
  if (filterCat !== 'ALL') {
    sortedDates = sortedDates.filter(d => dateMap[d].records.some(r => r.category === filterCat));
  }

  const container = document.getElementById('container-history-list');
  if (sortedDates.length === 0) {
    container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">No session logs found.</p>`;
    return;
  }

  container.innerHTML = sortedDates.map(d => {
    const sess = dateMap[d];
    const recsHtml = sess.records.map(r => `
      <div style="font-size: 12px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-top: 4px;">
        <strong>${r.exerciseName}</strong> (${r.category}) - ${r.type === 'Cardio' ? `${r.distance}km` : `${r.sets}×${r.reps} @ ${r.weight}${state.unit}`}
      </div>
    `).join('');

    return `
      <div class="glass-card">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); pb: 8px;">
          <strong>📅 ${d}</strong>
          ${sess.weight ? `<span class="badge-pro">⚖️ ${sess.weight} ${state.unit}</span>` : ''}
        </div>
        <div style="margin-top: 8px;">${recsHtml || '<span style="font-size:11px; color:var(--text-muted);">Weight entry only</span>'}</div>
      </div>
    `;
  }).join('');
}

function renderLibrary() {
  const allEx = Storage.getAllExercises(state.currentUser.id);
  const container = document.getElementById('container-library-grid');
  container.innerHTML = allEx.map(ex => `
    <div class="exercise-card">
      <div>
        <div style="font-size: 13px; font-weight: 700;">${ex.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${ex.category} ${ex.isCustom ? '• Custom' : ''}</div>
      </div>
    </div>
  `).join('');
}

// Chart Renderers (Chart.js)
let weightChartInstance = null;
let volumeChartInstance = null;

function renderCharts() {
  const logs = Storage.getDailyLogs(state.currentUser.id).sort((a, b) => new Date(a.date) - new Date(b.date));
  const records = Storage.getWorkoutRecords(state.currentUser.id);

  // 1. Weight Chart
  const ctxWeight = document.getElementById('chart-weight-trend').getContext('2d');
  if (weightChartInstance) weightChartInstance.destroy();
  weightChartInstance = new Chart(ctxWeight, {
    type: 'line',
    data: {
      labels: logs.map(l => l.date.split('-').slice(1).join('/')),
      datasets: [{
        label: `Weight (${state.unit})`,
        data: logs.map(l => l.bodyWeight),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // 2. Volume Chart
  const catCounts = {};
  records.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + (r.sets || 1); });
  const ctxVol = document.getElementById('chart-category-volume').getContext('2d');
  if (volumeChartInstance) volumeChartInstance.destroy();
  volumeChartInstance = new Chart(ctxVol, {
    type: 'bar',
    data: {
      labels: Object.keys(catCounts),
      datasets: [{
        label: 'Total Sets Completed',
        data: Object.values(catCounts),
        backgroundColor: '#06b6d4'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// Event Listeners & Modals
function setupEventListeners() {
  // Bottom Navigation Switcher
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const targetScreen = btn.getAttribute('data-target');
      document.getElementById(targetScreen).classList.add('active');
      if (targetScreen === 'screen-analytics') renderCharts();
    });
  });

  // Date Navigation
  document.getElementById('btn-prev-day').addEventListener('click', () => shiftDate(-1));
  document.getElementById('btn-next-day').addEventListener('click', () => shiftDate(1));
  document.getElementById('date-picker-input').addEventListener('change', (e) => {
    state.selectedDate = e.target.value;
    renderAll();
  });

  // Unit Toggle
  document.getElementById('btn-toggle-unit').addEventListener('click', () => {
    state.unit = state.unit === 'kg' ? 'lbs' : 'kg';
    document.getElementById('unit-kg-label').style.color = state.unit === 'kg' ? '#22c55e' : '#9ca3af';
    document.getElementById('unit-lbs-label').style.color = state.unit === 'lbs' ? '#22c55e' : '#9ca3af';
    renderAll();
  });

  // Category Pill Filters
  document.querySelectorAll('.pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedCategory = pill.getAttribute('data-cat');
      renderExerciseGrid();
    });
  });

  // Search Input
  document.getElementById('input-search-exercise').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderExerciseGrid();
  });

  // Daily Weight Form
  document.getElementById('form-weight-logger').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = parseFloat(document.getElementById('input-daily-weight').value);
    if (!isNaN(val) && val > 0) {
      Storage.saveDailyWeight(state.currentUser.id, state.selectedDate, val);
      renderWeightCard();
    }
  });

  // Modals Open/Close
  document.getElementById('btn-account-modal').addEventListener('click', () => openModal('modal-account'));
  document.getElementById('close-modal-account').addEventListener('click', () => closeModal('modal-account'));
  document.getElementById('close-modal-logger').addEventListener('click', () => closeModal('modal-logger'));
  document.getElementById('btn-open-custom-ex').addEventListener('click', () => openModal('modal-custom-ex'));
  document.getElementById('btn-library-add-ex').addEventListener('click', () => openModal('modal-custom-ex'));
  document.getElementById('close-modal-custom-ex').addEventListener('click', () => closeModal('modal-custom-ex'));

  // Login Form
  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('input-username').value;
    const p = document.getElementById('input-pin').value;
    try {
      state.currentUser = Storage.loginOrRegister(u, p);
      Storage.seedInitialData(state.currentUser.id);
      document.getElementById('nav-username').textContent = state.currentUser.username;
      closeModal('modal-account');
      renderAll();
    } catch (err) {
      alert(err.message);
    }
  });

  // Custom Movement Form
  document.getElementById('form-custom-ex').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custom-ex-name').value;
    const cat = document.getElementById('custom-ex-category').value;
    if (name) {
      Storage.addCustomExercise(state.currentUser.id, name, cat);
      closeModal('modal-custom-ex');
      renderAll();
    }
  });

  // Exercise Logger Form
  document.getElementById('form-exercise-logger').addEventListener('submit', (e) => {
    e.preventDefault();
    const isCardio = state.activeExercise.type === 'Cardio';
    const recData = {
      id: state.editingRecordId,
      userId: state.currentUser.id,
      date: state.selectedDate,
      exerciseId: state.activeExercise.id,
      exerciseName: state.activeExercise.name,
      category: state.activeExercise.category,
      type: state.activeExercise.type,
      notes: document.getElementById('log-notes').value,
    };

    if (isCardio) {
      recData.distance = parseFloat(document.getElementById('log-distance').value) || 0;
      recData.pace = document.getElementById('log-pace').value || '0:00';
      recData.calories = parseInt(document.getElementById('log-calories').value) || 0;
    } else {
      recData.weight = parseFloat(document.getElementById('log-weight').value) || 0;
      recData.sets = parseInt(document.getElementById('log-sets').value) || 1;
      recData.reps = parseInt(document.getElementById('log-reps').value) || 1;
    }

    Storage.saveWorkoutRecord(state.currentUser.id, recData);
    closeModal('modal-logger');
    renderLoggedToday();
    renderExerciseGrid();
  });
}

function shiftDate(days) {
  const d = new Date(state.selectedDate);
  d.setDate(d.getDate() + days);
  state.selectedDate = d.toISOString().split('T')[0];
  document.getElementById('date-picker-input').value = state.selectedDate;
  renderAll();
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openLoggerForNew(exId) {
  const allEx = Storage.getAllExercises(state.currentUser.id);
  state.activeExercise = allEx.find(e => e.id === exId);
  state.editingRecordId = null;

  document.getElementById('modal-log-title').textContent = state.activeExercise.name;
  document.getElementById('modal-log-category').textContent = state.activeExercise.category;
  
  const isCardio = state.activeExercise.type === 'Cardio';
  document.getElementById('fields-weight-training').style.display = isCardio ? 'none' : 'block';
  document.getElementById('fields-cardio').style.display = isCardio ? 'block' : 'none';

  openModal('modal-logger');
}

function openLoggerForEdit(recordId) {
  const rec = Storage.getWorkoutRecords(state.currentUser.id).find(r => r.id === recordId);
  if (!rec) return;
  state.editingRecordId = rec.id;
  state.activeExercise = { id: rec.exerciseId, name: rec.exerciseName, category: rec.category, type: rec.type };

  document.getElementById('modal-log-title').textContent = rec.exerciseName;
  document.getElementById('modal-log-category').textContent = rec.category;

  const isCardio = rec.type === 'Cardio';
  document.getElementById('fields-weight-training').style.display = isCardio ? 'none' : 'block';
  document.getElementById('fields-cardio').style.display = isCardio ? 'block' : 'none';

  if (isCardio) {
    document.getElementById('log-distance').value = rec.distance || '';
    document.getElementById('log-pace').value = rec.pace || '';
    document.getElementById('log-calories').value = rec.calories || '';
  } else {
    document.getElementById('log-weight').value = rec.weight || '';
    document.getElementById('log-sets').value = rec.sets || '';
    document.getElementById('log-reps').value = rec.reps || '';
  }

  openModal('modal-logger');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
