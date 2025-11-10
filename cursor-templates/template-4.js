(function () {
  const TEMPLATE_ID = 'template-4';
  const SCRIPT_ID = 'creative-script-tubes-cursor-loader';
  const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
  const LAYER_CLASS = 'creative-script-tubes-cursor-layer';
  const CANVAS_CLASS = 'creative-script-tubes-canvas';

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

  function loadScriptOnce() {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Window is not defined'));
    }

    window.__creativeScriptLoadedScripts = window.__creativeScriptLoadedScripts || {};

    if (window.__creativeScriptLoadedScripts[SCRIPT_SRC]) {
      return window.__creativeScriptLoadedScripts[SCRIPT_SRC];
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing && existing.getAttribute('data-loaded') === 'true') {
      window.__creativeScriptLoadedScripts[SCRIPT_SRC] = Promise.resolve();
      return window.__creativeScriptLoadedScripts[SCRIPT_SRC];
    }

    const promise = new Promise((resolve, reject) => {
      const script = existing || document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      script.onerror = (err) => {
        reject(new Error('Failed to load Tubes cursor script')); // eslint-disable-line prefer-promise-reject-errors
      };

      if (!existing) {
        document.head.appendChild(script);
      }
    });

    window.__creativeScriptLoadedScripts[SCRIPT_SRC] = promise;
    return promise;
  }

  function randomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(`#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`);
    }
    return colors;
  }

  function cursorFactory(context) {
    const win = (context && context.window) || window;
    const doc = (context && context.document) || document;

    let layer = null;
    let canvas = null;
    let tubesApp = null;
    let cancelled = false;

    const cleanupFns = [];

    try {
      layer = doc.createElement('div');
      layer.className = LAYER_CLASS;

      canvas = doc.createElement('canvas');
      canvas.className = CANVAS_CLASS;
      layer.appendChild(canvas);

      if (doc.body.firstChild) {
        doc.body.insertBefore(layer, doc.body.firstChild);
      } else {
        doc.body.appendChild(layer);
      }

      const resize = () => {
        canvas.width = win.innerWidth;
        canvas.height = win.innerHeight;
      };
      resize();
      win.addEventListener('resize', resize);
      cleanupFns.push(() => win.removeEventListener('resize', resize));

      loadScriptOnce()
        .then(() => {
          if (cancelled) {
            return;
          }

          const TubesCursor = win.TubesCursor;
          if (typeof TubesCursor !== 'function') {
            throw new Error('TubesCursor is not available on window');
          }

          tubesApp = TubesCursor(canvas, {
            tubes: {
              colors: ['#f967fb', '#53bc28', '#6958d5'],
              lights: {
                intensity: 200,
                colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5']
              }
            }
          });

          const clickHandler = () => {
            if (!tubesApp || !tubesApp.tubes) {
              return;
            }
            const colors = randomColors(3);
            const lightsColors = randomColors(4);
            if (typeof tubesApp.tubes.setColors === 'function') {
              tubesApp.tubes.setColors(colors);
            }
            if (typeof tubesApp.tubes.setLightsColors === 'function') {
              tubesApp.tubes.setLightsColors(lightsColors);
            }
          };

          doc.addEventListener('click', clickHandler);
          cleanupFns.push(() => doc.removeEventListener('click', clickHandler));
        })
        .catch((error) => {
          console.error('[Creative Script Cursor] Failed to initialize tubes cursor:', error); // eslint-disable-line no-console
        });
    } catch (error) {
      console.error('[Creative Script Cursor] template-4 initialization failed:', error); // eslint-disable-line no-console
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

      if (tubesApp) {
        if (typeof tubesApp.dispose === 'function') {
          try {
            tubesApp.dispose();
          } catch (err) {
            console.warn('[Creative Script Cursor] error disposing tubes cursor', err); // eslint-disable-line no-console
          }
        }
        tubesApp = null;
      }

      if (layer && layer.parentNode) {
        layer.parentNode.removeChild(layer);
      }
      layer = null;
      canvas = null;
    }

    return cleanupInternal;
  }

  register(TEMPLATE_ID, cursorFactory);
})();
