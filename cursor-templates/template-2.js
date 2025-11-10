(function () {
  const TEMPLATE_ID = 'template-2';

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

    let cursorElement = null;
    let mouseMoveHandler = null;
    let mouseEnterHandler = null;
    let mouseLeaveHandler = null;

    const cleanup = () => {
      if (mouseMoveHandler) {
        win.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
      }
      if (mouseEnterHandler) {
        win.removeEventListener('mouseenter', mouseEnterHandler);
        mouseEnterHandler = null;
      }
      if (mouseLeaveHandler) {
        win.removeEventListener('mouseleave', mouseLeaveHandler);
        mouseLeaveHandler = null;
      }
      if (cursorElement && cursorElement.parentNode) {
        cursorElement.parentNode.removeChild(cursorElement);
      }
      cursorElement = null;
      doc.body.classList.remove('creative-script-cursor-hidden');
    };

    cleanup();

    const isSafari =
      /^((?!chrome|android).)*safari/i.test(win.navigator.userAgent || '');
    if (isSafari) {
      return cleanup;
    }

    cursorElement = doc.createElement('span');
    cursorElement.className = 'creative-script-cursor dot';
    cursorElement.setAttribute('data-template', TEMPLATE_ID);
    cursorElement.style.opacity = '1';
    doc.body.appendChild(cursorElement);

    const offsetX = -5;
    const offsetY = -5;

    mouseMoveHandler = (event) => {
      const x = event.clientX + offsetX;
      const y = event.clientY + offsetY;
      cursorElement.style.transform = `translate(${x}px, ${y}px)`;
      doc.body.classList.remove('creative-script-cursor-hidden');
    };

    mouseLeaveHandler = () => {
      doc.body.classList.add('creative-script-cursor-hidden');
    };

    mouseEnterHandler = () => {
      doc.body.classList.remove('creative-script-cursor-hidden');
    };

    win.addEventListener('mousemove', mouseMoveHandler);
    win.addEventListener('mouseleave', mouseLeaveHandler);
    win.addEventListener('mouseenter', mouseEnterHandler);

    return cleanup;
  }

  register(TEMPLATE_ID, cursorFactory);
})();
