(function () {
  const TEMPLATE_ID = 'template-scroll-blur';

  function register(templateId, factory) {
    if (typeof window === 'undefined') {
      return;
    }

    const registerFn = window.registerCreativeScriptScrollAnimation;
    if (typeof registerFn === 'function') {
      registerFn(templateId, factory);
    } else {
      window.__creativeScriptScrollAnimationQueue = window.__creativeScriptScrollAnimationQueue || [];
      window.__creativeScriptScrollAnimationQueue.push({ id: templateId, factory });
    }
  }

  register(TEMPLATE_ID, ({ gsap, ScrollTrigger, config }) => {
    if (!gsap || !ScrollTrigger) {
      console.warn('[Creative Script][Scroll Template] GSAP oder ScrollTrigger nicht verfügbar.');
      return () => {};
    }

    const { elements, triggerElement, start, end, params = {} } = config || {};
    if (!Array.isArray(elements) || elements.length === 0) {
      console.warn('[Creative Script][Scroll Template] Keine Ziel-Elemente gefunden.');
      return () => {};
    }

    const blurAmount = typeof params.blur === 'number' ? params.blur : 10;
    const yOffset = typeof params.y === 'number' ? params.y : 20;
    const stagger = typeof params.stagger === 'number' ? params.stagger : 0.09;
    const ease = typeof params.ease === 'string' && params.ease.trim().length > 0 ? params.ease.trim() : 'power1.inOut';
    const scrub =
      typeof params.scrub === 'number'
        ? params.scrub
        : typeof params.scrub === 'boolean'
        ? params.scrub
        : true;

    const instances = [];
    const wordClassName = 'creative-script-scroll-blur-word';

    elements.forEach((element) => {
      if (!element || !element.ownerDocument) {
        return;
      }

      let splitInstance = null;
      let timeline = null;

      try {
        if (!window.SplitType) {
          console.warn('[Creative Script][Scroll Template] SplitType nicht gefunden – Animation übersprungen.');
          return;
        }

        splitInstance = new window.SplitType(element, {
          types: 'words',
          preserveWhitespace: true,
        });

        const words = splitInstance?.words;
        if (!words || words.length === 0) {
          console.warn('[Creative Script][Scroll Template] Keine Worte zum Animieren gefunden.', element);
          splitInstance?.revert();
          return;
        }

        try {
          words.forEach((word) => {
            if (word && word.classList) {
              word.classList.add(wordClassName);
            }
          });
        } catch (classError) {
          console.warn('[Creative Script][Scroll Template] Konnte Wort-Klasse nicht anwenden:', classError);
        }

        timeline = gsap.from(words, {
          opacity: 0,
          y: yOffset,
          filter: `blur(${blurAmount}px)`,
          stagger,
          ease,
          scrollTrigger: {
            trigger: triggerElement || element,
            start: typeof start === 'string' ? start : '0% center',
            end: typeof end === 'string' ? end : '100% center',
            scrub,
          },
        });

        instances.push({
          split: splitInstance,
          timeline,
        });
      } catch (error) {
        console.error('[Creative Script][Scroll Template] Fehler beim Initialisieren der Animation:', error);
        if (splitInstance) {
          try {
            splitInstance.revert();
          } catch (revertError) {
            console.warn('[Creative Script][Scroll Template] SplitType revert fehlgeschlagen:', revertError);
          }
        }
        if (timeline) {
          try {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          } catch (killError) {
            console.warn('[Creative Script][Scroll Template] Timeline kill fehlgeschlagen:', killError);
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
          console.warn('[Creative Script][Scroll Template] ScrollTrigger kill fehlgeschlagen:', timelineError);
        }

        try {
          instance.split?.revert();
        } catch (revertError) {
          console.warn('[Creative Script][Scroll Template] SplitType revert fehlgeschlagen:', revertError);
        }
      });
    };
  });
})();

