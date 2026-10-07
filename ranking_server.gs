// 찬서 명예의 전당 서버 (Google Apps Script) v4.2
// 기존 Apps Script 프로젝트의 코드를 전부 지우고 이걸 붙여넣은 뒤
// 배포 > 배포 관리 > 연필(수정) > 버전: 새 버전 > 배포  (URL은 그대로 유지됨)
//
// v4.1 → v4.2 바뀐 점
// - 직업 칸 40자 → 120자 (칭호·오라·장비 정보가 뒤에 붙으면서 잘리던 문제)
// - 결투 전적 칸(dw, "w승d무l패") 추가: 기록을 올릴 때, 그리고 결투가 끝날 때마다 그 이름의 모든 기록에 갱신
//
// v4 → v4.1 바뀐 점
// - 목록을 1분 동안 저장해 두고 바로 돌려줌 (기록이 올라오면 바로 새로 만듦) → 랭킹 불러오기가 빨라짐
// - 목록을 만들 때 무거운 캐릭터(hero) 칸은 읽지 않고, 캐릭터가 있는지는 따로 적어 둔 표시(hh 칸)로 판단
//
// v3 → v4 바뀐 점
// - 기록마다 '캐릭터' 칸(hero) 추가: 그 판의 증강·능력치를 압축한 문자열 → 게임의 ⚔ 결투에서 실제 캐릭터와 싸울 수 있음
// - 목록(doGet)에는 캐릭터가 있는지(h)만 주고, 캐릭터는 ?hero=이름&diff=난이도 로 따로 받아감 (목록이 무거워지지 않게)
// - 보스 러시(bossrush) 난이도 인식. 예전에 '일반'으로 잘못 저장된 보스 러시 기록도 목록에선 보스 러시로 보여줌
// - 예전 v3 시트는 그대로 쓰고 맨 오른쪽에 hero 칸만 추가됨 (기록 유지)
//
// v2 → v3 바뀐 점
// - 난이도별로 따로 저장 (이름 + 난이도마다 한 줄). 예전엔 이름당 한 줄이라 난이도끼리 기록을 덮어씀
// - 직업 칸 12자 → 40자 (예: "knight:nightmare#hf_gold"가 잘려서 악몽 기록이 사라지던 문제)
// - 점수는 게임과 같은 식으로 서버에서 다시 계산 (골드 제외, 처치 완만한 상한, 클리어 보너스, 난이도 배율)
// - 목록은 난이도마다 상위 50개씩
// - 처음 실행하면 v2 시트(ranking_v2)의 기록을 자동으로 옮김 (v2 시트는 그대로 남겨둠)

const SHEET_NAME = 'ranking_v3';
const OLD_SHEET = 'ranking_v2';
const HEAD = ['name', 'diff', 'cls', 'time', 'lvl', 'kills', 'bosses', 'score', 'comment', 'at', 'hero', 'hh', 'dw'];
const LIST_COLS = 10; // 목록에 필요한 칸 (name ~ at)
const CACHE_KEY = 'list_v42';
const DIFFS = { normal: 1, hard: 1.5, hell: 2.2, god: 3.2, nightmare: 4, bossrush: 4 };

function book_() {
  const a = SpreadsheetApp.getActiveSpreadsheet();
  if (a) return a;
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('BOOK');
  if (id) return SpreadsheetApp.openById(id);
  const b = SpreadsheetApp.create('찬서 랭킹');
  p.setProperty('BOOK', b.getId());
  return b;
}

// "knight:nightm" 처럼 예전에 잘린 난이도도 알아봄
function diffOf_(d, cls) {
  let k = String(d || '');
  if (!k) { const c = String(cls || '').split('#')[0]; k = c.indexOf(':') >= 0 ? c.split(':')[1] : 'normal'; }
  if (DIFFS[k]) return k;
  const hit = Object.keys(DIFFS).find(x => k && x.indexOf(k) === 0);
  return hit || 'normal';
}

