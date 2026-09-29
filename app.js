const defaultRaces = [
  { id: 1, round: '01', name: 'Grand Prix Bahrajnu', location: 'Sakhir · Bahrain', date: '30 mar 2025', time: '16:00', winner: 'Max Verstappen', team: 'Red Bull Racing', status: 'ZAKOŃCZONY', results: [['Max Verstappen','Red Bull Racing','1:32:41.382','25'],['Charles Leclerc','Ferrari','+ 0:08.123','18'],['Lando Norris','McLaren','+ 0:14.556','15']] },
  { id: 2, round: '02', name: 'Grand Prix Arabii Saudyjskiej', location: 'Dżudda · Arabia Saudyjska', date: '06 kwi 2025', time: '18:00', winner: 'Oscar Piastri', team: 'McLaren', status: 'ZAKOŃCZONY', results: [['Oscar Piastri','McLaren','1:21:16.211','25'],['Max Verstappen','Red Bull Racing','+ 0:02.843','18'],['Charles Leclerc','Ferrari','+ 0:04.992','15']] },
  { id: 3, round: '03', name: 'Grand Prix Japonii', location: 'Suzuka · Japonia', date: '13 kwi 2025', time: '07:00', winner: 'Max Verstappen', team: 'Red Bull Racing', status: 'ZAKOŃCZONY', results: [['Max Verstappen','Red Bull Racing','1:22:06.983','25'],['Lando Norris','McLaren','+ 0:01.423','18'],['Oscar Piastri','McLaren','+ 0:02.912','15']] },
  { id: 4, round: '04', name: 'Grand Prix Miami', location: 'Miami · USA', date: '04 maj 2025', time: '22:00', winner: 'Lando Norris', team: 'McLaren', status: 'ZAKOŃCZONY', results: [['Lando Norris','McLaren','1:27:56.123','25'],['Max Verstappen','Red Bull Racing','+ 0:03.119','18'],['Oscar Piastri','McLaren','+ 0:04.703','15']] },
  { id: 5, round: '05', name: 'Grand Prix Emilii-Romanii', location: 'Imola · Włochy', date: '18 maj 2025', time: '15:00', winner: 'Max Verstappen', team: 'Red Bull Racing', status: 'ZAKOŃCZONY', results: [['Max Verstappen','Red Bull Racing','1:31:33.456','25'],['Lando Norris','McLaren','+ 0:06.881','18'],['Charles Leclerc','Ferrari','+ 0:08.220','15']] },
  { id: 6, round: '06', name: 'Grand Prix Monako', location: 'Monte Carlo · Monako', date: '25 maj 2025', time: '15:00', winner: '—', team: '—', status: 'NADCHODZĄCY', results: [] },
  { id: 7, round: '07', name: 'Grand Prix Hiszpanii', location: 'Barcelona · Hiszpania', date: '01 cze 2025', time: '15:00', winner: '—', team: '—', status: 'NADCHODZĄCY', results: [] },
  { id: 8, round: '08', name: 'Grand Prix Kanady', location: 'Montreal · Kanada', date: '15 cze 2025', time: '20:00', winner: '—', team: '—', status: 'NADCHODZĄCY', results: [] }
];
const defaultDrivers = [
  ['Max Verstappen','Red Bull Racing','MV','142','+12'],
  ['Lando Norris','McLaren','LN','118','+8'],
  ['Oscar Piastri','McLaren','OP','106','+15'],
  ['Charles Leclerc','Ferrari','CL','96','-3'],
  ['George Russell','Mercedes','GR','71','+4'],
  ['Lewis Hamilton','Ferrari','LH','64','-2'],
  ['Fernando Alonso','Aston Martin','FA','48','+5'],
  ['Carlos Sainz','Williams','CS','41','-1'],
  ['Pierre Gasly','Alpine','PG','34','+3'],
  ['Esteban Ocon','Alpine','EO','26','-2'],
  ['Alex Albon','Williams','AA','23','+4'],
  ['Liam Lawson','RB','19','+6']
];
const defaultTeams = [
  ['Red Bull Racing','RB','278','+24',['Max Verstappen','Liam Lawson']],
  ['McLaren','MC','224','+37',['Oscar Piastri','Lando Norris']],
  ['Ferrari','FR','160','+12',['Charles Leclerc','Lewis Hamilton']],
  ['Aston Martin','AM','48','+5',['Fernando Alonso']],
  ['Williams','WI','64','+3',['Carlos Sainz','Alex Albon']],
  ['Alpine','AL','60','+1',['Pierre Gasly','Esteban Ocon']]
];
const memoryStorage = {};
const nativeStorage = (() => { try { return window.localStorage; } catch (error) { return null; } })();
function storageGet(key) { try { return nativeStorage ? nativeStorage.getItem(key) : memoryStorage[key] || null; } catch (error) { return memoryStorage[key] || null; } }
function storageSet(key, value) { try { if (nativeStorage) nativeStorage.setItem(key, value); else memoryStorage[key] = value; } catch (error) { memoryStorage[key] = value; } }
let races = JSON.parse(storageGet('gridline-races') || 'null') || defaultRaces;
let drivers = JSON.parse(storageGet('gridline-drivers') || 'null') || defaultDrivers;
let teams = JSON.parse(storageGet('gridline-teams') || 'null') || defaultTeams;
let expandedRace = 1;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
function initials(name) { return name.split(' ').map(part => part[0]).join('').slice(0,2); }
function syncTeamDefinitions() {
  teams = teams.map(team => Array.isArray(team) ? [team[0] || 'Nowy zespół', team[1] || 'NZ', String(team[2] || 0), String(team[3] || '+0'), Array.isArray(team[4]) ? team[4] : []] : ['Nowy zespół', 'NZ', '0', '+0', []]);
  const teamNames = teams.map(team => team[0]);
  drivers.forEach(driver => {
    if (!driver[1]) driver[1] = 'Bez zespołu';
    if (driver[1] === 'Bez zespołu') return;
    if (!teamNames.includes(driver[1])) {
      const team = teams.find(item => Array.isArray(item[4]) && item[4].includes(driver[0]));
      if (team) driver[1] = team[0];
      else {
        const short = driver[1].split(' ').map(part => part[0]).join('').slice(0,2).toUpperCase() || 'NZ';
        teams.push([driver[1], short, '0', '+0', [driver[0]]]);
      }
    }
  });
  teams = teams.filter((team, index, arr) => arr.findIndex(item => item[0] === team[0]) === index);
  teams.forEach(team => {
    const members = [...new Set((team[4] || []).filter(Boolean))];
    team[4] = members;
    members.forEach(name => {
      const driver = drivers.find(item => item[0] === name);
      if (driver) driver[1] = team[0];
    });
  });
  storageSet('gridline-teams', JSON.stringify(teams));
}
function recalculateDriverStandings() {
  const totals = {};
  drivers.forEach(driver => { totals[driver[0]] = 0; });
  races.forEach(race => {
    if (race.status !== 'ZAKOŃCZONY' || !Array.isArray(race.results)) return;
    race.results.forEach(result => {
      const name = result[0];
      if (!totals[name]) totals[name] = 0;
      totals[name] += Number(result[3] || 0);
    });
  });
  drivers.forEach(driver => {
    driver[3] = String(totals[driver[0]] || 0);
    driver[4] = String(Math.max(0, Number(driver[3]) % 25));
  });
}
function recalculateTeamStandings() {
  teams.forEach(team => {
    team[2] = '0';
    team[3] = '+0';
  });
  drivers.forEach(driver => {
    const team = teams.find(item => item[0] === driver[1]);
    if (!team) return;
    team[2] = String((Number(team[2]) || 0) + (Number(driver[3]) || 0));
  });
}
function syncRaceSummaries() {
  races = races.map(race => {
    if (!Array.isArray(race.results) || race.results.length === 0) {
      if (race.status === 'ZAKOŃCZONY' || race.winner !== '—') {
        race.winner = '—';
        race.team = '—';
        race.status = 'NADCHODZĄCY';
      }
      return race;
    }

    const winnerResult = race.results[0];
    const winnerName = winnerResult[0] || '—';
    const teamName = winnerResult[1] || drivers.find(driver => driver[0] === winnerName)?.[1] || '—';

    race.winner = winnerName;
    race.team = teamName;
    race.status = 'ZAKOŃCZONY';
    return race;
  });
}

