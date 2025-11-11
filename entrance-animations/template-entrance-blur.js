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
    const charClassName = 'creative-script-entrance-blur-char';

    const instances = [];

    elements.forEach((element) => {
      if (!element || !element.ownerDocument) {
        return;
      }

      let splitInstance = null;
      let timeline = null;

      const originalVisibility = element.style.visibility;

      try {
        element.style.visibility = 'hidden';
        if (!window.SplitType) {
          console.warn('[Creative Script][Entrance Template] SplitType ist nicht geladen.');
          return;
        }

        splitInstance = new window.SplitType(element, {
          types: 'lines,words,chars',
          preserveWhitespace: true,
        });

        const chars = splitInstance?.chars;
        if (!chars || chars.length === 0) {
          console.warn('[Creative Script][Entrance Template] Keine Zeichen zum Animieren gefunden.', element);
          splitInstance?.revert();
          return;
        }

        try {
          splitInstance.words?.forEach((word) => {
            if (word && word.classList) {
              word.classList.add('creative-script-entrance-blur-word');
            }
          });

          chars.forEach((char) => {
            if (!char || !char.classList) {
              return;
            }
            char.classList.add(charClassName);
            if (char.textContent && /\s/.test(char.textContent)) {
              char.classList.add(`${charClassName}--whitespace`);
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

        let hasReverted = false;
        const revertSplit = () => {
          if (hasReverted) {
            return;
          }
          try {
            splitInstance.revert();
            hasReverted = true;
          } catch (revertError) {
            console.warn('[Creative Script][Entrance Template] SplitType revert fehlgeschlagen:', revertError);
          }
        };

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
            start: typeof start === 'string' && start.trim().length > 0 ? start : 'top bottom',
            once: true,
            toggleActions: 'play none none none',
          },
        });

        timeline.eventCallback('onStart', () => {
          element.style.visibility = 'visible';
        });

        timeline.eventCallback('onComplete', () => {
          try {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          } catch (killError) {
            console.warn('[Creative Script][Entrance Template] Timeline kill fehlgeschlagen:', killError);
          }
          try {
            gsap.set(chars, { clearProps: 'all' });
          } catch (clearError) {
            console.warn('[Creative Script][Entrance Template] clearProps fehlgeschlagen:', clearError);
          }
          revertSplit();
          element.style.visibility = originalVisibility;
        });

        instances.push({
          split: splitInstance,
          timeline,
          revert: revertSplit,
          resetVisibility: () => {
            element.style.visibility = originalVisibility;
          },
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
        element.style.visibility = originalVisibility;
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
          instance.revert?.();
          instance.split?.revert();
        } catch (revertError) {
          console.warn('[Creative Script][Entrance Template] SplitType revert fehlgeschlagen:', revertError);
        }

        try {
          gsap.set(instance.split?.chars || [], { clearProps: 'all' });
        } catch (clearError) {
          console.warn('[Creative Script][Entrance Template] clearProps im Cleanup fehlgeschlagen:', clearError);
        }

        instance.resetVisibility?.();
      });
    };
  });

})();

