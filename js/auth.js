// ============================================================
// ToeicAuth — Firebase Google 登入模組 (PWA v2)
// 登入門模式：未登入顯示登入頁，登入後才進 App
// 登入持久化：browserLocalPersistence（關閉再開保持登入）
// ============================================================
window.ToeicAuth = (function() {
  'use strict';

  var FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';
  var SDK_LOADED = false;
  var AUTH_INITIALIZED = false;
  var SDK_TIMEOUT_MS = 15000;

  var auth = null;
  var db = null;
  var currentUser = null;
  var listeners = [];
  var _loginPageShown = false;
  var _startupResolved = false;

  // ── helpers ──

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

  // ── dynamic script loader ──

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

  // ── Startup spinner (shown during auth check) ──

  function showStartupSpinner() {
    var el = document.getElementById('startup-spinner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'startup-spinner';
      el.innerHTML = '<div class="spinner"></div><p style="margin-top:1rem;color:#6c757d;">\u8F09\u5165\u4E2D\u2026</p>';
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'min-height:60vh;padding:2rem;';
      document.getElementById('app').appendChild(el);
    } else {
      el.style.display = '';
    }
  }

  function hideStartupSpinner() {
    var el = document.getElementById('startup-spinner');
    if (el) {
      el.style.display = 'none';
    }
  }

  function showSdkError(msg) {
    var app = document.getElementById('app');
    app.innerHTML = '<div class="login-gate">' +
      '<div class="login-card" style="text-align:center;">' +
        '<h2 style="color:#1a3a5c;">\u670D\u52D9\u9054\u4E0D\u5230</h2>' +
        '<p style="color:#6c757d;margin:1rem 0;">' + escapeHtml(msg) + '</p>' +
        '<button class="login-btn" onclick="location.reload()" style="margin-top:0.5rem;">\u91CD\u65B0\u8F09\u5165</button>' +
      '</div>' +
    '</div>';
  }

  // ── Navbar rendering ──

  function renderNavbar() {
    var el = document.getElementById('toeic-auth-area');
    if (!el) return;
    var user = currentUser;
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
      el.innerHTML = '';
    }
  }

  // ── Login gate page ──

  function showLoginPage() {
    if (_loginPageShown) return;
    _loginPageShown = true;
    hideStartupSpinner();

    var app = document.getElementById('app');
    var offlineMsg = !navigator.onLine
      ? '<p style="color:#dc3545;font-size:0.85rem;margin-top:0.75rem;">\u26A0 \u9700\u9023\u7DDA\u767B\u5165</p>'
      : '';

    app.innerHTML = '<div class="login-gate">' +
      '<div class="login-card">' +
        '<div class="login-logo">TOEIC</div>' +
        '<div class="login-subtitle">\u591A\u76CA\u807D\u529B\u8207\u95B1\u8B80\u7DF4\u7FD2\u5BA4</div>' +
        '<p class="login-desc">\u767B\u5165\u5F8C\u53EF\u540C\u6B65\u7DF4\u7FD2\u8A18\u9304\u3001\u932F\u984C\u672C\u8207\u5F31\u9EDE\u5206\u6790</p>' +
        '<button class="login-btn" onclick="window.ToeicAuth.login()">' +
          '<span class="login-btn-icon">G</span> \u4F7F\u7528 Google \u767B\u5165' +
        '</button>' +
        offlineMsg +
      '</div>' +
    '</div>';

    // Hide bottom bar on login page
    if (window.ToeicPWA) {
      window.ToeicPWA.hideBottomBar();
    }
  }

  function showAppContent() {
    hideStartupSpinner();
    _loginPageShown = false;

    if (window.ToeicPWA) {
      window.ToeicPWA.showBottomBar();
    }

    if (window.ToeicAppGate && typeof window.ToeicAppGate.startApp === 'function') {
      window.ToeicAppGate.startApp();
    }
  }

  // ── auth state ──

  function notifyListeners(user) {
    currentUser = user;
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](user); } catch (e) { /* silent */ }
    }
  }

  // ── App startup gate ──
  // Called by app.js. Waits for onAuthStateChanged, then decides: login page or app.

  function initAppGate(callback) {
    showStartupSpinner();

    // E2E test mode: skip Firebase auth entirely
    if (window.__TOEIC_E2E_MODE) {
      AUTH_INITIALIZED = false;
      _startupResolved = true;
      showAppContent();
      callback(true);
      return;
    }

    // E2E auth mock mode: use window.__mockAuth (provided by test via addInitScript)
    if (window.__TOEIC_E2E_AUTH_MOCKED && window.__mockAuth) {
      auth = window.__mockAuth;
      db = window.__mockDb || {};

      // setPersistence tracking for tests
      if (auth.setPersistence) {
        auth.setPersistence(auth.Auth && auth.Auth.Persistence && auth.Auth.Persistence.LOCAL).catch(function(){});
      }

      AUTH_INITIALIZED = true;

      auth.onAuthStateChanged(function(user) {
        notifyListeners(user);
        renderNavbar();

        if (!_startupResolved) {
          _startupResolved = true;
          if (user) {
            showAppContent();
          } else {
            showLoginPage();
          }
          callback(!!user);
        } else {
          if (user) {
            showAppContent();
            if (window.ToeicSync) window.ToeicSync.onLogin(user);
          } else {
            showLoginPage();
            if (window.ToeicSync) window.ToeicSync.onLogout();
          }
        }
      });

      return;
    }

    if (!isConfigValid()) {
      // No Firebase config → skip login entirely, go straight to app
      AUTH_INITIALIZED = false;
      _startupResolved = true;
      showAppContent();
      callback(true);
      return;
    }

    loadFirebaseSdk().then(function() {
      if (typeof firebase === 'undefined') {
        AUTH_INITIALIZED = false;
        callback(true);
        return;
      }

      try {
        firebase.initializeApp(firebaseConfig);
      } catch (e) {
        if (e.code !== 'app/duplicate-app') {
          console.warn('Firebase init error:', e);
          AUTH_INITIALIZED = false;
          callback(true);
          return;
        }
      }

      auth = firebase.auth();
      db = firebase.firestore();

      // ── Set persistence to LOCAL ──
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(err) {
        console.warn('setPersistence failed:', err);
      });

      AUTH_INITIALIZED = true;

      // Wait for first auth state
      auth.onAuthStateChanged(function(user) {
        notifyListeners(user);
        renderNavbar();

        if (!_startupResolved) {
          _startupResolved = true;
          if (user) {
            // Logged in (even from cache) → show app
            showAppContent();
          } else {
            // No user → show login page
            showLoginPage();
          }
          callback(!!user);
        } else {
          // Subsequent state changes
          if (user) {
            showAppContent();
            if (window.ToeicSync) {
              window.ToeicSync.onLogin(user);
            }
          } else {
            // User signed out → show login page
            showLoginPage();
            if (window.ToeicSync) {
              window.ToeicSync.onLogout();
            }
          }
        }
      });

      // Timeout fallback: if auth state doesn't resolve in time
      setTimeout(function() {
        if (!_startupResolved) {
          _startupResolved = true;
          showSdkError('\u767B\u5165\u670D\u52D9\u56DE\u61C9\u8D85\u6642\uFF0C\u8ACB\u6AA2\u67E5\u7DB2\u8DEF\u5F8C\u91CD\u8A66\u3002');
          callback(false);
        }
      }, SDK_TIMEOUT_MS);

    }).catch(function(err) {
      console.warn('Firebase SDK load failed:', err);
      AUTH_INITIALIZED = false;
      _startupResolved = true;

      // If offline but was previously logged in, Firebase Auth SDK will restore from IndexedDB
      // The onAuthStateChanged above will fire with cached user once SDK loads.
      // If SDK fails entirely, show error.
      showSdkError('\u767B\u5165\u6A21\u7D44\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u91CD\u65B0\u6574\u7406\u3002');
      callback(false);
    });
  }

  // ── Login with popup + redirect fallback ──

  function login() {
    if (!isConfigValid() || !auth) return;

    var provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider).catch(function(err) {
      console.error('\u767B\u5165\u5931\u6557:', err.code, err.message);

      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // Fallback to redirect
        auth.signInWithRedirect(provider).catch(function(err2) {
          console.error('\u8F49\u5C0E\u767B\u5165\u5931\u6557:', err2.message);
          alert('\u767B\u5165\u5931\u6557\uFF0C\u8ACB\u78BA\u8A8D\u7DB2\u8DEF\u9023\u7DDA\u5F8C\u91CD\u8A66\u3002');
        });
      } else if (err.code === 'auth/network-request-failed') {
        alert('\u7DB2\u8DEF\u9023\u7DDA\u5931\u6557\uFF0C\u8ACB\u6AA2\u67E5\u7DB2\u8DEF\u5F8C\u91CD\u8A66\u3002');
      } else {
        alert('\u767B\u5165\u5931\u6557\uFF1A' + (err.message || '\u8ACB\u7A0D\u5F8C\u91CD\u8A66'));
      }
    });
  }

  // Handle redirect result on page load
  function checkRedirectResult() {
    if (!auth) return;
    auth.getRedirectResult().then(function(result) {
      // Handled by onAuthStateChanged
      if (result && result.user) {
        console.log('Redirect login success');
      }
    }).catch(function(err) {
      console.error('Redirect login error:', err.code, err.message);
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

  function hasStarted() {
    return _startupResolved;
  }

  // ── public API ──

  return {
    initAppGate: initAppGate,
    login: login,
    logout: logout,
    getUser: getUser,
    getDb: getDb,
    isLoggedIn: isLoggedIn,
    onChange: onChange,
    checkRedirectResult: checkRedirectResult,
    hasStarted: hasStarted
  };

})();
