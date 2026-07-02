// ============================================================
// ToeicSync — Firestore 學習記錄雲端同步
// 路徑: users/{uid} / toeic 欄位
// 隔離設計：只在 ToeicAuth 登入後運作，不影響離線功能
// ============================================================
window.ToeicSync = (function() {
  'use strict';

  var _syncTimer = null;
  var _syncDebounceMs = 3000;  // debounce 3 seconds
  var _uid = null;
  var _ready = false;

  var KEYS = {
    WRONG: 'toeic_wrong',
    STATS: 'toeic_stats',
    HISTORY: 'toeic_history',
    CONFIG: 'toeic_session_config',
    TRACK: 'toeic_track'
  };

  // ── helpers ─────────────────────────────────────────────

  function _readLocal(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function _writeLocal(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function _now() {
    return Date.now();
  }

  function _itemKey(item) {
    return item.questionId + '|' + (item.part || '');
  }

  // ── merge strategies ────────────────────────────────────

  function _mergeWrong(localArr, remoteArr) {
    if (!localArr) localArr = [];
    if (!remoteArr) remoteArr = [];
    var map = {};
    var i, item, key;
    for (i = 0; i < localArr.length; i++) {
      item = localArr[i];
      key = _itemKey(item);
      map[key] = item;
    }
    for (i = 0; i < remoteArr.length; i++) {
      item = remoteArr[i];
      key = _itemKey(item);
      if (!map[key]) {
        map[key] = item;
      } else {
        if ((item.timestamp || 0) > (map[key].timestamp || 0)) {
          map[key] = item;
        }
      }
    }
    var merged = [];
    Object.keys(map).forEach(function(k) { merged.push(map[k]); });
    merged.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
    return merged;
  }

  function _mergeStats(localObj, remoteObj) {
    if (!localObj) localObj = {};
    if (!remoteObj) remoteObj = {};
    var merged = {};
    var allKeys = {};
    Object.keys(localObj).forEach(function(k) { allKeys[k] = true; });
    Object.keys(remoteObj).forEach(function(k) { allKeys[k] = true; });
    Object.keys(allKeys).forEach(function(k) {
      var lv = localObj[k] || { attempts: 0, wrong: 0 };
      var rv = remoteObj[k] || { attempts: 0, wrong: 0 };
      merged[k] = {
        attempts: Math.max(lv.attempts || 0, rv.attempts || 0),
        wrong: Math.max(lv.wrong || 0, rv.wrong || 0)
      };
    });
    return merged;
  }

  function _mergeHistory(localArr, remoteArr) {
    if (!localArr) localArr = [];
    if (!remoteArr) remoteArr = [];
    var seen = {};
    var merged = [];
    var all = localArr.concat(remoteArr);
    for (var i = 0; i < all.length; i++) {
      var h = all[i];
      var sig = (h.date || '') + '|' + (h.mode || '') + '|' + (h.track || '') + '|' + h.total + '|' + h.correct;
      if (!seen[sig]) {
        seen[sig] = true;
        merged.push(h);
      }
    }
    merged.sort(function(a, b) {
      return (a.date || '').localeCompare(b.date || '');
    });
    if (merged.length > 200) merged = merged.slice(merged.length - 200);
    return merged;
  }

  function _mergeSimple(localVal, remoteVal, localTs, remoteTs) {
    if (localTs >= remoteTs) return localVal;
    return remoteVal;
  }

  // ── merge & push ────────────────────────────────────────

  function _loadAllLocal() {
    return {
      wrong: _readLocal(KEYS.WRONG),
      stats: _readLocal(KEYS.STATS),
      history: _readLocal(KEYS.HISTORY),
      config: _readLocal(KEYS.CONFIG),
      track: localStorage.getItem(KEYS.TRACK)
    };
  }

  function _getLocalMeta(key) {
    return parseInt(localStorage.getItem(key + '_ts') || '0', 10);
  }

  function _setLocalMeta(key, ts) {
    localStorage.setItem(key + '_ts', String(ts || _now()));
  }

  function _mergeAndWrite(remoteToeic) {
    if (!remoteToeic || typeof remoteToeic !== 'object') {
      _setAllMeta();
      return;
    }

    var local = _loadAllLocal();
    var now = _now();

    var rWrong = remoteToeic.wrong || [];
    var lWrong = local.wrong || [];
    var mergedWrong = _mergeWrong(lWrong, rWrong);
    _writeLocal(KEYS.WRONG, mergedWrong);
    _setLocalMeta(KEYS.WRONG, now);

    var rStats = remoteToeic.stats || {};
    var lStats = local.stats || {};
    var mergedStats = _mergeStats(lStats, rStats);
    _writeLocal(KEYS.STATS, mergedStats);
    _setLocalMeta(KEYS.STATS, now);

    var rHistory = remoteToeic.history || [];
    var lHistory = local.history || [];
    var mergedHistory = _mergeHistory(lHistory, rHistory);
    _writeLocal(KEYS.HISTORY, mergedHistory);
    _setLocalMeta(KEYS.HISTORY, now);

    var rConfig = remoteToeic.config || {};
    var rConfigTs = remoteToeic._configTs || 0;
    var lConfigTs = _getLocalMeta(KEYS.CONFIG);
    if (rConfigTs > lConfigTs && Object.keys(rConfig).length > 0) {
      _writeLocal(KEYS.CONFIG, rConfig);
      _setLocalMeta(KEYS.CONFIG, rConfigTs);
    } else {
      _setLocalMeta(KEYS.CONFIG, Math.max(lConfigTs, rConfigTs));
    }

    if (remoteToeic.track && (remoteToeic._trackTs || 0) > _getLocalMeta(KEYS.TRACK)) {
      localStorage.setItem(KEYS.TRACK, remoteToeic.track);
      _setLocalMeta(KEYS.TRACK, remoteToeic._trackTs || now);
    } else {
      _setLocalMeta(KEYS.TRACK, Math.max(_getLocalMeta(KEYS.TRACK) || 0, remoteToeic._trackTs || 0));
    }

    // After merge, push the merged data back to cloud
    syncUp();
  }

  function _setAllMeta() {
    var now = _now();
    [KEYS.WRONG, KEYS.STATS, KEYS.HISTORY, KEYS.CONFIG, KEYS.TRACK].forEach(function(k) {
      if (!localStorage.getItem(k + '_ts')) {
        localStorage.setItem(k + '_ts', String(now));
      }
    });
  }

  // ── public API ──────────────────────────────────────────

  function syncUp() {
    if (!_uid) return;
    var db = window.ToeicAuth.getDb();
    if (!db) return;
    var now = _now();
    var data = {
      toeic: {
        wrong: _readLocal(KEYS.WRONG) || [],
        stats: _readLocal(KEYS.STATS) || {},
        history: _readLocal(KEYS.HISTORY) || [],
        config: _readLocal(KEYS.CONFIG) || {},
        track: localStorage.getItem(KEYS.TRACK) || 'T600',
        updatedAt: now,
        _wrongTs: _getLocalMeta(KEYS.WRONG) || now,
        _statsTs: _getLocalMeta(KEYS.STATS) || now,
        _historyTs: _getLocalMeta(KEYS.HISTORY) || now,
        _configTs: _getLocalMeta(KEYS.CONFIG) || now,
        _trackTs: _getLocalMeta(KEYS.TRACK) || now
      }
    };
    db.collection('users').doc(_uid).set(data, { merge: true }).catch(function(err) {
      console.error('\u540C\u6B65\u4E0A\u50B3\u5931\u6557:', err.message || err);
    });
  }

  function syncDown() {
    if (!_uid) return Promise.resolve(null);
    var db = window.ToeicAuth.getDb();
    if (!db) return Promise.resolve(null);
    return db.collection('users').doc(_uid).get().then(function(doc) {
      if (!doc.exists) return null;
      var d = doc.data();
      return (d && d.toeic) ? d.toeic : null;
    }).catch(function(err) {
      console.error('\u540C\u6B65\u4E0B\u8F09\u5931\u6557:', err.message || err);
      return null;
    });
  }

  function scheduleSyncUp() {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(syncUp, _syncDebounceMs);
  }

  function onLogin(user) {
    _uid = user.uid;
    _ready = true;
    _setAllMeta();
    syncDown().then(function(remote) {
      if (remote) {
        _mergeAndWrite(remote);
      } else {
        // No remote data yet, push local up
        syncUp();
      }
    });
  }

  function onLogout() {
    _uid = null;
    _ready = false;
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = null;
  }

  // ── hook into storage writes ────────────────────────────

  function _installHooks() {
    if (!window.TOEIC) window.TOEIC = {};

    // Hook Storage
    var Storage = window.TOEIC.Storage;
    if (Storage) {
      var _addWrongItem = Storage.addWrongItem;
      Storage.addWrongItem = function(item) {
        _addWrongItem.call(Storage, item);
        _setLocalMeta(KEYS.WRONG, _now());
        scheduleSyncUp();
      };
      var _removeWrongItem = Storage.removeWrongItem;
      Storage.removeWrongItem = function(id) {
        _removeWrongItem.call(Storage, id);
        _setLocalMeta(KEYS.WRONG, _now());
        scheduleSyncUp();
      };
      var _setTrack = Storage.setTrack;
      Storage.setTrack = function(track) {
        _setTrack.call(Storage, track);
        _setLocalMeta(KEYS.TRACK, _now());
        scheduleSyncUp();
      };
    }

    // Hook Analytics
    var Analytics = window.TOEIC.Analytics;
    if (Analytics) {
      var _recordAttempt = Analytics.recordAttempt;
      Analytics.recordAttempt = function(part, category, isCorrect) {
        _recordAttempt.call(Analytics, part, category, isCorrect);
        _setLocalMeta(KEYS.STATS, _now());
        scheduleSyncUp();
      };
      var _recordSession = Analytics.recordSession;
      Analytics.recordSession = function(date, mode, track, total, correct) {
        _recordSession.call(Analytics, date, mode, track, total, correct);
        _setLocalMeta(KEYS.HISTORY, _now());
        scheduleSyncUp();
      };
    }
  }

  function onConfigSaved() {
    _setLocalMeta(KEYS.CONFIG, _now());
    scheduleSyncUp();
  }

  // ── init ────────────────────────────────────────────────

  function init() {
    _installHooks();
    window.ToeicAuth.onChange(function(user) {
      if (user) {
        onLogin(user);
      } else {
        onLogout();
      }
    });
    // If already logged in (auth.js auto-login restored), trigger merge
    if (window.ToeicAuth.isLoggedIn && window.ToeicAuth.isLoggedIn()) {
      var u = window.ToeicAuth.getUser();
      if (u) onLogin(u);
    }
  }

  // Auto-init after auth loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 500);
    });
  } else {
    setTimeout(init, 500);
  }

  return {
    syncUp: syncUp,
    syncDown: syncDown,
    scheduleSyncUp: scheduleSyncUp,
    onConfigSaved: onConfigSaved,
    onLogin: onLogin,
    onLogout: onLogout
  };

})();
