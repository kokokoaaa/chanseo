// 찬서 명예의 전당 서버 (Google Apps Script) v3
// 기존 Apps Script 프로젝트의 코드를 전부 지우고 이걸 붙여넣은 뒤
// 배포 > 배포 관리 > 연필(수정) > 버전: 새 버전 > 배포  (URL은 그대로 유지됨)
//
// v2 → v3 바뀐 점
// - 난이도별로 따로 저장 (이름 + 난이도마다 한 줄). 예전엔 이름당 한 줄이라 난이도끼리 기록을 덮어씀
// - 직업 칸 12자 → 40자 (예: "knight:nightmare#hf_gold"가 잘려서 악몽 기록이 사라지던 문제)
// - 점수는 게임과 같은 식으로 서버에서 다시 계산 (골드 제외, 처치 완만한 상한, 클리어 보너스, 난이도 배율)
// - 목록은 난이도마다 상위 50개씩
// - 처음 실행하면 v2 시트(ranking_v2)의 기록을 자동으로 옮김 (v2 시트는 그대로 남겨둠)

const SHEET_NAME = 'ranking_v3';
const OLD_SHEET = 'ranking_v2';
const HEAD = ['name', 'diff', 'cls', 'time', 'lvl', 'kills', 'bosses', 'score', 'comment', 'at'];
const DIFFS = { normal: 1, hard: 1.5, hell: 2.2, god: 3.2, nightmare: 4 };

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
  return s;
}

const num_ = (v, max) => Math.max(0, Math.min(max, Math.floor(+v || 0)));
const str_ = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').slice(0, n);
const softC_ = (x, c) => x <= c ? x : c * (1 + Math.log(x / c));

function clean_(d, at) {
  const r = {
    name: str_(d.name, 12) || '익명',
    cls: str_(d.cls, 40),
    time: num_(d.time, 360000),
    lvl: num_(d.lvl, 100000),
    kills: num_(d.kills, 10000000),
    bosses: num_(d.bosses, 10000),
    comment: str_(d.comment, 40),
    at: at || Date.now(),
  };
  r.diff = diffOf_(d.diff, r.cls);
  // 점수는 서버에서 다시 계산 (조작 방지). 게임과 같은 식
  r.score = Math.round((r.time * 12 + softC_(r.kills * 2, 4000) + r.lvl * 30 + r.bosses * 400 + (r.bosses >= 4 ? 3000 : 0)) * (DIFFS[r.diff] || 1));
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

function doGet() {
  const all = rows_(sheet_())
    .map(r => ({ name: String(r.name), diff: String(r.diff || 'normal'), cls: String(r.cls), time: +r.time, lvl: +r.lvl, kills: +r.kills, bosses: +r.bosses, score: +r.score, comment: String(r.comment || '') }))
    .sort((a, b) => b.score - a.score);
  const per = {};
  const list = all.filter(r => (per[r.diff] = (per[r.diff] || 0) + 1) <= 50);
  return out_(list);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const r = clean_(JSON.parse(e.postData.contents));
    const s = sheet_();
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
    if (r.comment) {
      s.getRange(row, HEAD.indexOf('comment') + 1).setValue(r.comment);
      return out_({ ok: true, result: 'comment' });
    }
    return out_({ ok: true, result: 'kept' });
  } finally {
    lock.releaseLock();
  }
}
