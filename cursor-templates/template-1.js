(function () {
  const TEMPLATE_ID = 'template-1';

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

  function cursorFactory(context) {
    const win = (context && context.window) || window;
    const doc = (context && context.document) || document;

    let circleElement = null;
    let mouse = { x: 0, y: 0 };
    let previousMouse = { x: 0, y: 0 };
    let circle = { x: 0, y: 0 };
    let currentScale = 0;
    let currentAngle = 0;
    let rafId = null;
    let mouseMoveHandler = null;

    function cleanup() {
      if (rafId !== null) {
        win.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (mouseMoveHandler) {
        win.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
      }
      if (circleElement && circleElement.parentNode) {
        circleElement.parentNode.removeChild(circleElement);
      }
      circleElement = null;
    }

    cleanup();

    circleElement = doc.createElement('div');
    circleElement.className = 'creative-script-cursor circle';
    circleElement.setAttribute('data-template', TEMPLATE_ID);
    doc.body.appendChild(circleElement);

    mouse = { x: 0, y: 0 };
    previousMouse = { x: 0, y: 0 };
    circle = { x: 0, y: 0 };
    currentScale = 0;
    currentAngle = 0;

    mouseMoveHandler = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    win.addEventListener('mousemove', mouseMoveHandler);

    const speed = 0.17;

    const tick = () => {
      if (!circleElement) {
        return;
      }

      const { customCursor } = win.__creativeScriptConfig || {};
      if (!customCursor || !customCursor.enabled || String(customCursor.template || '1') !== TEMPLATE_ID) {
        cleanup();
        return;
      }

      circle.x += (mouse.x - circle.x) * speed;
      circle.y += (mouse.y - circle.y) * speed;
      const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

      const deltaMouseX = mouse.x - previousMouse.x;
      const deltaMouseY = mouse.y - previousMouse.y;
      previousMouse.x = mouse.x;
      previousMouse.y = mouse.y;

      const mouseVelocity = Math.min(Math.sqrt(deltaMouseX ** 2 + deltaMouseY ** 2) * 4, 150);
      const scaleValue = (mouseVelocity / 150) * 0.5;
      currentScale += (scaleValue - currentScale) * speed;
      const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

      const angle = Math.atan2(deltaMouseY, deltaMouseX) * (180 / Math.PI);
      if (mouseVelocity > 20) {
        currentAngle = angle;
      }
      const rotateTransform = `rotate(${currentAngle}deg)`;

      circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;
      rafId = win.requestAnimationFrame(tick);
    };

    rafId = win.requestAnimationFrame(tick);

    return cleanup;
  }

  register(TEMPLATE_ID, cursorFactory);
})();

