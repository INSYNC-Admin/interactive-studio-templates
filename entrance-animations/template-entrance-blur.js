(function () {
  const TEMPLATE_ID = 'template-entrance-blur';

  function register(templateId, factory) {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof window.registerCreativeScriptEntranceAnimation === 'function') {
      window.registerCreativeScriptEntranceAnimation(templateId, factory);
    } else {
      window.__creativeScriptEntranceAnimationQueue = window.__creativeScriptEntranceAnimationQueue || [];
      window.__creativeScriptEntranceAnimationQueue.push({ id: templateId, factory });
    }
  }

  register(TEMPLATE_ID, ({ gsap, ScrollTrigger, config }) => {
    if (!gsap || !ScrollTrigger) {
      console.warn('[Creative Script][Entrance Template] GSAP oder ScrollTrigger nicht verfügbar.');
      return () => {};
    }

    const { elements, triggerClassName, start, params = {} } = config || {};
    if (!Array.isArray(elements) || elements.length === 0) {
      console.warn('[Creative Script][Entrance Template] Keine Ziel-Elemente gefunden.');
      return () => {};
    }

    const blurAmount = typeof params.blur === 'number' ? params.blur : 10;
    const yOffset = typeof params.y === 'number' ? params.y : 30;
    const stagger = typeof params.stagger === 'number' ? params.stagger : 0.02;
    const duration = typeof params.duration === 'number' ? params.duration : 0.6;
    const ease = typeof params.ease === 'string' && params.ease.trim().length > 0 ? params.ease.trim() : 'power2.out';
    const extraDelay = typeof params.delay === 'number' ? params.delay : 0;

    const instances = [];

    elements.forEach((element) => {
      if (!element || !element.ownerDocument) {
        return;
      }

      let splitInstance = null;
      let timeline = null;

      try {
        if (!window.SplitType) {
          console.warn('[Creative Script][Entrance Template] SplitType ist nicht geladen.');
          return;
        }

        splitInstance = new window.SplitType(element, {
          types: 'chars',
          preserveWhitespace: true,
        });

        const chars = splitInstance?.chars;
        if (!chars || chars.length === 0) {
          console.warn('[Creative Script][Entrance Template] Keine Zeichen zum Animieren gefunden.', element);
          splitInstance?.revert();
          return;
        }

        try {
          chars.forEach((char) => {
            if (char && char.classList) {
              char.classList.add('creative-script-entrance-blur-char');
            }
          });
        } catch (classError) {
          console.warn('[Creative Script][Entrance Template] Zeichen-Klasse konnte nicht gesetzt werden:', classError);
        }

        let triggerElement = element;
        if (triggerClassName) {
          try {
            const customTrigger = document.querySelector(`.${triggerClassName}`);
            if (customTrigger) {
              triggerElement = customTrigger;
            }
          } catch (error) {
            console.warn('[Creative Script][Entrance Template] Fehler beim Auffinden des Trigger-Elements:', error);
          }
        }

        timeline = gsap.from(chars, {
          opacity: 0,
          filter: `blur(${blurAmount}px)`,
          y: yOffset,
          duration,
          stagger,
          ease,
          delay: extraDelay,
          scrollTrigger: {
            trigger: triggerElement,
            start: typeof start === 'string' && start.trim().length > 0 ? start : 'top 95%',
            once: true,
            toggleActions: 'play none none none',
          },
        });

        const attemptImmediatePlay = () => {
          if (!timeline) {
            return;
          }
          const target = triggerElement || element;
          if (!target) {
            return;
          }
          if (timeline.scrollTrigger && timeline.progress() === 0 && isElementInViewport(target, 0)) {
            timeline.play(0);
            timeline.scrollTrigger.kill(false);
          }
        };

        if (typeof window !== 'undefined') {
          if (document.readyState === 'complete') {
            window.requestAnimationFrame(attemptImmediatePlay);
          } else {
            const onLoad = () => {
              window.removeEventListener('load', onLoad);
              window.requestAnimationFrame(attemptImmediatePlay);
            };
            window.addEventListener('load', onLoad);
          }
        }

        instances.push({
          split: splitInstance,
          timeline,
        });
      } catch (error) {
        console.error('[Creative Script][Entrance Template] Fehler beim Initialisieren der Animation:', error);

        if (splitInstance) {
          try {
            splitInstance.revert();
          } catch (revertError) {
            console.warn('[Creative Script][Entrance Template] SplitType revert fehlgeschlagen:', revertError);
          }
        }
        if (timeline) {
          try {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          } catch (killError) {
            console.warn('[Creative Script][Entrance Template] Timeline kill fehlgeschlagen:', killError);
          }
        }
      }
    });

    return () => {
      instances.forEach((instance) => {
        try {
          instance.timeline?.scrollTrigger?.kill();
          instance.timeline?.kill();
        } catch (timelineError) {
          console.warn('[Creative Script][Entrance Template] ScrollTrigger kill fehlgeschlagen:', timelineError);
        }

        try {
          instance.split?.revert();
        } catch (revertError) {
          console.warn('[Creative Script][Entrance Template] SplitType revert fehlgeschlagen:', revertError);
        }
      });
    };
  });

  function isElementInViewport(element, threshold) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
      return false;
    }
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const offset = typeof threshold === 'number' ? threshold : 0;

    return (
      rect.bottom >= -offset &&
      rect.top <= viewportHeight + offset &&
      rect.right >= -offset &&
      rect.left <= viewportWidth + offset
    );
  }
})();

