(function () {
  const TEMPLATE_ID = 'template-7';
  const LAYER_CLASS = 'creative-script-ghost-cursor-layer';
  const CURSOR_CLASS = 'creative-script-ghost-cursor';
  const BODY_BG_COLOR = '#161616';

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

  function createSvgFilter(doc) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('style', 'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;');

    const defs = doc.createElementNS(svgNS, 'defs');
    const filter = doc.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'creative-ghost-goo');

    const blur = doc.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '10');
    blur.setAttribute('result', 'ghost-blur');

    const colorMatrix = doc.createElementNS(svgNS, 'feColorMatrix');
    colorMatrix.setAttribute('in', 'ghost-blur');
    colorMatrix.setAttribute('mode', 'matrix');
    colorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7');
    colorMatrix.setAttribute('result', 'ghost-gooey');

    filter.appendChild(blur);
    filter.appendChild(colorMatrix);
    defs.appendChild(filter);
    svg.appendChild(defs);

    doc.body.appendChild(svg);
    return svg;
  }

  function createGhost(doc) {
    const container = doc.createElement('div');
    container.className = CURSOR_CLASS;

    const head = doc.createElement('div');
    head.className = `${CURSOR_CLASS}__head`;
    container.appendChild(head);

    const eyes = doc.createElement('div');
    eyes.className = `${CURSOR_CLASS}__eyes`;
    head.appendChild(eyes);

    const mouth = doc.createElement('div');
    mouth.className = `${CURSOR_CLASS}__mouth`;
    head.appendChild(mouth);

    const tail = doc.createElement('div');
    tail.className = `${CURSOR_CLASS}__tail`;
    container.appendChild(tail);

    const rip = doc.createElement('div');
    rip.className = `${CURSOR_CLASS}__rip`;
    tail.appendChild(rip);

    return {
      container,
      head,
      eyes,
      mouth,
      tail,
      rip
    };
  }

  function mapRange(num, inMin, inMax, outMin, outMax) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  function cursorFactory(context) {
    const win = (context && context.window) || window;
    const doc = (context && context.document) || document;

    let layer = null;
    let ghost = null;
    let svgFilter = null;
    let animationFrameId = null;

    const cleanupFns = [];

    const mouse = {
      x: win.innerWidth / 2,
      y: win.innerHeight / 2,
      dir: 'right'
    };
    let clicked = false;

    const pointerMoveHandler = (event) => {
      const clientX = typeof event.clientX === 'number' ? event.clientX : (event.touches && event.touches[0] ? event.touches[0].clientX : mouse.x);
      const clientY = typeof event.clientY === 'number' ? event.clientY : (event.touches && event.touches[0] ? event.touches[0].clientY : mouse.y);
      mouse.dir = mouse.x > clientX ? 'left' : 'right';
      mouse.x = clientX;
      mouse.y = clientY;
    };

    const pointerDownHandler = (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      clicked = true;
    };

    const pointerUpHandler = () => {
      clicked = false;
    };

    try {
      layer = doc.createElement('div');
      layer.className = LAYER_CLASS;

      svgFilter = createSvgFilter(doc);
      cleanupFns.push(() => {
        if (svgFilter && svgFilter.parentNode) {
          svgFilter.parentNode.removeChild(svgFilter);
        }
      });

      ghost = createGhost(doc);
      ghost.container.style.filter = 'url(#creative-ghost-goo)';
      layer.appendChild(ghost.container);

      doc.body.appendChild(layer);

      const originalBodyCursor = doc.body ? doc.body.style.cursor || '' : '';
      if (doc.body) {
        doc.body.style.cursor = 'none';
      }
      cleanupFns.push(() => {
        if (doc.body) {
          doc.body.style.cursor = originalBodyCursor;
        }
      });

      const pointerOptions = { passive: true };
      const pointerActiveOptions = { passive: false };

      ['mousemove', 'touchstart', 'touchmove'].forEach((eventName) => {
        const options = eventName === 'mousemove' ? pointerOptions : pointerOptions;
        win.addEventListener(eventName, pointerMoveHandler, options);
        cleanupFns.push(() => win.removeEventListener(eventName, pointerMoveHandler, options));
      });

      win.addEventListener('mousedown', pointerDownHandler, pointerActiveOptions);
      win.addEventListener('mouseup', pointerUpHandler, pointerOptions);
      cleanupFns.push(() => win.removeEventListener('mousedown', pointerDownHandler, pointerActiveOptions));
      cleanupFns.push(() => win.removeEventListener('mouseup', pointerUpHandler, pointerOptions));

      const pos = { x: mouse.x, y: mouse.y };

      const follow = () => {
        const distX = mouse.x - pos.x;
        const distY = mouse.y - pos.y;
        const velX = distX / 8;
        const velY = distY / 8;

        pos.x += distX / 10;
        pos.y += distY / 10;

        const skewX = mapRange(velX, 0, 100, 0, -50);
        const scaleY = mapRange(velY, 0, 100, 1, 2.0);
        const scaleEyeX = mapRange(Math.abs(velX), 0, 100, 1, 1.2);
        const scaleEyeY = mapRange(Math.abs(velX * 2), 0, 100, 1, 0.1);
        let scaleMouth = Math.min(
          Math.max(mapRange(Math.abs(velX * 1.5), 0, 100, 0, 10), mapRange(Math.abs(velY * 1.2), 0, 100, 0, 5)),
          2
        );

        if (clicked) {
          ghost.eyes.style.transform = 'translateX(-50%) scale(' + scaleEyeX + ',' + 0.4 + ')';
          scaleMouth = -scaleMouth;
        } else {
          ghost.eyes.style.transform = 'translateX(-50%) scale(' + scaleEyeX + ',' + scaleEyeY + ')';
        }

        ghost.container.style.transform =
          'translate(' + pos.x + 'px,' + pos.y + 'px) scale(0.7) skew(' + skewX + 'deg) rotate(' + -skewX + 'deg) scaleY(' + scaleY + ')';
        ghost.mouth.style.transform = 'translate(' + (-skewX * 0.5 - 10) + 'px) scale(' + scaleMouth + ')';

        runAnimation();
      };

      const runAnimation = () => {
        animationFrameId = win.requestAnimationFrame(follow);
      };

      runAnimation();
    } catch (error) {
      console.error('[Creative Script Cursor] template-7 initialization failed:', error); // eslint-disable-line no-console
      cleanupInternal();
      return () => {};
    }

    function cleanupInternal() {
      if (animationFrameId) {
        win.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      cleanupFns.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn('[Creative Script Cursor] cleanup error', err); // eslint-disable-line no-console
        }
      });

      if (layer && layer.parentNode) {
        layer.parentNode.removeChild(layer);
      }

      layer = null;
      ghost = null;
    }

    return cleanupInternal;
  }

  register(TEMPLATE_ID, cursorFactory);
})();
