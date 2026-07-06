const SPRITES = {
  fist: ['0001111000000','0011111100000','0111111110000','0111111111000','0111111111100','0111111111000','0111111110000','0111111110000','0111111110000','0111111110000','0011111100000','0011111100000','0001111000000'],
  rock: ['0001111000000','0011111100000','0111111110000','0111111111000','0111111111100','0111111111000','0111111110000','0111111110000','0111111110000','0111111110000','0011111100000','0011111100000','0001111000000'],
  paper: ['0101010100000','0101010100000','0101010100000','0101010100000','0101010100000','0111111100000','0111111110000','0111111111000','0111111111100','0111111111000','0111111110000','0011111100000','0011111100000'],
  scissors: ['0001000100000','0001000100000','0001000100000','0001000100000','0001111100000','0111111111000','0111111111100','0111111111000','0111111110000','0111111110000','0011111100000','0011111100000','0001111000000']
};
const NAMES = { rock:'ROCK', paper:'PAPER', scissors:'SCISSORS' };
const BEATS = { rock:'scissors', paper:'rock', scissors:'paper' };
const CHOICES = Object.keys(BEATS);

function drawSprite(el, bitmap){
  el.style.gridTemplateColumns = `repeat(${bitmap[0].length}, 1fr)`;
  el.innerHTML = bitmap.map(row => [...row].map(c => `<div class="cell${c==='1'?' on':''}"></div>`).join('')).join('');
}
function judge(p,c){ if(p===c) return 'draw'; return BEATS[p]===c ? 'win' : 'lose'; }
function pad(n){ return String(n).padStart(2,'0'); }
function randomPick(){ return CHOICES[Math.floor(Math.random()*3)]; }

const views = { home:'view-home', game:'view-game', contest:'view-contest', leaderboard:'view-leaderboard' };
function goTo(name){
  Object.values(views).forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(views[name]).classList.add('active');
  document.getElementById('pickButtons').style.display = name === 'leaderboard' ? 'none' : 'flex';
  if(name === 'leaderboard') renderLeaderboard();
  if(name === 'game') setButtonsDisabled(q.locked);
  if(name === 'contest') setButtonsDisabled(c.locked || c.finished);
  current = name;
}
let current = 'home';

document.querySelectorAll('[data-go]').forEach(el => {
  const activate = () => goTo(el.dataset.go);
  el.addEventListener('click', activate);
  el.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); activate(); } });
});
document.getElementById('homeBtn').addEventListener('click', () => goTo('home'));

/* ---------------- QUICK MATCH ---------------- */
const q = { player:0, comp:0, round:1, streak:0, streakType:null, history:[], locked:false };
const qEl = {
  playerSprite: document.getElementById('qPlayerSprite'), compSprite: document.getElementById('qCompSprite'),
  playerMove: document.getElementById('qPlayerMove'), compMove: document.getElementById('qCompMove'),
  message: document.getElementById('qMessage'), streak: document.getElementById('qStreak'),
  playerScore: document.getElementById('qPlayerScore'), compScore: document.getElementById('qCompScore'), roundNum: document.getElementById('qRoundNum'),
};
function qResetBoard(){ drawSprite(qEl.playerSprite,SPRITES.fist); drawSprite(qEl.compSprite,SPRITES.fist); qEl.playerMove.innerHTML='&nbsp;'; qEl.compMove.innerHTML='&nbsp;'; }
qResetBoard();
function qRenderTicker(){ document.getElementById('ticker').innerHTML = q.history.slice(-8).map(r=>`<span class="${r[0].toUpperCase()}"></span>`).join(''); }
function qRenderStreak(){ if(q.streak<2){ qEl.streak.innerHTML='&nbsp;'; return; } qEl.streak.textContent = `${q.streak} ${q.streakType.toUpperCase()} STREAK`; }
function qPlay(pick){
  if(q.locked || current!=='game') return;
  q.locked = true; setButtonsDisabled(true);
  qEl.message.textContent = 'ROCK... PAPER... SCISSORS...';
  const compPick = randomPick();
  setTimeout(() => {
    qEl.message.textContent = 'THROW!';
    drawSprite(qEl.playerSprite, SPRITES[pick]); drawSprite(qEl.compSprite, SPRITES[compPick]);
    qEl.playerMove.textContent = NAMES[pick]; qEl.compMove.textContent = NAMES[compPick];
    flashAndShake();
    setTimeout(() => {
      const result = judge(pick, compPick);
      if(result==='win') q.player++; if(result==='lose') q.comp++;
      if(result==='draw'){ q.streak=0; q.streakType=null; } else if(result===q.streakType){ q.streak++; } else { q.streak=1; q.streakType=result; }
      q.history.push(result); q.round++;
      qEl.playerScore.textContent = pad(q.player); qEl.compScore.textContent = pad(q.comp); qEl.roundNum.textContent = pad(q.round);
      qRenderTicker(); qRenderStreak();
      qEl.message.textContent = { win:'>> YOU WIN <<', lose:'>> CPU WINS <<', draw:'>> DRAW <<' }[result];
    }, 140);
    setTimeout(() => { unShake(); qResetBoard(); qEl.message.textContent='PICK A MOVE BELOW'; setButtonsDisabled(false); q.locked=false; }, 1600);
  }, 500);
}

