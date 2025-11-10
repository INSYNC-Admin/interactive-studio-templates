(function () {
  const TEMPLATE_ID = 'template-3';

  const CONFIG = {
    SIM_RESOLUTION: 256,
    DYE_RESOLUTION: 256,
    DENSITY_DISSIPATION: 0.97,
    VELOCITY_DISSIPATION: 0.98,
    PRESSURE_DISSIPATION: 0.35,
    PRESSURE_ITERATIONS: 20,
    CURL: 2,
    SPLAT_RADIUS: 0.6,
    SHADING: true,
    COLORFUL: true,
    TRANSPARENT: true,
    BLOOM: true,
    BLOOM_INTENSITY: 0.9,
    BLOOM_THRESHOLD: 0.7,
    BLOOM_SOFT_KNEE: 0.7
  };

  const MOTION_MULTIPLIER = 3.5;
  const MIN_POINTER_DISTANCE = 10;
  const MIN_POINTER_DISTANCE_SQ = MIN_POINTER_DISTANCE * MIN_POINTER_DISTANCE;
  const EMITTER_RADIUS_SCALE = 1.7;
  const SPLAT_COOLDOWN_MS = 20;

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

    const isMobile = /Mobi|Android/i.test(win.navigator.userAgent || '');
    const isSafari = /^((?!chrome|android).)*safari/i.test(win.navigator.userAgent || '');

    if (isMobile || isSafari) {
      return () => {};
    }

    let layer = null;
    let canvas = null;
    let gl = null;
    let animationId = null;
    let removeResize = null;
    const cleanupFns = [];

    try {
      layer = doc.createElement('div');
      layer.className = 'creative-script-fluid-cursor-layer';

      canvas = doc.createElement('canvas');
      layer.appendChild(canvas);

      if (doc.body.firstChild) {
        doc.body.insertBefore(layer, doc.body.firstChild);
      } else {
        doc.body.appendChild(layer);
      }

      const { glContext, ext } = initWebGL(win, canvas);
      gl = glContext;

      const simulation = createSimulation(win, gl, canvas, ext, CONFIG);
      const pointerController = createPointerController(win, simulation.splat);

      cleanupFns.push(pointerController.cleanup);
      cleanupFns.push(simulation.cleanup);

      const render = () => {
        simulation.step();
        simulation.render();
        animationId = win.requestAnimationFrame(render);
      };
      render();

      removeResize = createResizeHandler(win, simulation.resize);
      if (typeof removeResize === 'function') {
        cleanupFns.push(removeResize);
      }
    } catch (error) {
      console.error('[Creative Script Cursor] template-3 initialisation failed:', error);
      cleanupInternal();
      return () => {};
    }

    function cleanupInternal() {
      if (animationId !== null) {
        win.cancelAnimationFrame(animationId);
        animationId = null;
      }
      cleanupFns.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn('[Creative Script Cursor] cleanup error', err);
        }
      });
      if (layer && layer.parentNode) {
        layer.parentNode.removeChild(layer);
      }
      layer = null;
      canvas = null;
    }

    return cleanupInternal;
  }

  function initWebGL(win, canvas) {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    };

    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;

    if (!gl) {
      gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    }
    if (!gl) {
      throw new Error('WebGL not supported');
    }

    let ext = {};
    let halfFloat;
    let supportLinearFiltering;

    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);
    if (!halfFloatTexType) {
      throw new Error('Required half-float support missing');
    }

    const formatRGBA = getSupportedFormat(gl, isWebGL2, halfFloatTexType, gl.RGBA16F, gl.RGBA) ||
      getSupportedFormat(gl, false, halfFloatTexType, gl.RGBA, gl.RGBA);
    const formatRG = getSupportedFormat(gl, isWebGL2, halfFloatTexType, gl.RG16F, gl.RG) || formatRGBA;
    const formatR = getSupportedFormat(gl, isWebGL2, halfFloatTexType, gl.R16F, gl.RED) || formatRGBA;

    ext = {
      supportLinearFiltering: !!supportLinearFiltering,
      halfFloatTexType,
      formatRGBA,
      formatRG,
      formatR
    };

    return { glContext: gl, ext };
  }

  function getSupportedFormat(gl, isWebGL2, type, internalFormat, format) {
    if (!isWebGL2) {
      if (internalFormat === gl.RG16F || internalFormat === gl.R16F) {
        return null;
      }
      return { internalFormat: format, format };
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(fbo);

    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      return null;
    }

    return { internalFormat, format };
  }

  function createSimulation(win, gl, canvas, ext, config) {
    const splatStack = [];

    const programs = compilePrograms(gl, ext);

    const state = {
      density: null,
      velocity: null,
      pressure: null,
      divergence: null,
      curl: null,
      simWidth: 0,
      simHeight: 0,
      dyeWidth: 0,
      dyeHeight: 0
    };

    resize();
    randomSplats(6);

    function resize() {
      const width = win.innerWidth;
      const height = win.innerHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      initFramebuffers();
    }

    function initFramebuffers() {
      const simRes = getResolution(gl, canvas, config.SIM_RESOLUTION);
      const dyeRes = getResolution(gl, canvas, config.DYE_RESOLUTION);

      state.simWidth = simRes.width;
      state.simHeight = simRes.height;
      state.dyeWidth = dyeRes.width;
      state.dyeHeight = dyeRes.height;

      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      state.density = state.density
        ? resizeDoubleFBO(gl, state.density, state.dyeWidth, state.dyeHeight, rgba, texType, filtering)
        : createDoubleFBO(gl, state.dyeWidth, state.dyeHeight, rgba, texType, filtering);

      state.velocity = state.velocity
        ? resizeDoubleFBO(gl, state.velocity, state.simWidth, state.simHeight, rg, texType, filtering)
        : createDoubleFBO(gl, state.simWidth, state.simHeight, rg, texType, filtering);

      state.divergence = createFBO(gl, state.simWidth, state.simHeight, r, texType, gl.NEAREST);
      state.curl = createFBO(gl, state.simWidth, state.simHeight, r, texType, gl.NEAREST);
      state.pressure = state.pressure
        ? resizeDoubleFBO(gl, state.pressure, state.simWidth, state.simHeight, r, texType, gl.NEAREST)
        : createDoubleFBO(gl, state.simWidth, state.simHeight, r, texType, gl.NEAREST);
    }

    function step() {
      for (let i = splatStack.length - 1; i >= 0; i--) {
        multipleSplats(splatStack[i]);
      }
      splatStack.length = 0;

      gl.disable(gl.BLEND);
      gl.viewport(0, 0, state.simWidth, state.simHeight);

      programs.curl.bind();
      gl.uniform2f(programs.curl.uniforms.texelSize, 1 / state.simWidth, 1 / state.simHeight);
      gl.uniform1i(programs.curl.uniforms.uVelocity, state.velocity.read.attach(0));
      blit(gl, programs.triangleBuffer, state.curl.fbo);

      programs.vorticity.bind();
      gl.uniform2f(programs.vorticity.uniforms.texelSize, 1 / state.simWidth, 1 / state.simHeight);
      gl.uniform1i(programs.vorticity.uniforms.uVelocity, state.velocity.read.attach(0));
      gl.uniform1i(programs.vorticity.uniforms.uCurl, state.curl.attach(1));
      gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL);
      gl.uniform1f(programs.vorticity.uniforms.dt, 0.016);
      blit(gl, programs.triangleBuffer, state.velocity.write.fbo);
      state.velocity.swap();

      programs.divergence.bind();
      gl.uniform2f(programs.divergence.uniforms.texelSize, 1 / state.simWidth, 1 / state.simHeight);
      gl.uniform1i(programs.divergence.uniforms.uVelocity, state.velocity.read.attach(0));
      blit(gl, programs.triangleBuffer, state.divergence.fbo);

      programs.clear.bind();
      gl.uniform1i(programs.clear.uniforms.uTexture, state.pressure.read.attach(0));
      gl.uniform1f(programs.clear.uniforms.value, config.PRESSURE_DISSIPATION);
      blit(gl, programs.triangleBuffer, state.pressure.write.fbo);
      state.pressure.swap();

      programs.pressure.bind();
      gl.uniform2f(programs.pressure.uniforms.texelSize, 1 / state.simWidth, 1 / state.simHeight);
      gl.uniform1i(programs.pressure.uniforms.uDivergence, state.divergence.attach(0));

      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(programs.pressure.uniforms.uPressure, state.pressure.read.attach(1));
        blit(gl, programs.triangleBuffer, state.pressure.write.fbo);
        state.pressure.swap();
      }

      programs.gradientSubtract.bind();
      gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, 1 / state.simWidth, 1 / state.simHeight);
      gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, state.pressure.read.attach(0));
      gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, state.velocity.read.attach(1));
      blit(gl, programs.triangleBuffer, state.velocity.write.fbo);
      state.velocity.swap();

      const advectionProgram = ext.supportLinearFiltering ? programs.advection : programs.advectionManualFiltering;
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, 1 / state.simWidth, 1 / state.simHeight);
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1 / state.simWidth, 1 / state.simHeight);
      }
      const velocityId = state.velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      gl.uniform1f(advectionProgram.uniforms.dt, 0.016);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(gl, programs.triangleBuffer, state.velocity.write.fbo);
      state.velocity.swap();

      gl.viewport(0, 0, state.dyeWidth, state.dyeHeight);
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1 / state.dyeWidth, 1 / state.dyeHeight);
      }
      gl.uniform1i(advectionProgram.uniforms.uVelocity, state.velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, state.density.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(gl, programs.triangleBuffer, state.density.write.fbo);
      state.density.swap();
    }

    function render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (!config.TRANSPARENT) {
        programs.color.bind();
        gl.uniform4f(programs.color.uniforms.color, 0, 0, 0, 1);
        blit(gl, programs.triangleBuffer, null);
      }

      const displayProgram = config.SHADING ? programs.displayShading : programs.display;
      displayProgram.bind();
      gl.uniform1i(displayProgram.uniforms.uTexture, state.density.read.attach(0));
      gl.uniform2f(displayProgram.uniforms.texelSize, 1 / canvas.width, 1 / canvas.height);
      blit(gl, programs.triangleBuffer, null);
    }

    function splat(x, y, dx, dy, color) {
      gl.viewport(0, 0, state.simWidth, state.simHeight);
      programs.splat.bind();
      gl.uniform1i(programs.splat.uniforms.uTarget, state.velocity.read.attach(0));
      gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(programs.splat.uniforms.point, x / canvas.width, 1 - y / canvas.height);
      gl.uniform3f(programs.splat.uniforms.color, dx, -dy, 1);
      gl.uniform1f(programs.splat.uniforms.radius, (config.SPLAT_RADIUS * EMITTER_RADIUS_SCALE) / 100);
      blit(gl, programs.triangleBuffer, state.velocity.write.fbo);
      state.velocity.swap();

      gl.viewport(0, 0, state.dyeWidth, state.dyeHeight);
      gl.uniform1i(programs.splat.uniforms.uTarget, state.density.read.attach(0));
      gl.uniform3f(programs.splat.uniforms.color, color.r, color.g, color.b);
      blit(gl, programs.triangleBuffer, state.density.write.fbo);
      state.density.swap();
    }

    function randomSplats(count) {
      for (let i = 0; i < count; i++) {
        const color = generateColor();
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
      }
    }

    function multipleSplats(amount) {
      for (let i = 0; i < amount; i++) {
        const color = generateColor();
        color.r *= 10;
        color.g *= 10;
        color.b *= 10;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
      }
    }

    function cleanup() {
      [state.density, state.velocity, state.pressure].forEach((fbos) => {
        if (!fbos) {
          return;
        }
        destroyDoubleFBO(gl, fbos);
      });
      [state.divergence, state.curl].forEach((fbo) => fbo && destroyFBO(gl, fbo));
      destroyPrograms(gl, programs);
    }

    return {
      step,
      render,
      resize,
      splat: (x, y, dx, dy) => {
        const color = generateColor();
        splat(x, y, dx, dy, color);
      },
      cleanup
    };
  }

  function createPointer() {
    return {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      moved: false
    };
  }

  function createPointerController(win, splat) {
    const pointer = createPointer();
    let isInteractionActive = false;
    let lastSplatTime = 0;

    const passiveMoveOptions = { passive: true };
    const touchMoveOptions = { passive: false };

    const getNow = () => (typeof win.performance !== 'undefined' && typeof win.performance.now === 'function'
      ? win.performance.now()
      : Date.now());

    const clampToViewport = (x, y) => {
      const within = x >= 0 && y >= 0 && x <= win.innerWidth && y <= win.innerHeight;
      return within;
    };

    const updatePointer = (x, y, timestamp) => {
      const now = timestamp ?? getNow();

      if (!clampToViewport(x, y)) {
        isInteractionActive = false;
        return false;
      }

      if (!isInteractionActive) {
        pointer.x = x;
        pointer.y = y;
        pointer.dx = 0;
        pointer.dy = 0;
        isInteractionActive = true;
        return false;
      }

      if (now - lastSplatTime < SPLAT_COOLDOWN_MS) {
        return false;
      }

      const deltaX = x - pointer.x;
      const deltaY = y - pointer.y;
      const distanceSq = deltaX * deltaX + deltaY * deltaY;

      if (distanceSq < MIN_POINTER_DISTANCE_SQ) {
        return false;
      }

      pointer.dx = deltaX * MOTION_MULTIPLIER;
      pointer.dy = deltaY * MOTION_MULTIPLIER;
      pointer.x = x;
      pointer.y = y;

      lastSplatTime = now;
      splat(pointer.x, pointer.y, pointer.dx, pointer.dy);
      return true;
    };

    const pointerDownHandler = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      if (!clampToViewport(x, y)) {
        return;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.dx = 0;
      pointer.dy = 0;
      isInteractionActive = true;
    };

    const pointerMoveHandler = (event) => {
      updatePointer(event.clientX, event.clientY, event.timeStamp ? event.timeStamp : undefined);
    };

    const pointerUpHandler = () => {
      isInteractionActive = false;
    };

    const touchStartHandler = (event) => {
      if (event.touches.length === 0) {
        return;
      }
      const touch = event.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      if (!clampToViewport(x, y)) {
        return;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.dx = 0;
      pointer.dy = 0;
      isInteractionActive = true;
    };

    const touchMoveHandler = (event) => {
      if (event.touches.length === 0) {
        return;
      }
      const touch = event.touches[0];
      const handled = updatePointer(touch.clientX, touch.clientY, event.timeStamp ? event.timeStamp : undefined);
      if (handled) {
        event.preventDefault();
      }
    };

    const touchEndHandler = () => {
      isInteractionActive = false;
    };

    win.addEventListener('pointerdown', pointerDownHandler, passiveMoveOptions);
    win.addEventListener('pointermove', pointerMoveHandler, passiveMoveOptions);
    win.addEventListener('pointerup', pointerUpHandler, passiveMoveOptions);
    win.addEventListener('pointercancel', pointerUpHandler, passiveMoveOptions);

    win.addEventListener('touchstart', touchStartHandler, touchMoveOptions);
    win.addEventListener('touchmove', touchMoveHandler, touchMoveOptions);
    win.addEventListener('touchend', touchEndHandler, passiveMoveOptions);
    win.addEventListener('touchcancel', touchEndHandler, passiveMoveOptions);

    return {
      cleanup() {
        win.removeEventListener('pointerdown', pointerDownHandler, passiveMoveOptions);
        win.removeEventListener('pointermove', pointerMoveHandler, passiveMoveOptions);
        win.removeEventListener('pointerup', pointerUpHandler, passiveMoveOptions);
        win.removeEventListener('pointercancel', pointerUpHandler, passiveMoveOptions);

        win.removeEventListener('touchstart', touchStartHandler, touchMoveOptions);
        win.removeEventListener('touchmove', touchMoveHandler, touchMoveOptions);
        win.removeEventListener('touchend', touchEndHandler, passiveMoveOptions);
        win.removeEventListener('touchcancel', touchEndHandler, passiveMoveOptions);
      }
    };
  }

  function createResizeHandler(win, onResize) {
    const resize = () => {
      onResize();
    };

    win.addEventListener('resize', resize);

    return () => {
      win.removeEventListener('resize', resize);
    };
  }

  function getResolution(gl, canvas, resolution) {
    const aspect = canvas.width / canvas.height;
    const aspectRatio = aspect > 1 ? aspect : 1 / aspect;
    const max = Math.round(resolution * aspectRatio);
    const min = Math.round(resolution);
    if (canvas.width > canvas.height) {
      return { width: max, height: min };
    }
    return { width: min, height: max };
  }

  function generateColor() {
    const h = Math.random();
    const s = 1;
    const v = 1;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        r = g = b = 1;
    }

    return {
      r: r * 0.3,
      g: g * 0.3,
      b: b * 0.3
    };
  }

  function compilePrograms(gl, ext) {
    const triangleBuffer = createTriangle(gl);

    const baseVertexShader = compileShader(gl, gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    const displayFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        gl_FragColor = vec4(c, 1.0);
      }
    `);

    const displayShadingFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main () {
        vec3 L = texture2D(uTexture, vL).rgb;
        vec3 R = texture2D(uTexture, vR).rgb;
        vec3 T = texture2D(uTexture, vT).rgb;
        vec3 B = texture2D(uTexture, vB).rgb;
        vec3 C = texture2D(uTexture, vUv).rgb;
        float dx = length(R) - length(L);
        float dy = length(T) - length(B);
        vec3 n = normalize(vec3(dx, dy, texelSize.y));
        float diffuse = clamp(dot(n, vec3(0.0, 0.0, 1.0)) + 0.7, 0.7, 1.0);
        C *= diffuse;
        gl_FragColor = vec4(C, 1.0);
      }
    `);

    const colorFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform vec4 color;
      void main () {
        gl_FragColor = color;
      }
    `);

    const clearFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);

    const splatFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const advectionFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
      }
    `);

    const advectionManualFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
        gl_FragColor.a = 1.0;
      }
    `);

    const divergenceFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x;
        if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y;
        if (vB.y < 0.0) B = -C.y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const curlFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `);

    const pressureFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractFrag = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const programs = {
      triangleBuffer,
      display: new GLProgram(gl, triangleBuffer, baseVertexShader, displayFrag),
      displayShading: new GLProgram(gl, triangleBuffer, baseVertexShader, displayShadingFrag),
      color: new GLProgram(gl, triangleBuffer, baseVertexShader, colorFrag),
      clear: new GLProgram(gl, triangleBuffer, baseVertexShader, clearFrag),
      splat: new GLProgram(gl, triangleBuffer, baseVertexShader, splatFrag),
      advection: new GLProgram(gl, triangleBuffer, baseVertexShader, advectionFrag),
      advectionManualFiltering: new GLProgram(gl, triangleBuffer, baseVertexShader, advectionManualFrag),
      divergence: new GLProgram(gl, triangleBuffer, baseVertexShader, divergenceFrag),
      curl: new GLProgram(gl, triangleBuffer, baseVertexShader, curlFrag),
      vorticity: new GLProgram(gl, triangleBuffer, baseVertexShader, vorticityFrag),
      pressure: new GLProgram(gl, triangleBuffer, baseVertexShader, pressureFrag),
      gradientSubtract: new GLProgram(gl, triangleBuffer, baseVertexShader, gradientSubtractFrag)
    };

    return programs;
  }

  function createTriangle(gl) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    return { vbo, ibo };
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader) || 'Shader compile failed';
      gl.deleteShader(shader);
      throw new Error(err);
    }
    return shader;
  }

  function GLProgram(gl, triangleBuffer, vertexShader, fragmentShader) {
    this.uniforms = {};
    this.gl = gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(this.program) || 'Program link failed';
      throw new Error(err);
    }

    const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniform = gl.getActiveUniform(this.program, i);
      this.uniforms[uniform.name] = gl.getUniformLocation(this.program, uniform.name);
    }

    this.bind = () => {
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer.vbo);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer.ibo);
      const position = gl.getAttribLocation(this.program, 'aPosition');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    };
  }

  function blit(gl, triangleBuffer, destination) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  function createFBO(gl, w, h, format, type, param) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, format.internalFormat, w, h, 0, format.format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  function createDoubleFBO(gl, w, h, format, type, param) {
    let fbo1 = createFBO(gl, w, h, format, type, param);
    let fbo2 = createFBO(gl, w, h, format, type, param);
    return {
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

  function resizeDoubleFBO(gl, target, w, h, format, type, param) {
    target.read = resizeFBO(gl, target.read, w, h, format, type, param);
    target.write = createFBO(gl, w, h, format, type, param);
    return target;
  }

  function resizeFBO(gl, target, w, h, format, type, param) {
    const newFBO = createFBO(gl, w, h, format, type, param);
    return newFBO;
  }

  function destroyDoubleFBO(gl, target) {
    if (!target) {
      return;
    }
    destroyFBO(gl, target.read);
    destroyFBO(gl, target.write);
  }

  function destroyFBO(gl, target) {
    if (!target) {
      return;
    }
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.fbo);
  }

  function destroyPrograms(gl, programs) {
    Object.keys(programs).forEach((key) => {
      const program = programs[key];
      if (program && program.program) {
        gl.deleteProgram(program.program);
      }
    });
  }

  register(TEMPLATE_ID, cursorFactory);
})();
