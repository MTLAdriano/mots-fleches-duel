// ── Variables globales requises par arrowwords.js et keyboard.js ──────────

// Variables APP_ (celles qui ne changent pas entre parties)
const APP_GAME_SLUG   = 'arrowwords';
const APP_GAME_ID     = '2026-06-08';
const APP_GAME_LEVEL  = '1';
const APP_FREE_HELPS  = true;
const APP_LIMIT_HELPS = true;
const APP_SHOW_HELPS  = true;
const APP_SHOW_RULES  = false;
const APP_AUTO_SAVE   = false;
const APP_USER        = false;
const APP_IS_MOBILE   = false;
const APP_IS_IOS      = false;
const APP_SHOW_ADS    = false;
const APP_SHOW_BANNER_ADS = false;
const APP_SHOW_PAGE_ADS   = false;
const APP_SHOW_VIEWPAY    = false;
const APP_CAN_PLAY_NEXT   = false;
const APP_CHEAT_ID    = 3;
const APP_CHEAT_COUNT = '15';
const APP_RESTRICT_FULLSCREEN = false;
const APP_IFRAME_ID   = 'mq555e0w';
const APP_VIEW_PAY_ID = '';
const APP_CUSTOM_ORIGIN = null;
const APP_SHOW_LOGIN  = false;
const APP_RANKING_URL = '/classement';
const APP_LOGIN_URL   = '/connexion';
const APP_CHECK_SSO_URL = '/check-sso';
const APP_LOG_D_URL   = '/log-discovery';
const APP_MODAL_URL   = '/modal';
const APP_PLAYER_STAT = '/player-stat';
const APP_ORIGIN      = '';
const API_KEY         = 'u4PUvZHm8yE7La5hZaYgmfmlsR7XJWBo';

// Ces URLs sont relatives à sdk.mygamify.fr — on les préfixe
const APP_CHECK_URL = 'https://sdk.mygamify.fr/mots-fleches/verifier/359';
const APP_QUERY     = '?iframe=mq555e0w&origin=https://jeux.franceinfo.fr/mots-fleches/classique/archives/';
const APP_HELP_URL  = 'https://sdk.mygamify.fr/mots-fleches/aider/359';
const APP_SAVE_URL  = 'https://sdk.mygamify.fr/mots-fleches/sauvegarder/359';
const APP_LOAD_URL  = 'https://sdk.mygamify.fr/mots-fleches/charger/359';

// Stubs pour les fonctions non utilisées dans le duel
function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// Remplace Toastify (non chargé)
if (typeof Toastify === 'undefined') {
  window.Toastify = function(opts) {
    return { showToast: function() {
      if (window.DUEL_TOAST) window.DUEL_TOAST(opts.text || '');
    }};
  };
}

// enterKey utilisé par keyboard.js
function enterKey() {}