/* ---------------- CONTEST (10 rounds) ---------------- */
const CONTEST_LEN = 10;
const c = { player:0, comp:0, round:1, history:[], locked:false, finished:false };
const cEl = {
  playerSprite: document.getElementById('cPlayerSprite'), compSprite: document.getElementById('cCompSprite'),
  playerMove: document.getElementById('cPlayerMove'), compMove: document.getElementById('cCompMove'),
  message: document.getElementById('cMessage'), playerScore: document.getElementById('cPlayerScore'),
  compScore: document.getElementById('cCompScore'), roundNum: document.getElementById('cRoundNum'), bar: document.getElementById('contestBar'),
};
function cResetBoard(){ drawSprite(cEl.playerSprite,SPRITES.fist); drawSprite(cEl.compSprite,SPRITES.fist); cEl.playerMove.innerHTML='&nbsp;'; cEl.compMove.innerHTML='&nbsp;'; }
function cRenderBar(){
  cEl.bar.innerHTML = Array.from({length:CONTEST_LEN}, (_,i) => {
    const n = i+1;
    let cls = '';
    if(n < c.round) cls = 'done'; else if(n === c.round && !c.finished) cls = 'current';
    return `<span class="${cls}"></span>`;
  }).join('');
}
function cStartNew(){
  Object.assign(c, { player:0, comp:0, round:1, history:[], locked:false, finished:false });
  cEl.playerScore.textContent = c.player; cEl.compScore.textContent = c.comp; cEl.roundNum.textContent = `01/${CONTEST_LEN}`;
  cEl.message.textContent = `ROUND 1 OF ${CONTEST_LEN} — PICK A MOVE`;
  cResetBoard(); cRenderBar(); setButtonsDisabled(false);
}
function cPlay(pick){
  if(c.locked || c.finished || current!=='contest') return;
  c.locked = true; setButtonsDisabled(true);
  cEl.message.textContent = 'ROCK... PAPER... SCISSORS...';
  const compPick = randomPick();
  setTimeout(() => {
    cEl.message.textContent = 'THROW!';
    drawSprite(cEl.playerSprite, SPRITES[pick]); drawSprite(cEl.compSprite, SPRITES[compPick]);
    cEl.playerMove.textContent = NAMES[pick]; cEl.compMove.textContent = NAMES[compPick];
    flashAndShake();
    setTimeout(() => {
      const result = judge(pick, compPick);
      if(result==='win') c.player++; if(result==='lose') c.comp++;
      c.history.push(result);
      cEl.playerScore.textContent = c.player; cEl.compScore.textContent = c.comp;
      cEl.message.textContent = { win:'>> YOU WIN <<', lose:'>> CPU WINS <<', draw:'>> DRAW <<' }[result];
    }, 140);
    setTimeout(() => {
      unShake(); cResetBoard();
      if(c.round >= CONTEST_LEN){
        c.finished = true; cRenderBar();
        const verdict = c.player > c.comp ? 'CONTEST WON!' : c.player < c.comp ? 'CONTEST LOST' : 'CONTEST TIED';
        cEl.message.textContent = `${verdict}  FINAL ${c.player}-${c.comp}`;
        saveToLeaderboard(c.player, c.comp);
        setButtonsDisabled(true);
      } else {
        c.round++; cRenderBar(); cEl.roundNum.textContent = `${pad(c.round)}/${CONTEST_LEN}`;
        cEl.message.textContent = `ROUND ${c.round} OF ${CONTEST_LEN} — PICK A MOVE`;
        setButtonsDisabled(false);
      }
      c.locked = false;
    }, 1600);
  }, 500);
}

/* ---------------- shared fx ---------------- */
function flashAndShake(){ document.getElementById('screen').classList.add('flash'); document.getElementById('console').classList.add('shake'); }
function unShake(){ document.getElementById('screen').classList.remove('flash'); document.getElementById('console').classList.remove('shake'); }
function setButtonsDisabled(disabled){ document.querySelectorAll('.btn').forEach(b => b.disabled = disabled); }

document.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', () => {
  const pick = btn.dataset.pick;
  if(current === 'game') qPlay(pick);
  else if(current === 'contest') cPlay(pick);
}));

/* ---------------- LEADERBOARD ---------------- */
const LB_KEY = 'duelboy-leaderboard';
function loadLB(){ try{ return JSON.parse(localStorage.getItem(LB_KEY)) || []; } catch(e){ return []; } }
function saveLB(list){ try{ localStorage.setItem(LB_KEY, JSON.stringify(list)); } catch(e){} }
function renderLeaderboard(){
  const list = loadLB().sort((a,b) => b.score - a.score || a.round - b.round).slice(0,10);
  const ul = document.getElementById('lbList');
  document.getElementById('lbResultSlot').innerHTML = '';
  if(list.length === 0){ ul.innerHTML = '<li class="lb-empty" style="border:none;">NO ENTRIES YET — PLAY A CONTEST!</li>'; return; }
  ul.innerHTML = list.map((e,i) => `<li><span><span class="rank">${i+1}.</span>${e.name}</span><span>${e.player}-${e.comp}</span></li>`).join('');
}
function saveToLeaderboard(player, comp){
  const list = loadLB();
  list.push({ name:`PLAYER ${list.length+1}`, player, comp, score:player, round:CONTEST_LEN });
  saveLB(list);
}
document.getElementById('clearData').addEventListener('click', () => {
  localStorage.removeItem(LB_KEY);
  renderLeaderboard();
});

/* ---------------- RESET (context aware) ---------------- */
document.getElementById('reset').addEventListener('click', () => {
  if(current === 'game'){
    Object.assign(q, { player:0, comp:0, round:1, streak:0, streakType:null, history:[] });
    qEl.playerScore.textContent='00'; qEl.compScore.textContent='00'; qEl.roundNum.textContent='01';
    qEl.message.textContent='PICK A MOVE BELOW'; qEl.streak.innerHTML='&nbsp;'; document.getElementById('ticker').innerHTML='';
    qResetBoard(); setButtonsDisabled(false);
  } else if(current === 'contest'){
    cStartNew();
  }
});

cStartNew();