function getTeamLogo(teamName) {
  const source = (teamName || '').trim();
  if (!source) return 'T';
  const initials = source.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
  return initials || source.slice(0, 2).toUpperCase();
}

let expandedTeam = null;
function persistTeamChanges() {
  storageSet('gridline-drivers', JSON.stringify(drivers));
  storageSet('gridline-teams', JSON.stringify(teams));
  renderAll();
}
function removeDriverFromTeam(driverName) {
  const driver = drivers.find(item => item[0] === driverName);
  if (!driver) return;
  teams.forEach(team => {
    team[4] = (team[4] || []).filter(name => name !== driverName);
  });
  driver[1] = 'Bez zespołu';
  persistTeamChanges();
}
function assignDriverToTeam(driverName, teamName) {
  const driver = drivers.find(item => item[0] === driverName);
  const team = teams.find(item => item[0] === teamName);
  if (!driver || !team) return;

  teams.forEach(item => {
    item[4] = (item[4] || []).filter(name => name !== driverName);
  });
  driver[1] = teamName;
  team[4] = [...new Set([...(team[4] || []), driverName])];
  expandedTeam = teamName;
  persistTeamChanges();
}
function deleteTeam(teamName) {
  if (!window.confirm(`Czy na pewno usunąć zespół ${teamName}? Kierowcy pozostaną w klasyfikacji.`)) return;
  const team = teams.find(item => item[0] === teamName);
  if (!team) return;

  const members = team[4] || [];
  drivers.forEach(driver => {
    if (members.includes(driver[0]) || driver[1] === teamName) driver[1] = 'Bez zespołu';
  });
  teams = teams.filter(item => item[0] !== teamName);
  if (expandedTeam === teamName) expandedTeam = null;
  persistTeamChanges();
  showView('teams');
}
function deleteDriver(driverName) {
  if (!window.confirm(`Czy na pewno usunąć zawodnika ${driverName}?`)) return;
  drivers = drivers.filter(driver => driver[0] !== driverName);
  teams.forEach(team => {
    team[4] = (team[4] || []).filter(name => name !== driverName);
  });
  races.forEach(race => {
    race.results = (race.results || []).filter(result => result[0] !== driverName);
  });
  storageSet('gridline-races', JSON.stringify(races));
  persistTeamChanges();
  showView('drivers');
}
function refreshDriverOptions() {
  const winnerSelect = $('#raceForm select[name="winner"]');
  const driverSelect = $('#raceForm select[name="driver"]');
  const driverOptions = drivers.map(driver => `<option value="${driver[0]}">${driver[0]}</option>`).join('');
  if (winnerSelect) winnerSelect.innerHTML = '<option value="—">Brak wyniku</option>' + driverOptions;
  if (driverSelect) driverSelect.innerHTML = driverOptions || '<option value="">Brak kierowców</option>';
  const teamSelect = $('#driverFields select[name="driverTeam"]');
  if (teamSelect) {
    const teamOptions = teams.map(team => `<option value="${team[0]}">${team[0]}</option>`).join('');
    teamSelect.innerHTML = teamOptions || '<option value="Bez zespołu">Bez zespołu</option>';
  }
  const teamFields = $('#teamFields select[name="teamDrivers"]');
  if (teamFields) {
    teamFields.innerHTML = drivers.map(driver => `<option value="${driver[0]}">${driver[0]}</option>`).join('');
  }
}
function raceRow(race, full = false) { return `<div class="race-row ${race.status === 'NADCHODZĄCY' ? 'upcoming' : ''}" data-race-id="${race.id}"><span class="race-number">${race.round}</span><div class="race-name">${race.name}<small>${race.location} · ${race.date} · ${race.time}</small></div><span class="race-status ${race.status === 'NADCHODZĄCY' ? 'upcoming' : ''}">${race.status}</span><div class="race-winner">${race.winner}<b>${race.winner === '—' ? 'Oczekuje na start' : race.team}</b></div><button type="button" class="row-edit" data-edit-race="${race.id}" onclick="event.stopPropagation(); openEditRace(${race.id})">Edytuj</button><button type="button" class="row-delete" data-delete-race="${race.id}" onclick="event.stopPropagation(); deleteRace(${race.id})">Usuń</button>${full ? `<span class="race-chevron">${expandedRace === race.id ? '⌃' : '⌄'}</span>` : ''}</div>`; }
function renderRecent() { $('#recentRaces').innerHTML = races.slice(0, 4).map(race => raceRow(race)).join(''); }
function renderLeaderboard() {
  const sorted = [...drivers.entries()].sort((left, right) => Number(right[1][3]) - Number(left[1][3]));
  $('#leaderboardList').innerHTML = sorted.slice(0, 5).map(([originalIndex, driver], index) => `<div class="leader-row"><span class="rank">0${index + 1}</span><span class="driver-mini">${driver[2]}</span><span class="leader-name">${driver[0]}<small>${driver[1]}</small></span><span class="leader-points">${driver[3]} <small>pkt</small></span></div>`).join('');
}
function expanded(race) { if (expandedRace !== race.id) return ''; const rows = race.results.length ? `<div class="result-head"><span>POZ.</span><span>KIEROWCA</span><span>ZESPÓŁ</span><span>CZAS / STRATA</span><span>PUNKTY</span></div>${race.results.map((result, index) => `<div class="result-line"><span class="pos">${String(index + 1).padStart(2, '0')}</span><strong>${result[0]}<small>${initials(result[0])}</small></strong><span>${result[1]}</span><span>${result[2]}</span><span class="points">+${result[3]}</span><button type="button" class="result-edit" data-edit-result="${race.id}" data-result-index="${index}" onclick="event.stopPropagation(); openResultModal(${race.id}, ${index})">Edytuj</button></div>`).join('')}` : '<div class="result-line"><strong>Brak wyników</strong><small>Dodaj klasyfikację po zakończeniu wyścigu.</small></div>'; return `<div class="expanded-results">${rows}<button type="button" class="text-button" data-add-result="${race.id}">＋ Dodaj zawodnika do wyników</button></div>`; }
function renderFullRaces() { $('#fullRaceList').innerHTML = races.map(race => raceRow(race, true) + expanded(race)).join(''); }
function renderDrivers() {
  const sorted = [...drivers.entries()].sort((left, right) => Number(right[1][3]) - Number(left[1][3]));
  $('#driversTable').innerHTML = `<div class="driver-table-head"><span>POZ.</span><span>KIEROWCA</span><span>ZESPÓŁ</span><span>PUNKTY</span><span>FORMA</span><span></span></div>` + sorted.map(([originalIndex, driver], index) => `<div class="driver-table-row"><span class="rank">${String(index + 1).padStart(2,'0')}</span><span class="driver-cell"><span class="driver-mini">${driver[2]}</span><strong>${driver[0]}</strong></span><span class="team-name">${driver[1]}</span><strong class="total-points">${driver[3]}</strong><span class="trend">${driver[4]} pkt</span><span class="driver-actions"><button type="button" class="row-edit" data-edit-driver="${originalIndex}" onclick="event.stopPropagation(); openDriverModal(${originalIndex})">Edytuj</button><button type="button" class="row-delete" data-delete-driver="${driver[0]}" title="Usuń zawodnika" aria-label="Usuń ${driver[0]}">Usuń</button></span></div>`).join('');
}
function deleteRace(raceId) {
  races = races.filter(race => race.id !== raceId);
  storageSet('gridline-races', JSON.stringify(races));
  renderAll();
  showView('races');
}
function renderTeams() {
  const sorted = [...teams].sort((left, right) => Number(right[2]) - Number(left[2]));
  $('#teamGrid').innerHTML = sorted.map((team, index) => {
    const availableDrivers = drivers.filter(driver => driver[1] !== team[0]);
    const teamDrivers = ((team[4] || []).map(driverName => {
      const driver = drivers.find(item => item[0] === driverName);
      if (!driver) return null;
      return {
        name: driver[0],
        initials: driver[2] || initials(driver[0]),
        points: Number(driver[3] || 0)
      };
    }).filter(Boolean)).sort((left, right) => right.points - left.points);

    const isExpanded = expandedTeam === team[0];
    const teamLogo = getTeamLogo(team[0]);

    return `<article class="team-card${isExpanded ? ' expanded' : ''}" data-team-name="${team[0]}" tabindex="0">
      <div class="team-card-top">
        <span class="team-logo">${teamLogo}</span>
        <div class="team-card-actions"><span class="rank">${String(index + 1).padStart(2, '0')}</span><button type="button" class="team-delete" data-delete-team="${team[0]}" title="Usuń zespół" aria-label="Usuń zespół ${team[0]}">Usuń</button></div>
      </div>
      <h3>${team[0]}</h3>
      <small>${teamDrivers.length || 0} kierowców</small>
      <div class="team-score">
        <strong>${team[2]} <small>pkt</small></strong>
        <span>${team[3]} pkt / ostatni wyścig</span>
      </div>
      ${isExpanded ? `<div class="team-detail-list">${teamDrivers.length ? teamDrivers.map(driver => `<div class="team-driver-item"><span class="driver-mini">${driver.initials}</span><div class="team-driver-main"><strong>${driver.name}</strong><small>${driver.points} pkt</small></div><button type="button" class="team-driver-remove" data-remove-driver="${driver.name}" title="Usuń z zespołu" aria-label="Usuń ${driver.name} z zespołu">Usuń</button></div>`).join('') : '<div class="team-driver-empty">Brak kierowców przypisanych do tego zespołu.</div>'}<div class="team-assignment"><select aria-label="Wybierz kierowcę do przypisania"><option value="">Wybierz kierowcę</option>${availableDrivers.map(driver => `<option value="${driver[0]}">${driver[0]}</option>`).join('')}</select><button type="button" class="team-driver-assign" data-assign-driver>Przypisz kierowcę</button></div></div>` : ''}
    </article>`;
  }).join('');
}
function updateOverviewStats() {
  const completed = races.filter(race => race.status === 'ZAKOŃCZONY').length;
  const total = races.length || 1;
  const ratio = Math.min(100, Math.round((completed / total) * 100));
  const driverLeader = [...drivers].sort((left, right) => Number(right[3]) - Number(left[3]))[0] || ['—', '—', '—', '0', '0'];
  const winMap = {};
  races.forEach(race => {
    if (race.winner && race.winner !== '—') {
      winMap[race.winner] = (winMap[race.winner] || 0) + 1;
    }
  });
  const winnerEntry = Object.entries(winMap).sort((left, right) => right[1] - left[1])[0];
  const teamLeader = [...teams].sort((left, right) => Number(right[2]) - Number(left[2]))[0] || ['—', '—', '0', '+0', []];

  $('#raceStat').innerHTML = `${String(completed).padStart(2, '0')} <small>/ ${String(total).padStart(2, '0')}</small>`;
  $('#raceProgress').style.width = `${ratio}%`;
  $('#raceNote').textContent = `${ratio}% sezonu za nami`;
  $('#seasonRaceInfo').textContent = `${completed} z ${total} rund zakończonych`;

  $('#leaderName').textContent = driverLeader[0];
  $('#leaderBadge').textContent = driverLeader[2] || '—';
  $('#leaderTeam').textContent = driverLeader[1] || '—';
  $('#leaderPoints').textContent = `${driverLeader[3] || 0} pkt`;

  $('#winsName').textContent = winnerEntry ? winnerEntry[0] : '—';
  $('#winsCount').textContent = winnerEntry ? `${winnerEntry[1]} zwycięstwa` : '0 zwycięstw';
  $('#winsPercent').textContent = winnerEntry ? `${Math.min(100, Math.round((winnerEntry[1] / Math.max(1, total)) * 100))}%` : '0%';

  $('#bestTeamName').textContent = teamLeader[0];
  $('#bestTeamBadge').textContent = teamLeader[1] || '—';
  $('#bestTeamPoints').textContent = `${teamLeader[2] || 0} punktów`;
  $('#bestTeamDelta').textContent = typeof teamLeader[3] === 'string' ? teamLeader[3] : '+0';
}
function renderAll() {
  syncRaceSummaries();
  syncTeamDefinitions();
  recalculateDriverStandings();
  recalculateTeamStandings();
  refreshDriverOptions();
  renderRecent();
  renderLeaderboard();
  renderFullRaces();
  renderDrivers();
  renderTeams();
  renderNextRace();
  updateOverviewStats();
  storageSet('gridline-drivers', JSON.stringify(drivers));
  storageSet('gridline-teams', JSON.stringify(teams));
}
function openTeamModal() {
  resultRaceId = null;
  editRaceId = null;
  editResultIndex = null;
  editDriverIndex = null;
  driverMode = false;
  setFieldsDisabled('#raceFields', true);
  setFieldsDisabled('#driverFields', true);
  setFieldsDisabled('#resultFields', true);
  setFieldsDisabled('#teamFields', false);
  $('#raceFields').classList.add('hidden');
  $('#driverFields').classList.add('hidden');
  $('#resultFields').classList.add('hidden');
  $('#teamFields').classList.remove('hidden');
  $('#modalTitle').textContent = 'Dodaj zespół';
  $('#modalCopy').textContent = 'Utwórz nowy zespół i przypisz do niego kierowców.';
  $('#submitAdmin').textContent = 'Zapisz zespół';
  $('#teamFields input[name="teamName"]').value = '';
  $('#teamFields input[name="teamShort"]').value = '';
  $('#teamFields select[name="teamDrivers"]').value = '';
  $('#adminModal').classList.remove('hidden');
}
function getNextRace() { return races.map(race => ({ race, timestamp: race.dateValue ? new Date(`${race.dateValue}T${race.time || '00:00'}`).getTime() : NaN })).filter(item => Number.isFinite(item.timestamp) && item.timestamp > Date.now()).sort((left, right) => left.timestamp - right.timestamp)[0]; }
function renderNextRace() { const next = getNextRace(); if (!next) { $('#nextRaceName').textContent = 'Brak zaplanowanych wyścigów'; $('#nextRaceMeta').textContent = 'Dodaj przyszłą rundę w panelu administratora'; $('#nextRaceDays').textContent = '--'; ['countDays','countHours','countMinutes','countSeconds'].forEach(id => { $(`#${id}`).textContent = '00'; }); return; } const race = next.race; const date = new Date(next.timestamp); $('#nextRaceName').textContent = race.name; $('#nextRaceMeta').textContent = `${race.location} · ${date.toLocaleDateString('pl-PL')} · ${race.time}`; updateCountdown(next.timestamp); }
function updateCountdown(timestamp = getNextRace()?.timestamp) { if (!timestamp) return; const remaining = Math.max(0, timestamp - Date.now()); const seconds = Math.floor(remaining / 1000); $('#countDays').textContent = String(Math.floor(seconds / 86400)).padStart(2, '0'); $('#countHours').textContent = String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0'); $('#countMinutes').textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0'); $('#countSeconds').textContent = String(seconds % 60).padStart(2, '0'); $('#nextRaceDays').textContent = `${Math.floor(seconds / 86400)} DNI`; }
setInterval(() => { const next = getNextRace(); if (next) updateCountdown(next.timestamp); }, 1000);
function showView(view) { $$('.view-panel').forEach(panel => panel.classList.add('hidden')); $(`#${view}View`).classList.remove('hidden'); $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view)); $('#viewTitle').textContent = view === 'overview' ? 'PRZEGLĄD' : view === 'races' ? 'WYŚCIGI' : view === 'drivers' ? 'KIEROWCY' : 'ZESPOŁY'; }
let resultRaceId = null;
let editRaceId = null;
let editResultIndex = null;
let driverMode = false;
let editDriverIndex = null;
function setFieldsDisabled(selector, disabled) {
  document.querySelectorAll(`${selector} input, ${selector} select`).forEach(field => {
    field.disabled = disabled;
  });
}
function openModal() { resultRaceId = null; editRaceId = null; editResultIndex = null; editDriverIndex = null; driverMode = false; setFieldsDisabled('#raceFields', false); $('#raceForm input[name="date"]').disabled = false; setFieldsDisabled('#driverFields', true); setFieldsDisabled('#resultFields', true); setFieldsDisabled('#teamFields', true); $('#modalTitle').textContent = 'Dodaj dane wyścigu'; $('#modalCopy').textContent = 'Uzupełnij podstawowe informacje. Dane zostaną zapisane tylko w tej przeglądarce.'; $('#raceFields').classList.remove('hidden'); $('#driverFields').classList.add('hidden'); $('#resultFields').classList.add('hidden'); $('#teamFields').classList.add('hidden'); $('#submitAdmin').textContent = 'Zapisz wyścig'; $('#adminModal').classList.remove('hidden'); $('#raceForm').querySelector('input').focus(); }
function openDriverModal(driverIndex = null) {
  resultRaceId = null;
  editRaceId = null;
  editResultIndex = null;
  editDriverIndex = driverIndex;
  driverMode = true;
  setFieldsDisabled('#raceFields', true);
  setFieldsDisabled('#driverFields', false);
  setFieldsDisabled('#resultFields', true);
  setFieldsDisabled('#teamFields', true);
  const driver = driverIndex === null ? null : drivers[driverIndex];
  $('#modalTitle').textContent = driver ? 'Edytuj zawodnika' : 'Dodaj zawodnika';
  $('#modalCopy').textContent = driver ? 'Zmień nazwę lub zespół zawodnika.' : 'Wpisz zawodnika, który ma być widoczny w klasyfikacji turnieju.';
  $('#raceFields').classList.add('hidden');
  $('#driverFields').classList.remove('hidden');
  $('#resultFields').classList.add('hidden');
  $('#teamFields').classList.add('hidden');
  $('#submitAdmin').textContent = driver ? 'Zapisz zmiany' : 'Zapisz zawodnika';
  $('#driverFields input[name="driverName"]').value = driver ? driver[0] : '';
  const teamValue = driver && driver[1] && driver[1] !== 'Bez zespołu' ? driver[1] : 'Bez zespołu';
  $('#driverFields select[name="driverTeam"]').value = teamValue;
  $('#adminModal').classList.remove('hidden');
  $('#driverFields input[name="driverName"]').focus();
}
function openEditRace(raceId) { const race = races.find(item => item.id === raceId); editRaceId = raceId; resultRaceId = null; editResultIndex = null; setFieldsDisabled('#raceFields', false); $('#raceForm input[name="date"]').disabled = true; setFieldsDisabled('#resultFields', true); $('#modalTitle').textContent = 'Edytuj dane wyścigu'; $('#modalCopy').textContent = 'Zmień informacje zapisane dla tej rundy. Datę możesz zostawić bez zmian.'; $('#raceFields').classList.remove('hidden'); $('#resultFields').classList.add('hidden'); $('#submitAdmin').textContent = 'Zapisz zmiany'; $('#raceForm input[name="name"]').value = race.name; $('#raceForm input[name="date"]').value = ''; $('#raceForm input[name="location"]').value = race.location.split(' · ')[0]; $('#raceForm input[name="time"]').value = race.time; $('#raceForm select[name="winner"]').value = race.winner === '—' ? 'Max Verstappen' : race.winner; $('#adminModal').classList.remove('hidden'); }
function openResultModal(raceId, resultIndex = null) { resultRaceId = raceId; editResultIndex = resultIndex; editRaceId = null; const result = resultIndex === null ? null : races.find(item => item.id === raceId).results[resultIndex]; setFieldsDisabled('#raceFields', true); setFieldsDisabled('#resultFields', false); $('#modalTitle').textContent = result ? 'Edytuj wynik zawodnika' : 'Dodaj wynik zawodnika'; $('#modalCopy').textContent = result ? 'Zmień dane przejazdu w klasyfikacji tego wyścigu.' : 'Wpisz przejazd do rozwiniętej klasyfikacji tego wyścigu.'; $('#raceFields').classList.add('hidden'); $('#resultFields').classList.remove('hidden'); $('#submitAdmin').textContent = result ? 'Zapisz zmiany' : 'Zapisz wynik'; if (result) { $('#resultFields select[name="driver"]').value = result[0]; $('#resultFields input[name="team"]').value = result[1]; $('#resultFields input[name="resultTime"]').value = result[2]; $('#resultFields input[name="points"]').value = result[3]; } $('#adminModal').classList.remove('hidden'); $('#resultFields select').focus(); }
function closeModal() { resultRaceId = null; driverMode = false; editDriverIndex = null; $('#adminModal').classList.add('hidden'); }
$$('.nav-item').forEach(item => item.addEventListener('click', () => showView(item.dataset.view)));
$$('[data-view-target]').forEach(button => button.addEventListener('click', () => showView(button.dataset.viewTarget)));
$('#recentRaces').addEventListener('click', (event) => { const editRace = event.target.closest('[data-edit-race]'); if (editRace) { event.stopPropagation(); openEditRace(Number(editRace.dataset.editRace)); return; } const row = event.target.closest('[data-race-id]'); if (row) { expandedRace = Number(row.dataset.raceId); showView('races'); renderFullRaces(); } });
$('#driversTable').addEventListener('click', event => {
  const deleteButton = event.target.closest('[data-delete-driver]');
  if (deleteButton) {
    event.stopPropagation();
    deleteDriver(deleteButton.dataset.deleteDriver);
    return;
  }
  const editDriver = event.target.closest('[data-edit-driver]');
  if (editDriver) openDriverModal(Number(editDriver.dataset.editDriver));
});
$('#teamGrid').addEventListener('click', event => {
  const deleteButton = event.target.closest('[data-delete-team]');
  if (deleteButton) {
    event.stopPropagation();
    deleteTeam(deleteButton.dataset.deleteTeam);
    return;
  }
  const assignmentPanel = event.target.closest('.team-assignment');
  if (assignmentPanel && !event.target.closest('[data-assign-driver]')) {
    event.stopPropagation();
    return;
  }
  const assignButton = event.target.closest('[data-assign-driver]');
  if (assignButton) {
    event.stopPropagation();
    const card = assignButton.closest('[data-team-name]');
    const select = assignButton.closest('.team-assignment')?.querySelector('select');
    if (card && select?.value) assignDriverToTeam(select.value, card.dataset.teamName);
    return;
  }
  const removeButton = event.target.closest('[data-remove-driver]');
  if (removeButton) {
    event.stopPropagation();
    removeDriverFromTeam(removeButton.dataset.removeDriver);
    return;
  }
  const card = event.target.closest('[data-team-name]');
  if (!card) return;
  const teamName = card.dataset.teamName;
  expandedTeam = expandedTeam === teamName ? null : teamName;
  renderTeams();
});
$('#fullRaceList').addEventListener('click', (event) => {
  const deleteRaceButton = event.target.closest('[data-delete-race]');
  if (deleteRaceButton) {
    event.stopPropagation();
    deleteRace(Number(deleteRaceButton.dataset.deleteRace));
    return;
  }
  const editRace = event.target.closest('[data-edit-race]');
  if (editRace) { event.stopPropagation(); openEditRace(Number(editRace.dataset.editRace)); return; }
  const editResult = event.target.closest('[data-edit-result]');
  if (editResult) { event.stopPropagation(); openResultModal(Number(editResult.dataset.editResult), Number(editResult.dataset.resultIndex)); return; }
  const addResult = event.target.closest('[data-add-result]');
  if (addResult) { openResultModal(Number(addResult.dataset.addResult)); return; }
  const row = event.target.closest('[data-race-id]');
  if (row) { expandedRace = Number(row.dataset.raceId); renderFullRaces(); }
});
$('#openAdmin').addEventListener('click', () => openModal()); $('#openAdminTop').addEventListener('click', () => openModal()); $('#openAdminRace').addEventListener('click', () => openModal()); $('#openAdminDriver').addEventListener('click', () => openDriverModal()); $('#openAdminTeam').addEventListener('click', () => openTeamModal()); $('#closeAdmin').addEventListener('click', closeModal); $('#cancelAdmin').addEventListener('click', closeModal);
$('#adminModal').addEventListener('click', event => { if (event.target.id === 'adminModal') closeModal(); });
$('#raceForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);

  if ($('#teamFields').classList.contains('hidden') === false) {
    const name = (data.get('teamName') || '').toString().trim();
    const short = (data.get('teamShort') || '').toString().trim() || name.slice(0, 2).toUpperCase();
    const selected = Array.from($('#teamFields select[name="teamDrivers"]').selectedOptions).map(option => option.value);
    if (!name) return;
    const existing = teams.find(team => team[0].toLowerCase() === name.toLowerCase());
    if (existing) {
      existing[1] = short;
      existing[4] = [...new Set([...existing[4], ...selected])];
    } else {
      teams.push([name, short, '0', '+0', selected]);
    }
    selected.forEach(driverName => {
      const driver = drivers.find(item => item[0] === driverName);
      if (driver) driver[1] = name;
    });
    storageSet('gridline-teams', JSON.stringify(teams));
    storageSet('gridline-drivers', JSON.stringify(drivers));
    renderAll();
    closeModal();
    showView('teams');
    return;
  }

  if (driverMode) {
    const name = (data.get('driverName') || '').toString().trim();
    if (!name) return;
    const team = (data.get('driverTeam') || '').toString().trim();
    const driver = [name, team === 'Bez zespołu' ? 'Bez zespołu' : team, initials(name), '0', 'NEW'];
    if (editDriverIndex === null) {
      drivers.push(driver);
    } else {
      driver[3] = drivers[editDriverIndex][3];
      driver[4] = drivers[editDriverIndex][4];
      drivers[editDriverIndex] = driver;
    }
    if (team !== 'Bez zespołu') {
      const teamEntry = teams.find(item => item[0] === team);
      if (!teamEntry) {
        teams.push([team, team.slice(0, 2).toUpperCase(), '0', '+0', [name]]);
      } else if (!teamEntry[4].includes(name)) {
        teamEntry[4].push(name);
      }
    }
    storageSet('gridline-drivers', JSON.stringify(drivers));
    storageSet('gridline-teams', JSON.stringify(teams));
    renderAll();
    closeModal();
    showView('drivers');
    return;
  }

  if (resultRaceId) {
    const race = races.find(item => item.id === resultRaceId);
    if (!race) return;
    const result = [data.get('driver'), data.get('team'), data.get('resultTime'), data.get('points')];
    if (editResultIndex === null) race.results.push(result); else race.results[editResultIndex] = result;
    race.status = 'ZAKOŃCZONY';
    const winner = data.get('driver');
    const teamName = data.get('team');
    race.winner = winner;
    race.team = teamName;
    storageSet('gridline-races', JSON.stringify(races));
    renderAll();
    closeModal();
    showView('races');
    return;
  }

  if (editRaceId) {
    const race = races.find(item => item.id === editRaceId);
    if (!race) return;
    const winner = data.get('winner');
    race.name = data.get('name');
    race.location = data.get('location');
    race.time = data.get('time');
    race.winner = winner === '—' ? '—' : winner;
    race.team = winner === '—' ? '—' : (teams.find(team => team[0] === drivers.find(driver => driver[0] === winner)?.[1]) || [teamName])[0] || '—';
    if (winner === '—') {
      race.status = 'NADCHODZĄCY';
    } else {
      race.status = 'ZAKOŃCZONY';
    }
    storageSet('gridline-races', JSON.stringify(races));
    renderAll();
    closeModal();
    showView('races');
    return;
  }

  const raceName = (data.get('name') || '').toString().trim();
  const dateRaw = (data.get('date') || '').toString();
  const location = (data.get('location') || '').toString().trim();
  const time = (data.get('time') || '').toString();
  if (!raceName || !dateRaw || !location || !time) return;

  const winner = (data.get('winner') || '—').toString();
  const date = new Date(`${dateRaw}T00:00:00`);
  const race = {
    id: Date.now(),
    round: String(races.length + 1).padStart(2, '0'),
    name: raceName,
    location,
    date: date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' }),
    time,
    dateValue: dateRaw,
    winner: winner === '—' ? '—' : winner,
    team: winner === '—' ? '—' : (drivers.find(driver => driver[0] === winner)?.[1] || '—'),
    status: winner === '—' ? 'NADCHODZĄCY' : 'ZAKOŃCZONY',
    results: []
  };
  races = [race, ...races];
  storageSet('gridline-races', JSON.stringify(races));
  renderAll();
  closeModal();
  showView('races');
});
renderAll();
