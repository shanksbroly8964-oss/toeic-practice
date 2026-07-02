// ============================================================
// ToeicAuth — Firebase Google 登入模組
// 隔離設計：僅操作 #toeic-auth-area，不碰任何其他 DOM
// 未登入或 SDK 失敗時全站功能照常走 localStorage
// ============================================================
window.ToeicAuth = (function() {
  'use strict';

  var FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';
  var SDK_LOADED = false;
  var AUTH_INITIALIZED = false;

  var auth = null;
  var db = null;
  var currentUser = null;
  var listeners = [];

  // ── helpers ─────────────────────────────────────────────

  function isPlaceholder(val) {
    return !val || /^YOUR_/.test(val);
  }

  function isConfigValid() {
    try {
      if (typeof firebaseConfig === 'undefined') return false;
      var c = firebaseConfig;
      return !isPlaceholder(c.apiKey) && !isPlaceholder(c.projectId) && !isPlaceholder(c.appId);
    } catch (e) {
      return false;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── dynamic script loader ───────────────────────────────

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = function() { reject(new Error('Failed to load: ' + src)); };
      document.head.appendChild(el);
    });
  }

  function loadFirebaseSdk() {
    if (SDK_LOADED) return Promise.resolve();
    return Promise.all([
      loadScript(FB_CDN + '/firebase-app-compat.js'),
      loadScript(FB_CDN + '/firebase-auth-compat.js'),
      loadScript(FB_CDN + '/firebase-firestore-compat.js')
    ]).then(function() {
      SDK_LOADED = true;
    });
  }

  // ── UI rendering ────────────────────────────────────────

  function render() {
    var el = document.getElementById('toeic-auth-area');
    if (!el) return;
    var user = getUser();
    if (user) {
      var avatar = user.photoURL ? escapeHtml(user.photoURL) : '';
      var name = user.displayName || user.email || '\u4F7F\u7528\u8005';
      el.innerHTML =
        '<span class="toeic-auth-user" style="display:flex;align-items:center;gap:6px;">' +
          (avatar ? '<img src="' + avatar + '" alt="" style="width:24px;height:24px;border-radius:50%;">' : '') +
          '<span class="toeic-auth-name" style="font-size:13px;color:#fff;">' + escapeHtml(name) + '</span>' +
          '<button class="toeic-auth-btn toeic-auth-logout" onclick="window.ToeicAuth.logout()" ' +
            'style="margin-left:8px;padding:3px 10px;border:1px solid rgba(255,255,255,0.5);border-radius:3px;' +
            'background:transparent;color:#fff;cursor:pointer;font-size:12px;">' +
            '\u767B\u51FA</button>' +
        '</span>';
    } else {
      if (AUTH_INITIALIZED) {
        el.innerHTML =
          '<button class="toeic-auth-btn toeic-auth-login" onclick="window.ToeicAuth.login()" ' +
            'style="display:flex;align-items:center;gap:6px;padding:4px 14px;border:none;border-radius:3px;' +
            'background:#fff;color:#1a3a5c;cursor:pointer;font-size:13px;font-weight:500;">' +
            '<span style="font-weight:700;font-size:14px;">G</span> ' + '\u767B\u5165' +
          '</button>';
      } else {
        el.innerHTML =
          '<button class="toeic-auth-btn toeic-auth-loading" disabled ' +
            'style="padding:4px 14px;border:1px solid rgba(255,255,255,0.3);border-radius:3px;' +
            'background:transparent;color:rgba(255,255,255,0.5);cursor:default;font-size:13px;">' +
            '\u8F09\u5165\u4E2D...' +
          '</button>';
      }
    }
  }

  // ── auth state ──────────────────────────────────────────

  function notifyListeners(user) {
    currentUser = user;
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](user); } catch (e) { /* silent */ }
    }
  }

  // ── public API ──────────────────────────────────────────

  function init() {
    if (!isConfigValid()) {
      render();
      return;
    }

    loadFirebaseSdk().then(function() {
      if (typeof firebase === 'undefined') {
        AUTH_INITIALIZED = false;
        render();
        return;
      }

      try {
        firebase.initializeApp(firebaseConfig);
      } catch (e) {
        if (e.code !== 'app/duplicate-app') {
          console.warn('Firebase init error:', e);
          AUTH_INITIALIZED = false;
          render();
          return;
        }
      }

      auth = firebase.auth();
      db = firebase.firestore();

      auth.onAuthStateChanged(function(user) {
        notifyListeners(user);
        render();
        if (user && window.ToeicSync) {
          window.ToeicSync.onLogin(user);
        }
      });

      AUTH_INITIALIZED = true;
      render();
    }).catch(function(err) {
      console.warn('Firebase SDK load failed:', err);
      AUTH_INITIALIZED = false;
      render();
    });
  }

  function login() {
    if (!isConfigValid() || !auth) return;
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function(err) {
      console.error('\u767B\u5165\u5931\u6557:', err.message || err);
    });
  }

  function logout() {
    if (!auth) return;
    auth.signOut().catch(function(err) {
      console.error('\u767B\u51FA\u5931\u6557:', err.message || err);
    });
  }

  function getUser() {
    return currentUser || null;
  }

  function getDb() {
    return db;
  }

  function isLoggedIn() {
    return !!(currentUser && db && AUTH_INITIALIZED);
  }

  function onChange(callback) {
    if (typeof callback !== 'function') return;
    listeners.push(callback);
    if (currentUser !== undefined && currentUser !== null) {
      try { callback(currentUser); } catch (e) { /* silent */ }
    }
  }

  // ── auto-init ───────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init: init,
    login: login,
    logout: logout,
    getUser: getUser,
    getDb: getDb,
    isLoggedIn: isLoggedIn,
    onChange: onChange
  };

})();
