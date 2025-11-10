(function () {
  const TEMPLATE_ID = 'template-5';
  const GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js';
  const LAYER_CLASS = 'creative-script-gooey-cursor-layer';
  const CURSOR_CLASS = 'creative-script-gooey-cursor';
  const MIN_DESKTOP_WIDTH = 1024;
  const MAX_PARTICLES = 40;

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
      if (winRef.gsap) {
        resolve(winRef.gsap);
        return;
      }

      const script = winRef.document.createElement('script');
      script.src = GSAP_SRC;
      script.async = true;
      script.onload = () => resolve(winRef.gsap);
      script.onerror = () => reject(new Error('Failed to load GSAP'));
      winRef.document.head.appendChild(script);
    });

    winRef.__creativeScriptLoadedScripts[GSAP_SRC] = promise;
    return promise;
  }

  function createSvgScene(doc) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('style', 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483645;filter:url(#creative-gooey-filter);');
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.setAttribute('width', `${window.innerWidth}`);
    svg.setAttribute('height', `${window.innerHeight}`);

    const defs = doc.createElementNS(svgNS, 'defs');

    const radialGradient = doc.createElementNS(svgNS, 'radialGradient');
    radialGradient.setAttribute('id', 'creative-gooey-gradient');
    const stopInner = doc.createElementNS(svgNS, 'stop');
    stopInner.setAttribute('offset', '40%');
    stopInner.setAttribute('stop-color', '#000000');
    const stopOuter = doc.createElementNS(svgNS, 'stop');
    stopOuter.setAttribute('offset', '100%');
    stopOuter.setAttribute('stop-color', '#00F0FF');
    radialGradient.appendChild(stopInner);
    radialGradient.appendChild(stopOuter);

    const filter = doc.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'creative-gooey-filter');
    const blur = doc.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '15');
    blur.setAttribute('result', 'blur');
    const colorMatrix = doc.createElementNS(svgNS, 'feColorMatrix');
    colorMatrix.setAttribute('in', 'blur');
    colorMatrix.setAttribute('mode', 'matrix');
    colorMatrix.setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 50 -16');
    colorMatrix.setAttribute('result', 'gooey');
    const turbulence = doc.createElementNS(svgNS, 'feTurbulence');
    turbulence.setAttribute('baseFrequency', '0.03');
    turbulence.setAttribute('numOctaves', '1');
    turbulence.setAttribute('result', 'turbulence');
    const displacement = doc.createElementNS(svgNS, 'feDisplacementMap');
    displacement.setAttribute('in', 'gooey');
    displacement.setAttribute('in2', 'turbulence');
    displacement.setAttribute('scale', '100');
    displacement.setAttribute('xChannelSelector', 'B');
    displacement.setAttribute('yChannelSelector', 'G');
    const blend = doc.createElementNS(svgNS, 'feBlend');
    blend.setAttribute('in', 'gooey');
    blend.setAttribute('in2', 'SourceGraphic');
    blend.setAttribute('mode', 'difference');

    filter.appendChild(blur);
    filter.appendChild(colorMatrix);
    filter.appendChild(turbulence);
    filter.appendChild(displacement);
    filter.appendChild(blend);

    defs.appendChild(radialGradient);
    defs.appendChild(filter);
    svg.appendChild(defs);

    return svg;
  }

  function getPointerPosition(event) {
    if (!event) {
      return { x: 0, y: 0 };
    }
    const hasClient = typeof event.clientX === 'number' && typeof event.clientY === 'number';
    if (hasClient) {
      return {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY
      };
    }
    if (event.touches && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX + window.scrollX,
        y: event.touches[0].clientY + window.scrollY
      };
    }
    return { x: 0, y: 0 };
  }

  function cursorFactory(context) {
    const win = (context && context.window) || window;
    const doc = (context && context.document) || document;

    if (win.innerWidth <= MIN_DESKTOP_WIDTH) {
      return () => {};
    }

    let layer = null;
    let cursor = null;
    let svgScene = null;
    let gsapInstance = null;
    let cancelled = false;
    const originalBodyCursor = doc.body ? doc.body.style.cursor || '' : '';

    const cleanupFns = [];
    const particles = [];

    try {
      layer = doc.createElement('div');
      layer.className = LAYER_CLASS;

      cursor = doc.createElement('div');
      cursor.className = CURSOR_CLASS;
      cursor.style.transform = 'translate(-50%, -50%)';
      layer.appendChild(cursor);

      svgScene = createSvgScene(doc);
      layer.appendChild(svgScene);

      doc.body.appendChild(layer);

      if (doc.body) {
        doc.body.style.cursor = 'none';
      }

      const resizeHandler = () => {
        svgScene.setAttribute('width', `${win.innerWidth}`);
        svgScene.setAttribute('height', `${win.innerHeight}`);
        svgScene.setAttribute('viewBox', `0 0 ${win.innerWidth} ${win.innerHeight}`);
      };
      win.addEventListener('resize', resizeHandler);
      cleanupFns.push(() => win.removeEventListener('resize', resizeHandler));

      const updateCursorPosition = (x, y) => {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
      };

      const spawnParticle = (x, y) => {
        if (!gsapInstance || cancelled) {
          return;
        }

        const svgNS = 'http://www.w3.org/2000/svg';
        const circle = doc.createElementNS(svgNS, 'circle');
        circle.setAttribute('r', '30');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('fill', '#00FFF7');
        circle.setAttribute('stroke', '#00FFF0');
        circle.setAttribute('stroke-width', '10');

        svgScene.appendChild(circle);
        particles.push(circle);
        if (particles.length > MAX_PARTICLES) {
          const old = particles.shift();
          if (old && old.parentNode) {
            svgScene.removeChild(old);
          }
        }

        gsapInstance.set(circle, { x, y, opacity: 1 });
        gsapInstance.to(circle, {
          duration: 2.2,
          x: x + (Math.random() - 0.5) * 360,
          y: y + (Math.random() - 0.5) * 360,
          scale: 0,
          opacity: 0,
          ease: 'power2.out',
          onComplete: () => {
            if (circle.parentNode) {
              svgScene.removeChild(circle);
            }
          }
        });
      };

      const handlePointer = (event) => {
        const { x, y } = getPointerPosition(event);
        updateCursorPosition(x, y);
        spawnParticle(x, y);
      };

      const pointerMoveHandler = (event) => {
        handlePointer(event);
      };

      const pointerClickHandler = (event) => {
        handlePointer(event);
      };

      const touchMoveHandler = (event) => {
        handlePointer(event);
        if (event.cancelable) {
          event.preventDefault();
        }
      };

      const pointerPassiveOptions = { passive: true };
      const touchActiveOptions = { passive: false };

      win.addEventListener('pointermove', pointerMoveHandler, pointerPassiveOptions);
      win.addEventListener('pointerdown', pointerMoveHandler, pointerPassiveOptions);
      win.addEventListener('click', pointerClickHandler, pointerPassiveOptions);
      win.addEventListener('touchmove', touchMoveHandler, touchActiveOptions);
      win.addEventListener('touchstart', touchMoveHandler, touchActiveOptions);

      cleanupFns.push(() => win.removeEventListener('pointermove', pointerMoveHandler, pointerPassiveOptions));
      cleanupFns.push(() => win.removeEventListener('pointerdown', pointerMoveHandler, pointerPassiveOptions));
      cleanupFns.push(() => win.removeEventListener('click', pointerClickHandler, pointerPassiveOptions));
      cleanupFns.push(() => win.removeEventListener('touchmove', touchMoveHandler, touchActiveOptions));
      cleanupFns.push(() => win.removeEventListener('touchstart', touchMoveHandler, touchActiveOptions));

      loadGsap(win)
        .then((gsapModule) => {
          if (cancelled) {
            return;
          }
          gsapInstance = gsapModule;
        })
        .catch((error) => {
          console.error('[Creative Script Cursor] Failed to load GSAP for gooey cursor:', error); // eslint-disable-line no-console
        });
    } catch (error) {
      console.error('[Creative Script Cursor] template-5 initialization failed:', error); // eslint-disable-line no-console
      cleanupInternal();
      return () => {};
    }

    function cleanupInternal() {
      cancelled = true;
      cleanupFns.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn('[Creative Script Cursor] cleanup error', err); // eslint-disable-line no-console
        }
      });

      particles.splice(0).forEach((particle) => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
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
      svgScene = null;
      gsapInstance = null;
    }

    return cleanupInternal;
  }

  register(TEMPLATE_ID, cursorFactory);
})();
