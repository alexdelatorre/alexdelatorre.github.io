/* ==========================================================================
   Caso 01 — misión simulada con los componentes reales de FE Test.
   El escenario trabaja en coordenadas de 1920×1080 (las del archivo de Figma)
   y se escala al tamaño disponible.
   ========================================================================== */
(function () {
  var IMG = '../assets/img/fe/';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var ORDER = ['briefing', 'ondeck', 'fishing', 'navigation', 'recovery', 'close'];
  var LABEL = { briefing: 'Briefing', ondeck: 'On Deck', fishing: 'Fishing', navigation: 'Navigation', recovery: 'Recovery', close: 'Cierre' };
  var NEXT = { briefing: 'ondeck', ondeck: 'fishing', fishing: 'navigation', navigation: 'recovery', recovery: 'close', close: 'briefing' };
  var PLATE = { briefing: 'ondeck', ondeck: 'ondeck', fishing: 'fishing', navigation: 'navigation', recovery: 'recovery', close: 'recovery' };
  var TITLE = { briefing: 'ON DECK', ondeck: 'ON DECK', fishing: 'FISHING', navigation: 'NAVIGATION', recovery: 'RECOVERY', close: 'RECOVERY' };
  var TYPES = ['grass', 'bird', 'fish', 'floatsam'];
  var TNAME = { grass: 'Grass', bird: 'Bird', fish: 'Fish', floatsam: 'Floatsam' };
  var GBOX = { grass: 75.6, bird: 80.5, fish: 65.7, floatsam: 65.7 };
  var GCX = { grass: 783.5, bird: 891.75, fish: 999.5, floatsam: 1107.5 };
  var SLOTS = { fish: [[684, 107], [1253, 246], [909, 384]], grass: [[396, 269]], bird: [[1115, 518]], floatsam: [[325, 676], [728, 700], [506, 961]] };
  var EXTRA = [[560, 470], [1330, 420], [820, 230], [230, 470], [1010, 610], [1180, 760], [640, 860], [1500, 300]];
  var SEED = ['fish', 'grass', 'fish', 'fish', 'bird', 'floatsam', 'floatsam', 'floatsam'];

  var TEXT = {
    briefing: ['Briefing', 'Un vigía que no se cansa', 'FE quería sustituir al vigía de la pesca deportiva por un dron atado al barco. El QGroundControl de serie no servía para eso, así que rehicimos su capa de modos. La pantalla es esa capa, con sus componentes reales.', 'Comenzar misión →'],
    ondeck: ['Paso 1 — On Deck', 'Despegar en tres gestos', 'Cada control se enciende cuando el anterior termina. Despegar no es un botón sino un deslizador, para que un toque accidental no levante el dron. Recovery está gris: no hay nada que recuperar.'],
    fishing: ['Paso 2 — Fishing', 'Ahora el vigía eres tú', 'Los cuatro botones de la barra marcan lo que ve la cámara: hierba, aves, peces o restos flotantes. Cada marca cae en el mapa, en el orden en que la pones.'],
    navigation: ['Paso 3 — Navigation', 'De marca en marca, sin arrastrar', 'Los mismos cuatro botones cambian de función: cada pulsación centra el mapa en la siguiente marca de ese tipo, en orden de colocación. Nada de buscar a mano sobre la carta.'],
    recovery: ['Paso 4 — Recovery', 'El agarre espera a la altura', 'La escala solo cubre los últimos 10 ft, la zona de influencia del barco. GRAB sigue gris hasta unos 5 ft, la altura cómoda para sujetar el dron mientras se desarma. Recovery se ha apagado: ya estás recuperando.'],
    close: ['Cierre', 'No es consistencia. Es jerarquía.', 'Recovery se apagó exactamente cuando debía. Man Overboard no se apagó nunca: ni despegando, ni aterrizando, ni sin cable. Esa diferencia, escrita en qué botón se apaga y cuál no, es la arquitectura entera.', 'Repetir misión ↺']
  };
  var ALERT = {
    mob: ['Man Overboard', 'Persona al agua.', 'Da igual en qué punto estuvieras: despegando, pescando, aterrizando o sin cable. Este botón no se apaga nunca, porque en este momento nada más importa.', 'Volver a la misión ↩'],
    emergency: ['Emergency Recovery', 'Se ha perdido el cable.', 'El dron pasa a batería: el enlace del cable se rompe en el icono de estado y el notch se pone en rojo. GRAB y ABORT se apagan. Queda un único control vivo: Man Overboard, abajo a la derecha.', 'Restablecer cable']
  };

  var console_ = $('console');
  if (!console_) return;

  /* ---------- Construcción del escenario ---------- */
  var stage = $('m-stage');
  var ticks = '';
  for (var t = 0; t <= 20; t++) {
    var long = t % 5 === 0;
    ticks += '<div class="abs" style="left:' + (long ? 1852 : 1863) + 'px;top:' + (143 + t * 30) + 'px;width:' + (long ? 34 : 23) + 'px;height:2px;background:#FFF"></div>';
  }
  var mk = TYPES.map(function (k) {
    return '<button class="ui mk" data-type="' + k + '" style="left:' + (GCX[k] - 35.5) + 'px" aria-label="' + TNAME[k] + '">' +
      '<img src="' + IMG + 'btn-' + k + '.svg" alt="" style="position:absolute;left:' + (35.5 - GBOX[k] / 2) + 'px;top:' + (23.5 - GBOX[k] / 2) + 'px;width:' + GBOX[k] + 'px;height:' + GBOX[k] + 'px">' +
      '<span>' + TNAME[k] + '</span></button>';
  }).join('');
  stage.innerHTML =
    '<img class="plate" id="plate" alt="" src="' + IMG + 'ondeck.jpg">' +
    '<div class="abs" id="mini" style="left:1424px;top:797px;width:486px;height:273px;border-radius:15px;overflow:hidden"></div>' +
    '<div class="abs" id="navlayer" style="left:0;top:0;width:1920px;height:1080px;clip-path:polygon(0 85px,712px 85px,712px 104px,760px 110px,1160px 110px,1208px 104px,1208px 85px,1920px 85px,1920px 1080px,0 1080px)"><div id="navmk"></div><div class="reticle" id="reticle" style="opacity:0;left:885px;top:465px"></div></div>' +
    '<div class="notch-title" id="notch"></div>' +
    '<div class="tele" style="left:1234px"><span>Ground Speed</span><span id="speed"></span></div>' +
    '<div class="tele" style="left:1384px"><span>Altitude</span><span id="alt-top"></span></div>' +
    '<img class="abs" id="tether" alt="" src="' + IMG + 'tether.png" style="left:105px;top:15px;width:287px;height:55px">' +
    '<div id="height">' +
      '<div class="abs" style="left:0;top:0;width:1920px;height:1080px;opacity:.85;pointer-events:none">' +
        '<div class="abs" style="left:1825px;top:115px;width:85px;height:657px;border-radius:42.5px;background:#222"></div>' +
        '<div class="abs" id="h-tab" style="left:1768px;width:58px;height:57px;border-radius:10px 0 0 10px;background:#222"></div>' +
        '<div class="abs" id="h-patch" style="left:1825px;width:43.5px;background:#222"></div>' +
        '<div class="abs" id="h-f1" style="left:1815px;width:11px;height:10px;background:radial-gradient(circle at 0 0,transparent 10px,#222 10.6px)"></div>' +
        '<div class="abs" id="h-f2" style="left:1815px;width:11px;height:10px;background:radial-gradient(circle at 0 100%,transparent 10px,#222 10.6px)"></div>' +
      '</div>' +
      '<div class="abs" id="halo" style="left:1851px;width:34px;background:linear-gradient(to top,#C30909 0px,#D9CD2D 300px,#18D62B 600px);background-size:34px 600px;background-position:bottom;opacity:.35;filter:blur(14px)"></div>' +
      '<div class="abs" style="left:1878px;top:144px;width:7px;height:600px;background:linear-gradient(to top,#C30909 0%,#D9CD2D 50%,#18D62B 100%)"></div>' +
      '<div class="abs" style="left:1885px;top:143px;width:3px;height:602px;background:#FFF"></div>' + ticks +
      '<div class="abs" id="device" style="left:1768px;width:57px;height:57px;padding:6px 4px 6px 6px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">' +
        '<img src="' + IMG + 'device.svg" alt="" style="width:47px;height:26px"><span id="alt-dev" style="font-size:12px;line-height:15px"></span></div>' +
    '</div>' +
    '<button class="ui" id="rec" aria-label="Recovery"><img id="rec-img" alt="" src="' + IMG + 'recovery.svg" style="width:72px;height:63px"></button>' +
    '<div id="markers">' + mk + '</div>' +
    '<div id="grababort">' +
      '<button class="ui b125" id="grab" style="left:792.5px" aria-label="Grab"><b>GRAB</b><small>DISARM</small></button>' +
      '<button class="ui b125" id="abort" style="left:1002.5px" aria-label="Abort"><b>ABORT</b></button>' +
    '</div>' +
    '<button class="ui" id="mob" aria-label="Man Overboard"><img id="mob-img" alt="" src="' + IMG + 'mob.svg" style="width:72px;height:63px"></button>' +
    '<div class="toast" id="toast"><i></i>Grab altitude reached</div>' +
    '<div class="coach" id="coach"></div>';

  var screenEl = $('m-screen');
  function fit() { var w = screenEl.clientWidth; stage.style.transform = 'scale(' + (w / 1920) + ')'; }
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(screenEl); else window.addEventListener('resize', fit);
  fit();

  /* Pasos */
  var stepsNav = $('m-steps');
  ORDER.forEach(function (id) {
    var b = document.createElement('button');
    b.textContent = LABEL[id]; b.dataset.step = id;
    b.addEventListener('click', function () { goTo(id); });
    stepsNav.appendChild(b);
  });

  /* ---------- Estado ---------- */
  var S, altTimer = null, fadeTimer = null, flashTimer = null;
  function fresh() { return { step: 'briefing', fading: false, overlay: null, prev: null, armed: false, slide: 0, climbing: false, launched: false, alt: 0, markers: [], used: {}, seeded: false, navIdx: {}, navFocus: null, navMsg: '', flash: null, mobCount: 0 }; }
  S = fresh();
  function set(p) { for (var k in p) S[k] = p[k]; render(); }

  function stopAlt() { if (altTimer) { cancelAnimationFrame(altTimer); altTimer = null; } }
  function runAlt(from, to, dur, done) {
    stopAlt();
    if (reduce) { set({ alt: to }); if (done) done(); return; }
    var t0 = performance.now();
    function tick(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      set({ alt: from + (to - from) * e });
      if (k < 1) altTimer = requestAnimationFrame(tick); else { altTimer = null; if (done) done(); }
    }
    altTimer = requestAnimationFrame(tick);
  }
  function goTo(id) {
    clearTimeout(fadeTimer);
    set({ fading: true });
    fadeTimer = setTimeout(function () { enter(id); }, reduce ? 0 : 180);
  }
  function enter(id) {
    stopAlt();
    var base = { step: id, fading: false, overlay: null, prev: null };
    if (id === 'briefing') { S = fresh(); render(); return; }
    if (id === 'ondeck') return set(Object.assign(base, { armed: false, slide: 0, climbing: false, launched: false, alt: 0 }));
    if (id === 'fishing') return set(Object.assign(base, { alt: 50, markers: S.seeded ? [] : S.markers, used: S.seeded ? {} : S.used, seeded: false }));
    if (id === 'navigation') {
      var extra = {};
      if (!S.markers.length) {
        var seeded = [], cnt = {};
        SEED.forEach(function (t) { var n = cnt[t] || 0; cnt[t] = n + 1; seeded.push({ type: t, x: SLOTS[t][n][0], y: SLOTS[t][n][1] }); });
        extra = { markers: seeded, seeded: true };
      }
      return set(Object.assign(base, { alt: 50, navIdx: {}, navFocus: null, navMsg: '' }, extra));
    }
    if (id === 'recovery') { set(Object.assign(base, { alt: 50 })); runAlt(50, 4, 5200); return; }
    if (id === 'close') return set(Object.assign(base, { alt: 0 }));
  }

  /* ---------- Acciones ---------- */
  function isEmergency() { return S.overlay === 'emergency' || (S.overlay === 'mob' && S.prev === 'emergency'); }
  function isAir() { return !isEmergency() && (S.step === 'fishing' || S.step === 'navigation'); }

  $('rec').addEventListener('click', function () { if (isAir()) goTo('recovery'); });
  $('mob').addEventListener('click', function () { if (S.overlay !== 'mob') set({ overlay: 'mob', prev: S.overlay, mobCount: S.mobCount + 1 }); });
  $('grab').addEventListener('click', function () { if (grabReady()) goTo('close'); });
  $('abort').addEventListener('click', function () {
    if (S.overlay) return;
    if (S.step === 'recovery') goTo('navigation');
    else if (S.step === 'ondeck') { stopAlt(); set({ armed: false, slide: 0, climbing: false, launched: false, alt: 0 }); }
  });
  document.querySelectorAll('#markers .mk').forEach(function (b) {
    b.addEventListener('click', function () { pressMarker(b.dataset.type); });
  });
  function pressMarker(t) {
    if (S.overlay) return;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { set({ flash: null }); }, 220);
    if (S.step === 'fishing') {
      if (S.markers.length >= 12) return set({ flash: t });
      var used = Object.assign({}, S.used), n = used[t] || 0, pos;
      if (n < SLOTS[t].length) pos = SLOTS[t][n];
      else { pos = EXTRA[(used.extra || 0) % EXTRA.length]; used.extra = (used.extra || 0) + 1; }
      used[t] = n + 1;
      set({ flash: t, markers: S.markers.concat([{ type: t, x: pos[0], y: pos[1] }]), used: used });
    } else if (S.step === 'navigation') {
      var list = S.markers.filter(function (m) { return m.type === t; });
      if (!list.length) return set({ flash: t, navMsg: 'No hay marcas de tipo ' + TNAME[t] + '.' });
      var prev = S.navIdx[t], idx = prev === undefined ? 0 : (prev + 1) % list.length, p = list[idx];
      var ni = Object.assign({}, S.navIdx); ni[t] = idx;
      set({ flash: t, navIdx: ni, navFocus: { x: p.x, y: p.y }, navMsg: 'Centrado en ' + TNAME[t] + ' ' + (idx + 1) + ' de ' + list.length + ', en orden de colocación.' });
    }
  }
  function grabReady() { return S.step === 'recovery' && !S.overlay && S.alt <= 5; }

  $('intro-btn').addEventListener('click', function () { goTo(NEXT[S.step]); });
  document.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { goTo(b.dataset.go); }); });
  document.querySelectorAll('[data-cut]').forEach(function (b) { b.addEventListener('click', function () { set({ overlay: 'emergency' }); }); });
  $('alert-exit').addEventListener('click', function () {
    if (S.overlay === 'mob') set({ overlay: S.prev, prev: null }); else set({ overlay: null, prev: null });
  });
  $('mini-prev').addEventListener('click', function () { goTo(ORDER[(ORDER.indexOf(S.step) + ORDER.length - 1) % ORDER.length]); });
  $('mini-next').addEventListener('click', function () { goTo(NEXT[S.step]); });

  /* On Deck: armar → deslizar → ascender */
  var slider = $('slider');
  $('arm').addEventListener('click', function () { set({ armed: true }); });
  $('continue').addEventListener('click', function () { goTo('fishing'); });
  slider.addEventListener('input', function () {
    if (!S.armed || S.launched || S.climbing) return;
    var v = Number(slider.value);
    if (v >= 96) {
      set({ slide: 100, climbing: true });
      runAlt(0, 50, 3200, function () { set({ climbing: false, launched: true }); });
    } else set({ slide: v });
  });
  function release() { if (!S.climbing && !S.launched && S.slide < 96) set({ slide: 0 }); }
  ['change', 'pointerup', 'touchend', 'blur'].forEach(function (ev) { slider.addEventListener(ev, release); });

  var compact = window.matchMedia('(orientation: landscape) and (max-height: 540px)');
  if (compact.addEventListener) compact.addEventListener('change', function () { render(); });

  /* ---------- Render ---------- */
  var miniEl = $('mini'), navEl = $('navmk'), plateEl = $('plate');
  var drawnMini = 0, drawnNav = 0, lastPlate = '';
  function css(el, s) { el.style.cssText = s; }
  function show(el, on) { el.style.display = on ? '' : 'none'; }

  function render() {
    var cur = S.step, ov = S.overlay, emer = isEmergency(), air = isAir(), deck = !air;
    var txt = ov ? ALERT[ov] : TEXT[cur];

    // Cabecera
    stepsNav.querySelectorAll('button').forEach(function (b) { if (b.dataset.step === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $('m-progress').style.width = (ORDER.indexOf(cur) / (ORDER.length - 1) * 100) + '%';
    console_.classList.toggle('is-alert', !!ov);
    $('m-flag').classList.toggle('is-alert', !!ov);
    $('m-flag-text').textContent = ov === 'mob' ? 'PERSONA AL AGUA' : (emer ? 'CABLE PERDIDO' : 'UX Architect');
    $('m-body').classList.toggle('is-fading', S.fading);
    $('mini-count').textContent = (ORDER.indexOf(cur) + 1) + ' / ' + ORDER.length;
    $('mini-label').textContent = ov === 'mob' ? 'MOB' : (emer ? 'Emergency' : LABEL[cur]);

    // Fondo
    var plate = emer ? 'emergency' : PLATE[cur];
    if (plate !== lastPlate) { plateEl.src = IMG + plate + '.jpg'; lastPlate = plate; }
    plateEl.alt = 'Pantalla ' + (emer ? 'EMERGENCY RECOVERY' : TITLE[cur]) + ' de la integración de FE sobre QGroundControl';

    // Marcas: minimapa (Fishing) y carta (Navigation)
    var showMini = cur === 'fishing' && !emer, showNav = cur === 'navigation' && !emer;
    show(miniEl, showMini); show($('navlayer'), showNav);
    if (S.markers.length < drawnMini) { miniEl.innerHTML = ''; drawnMini = 0; }
    if (S.markers.length < drawnNav) { navEl.innerHTML = ''; drawnNav = 0; }
    if (showMini) while (drawnMini < S.markers.length) {
      var m = S.markers[drawnMini++], mx = (m.x + 20) / 1920 * 486, my = (m.y + 21) / 1080 * 273;
      miniEl.insertAdjacentHTML('beforeend', '<img class="map-mk" alt="" src="' + IMG + 'marker-' + m.type + '.svg" style="left:' + (mx - 17.5) + 'px;top:' + (my - 17.5) + 'px;width:35px;height:35px">');
    }
    if (showNav) while (drawnNav < S.markers.length) {
      var n = S.markers[drawnNav++];
      navEl.insertAdjacentHTML('beforeend', '<img class="map-mk" alt="" src="' + IMG + 'marker-' + n.type + '.svg" style="left:' + (n.x - 48) + 'px;top:' + (n.y - 48) + 'px;width:96px;height:96px">');
    }
    if (!showMini) { miniEl.innerHTML = ''; drawnMini = 0; }
    if (!showNav) { navEl.innerHTML = ''; drawnNav = 0; }
    var f = S.navFocus, ret = $('reticle');
    ret.style.opacity = f ? 1 : 0;
    if (f) { ret.style.left = (f.x - 75) + 'px'; ret.style.top = (f.y - 75) + 'px'; }

    // Notch y telemetría
    var notch = $('notch'), two = !!ov;
    notch.textContent = ov === 'mob' ? 'MAN\nOVERBOARD' : (emer ? 'EMERGENCY\nRECOVERY' : TITLE[cur]);
    notch.style.top = two ? '7.4px' : '23.8px'; notch.style.fontSize = two ? '48px' : '60px'; notch.style.lineHeight = two ? '46px' : '60px';
    var alt = S.alt || 0, altText = Math.round(alt) + ' ft';
    $('speed').textContent = air ? '35 mph' : '0 mph';
    $('alt-top').textContent = altText; $('alt-dev').textContent = altText;
    show($('tether'), cur === 'ondeck' && (S.climbing || S.launched));

    // Indicador de altura (0–10 ft) con la pestaña del dron integrada
    show($('height'), deck);
    if (deck) {
      var levelY = 744 - Math.max(0, Math.min(1, alt / 10)) * 600;
      var ty = Math.min(Math.max(levelY - 28.5, 115), 772 - 57), tb = ty + 57;
      var pTop = ty < 157.5 ? 115 : ty, pBot = tb > 729.5 ? 772 : tb;
      $('h-tab').style.top = ty + 'px';
      $('h-patch').style.top = pTop + 'px'; $('h-patch').style.height = (pBot - pTop) + 'px';
      show($('h-f1'), ty > 115.5); $('h-f1').style.top = (ty - 10) + 'px';
      show($('h-f2'), tb < 771.5); $('h-f2').style.top = tb + 'px';
      $('halo').style.top = levelY + 'px'; $('halo').style.height = Math.max(0, 744 - levelY) + 'px';
      $('device').style.top = ty + 'px';
    }

    // Barra inferior
    var recOk = air, rec = $('rec');
    rec.disabled = !recOk;
    $('rec-img').src = IMG + (recOk ? 'recovery.svg' : 'recovery-off.svg');
    rec.style.left = air ? '576px' : '585.5px'; rec.style.top = air ? '1003.5px' : '1006px';
    rec.title = emer ? 'Sin cable: Recovery no disponible' : (cur === 'ondeck' ? 'Despegando: nada que recuperar' : (cur === 'recovery' ? 'Ya estás recuperando' : 'Recovery'));
    show($('markers'), air);
    document.querySelectorAll('#markers .mk').forEach(function (b) { b.classList.toggle('is-flash', S.flash === b.dataset.type); });
    show($('grababort'), deck);
    var gr = grabReady(), g = $('grab'), a = $('abort');
    g.disabled = !gr;
    g.style.background = gr ? '#1A4E66' : '#223F4D'; g.style.color = gr ? '#FFFFFF' : '#595959';
    a.disabled = emer;
    a.style.background = emer ? '#732226' : '#BF242C'; a.style.color = emer ? '#595959' : '#FFFFFF';
    var mob = $('mob');
    mob.style.left = air ? '1272px' : '1262.5px'; mob.style.top = air ? '1003.5px' : '1006px';
    $('mob-img').classList.toggle('pulse', ov === 'mob');
    show($('toast'), gr);

    // Guía de interacción
    var coach = null;
    if (!ov) {
      if (cur === 'fishing' && !S.markers.length) coach = [736, 992, 420, 86];
      if (cur === 'navigation' && !f) coach = [736, 992, 420, 86];
      if (cur === 'navigation' && f) coach = [562, 990, 100, 88];
      if (cur === 'recovery' && gr) coach = [782, 997, 145, 80];
    }
    show($('coach'), !!coach);
    if (coach) css($('coach'), 'left:' + coach[0] + 'px;top:' + coach[1] + 'px;width:' + coach[2] + 'px;height:' + coach[3] + 'px');

    // Velo de introducción / cierre
    var intro = !ov && (cur === 'briefing' || cur === 'close');
    show($('m-veil'), intro);
    $('veil-eyebrow').textContent = cur === 'close' ? 'Misión completada' : 'Caso 01 — Misión simulada';
    $('veil-title').textContent = cur === 'close' ? 'Recovery se apagó cuando debía. Man Overboard, nunca.' : 'Pilota la capa de modos que diseñamos para FE.';

    // Franja narrativa
    $('s-eyebrow').textContent = txt[0]; $('s-eyebrow').classList.toggle('is-alert', !!ov);
    $('s-title').textContent = txt[1]; $('s-body').textContent = txt[2];
    var ctl = ov ? 'alert' : (intro ? 'intro' : cur);
    document.querySelectorAll('[data-ctl]').forEach(function (d) { d.classList.toggle('is-on', d.dataset.ctl === ctl); });
    $('intro-btn').textContent = TEXT[cur][3] || '';
    $('intro-hint').textContent = cur === 'briefing' ? 'Man Overboard funciona en cualquier momento. Pruébalo.'
      : (S.mobCount > 0 ? 'Pulsaste Man Overboard ' + S.mobCount + (S.mobCount === 1 ? ' vez' : ' veces') + '. Respondió siempre.' : 'No has pulsado Man Overboard. Repite y pruébalo en mitad de un aterrizaje.');
    if (ov) $('alert-exit').textContent = ALERT[ov][3];

    // On Deck
    $('arm').disabled = S.armed; $('arm').textContent = S.armed ? '1 · Armado' : '1 · Armar';
    $('continue').disabled = !S.launched;
    slider.disabled = !S.armed || S.launched || S.climbing;
    if (Number(slider.value) !== S.slide) slider.value = S.slide;
    var narrow = compact.matches;
    $('slide-label').textContent = !S.armed ? (narrow ? 'Arma primero' : '2 · Arma primero') : (S.climbing ? 'Ascendiendo…' : (S.launched ? 'En el aire' : (narrow ? 'Desliza →' : '2 · Desliza para despegar →')));
    css($('slide-fill'), 'width:calc(' + S.slide + '% + ' + (42 - 0.42 * S.slide).toFixed(1) + 'px);background:' + ((S.climbing || S.launched) ? 'rgba(111,191,115,0.35)' : (S.armed ? 'rgba(201,106,73,0.45)' : 'rgba(242,240,236,0.06)')));

    var count = S.markers.length;
    $('fish-hint').textContent = count === 0 ? 'Pulsa Grass, Bird, Fish o Floatsam en la barra inferior de la pantalla.' : count + (count === 1 ? ' marca en el mapa.' : ' marcas en el mapa.') + ' Sigue marcando o pasa a Navigation.';
    $('nav-hint').textContent = f ? 'Para volver al barco, pulsa el icono de Recovery (abajo a la izquierda).' : 'Pulsa un tipo en la barra para saltar a su siguiente marca.';
    $('nav-note').textContent = S.seeded ? 'No marcaste nada en Fishing: estas son las marcas del diseño original.' : (S.navMsg || '');
    $('rec-hint').textContent = gr ? 'Altura de agarre alcanzada: GRAB activo.' : 'Descendiendo… GRAB se activa a unos 5 ft (1,5 m).';
  }
  render();

  /* ---------- Móvil en vertical: pedir el giro ---------- */
  var card = $('rotate-card'), taps = 0;
  $('poster-btn').addEventListener('click', function () {
    taps++;
    card.classList.remove('is-nudge'); void card.offsetWidth; card.classList.add('is-nudge');
    if (taps >= 2) card.classList.add('show-lock');
  });
})();
