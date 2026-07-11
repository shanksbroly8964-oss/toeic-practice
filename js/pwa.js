// ============================================================
// ToeicPWA — PWA 功能模組：底部分頁列、安裝提示、iOS 引導
// ============================================================
window.ToeicPWA = (function() {
  'use strict';

var _deferredPrompt = null;
var _bottomBar = null;
var _installBanner = null;
var _authBlocked = true;

  // ── iOS detection ──
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           navigator.standalone;
  }

  // ── Bottom Tab Bar ──
  function createBottomBar() {
    if (_bottomBar) return;

    _bottomBar = document.createElement('div');
    _bottomBar.id = 'toeic-bottom-bar';

    function tab(label, icon, action) {
      var btn = document.createElement('button');
      btn.className = 'bottom-tab-btn';
      btn.innerHTML = '<span class="bottom-tab-icon">' + icon + '</span><span class="bottom-tab-label">' + label + '</span>';
      btn.addEventListener('click', action);
      return btn;
    }

    _bottomBar.appendChild(tab('\u7DF4\u7FD2', '\uD83C\uDFAF', function() {
      TOEIC.App.goHome();
    }));
    _bottomBar.appendChild(tab('\u7D9C\u5408', '\uD83D\uDCCA', function() {
      TOEIC.App.startCompositePractice();
    }));
    _bottomBar.appendChild(tab('\u5F31\u9EDE', '\uD83D\uDCD6', function() {
      TOEIC.App.openAnalytics();
    }));
    _bottomBar.appendChild(tab('\u932F\u984C\u672C', '\u270D\uFE0F', function() {
      TOEIC.App.openWrongBook();
    }));
    _bottomBar.appendChild(tab('\u8A2D\u5B9A', '\u2699\uFE0F', function() {
      TOEIC.App.openSettings();
    }));

    document.body.appendChild(_bottomBar);
  }

  function showBottomBar() {
    _authBlocked = false;
    if (_bottomBar) {
      _bottomBar.style.display = '';
    }
  }

  function hideBottomBar() {
    _authBlocked = true;
    if (_bottomBar) {
      _bottomBar.style.display = 'none';
    }
  }

  // ── Install prompt ──
  function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      _deferredPrompt = e;
      showInstallBanner();
    });

    window.addEventListener('appinstalled', function() {
      _deferredPrompt = null;
      dismissInstallBanner();
      localStorage.setItem('toeic_pwa_installed', '1');
    });
  }

  function showInstallBanner() {
    if (isStandalone()) return;
    if (_installBanner) return;
    if (localStorage.getItem('toeic_pwa_hint_dismissed')) return;
    if (localStorage.getItem('toeic_pwa_installed')) return;

    _installBanner = document.createElement('div');
    _installBanner.id = 'pwa-install-banner';

    var text = document.createElement('span');
    text.textContent = '\uD83D\uDCF1 \u5B89\u88DD App\uFF0C\u96E2\u7DDA\u4E5F\u80FD\u7DF4\u7FD2\uFF01';

    var actions = document.createElement('div');
    actions.className = 'pwa-install-actions';

    var installBtn = document.createElement('button');
    installBtn.className = 'pwa-install-btn';
    installBtn.textContent = '\u5B89\u88DD';
    installBtn.addEventListener('click', function() {
      if (_deferredPrompt) {
        _deferredPrompt.prompt();
        _deferredPrompt.userChoice.then(function(choiceResult) {
          _deferredPrompt = null;
          dismissInstallBanner();
          if (choiceResult.outcome === 'accepted') {
            localStorage.setItem('toeic_pwa_installed', '1');
          }
        });
      }
    });

    var closeBtn = document.createElement('button');
    closeBtn.className = 'pwa-close-btn';
    closeBtn.textContent = '\u2715';
    closeBtn.addEventListener('click', function() {
      dismissInstallBanner();
      localStorage.setItem('toeic_pwa_hint_dismissed', '1');
    });

    actions.appendChild(installBtn);
    actions.appendChild(closeBtn);
    _installBanner.appendChild(text);
    _installBanner.appendChild(actions);

    document.body.appendChild(_installBanner);
  }

  function showIOSGuide() {
    if (!isIOS()) return;
    if (isStandalone()) return;
    if (localStorage.getItem('toeic_pwa_hint_dismissed')) return;
    if (localStorage.getItem('toeic_pwa_installed')) return;

    _installBanner = document.createElement('div');
    _installBanner.id = 'pwa-install-banner';
    _installBanner.className = 'pwa-ios-guide';

    var text = document.createElement('span');
    text.textContent = '\u9EDE\u4E0B\u65B9\u5206\u4EAB\u9215 \u2192 \u300C\u52A0\u5165\u4E3B\u756B\u9762\u300D\uFF0C\u96E2\u7DDA\u4E5F\u80FD\u7DF4\u7FD2';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'pwa-close-btn';
    closeBtn.textContent = '\u2715';
    closeBtn.addEventListener('click', function() {
      dismissInstallBanner();
      localStorage.setItem('toeic_pwa_hint_dismissed', '1');
    });

    _installBanner.appendChild(text);
    _installBanner.appendChild(closeBtn);

    document.body.appendChild(_installBanner);
  }

  function dismissInstallBanner() {
    if (_installBanner) {
      _installBanner.remove();
      _installBanner = null;
    }
  }

  // ── Init ──
  function init() {
    createBottomBar();
    hideBottomBar();
    initInstallPrompt();

    var isMobile = window.matchMedia('(max-width: 768px)');

    isMobile.addEventListener('change', function(e) {
      if (!_authBlocked) {
        if (e.matches) {
          showBottomBar();
        } else {
          hideBottomBar();
        }
      }
    });

    window.addEventListener('resize', function() {
      if (_authBlocked) return;
      if (window.innerWidth <= 768) {
        showBottomBar();
      } else {
        hideBottomBar();
      }
    });
  }

  // ── Public API ──
  return {
    init: init,
    showBottomBar: showBottomBar,
    hideBottomBar: hideBottomBar,
    showInstallBanner: showInstallBanner
  };

})();
