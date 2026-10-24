(function (root) {
  var KEY = 'sirtech_intro_seen';
  function shouldShow(storage, search) {
    if (/[?&]replay=1/.test(search || '')) return true;
    try { return !storage.getItem(KEY); } catch (e) { return true; }
  }
  function markSeen(storage) { try { storage.setItem(KEY, '1'); } catch (e) {} }
  var api = { KEY: KEY, shouldShow: shouldShow, markSeen: markSeen };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SirSession = api;
})(this);
