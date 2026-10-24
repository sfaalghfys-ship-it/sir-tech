(function () {
  var S = window.SirSession, intro = document.getElementById('intro');
  if (!intro || !S.shouldShow(sessionStorage, location.search)) { if (intro) intro.hidden = true; return; }
  var v = document.getElementById('introVideo'), playBtn = document.getElementById('playBtn'), t;
  function end() {
    clearTimeout(t); S.markSeen(sessionStorage); v.pause();
    intro.classList.add('done'); document.body.classList.remove('lock');
    setTimeout(function () { intro.hidden = true; }, 900);
  }
  document.body.classList.add('lock');
  v.muted = true;
  var p = v.play();
  if (p && p.catch) p.catch(function () { playBtn.hidden = false; });
  playBtn.onclick = function () { v.play(); playBtn.hidden = true; };
  document.getElementById('skipBtn').onclick = end;
  document.getElementById('introStart').onclick = function () { S.markSeen(sessionStorage); location.href = 'login.html'; };
  t = setTimeout(end, 7000); // مدة الافتتاحية ≈ 7 ثوانٍ
})();