function sheet_() {
  const ss = book_();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.getRange(1, 1, 1, HEAD.length).setValues([HEAD]);
    s.getRange('A:A').setNumberFormat('@');
    s.getRange('C:C').setNumberFormat('@');
    s.getRange('I:I').setNumberFormat('@');
    const old = ss.getSheetByName(OLD_SHEET);
    if (old && old.getLastRow() > 1) {
      const v = old.getDataRange().getValues();
      const h = v.shift().map(String);
      const rows = v.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
        .map(o => clean_({ ...o, diff: diffOf_('', o.cls) }, o.at))
        .map(r => HEAD.map(k => r[k]));
      if (rows.length) s.getRange(2, 1, rows.length, HEAD.length).setValues(rows);
    }
  }
  // v3 시트에 hero 칸이 없으면 머리글만 추가 (기존 기록은 그대로)
  if (s.getLastColumn() < HEAD.length) {
    s.getRange(1, 1, 1, HEAD.length).setValues([HEAD]);
    // v4 기록 중 캐릭터가 있는 줄에 hh 표시 한 번만 채움
    const last = s.getLastRow(), hc = HEAD.indexOf('hero') + 1;
    if (last > 1) s.getRange(2, hc + 1, last - 1, 1).setValues(s.getRange(2, hc, last - 1, 1).getValues().map(r => [r[0] ? 1 : '']));
  }
  return s;
}

const num_ = (v, max) => Math.max(0, Math.min(max, Math.floor(+v || 0)));
const str_ = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').slice(0, n);
// 결투 전적 "승-무-패"
// 시트가 날짜로 바꾸지 않게 "w3d1l2" 꼴로 저장
const dw_ = v => { const m = String(v || '').match(/^(\d{1,6})-(\d{1,6})-(\d{1,6})$/); return m ? 'w' + m[1] + 'd' + m[2] + 'l' + m[3] : ''; };
const softC_ = (x, c) => x <= c ? x : c * (1 + Math.log(x / c));

function clean_(d, at) {
  const r = {
    name: str_(d.name, 12) || '익명',
    cls: str_(d.cls, 120),
    time: num_(d.time, 360000),
    lvl: num_(d.lvl, 100000),
    kills: num_(d.kills, 10000000),
    bosses: num_(d.bosses, 10000),
    comment: str_(d.comment, 40),
    at: at || Date.now(),
    // 캐릭터: 압축 문자열 (base64 글자만, 한 칸 최대 45000자)
    hero: String(d.hero || '').replace(/[^A-Za-z0-9+\/=:]/g, '').slice(0, 45000),
  };
  r.hh = r.hero ? 1 : '';
  r.dw = dw_(d.dw);
  r.diff = diffOf_(d.diff, r.cls);
  // 점수는 서버에서 다시 계산 (조작 방지). 게임과 같은 식
  r.score = r.diff === 'bossrush'
    ? Math.round((r.bosses * 2500 + r.lvl * 30 + r.time * 2) * DIFFS.bossrush)
    : Math.round((r.time * 12 + softC_(r.kills * 2, 4000) + r.lvl * 30 + r.bosses * 400 + (r.bosses >= 4 ? 3000 : 0)) * (DIFFS[r.diff] || 1));
  return r;
}

