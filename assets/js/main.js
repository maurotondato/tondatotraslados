/* =====================================================================
   Tondato Traslados — interacciones
   Sin dependencias salvo EmailJS. Todo degrada con elegancia: si algo
   falla o el navegador es viejo, la página sigue siendo utilizable.
   ===================================================================== */
(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var calm = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { calm = e.matches; });

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------- 1. Revelado */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || calm) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* Marca de entrada para elementos que animan solos (barras, líneas) */
  (function markIn() {
    var items = $$('.stat, .step');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------- 2. Navegación */
  (function nav() {
    var bar      = $('#nav');
    var burger   = $('#burger');
    var panel    = $('#nav-panel');
    var progress = $('#nav-progress');
    if (!bar) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        bar.classList.toggle('is-stuck', y > 40);
        if (progress) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.setProperty('--progress', max > 0 ? clamp(y / max, 0, 1) : 0);
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Menú móvil: bloquea el scroll, atrapa el foco y cierra con Escape */
    if (burger && panel) {
      var lastFocus = null;

      function setMenu(open) {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        panel.classList.toggle('is-open', open);
        document.body.classList.toggle('is-locked', open);
        if (open) {
          lastFocus = document.activeElement;
          var first = panel.querySelector('a');
          if (first) setTimeout(function () { first.focus(); }, 220);
        } else if (lastFocus) {
          lastFocus.focus();
        }
      }

      burger.addEventListener('click', function () {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
      });
      panel.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || burger.getAttribute('aria-expanded') !== 'true') return;
        setMenu(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab' || burger.getAttribute('aria-expanded') !== 'true') return;
        var f = $$('a, button', panel).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 1040 && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
      });
    }

    /* Resalta en el menú la sección que se está mirando */
    var links = $$('#nav-links a');
    if (links.length && 'IntersectionObserver' in window) {
      var map = {};
      links.forEach(function (a) {
        var sec = document.querySelector(a.getAttribute('href'));
        if (sec) map[sec.id] = a;
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var a = map[e.target.id];
          if (!a) return;
          if (e.isIntersecting) {
            links.forEach(function (l) { l.removeAttribute('aria-current'); });
            a.setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
    }
  })();

  /* --------------------------------------------- 3. Hero: parallax 3D */
  (function heroParallax() {
    var hero  = $('#inicio');
    var scene = $('#hero-scene');
    if (!hero || !scene) return;

    var inner = hero.querySelector('.hero__content > div');

    /* Aparición del titular en cuanto la ciudad está pintada */
    var city = hero.querySelector('.hero__city');
    var ready = function () { hero.classList.add('is-ready'); };
    if (!city || city.complete) requestAnimationFrame(ready);
    else { city.addEventListener('load', ready); city.addEventListener('error', ready); }
    setTimeout(ready, 1600);           /* red de seguridad */

    if (calm) return;

    var target = { x: 0, y: 0 }, current = { x: 0, y: 0 };
    var drift = 0, pointer = false, visible = true, raf = 0;

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = hero.getBoundingClientRect();
      target.x = clamp((e.clientX - r.left) / r.width  - 0.5, -0.5, 0.5) * 2;
      target.y = clamp((e.clientY - r.top)  / r.height - 0.5, -0.5, 0.5) * 2;
      pointer = true;
    }, { passive: true });

    hero.addEventListener('pointerleave', function () {
      target.x = 0; target.y = 0; pointer = false;
    }, { passive: true });

    function frame() {
      raf = 0;
      if (!visible) return;

      /* En pantallas táctiles nadie mueve el mouse: la escena respira sola */
      if (!pointer) {
        drift += 0.0045;
        target.x = Math.sin(drift) * 0.34;
        target.y = Math.cos(drift * 0.72) * 0.22;
      }

      current.x = lerp(current.x, target.x, 0.055);
      current.y = lerp(current.y, target.y, 0.055);

      scene.style.setProperty('--mx', (current.x * 13).toFixed(2) + 'px');
      scene.style.setProperty('--my', (current.y * 9).toFixed(2) + 'px');
      scene.style.setProperty('--tilt-x', (current.x * 2.1).toFixed(3));
      scene.style.setProperty('--tilt-y', (-current.y * 1.5).toFixed(3));

      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
    start();

    /* El scroll aleja la cámara y desvanece el texto */
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var h = hero.offsetHeight || 1;
        var p = clamp((window.scrollY || window.pageYOffset) / h, 0, 1);
        scene.style.setProperty('--sy', (p * -90).toFixed(1) + 'px');
        scene.style.setProperty('--dolly', (1 + p * 0.08).toFixed(4));
        if (inner) {
          inner.style.opacity = String(clamp(1 - p * 1.5, 0, 1));
          inner.style.translate = '0 ' + (p * 60).toFixed(1) + 'px';
        }
        tick = false;
      });
    }, { passive: true });
  })();

  /* --------------------------------- 4. Hero: estelas de luz en canvas */
  (function trails() {
    var canvas = $('#hero-trails');
    var hero = $('#inicio');
    if (!canvas || !hero || calm) return;

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    /* Punto de fuga medido sobre la fotografía original (1920 × 1080) */
    var VPX = 900 / 1920, VPY = 645 / 1080;
    /* Carriles: dónde cruza cada estela el borde inferior del encuadre */
    var LANES = [-0.06, 0.09, 0.24, 0.39, 0.57, 0.73, 0.9, 1.06];

    var W = 0, H = 0, dpr = 1, streaks = [], raf = 0, visible = true, last = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = Math.round(r.width  * dpr);
      H = Math.round(r.height * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    }

    function spawn(seed) {
      return {
        lane: LANES[(Math.random() * LANES.length) | 0] + (Math.random() - 0.5) * 0.05,
        t: seed ? Math.random() : 0,
        speed: 0.085 + Math.random() * 0.16,
        len: 0.10 + Math.random() * 0.17,
        width: 0.7 + Math.random() * 0.9,
        warm: Math.random() < 0.3
      };
    }

    for (var i = 0; i < 15; i++) streaks.push(spawn(true));

    /* Coordenadas de un punto de la estela, en píxeles del canvas */
    function at(s, t) {
      var e = Math.pow(clamp(t, 0, 1), 2.45);
      return {
        x: (VPX + (s.lane - VPX) * e) * W,
        y: (VPY + (1 - VPY) * e) * H,
        e: e
      };
    }

    function draw(now) {
      raf = 0;
      if (!visible) return;
      var dt = Math.min((now - last) / 1000, 0.05) || 0.016;
      last = now;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (var i = 0; i < streaks.length; i++) {
        var s = streaks[i];
        s.t += s.speed * dt;
        if (s.t - s.len > 1.05) { streaks[i] = spawn(false); continue; }

        var head = at(s, s.t);
        var tail = at(s, s.t - s.len);
        if (head.e <= 0) continue;

        var fade = Math.min(1, head.e * 3.2) * (1 - clamp((s.t - 1) / 0.25, 0, 1));
        if (fade <= 0.01) continue;

        var g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        var core = s.warm ? '255,110,150' : '255,45,140';
        g.addColorStop(0, 'rgba(' + core + ',0)');
        g.addColorStop(0.55, 'rgba(' + core + ',' + (0.24 * fade).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,190,225,' + (0.5 * fade).toFixed(3) + ')');

        var w = (1 + 13 * head.e * head.e) * s.width * dpr;

        /* Halo ancho y difuso */
        ctx.strokeStyle = g;
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = w * 3.1;
        ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke();

        /* Núcleo brillante */
        ctx.globalAlpha = 1;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    }

    function start() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(draw); } }
    function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    resize();
    window.addEventListener('resize', function () { resize(); }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  })();

  /* ---------------------------------------------- 5. Contadores */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;
    var fmt = new Intl.NumberFormat('es-AR');

    function run(el) {
      var end = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (calm) { el.textContent = fmt.format(end); return; }
      var dur = 1900, t0 = performance.now();
      (function step(now) {
        var p = clamp((now - t0) / dur, 0, 1);
        var eased = 1 - Math.pow(1 - p, 4);            /* frena al final */
        el.textContent = fmt.format(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.45 });
    nodes.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------- 6. Tarjetas: foco e inclinación 3D */
  (function cards() {
    $$('.card--spot').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });

    if (calm || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('[data-tilt]').forEach(function (el) {
      var raf = 0, rx = 0, ry = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width  - 0.5) * 9;
        rx = ((e.clientY - r.top)  / r.height - 0.5) * -7;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) +
                               'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
        });
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        el.style.transform = '';
      }, { passive: true });
    });
  })();

  /* ------------------------------------------- 7. Botones magnéticos */
  (function magnetic() {
    if (calm || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - 2).toFixed(1) + 'px)';
      }, { passive: true });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; }, { passive: true });
    });
  })();

  /* ------------------------------------------------- 8. Acordeón FAQ */
  (function faq() {
    var buttons = $$('.faq__q');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
  })();

  /* --------------------------------------------------- 9. Formulario */
  (function quoteForm() {
    var form = $('#quote-form');
    if (!form) return;

    var status  = $('#quote-status');
    var submit  = $('#quote-submit');
    var hidden  = $('#f-message');
    var WA      = '5492223431190';

    var SERVICE  = 'tondatotraslados';
    var TEMPLATE = 'template_2lh8r4g';
    var PUBLIC   = 'CkYtRueXedWVXzpED';

    var val = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ''; };

    function fieldOf(input) { return input.closest('.field'); }

    function validate(input) {
      var v = input.value.trim();
      var ok = true;
      if (input.hasAttribute('required') && !v) ok = false;
      else if (input.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
      else if (input.type === 'tel' && v) ok = (v.replace(/\D/g, '').length >= 8);
      var wrap = fieldOf(input);
      if (wrap) wrap.classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }

    $$('input, textarea', form).forEach(function (input) {
      if (input.name === 'website') return;
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.classList.contains('has-error')) validate(input);
      });
    });

    /* Texto que resume todo el pedido, para que llegue completo al correo */
    function summary() {
      var lines = [
        'Nombre: '   + val('user_name'),
        'WhatsApp: ' + val('user_whatsapp'),
        'Email: '    + val('user_email'),
        'Origen: '   + val('origen'),
        'Destino: '  + val('destino'),
        'Fecha: '    + (val('fecha') || 'a coordinar'),
        'Pasajeros: ' + val('pasajeros'),
        'Tipo de servicio: ' + val('tipo')
      ];
      var d = val('detalle');
      if (d) lines.push('', 'Detalles: ' + d);
      return lines.join('\n');
    }

    function say(kind, text) {
      if (!status) return;
      status.className = 'form__status is-' + kind;
      status.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-' +
        (kind === 'ok' ? 'check-circle' : 'alert') + '"></use></svg><span></span>';
      status.querySelector('span').textContent = text;
    }

    /* Si el correo no sale, no perdemos la consulta: la pasamos a WhatsApp */
    function whatsappFallback() {
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(
        'Hola, quiero pedir un presupuesto.\n\n' + summary());
      var a = document.createElement('a');
      a.className = 'btn btn--wa';
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-wa"></use></svg>Enviarlo por WhatsApp';
      status.appendChild(a);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (val('website')) return;                 /* bot: lo ignoramos en silencio */

      var required = $$('[required]', form);
      var firstBad = null;
      required.forEach(function (input) { if (!validate(input) && !firstBad) firstBad = input; });
      if (firstBad) {
        say('error', 'Revisá los campos marcados antes de enviar.');
        firstBad.focus();
        return;
      }

      if (hidden) hidden.value = summary();

      if (typeof window.emailjs === 'undefined') {
        say('error', 'No pudimos conectar con el servidor de correo.');
        whatsappFallback();
        return;
      }

      submit.setAttribute('aria-busy', 'true');
      if (status) status.className = 'form__status';

      try { window.emailjs.init({ publicKey: PUBLIC }); }
      catch (err) { try { window.emailjs.init(PUBLIC); } catch (e2) {} }

      window.emailjs.sendForm(SERVICE, TEMPLATE, form)
        .then(function () {
          submit.removeAttribute('aria-busy');
          say('ok', '¡Listo! Recibimos tu pedido y te respondemos a la brevedad.');
          form.reset();
          $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
        })
        .catch(function () {
          submit.removeAttribute('aria-busy');
          say('error', 'No pudimos enviar el formulario en este momento.');
          whatsappFallback();
        });
    });
  })();

  /* --------------------------------------------------- 10. Detalles */
  (function misc() {
    var top = $('#to-top');
    if (top) {
      window.addEventListener('scroll', function () {
        top.classList.toggle('is-on', (window.scrollY || window.pageYOffset) > 700);
      }, { passive: true });
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
      });
    }

    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* El chat de Botpress se va a la izquierda para no tapar WhatsApp */
    function moveChat() {
      var el = document.getElementById('botpress-webchat-container') ||
               document.querySelector('.bpFab, #bp-web-widget-container');
      if (!el) return;
      el.style.right = 'auto';
      el.style.left = '20px';
      el.style.bottom = '20px';
      el.style.zIndex = '940';
    }
    [400, 1200, 2600].forEach(function (ms) { setTimeout(moveChat, ms); });
  })();
})();
