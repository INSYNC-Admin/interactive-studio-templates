(function () {
  const TEMPLATE_ID = 'template-6';
  const GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js';
  const LAYER_CLASS = 'creative-script-morph-cursor-layer';
  const CURSOR_CLASS = 'creative-script-morph-cursor';
  const MIN_DESKTOP_WIDTH = 1024;

  const DOT_COUNT = 20;
  const SINE_DOTS = Math.floor(DOT_COUNT * 0.3);
  const DOT_WIDTH = 26;
  const IDLE_TIMEOUT = 150;
  const MAX_PARTICLES = DOT_COUNT;

  function register(templateId, factory) {
    if (typeof window === 'undefined') {
      return;
    }
    if (typeof window.registerCreativeScriptCursorTemplate === 'function') {
      window.registerCreativeScriptCursorTemplate(templateId, factory);
    } else {
      window.__creativeScriptCursorTemplateQueue = window.__creativeScriptCursorTemplateQueue || [];
      window.__creativeScriptCursorTemplateQueue.push({ templateId, factory });
    }
  }

  function loadGsap(winRef) {
    if (typeof winRef === 'undefined') {
      return Promise.reject(new Error('Window is not defined'));
    }

    winRef.__creativeScriptLoadedScripts = winRef.__creativeScriptLoadedScripts || {};

    if (winRef.__creativeScriptLoadedScripts[GSAP_SRC]) {
      return winRef.__creativeScriptLoadedScripts[GSAP_SRC];
    }

    const promise = new Promise((resolve, reject) => {
      if (winRef.TweenMax && winRef.Power3) {
        resolve(winRef); // GSAP already present
        return;
      }

      const script = winRef.document.createElement('script');
      script.src = GSAP_SRC;
      script.async = true;
      script.onload = () => {
        if (winRef.TweenMax && winRef.Power3) {
          resolve(winRef);
        } else {
          reject(new Error('GSAP loaded but TweenMax/Power3 missing'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load GSAP')); // eslint-disable-line prefer-promise-reject-errors
      winRef.document.head.appendChild(script);
    });

    winRef.__creativeScriptLoadedScripts[GSAP_SRC] = promise;
    return promise;
  }

  function createGooFilter(doc) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('style', 'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;');

    const defs = doc.createElementNS(svgNS, 'defs');
    const filter = doc.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'creative-morph-goo');

    const blur = doc.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '6');
    blur.setAttribute('result', 'blur');

    const colorMatrix = doc.createElementNS(svgNS, 'feColorMatrix');
    colorMatrix.setAttribute('in', 'blur');
    colorMatrix.setAttribute('mode', 'matrix');
    colorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15');
    colorMatrix.setAttribute('result', 'goo');

    const composite = doc.createElementNS(svgNS, 'feComposite');
    composite.setAttribute('in', 'SourceGraphic');
    composite.setAttribute('in2', 'goo');
    composite.setAttribute('operator', 'atop');

    filter.appendChild(blur);
    filter.appendChild(colorMatrix);
    filter.appendChild(composite);
    defs.appendChild(filter);
    svg.appendChild(defs);

    doc.body.appendChild(svg);
    return svg;
  }

  function cursorFactory(context) {
    const win = (context && context.window) || window;
    const doc = (context && context.document) || document;

    if (win.innerWidth <= MIN_DESKTOP_WIDTH) {
      return () => {};
    }

    let layer = null;
    let cursor = null;
    let dots = [];
    let gsapWin = null;
    let idle = false;
    let idleTimeoutId = null;
    let cancelRender = false;
    let lastFrame = 0;
    let originalBodyCursor = doc.body ? doc.body.style.cursor || '' : '';

    const mousePosition = { x: 0, y: 0 };
    const cleanupFns = [];

    class Dot {
      constructor(index) {
        this.index = index;
        this.anglespeed = 0.05;
        this.x = 0;
        this.y = 0;
        this.scale = 1 - 0.05 * index;
        this.range = DOT_WIDTH / 2 - (DOT_WIDTH / 2) * this.scale + 2;
        this.element = doc.createElement('span');
        if (gsapWin && gsapWin.TweenMax) {
          gsapWin.TweenMax.set(this.element, { scale: this.scale });
        } else {
          this.element.style.transform = `scale(${this.scale})`;
        }
        cursor.appendChild(this.element);
      }

      lock() {
        this.lockX = this.x;
        this.lockY = this.y;
        this.angleX = Math.PI * 2 * Math.random();
        this.angleY = Math.PI * 2 * Math.random();
      }

      draw(delta) {
        if (!gsapWin || !gsapWin.TweenMax) {
          return;
        }
        if (!idle || this.index <= SINE_DOTS) {
          gsapWin.TweenMax.set(this.element, { x: this.x, y: this.y });
        } else {
          this.angleX += this.anglespeed;
          this.angleY += this.anglespeed;
          this.y = this.lockY + Math.sin(this.angleY) * this.range;
          this.x = this.lockX + Math.sin(this.angleX) * this.range;
          gsapWin.TweenMax.set(this.element, { x: this.x, y: this.y });
        }
      }
    }

    const clearIdleTimer = () => {
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
        idleTimeoutId = null;
      }
    };

    const startIdleTimer = () => {
      clearIdleTimer();
      idleTimeoutId = setTimeout(() => {
        idle = true;
        dots.forEach((dot) => dot.lock());
      }, IDLE_TIMEOUT);
    };

    const resetIdleTimer = () => {
      idle = false;
      startIdleTimer();
    };

    const onPointerMove = (event) => {
      const clientX = typeof event.clientX === 'number' ? event.clientX : (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
      const clientY = typeof event.clientY === 'number' ? event.clientY : (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
      mousePosition.x = clientX - DOT_WIDTH / 2;
      mousePosition.y = clientY - DOT_WIDTH / 2;
      resetIdleTimer();
    };

    const render = (timestamp) => {
      if (cancelRender) {
        return;
      }
      if (!lastFrame) {
        lastFrame = timestamp;
      }
      const delta = timestamp - lastFrame;
      lastFrame = timestamp;

      let x = mousePosition.x;
      let y = mousePosition.y;

      dots.forEach((dot, index) => {
        const nextDot = dots[index + 1] || dots[0];
        dot.x = x;
        dot.y = y;
        dot.draw(delta);
        if (!idle || index <= SINE_DOTS) {
          const dx = (nextDot.x - dot.x) * 0.35;
          const dy = (nextDot.y - dot.y) * 0.35;
          x += dx;
          y += dy;
        }
      });

      win.requestAnimationFrame(render);
    };

    try {
      layer = doc.createElement('div');
      layer.className = LAYER_CLASS;

      const svgFilter = createGooFilter(doc);
      cleanupFns.push(() => {
        if (svgFilter && svgFilter.parentNode) {
          svgFilter.parentNode.removeChild(svgFilter);
        }
      });

      cursor = doc.createElement('div');
      cursor.className = CURSOR_CLASS;
      layer.appendChild(cursor);

      doc.body.appendChild(layer);
      if (doc.body) {
        doc.body.style.cursor = 'none';
      }

      loadGsap(win)
        .then((gsapModule) => {
          if (cancelRender) {
            return;
          }
          gsapWin = gsapModule;
          // Build dots after GSAP is ready so TweenMax is available
          dots = [];
          for (let i = 0; i < DOT_COUNT; i++) {
            dots.push(new Dot(i));
          }
          startIdleTimer();
          win.requestAnimationFrame(render);
        })
        .catch((error) => {
          console.error('[Creative Script Cursor] Failed to load GSAP for morph cursor:', error); // eslint-disable-line no-console
        });

      const pointerOptions = { passive: true };
      const touchOptions = { passive: true };

      win.addEventListener('pointermove', onPointerMove, pointerOptions);
      win.addEventListener('pointerdown', onPointerMove, pointerOptions);
      win.addEventListener('touchmove', onPointerMove, touchOptions);
      win.addEventListener('touchstart', onPointerMove, touchOptions);

      cleanupFns.push(() => win.removeEventListener('pointermove', onPointerMove, pointerOptions));
      cleanupFns.push(() => win.removeEventListener('pointerdown', onPointerMove, pointerOptions));
      cleanupFns.push(() => win.removeEventListener('touchmove', onPointerMove, touchOptions));
      cleanupFns.push(() => win.removeEventListener('touchstart', onPointerMove, touchOptions));
    } catch (error) {
      console.error('[Creative Script Cursor] template-6 initialization failed:', error); // eslint-disable-line no-console
      cleanupInternal();
      return () => {};
    }

    function cleanupInternal() {
      cancelRender = true;
      clearIdleTimer();

      cleanupFns.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn('[Creative Script Cursor] cleanup error', err); // eslint-disable-line no-console
        }
      });

      dots.splice(0).forEach((dot) => {
        if (dot && dot.element && dot.element.parentNode) {
          dot.element.parentNode.removeChild(dot.element);
        }
      });

      if (doc.body) {
        doc.body.style.cursor = originalBodyCursor;
      }

      if (layer && layer.parentNode) {
        layer.parentNode.removeChild(layer);
      }

      layer = null;
      cursor = null;
      dots = [];
      gsapWin = null;
    }

    return cleanupInternal;
  }

  register(TEMPLATE_ID, cursorFactory);
})();