function rows_(s) {
  const v = s.getDataRange().getValues();
  v.shift();
  return v.map(r => Object.fromEntries(HEAD.map((h, i) => [h, r[i]])));
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// 예전에 일반(normal)으로 잘못 저장된 보스 러시 기록 바로잡기
const fixDiff_ = r => (String(r.diff) === 'normal' && String(r.cls).indexOf(':bossrush') >= 0) ? 'bossrush' : String(r.diff || 'normal');

function listJson_() {
  const s = sheet_();
  const last = s.getLastRow();
  if (last < 2) return '[]';
  // 목록 칸(name~at)과 캐릭터 표시(hh)만 읽음. 무거운 hero 칸은 안 읽음
  const v = s.getRange(2, 1, last - 1, LIST_COLS).getValues();
  const hc = HEAD.indexOf('hh') + 1, ex = s.getLastColumn() >= hc + 1 ? s.getRange(2, hc, last - 1, 2).getValues() : [];
  const all = v.map((r, i) => { const o = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, r[j]]));
      return { name: String(o.name), diff: fixDiff_(o), cls: String(o.cls), time: +o.time, lvl: +o.lvl, kills: +o.kills, bosses: +o.bosses, score: +o.score, comment: String(o.comment || ''), h: ex[i] && ex[i][0] ? 1 : 0, dw: ex[i] ? String(ex[i][1] || '') : '' }; })
    .sort((a, b) => b.score - a.score);
  const per = {};
  return JSON.stringify(all.filter(r => (per[r.diff] = (per[r.diff] || 0) + 1) <= 50));
}

function doGet(e) {
  const q = (e && e.parameter) || {};
  if (q.hero) {
    // 이름·난이도로 줄만 찾고, 그 한 줄의 hero 칸만 읽음
    const s = sheet_(), last = s.getLastRow();
    if (last < 2) return out_({ hero: '' });
    const v = s.getRange(2, 1, last - 1, LIST_COLS).getValues();
    const i = v.findIndex(r => { const o = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, r[j]])); return String(o.name) === String(q.hero) && fixDiff_(o) === String(q.diff || 'nightmare'); });
    return out_({ hero: i < 0 ? '' : String(s.getRange(i + 2, HEAD.indexOf('hero') + 1).getValue() || '') });
  }
  const c = CacheService.getScriptCache();
  let j = c.get(CACHE_KEY);
  if (!j) { j = listJson_(); try { c.put(CACHE_KEY, j, 60); } catch (err) {} }
  return ContentService.createTextOutput(j).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const s = sheet_();
    try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (err) {}
    // 결투 전적만 갱신 (그 이름의 기록이 있을 때만, 새 줄은 만들지 않음)
    if (d.dwOnly) {
      const dw = dw_(d.dw), nm = str_(d.name, 12), last = s.getLastRow();
      if (!dw || !nm || last < 2) return out_({ ok: false });
      const c = HEAD.indexOf('dw') + 1, names = s.getRange(2, 1, last - 1, 1).getValues();
      let n = 0;
      names.forEach((x, i) => { if (String(x[0]) === nm) { s.getRange(i + 2, c).setValue(dw); n++; } });
      return out_({ ok: true, result: 'dw', n });
    }
    const r = clean_(d);
    const last = s.getLastRow();
    const keys = last > 1 ? s.getRange(2, 1, last - 1, 2).getValues().map(x => String(x[0]) + '\u0001' + String(x[1])) : [];
    const i = keys.indexOf(r.name + '\u0001' + r.diff);
    if (i < 0) {
      s.appendRow(HEAD.map(h => r[h]));
      return out_({ ok: true, result: 'new' });
    }
    const row = i + 2;
    const oldScore = +s.getRange(row, HEAD.indexOf('score') + 1).getValue() || 0;
    if (r.score > oldScore) {
      s.getRange(row, 1, 1, HEAD.length).setValues([HEAD.map(h => r[h])]);
      return out_({ ok: true, result: 'best' });
    }
    if (r.dw) s.getRange(row, HEAD.indexOf('dw') + 1).setValue(r.dw);
    // 점수는 그대로여도 캐릭터 정보가 비어 있으면 채워 둠
    if (r.hero && !String(s.getRange(row, HEAD.indexOf('hero') + 1).getValue() || '')) { s.getRange(row, HEAD.indexOf('hero') + 1).setValue(r.hero); s.getRange(row, HEAD.indexOf('hh') + 1).setValue(1); }
    if (r.comment) {
      s.getRange(row, HEAD.indexOf('comment') + 1).setValue(r.comment);
      return out_({ ok: true, result: 'comment' });
    }
    return out_({ ok: true, result: 'kept' });
  } finally {
    lock.releaseLock();
  }
}
