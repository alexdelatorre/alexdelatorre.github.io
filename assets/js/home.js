/* Portada: demo en bucle + piezas interactivas de "Más allá del producto" */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Demo en bucle ---------- */
  var DEMO = [
    ['01-ondeck', 0, 1500], ['02-climb', 0, 900], ['03-air', 0, 1300],
    ['04-fish0', 1, 1200, [999.5, 1035]], ['05-fish1', 1, 950, [891.75, 1035]], ['06-fish2', 1, 950, [999.5, 1035]], ['07-fish3', 1, 1400],
    ['08-nav0', 2, 1100, [999.5, 1035]], ['09-nav1', 2, 1200, [999.5, 1035]], ['10-nav2', 2, 1200, [612, 1035]],
    ['11-rec', 3, 1600], ['12-grab', 3, 1700, [855, 1037]]
  ];
  var MODES = ['On Deck', 'Fishing', 'Navigation', 'Recovery'];
  var screen = document.getElementById('demo');
  if (screen) {
    var imgs = DEMO.map(function (f, i) {
      var im = document.createElement('img');
      im.src = 'assets/img/demo/' + f[0] + '.jpg';
      im.alt = '';
      im.decoding = 'async';
      screen.appendChild(im);
      return im;
    });
    var tap = document.createElement('div');
    tap.className = 'demo-tap';
    screen.appendChild(tap);
    var modes = document.querySelectorAll('#demo-modes span');
    var bar = document.getElementById('demo-bar');
    var i = 0, timers = [], visible = true;

    function show(n) {
      imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === n); });
      imgs[n].alt = 'Demo del Caso 01: modo ' + MODES[DEMO[n][1]];
      modes.forEach(function (m, j) { m.classList.toggle('is-on', j === DEMO[n][1]); });
      if (bar) bar.style.width = ((n + 1) / DEMO.length * 100) + '%';
    }
    function step() {
      timers = [];
      var f = DEMO[i];
      show(i);
      if (f[3]) timers.push(setTimeout(function () {
        tap.style.left = (f[3][0] / 1920 * 100) + '%';
        tap.style.top = (f[3][1] / 1080 * 100) + '%';
        tap.classList.remove('is-on'); void tap.offsetWidth; tap.classList.add('is-on');
      }, Math.max(0, f[2] - 420)));
      timers.push(setTimeout(function () {
        i = (i + 1) % DEMO.length;
        if (visible) step(); else timers = [];
      }, f[2]));
    }
    if (reduce) { show(6); }
    else {
      step();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          var was = visible; visible = es[0].isIntersecting;
          if (visible && !was && timers.length === 0) step();
        }).observe(screen);
      }
    }
  }

  /* ---------- Utilidades de pila de imágenes ---------- */
  function setOn(stage, pred) {
    stage.querySelectorAll('img').forEach(function (im, j) { im.classList.toggle('is-on', pred(im, j)); });
  }

  /* Rolê: pestañas */
  document.querySelectorAll('[data-tabs]').forEach(function (card) {
    var stage = card.querySelector('[data-stage]');
    var cap = card.querySelector('[data-caption-out]');
    var tabs = card.querySelectorAll('[role=tab]');
    tabs.forEach(function (t, n) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o, k) { o.setAttribute('aria-selected', k === n ? 'true' : 'false'); });
        setOn(stage, function (im, j) { return j === n; });
        var im = stage.querySelectorAll('img')[n];
        stage.style.background = im.style.background;
        if (cap) cap.textContent = im.getAttribute('data-caption') || '';
      });
    });
    stage.style.background = stage.querySelector('img').style.background;
  });

  /* Ingrid: paginador */
  document.querySelectorAll('[data-pager]').forEach(function (card) {
    var stage = card.querySelector('[data-stage]');
    var pages = stage.querySelectorAll('img');
    var dots = card.querySelector('[data-dots]');
    var count = card.querySelector('[data-count]');
    var n = pages.length, cur = 0;
    var btns = [];
    for (var k = 0; k < n; k++) {
      (function (k) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Página ' + (k + 1));
        b.addEventListener('click', function () { go(k); });
        dots.appendChild(b); btns.push(b);
      })(k);
    }
    function go(k) {
      cur = (k + n) % n;
      setOn(stage, function (im, j) { return j === cur; });
      btns.forEach(function (b, j) { b.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
      if (count) count.textContent = (cur + 1) + ' / ' + n;
    }
    card.querySelector('[data-prev]').addEventListener('click', function () { go(cur - 1); });
    card.querySelector('[data-next]').addEventListener('click', function () { go(cur + 1); });
    go(0);
  });

  /* Lince: colecciones + girar */
  document.querySelectorAll('[data-flip]').forEach(function (card) {
    var stage = card.querySelector('[data-stage]');
    var btn = card.querySelector('[data-flip-btn]');
    var tabs = card.querySelectorAll('[role=tab]');
    var set = 0, back = true;
    function render() {
      setOn(stage, function (im) { return +im.getAttribute('data-set') === set && (im.getAttribute('data-side') === 'back') === back; });
      btn.textContent = (back ? 'Ver frontal' : 'Ver espalda') + ' ↻';
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === set ? 'true' : 'false'); });
    }
    btn.addEventListener('click', function () { back = !back; render(); });
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { set = k; back = true; render(); }); });
    render();
  });
})();
