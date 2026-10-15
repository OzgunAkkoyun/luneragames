/**
 * Oyun bağlantı sayfaları (/catunblock, /purrblocks): Android → Google Play, iPhone/iPad → App Store.
 * Hangi mağazada yayında olduğu games.json'dan okunur (uygulamalardaki "Diğer oyunlarımız" ile aynı kaynak):
 * Google Play için `live` + `playStore`, App Store için dolu `appStoreId` gerekir.
 * Masaüstünde ya da oyun o cihazın mağazasında henüz yoksa yönlendirmez; mağaza butonlarını gösterir.
 */
(function () {
  const body = document.body;
  const gameId = body.dataset.game;
  const pkg = body.dataset.package;
  const ua = navigator.userAgent || '';
  // iPadOS Safari kendini Mac olarak tanıtır; dokunmatik olmasından ayırt edilir
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = !isIOS && /Android/i.test(ua);

  const playUrl = 'https://play.google.com/store/apps/details?id=' + pkg;
  const iosUrl = (id) => 'https://apps.apple.com/app/id' + id;

  function render(game) {
    const onPlay = !!game && !!game.live && !!game.playStore;
    const iosId = game && game.appStoreId ? String(game.appStoreId) : null;

    if (isAndroid && onPlay) return location.replace(playUrl);
    if (isIOS && iosId) return location.replace(iosUrl(iosId));

    const play = document.getElementById('storePlay');
    const ios = document.getElementById('storeIos');
    if (onPlay && !isIOS) {
      play.href = playUrl;
      play.hidden = false;
    }
    if (iosId && !isAndroid) {
      ios.href = iosUrl(iosId);
      ios.hidden = false;
    }

    let note = '';
    if (isIOS) note = 'Coming soon to the App Store.';
    else if (isAndroid) note = 'Coming soon to Google Play.';
    else if (!onPlay && !iosId) note = 'Coming soon to Google Play and the App Store.';
    document.getElementById('storeNote').textContent = note;
    body.classList.add('is-ready');
  }

  fetch('/games.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => render((data.games || []).find((g) => g.id === gameId)))
    .catch(() => render({ live: true, playStore: true, appStoreId: null }));
})();
