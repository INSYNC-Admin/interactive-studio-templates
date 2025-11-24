var ke = Object.defineProperty;
var zt = (i) => {
  throw TypeError(i);
};
var Fe = (i, t, e) => t in i ? ke(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var d = (i, t, e) => Fe(i, typeof t != "symbol" ? t + "" : t, e), Mt = (i, t, e) => t.has(i) || zt("Cannot " + e);
var h = (i, t, e) => (Mt(i, t, "read from private field"), e ? e.call(i) : t.get(i)), u = (i, t, e) => t.has(i) ? zt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(i) : t.set(i, e), A = (i, t, e, n) => (Mt(i, t, "write to private field"), n ? n.call(i, e) : t.set(i, e), e), f = (i, t, e) => (Mt(i, t, "access private method"), e);
const Ke = "72f6a2a4-9295-44e1-af41-f407261fa2c1", We = "/panel";
async function je() {
  var i, t;
  try {
    const { editor: e } = await Promise.resolve().then(() => vn);
    if ((i = e == null ? void 0 : e.addon) != null && i.open) {
      await e.addon.open({
        addonId: Ke,
        mode: "settings"
      });
      return;
    }
    throw new Error("editor.addon API not available");
  } catch (e) {
    console.warn("[Creative Script Widget] opening addon failed – fallback to browser tab", e);
    const n = ((t = window == null ? void 0 : window.location) == null ? void 0 : t.origin) ?? "https://interactive-studio.vercel.app";
    window.open(`${n}${We}`, "_blank", "noopener");
  }
}
class Le extends HTMLElement {
  connectedCallback() {
    this.style.display = "block", this.style.minHeight = "120px", this.innerHTML = `
      <div style="
        border: 1px dashed #c4c7d4;
        border-radius: 12px;
        padding: 16px;
        font-family: 'Wix Madefor Text', sans-serif;
        color: #404457;
        background:#f8f9ff;
      ">
        <strong>Creative Script Widget</strong>
        <p style="margin:8px 0 0; font-size:13px;">
          Öffne das Settings-Panel im Editor, um dein Widget zu konfigurieren.
        </p>
      </div>`;
  }
}
customElements.get("creative-script-widget") || customElements.define("creative-script-widget", Le);
window.CreativeScriptWidget = {
  openSettingsPanel: je
};
var L = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ue(i) {
  if (i.__esModule) return i;
  var t = i.default;
  if (typeof t == "function") {
    var e = function n() {
      return this instanceof n ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    e.prototype = t.prototype;
  } else e = {};
  return Object.defineProperty(e, "__esModule", { value: !0 }), Object.keys(i).forEach(function(n) {
    var s = Object.getOwnPropertyDescriptor(i, n);
    Object.defineProperty(e, n, s.get ? s : {
      enumerable: !0,
      get: function() {
        return i[n];
      }
    });
  }), e;
}
var U = {};
function $e(i, t = !1, e = (n) => n) {
  return () => ({
    __type: "event-definition",
    type: i,
    isDomainEvent: t,
    transformations: e
  });
}
function Be(i, t) {
  return {
    __type: "service-plugin-definition",
    componentType: i,
    methods: t
  };
}
var qe = "wix_spi_error";
const ze = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  EventDefinition: $e,
  SERVICE_PLUGIN_ERROR_TYPE: qe,
  ServicePluginDefinition: Be
}, Symbol.toStringTag, { value: "Module" })), He = /* @__PURE__ */ Ue(ze);
var Ct = {};
Object.defineProperty(Ct, "__esModule", { value: !0 });
Ct.EventType = void 0;
var Ht;
(function(i) {
  i.removeAppCompleted = "removeAppCompleted", i.componentSelectionChanged = "componentSelectionChanged", i.appInstalled = "appInstalled", i.appUpdateCompleted = "appUpdateCompleted";
})(Ht || (Ct.EventType = Ht = {}));
(function(i) {
  var t = L && L.__createBinding || (Object.create ? function(o, a, c, l) {
    l === void 0 && (l = c);
    var p = Object.getOwnPropertyDescriptor(a, c);
    (!p || ("get" in p ? !a.__esModule : p.writable || p.configurable)) && (p = { enumerable: !0, get: function() {
      return a[c];
    } }), Object.defineProperty(o, l, p);
  } : function(o, a, c, l) {
    l === void 0 && (l = c), o[l] = a[c];
  }), e = L && L.__setModuleDefault || (Object.create ? function(o, a) {
    Object.defineProperty(o, "default", { enumerable: !0, value: a });
  } : function(o, a) {
    o.default = a;
  }), n = L && L.__importStar || /* @__PURE__ */ function() {
    var o = function(a) {
      return o = Object.getOwnPropertyNames || function(c) {
        var l = [];
        for (var p in c) Object.prototype.hasOwnProperty.call(c, p) && (l[l.length] = p);
        return l;
      }, o(a);
    };
    return function(a) {
      if (a && a.__esModule) return a;
      var c = {};
      if (a != null) for (var l = o(a), p = 0; p < l.length; p++) l[p] !== "default" && t(c, a, l[p]);
      return e(c, a), c;
    };
  }();
  Object.defineProperty(i, "__esModule", { value: !0 }), i.EventType = i.WixSDKTypes = void 0;
  const s = n(He);
  i.WixSDKTypes = s;
  var r = Ct;
  Object.defineProperty(i, "EventType", { enumerable: !0, get: function() {
    return r.EventType;
  } });
})(U);
const k = class k {
  constructor() {
    d(this, "uid", 0);
    d(this, "callbacks", /* @__PURE__ */ new Map());
    d(this, "inTransaction", !1);
    d(this, "isSilent", !1);
    d(this, "queue", []);
  }
  silent(t = !0) {
    this.isSilent = t;
  }
  startTransaction() {
    this.inTransaction = !0;
  }
  commit() {
    this.inTransaction = !1;
    const t = this.queue;
    this.queue = [], this.isSilent || t.forEach((e) => {
      this.notify(e);
    });
  }
  notify(t) {
    this.isSilent || (this.inTransaction ? this.queue.push(t) : this.callbacks.forEach((e) => {
      e(t);
    }));
  }
  subscribe(t) {
    const e = this.uid++;
    return this.callbacks.set(e, t), () => {
      this.callbacks.delete(e);
    };
  }
  notifyWithStep(t, e) {
    this.notify({
      ...t,
      meta: {
        ...t.meta,
        step: e
      }
    });
  }
  async withEvent(t, e) {
    let n = e();
    if (n && n.hasOwnProperty("then"))
      try {
        return this.notifyWithStep(t, k.EventSteps.Start), n = await n, this.notifyWithStep(t, k.EventSteps.End), n;
      } catch (s) {
        throw this.notifyWithStep(
          {
            ...t,
            meta: {
              ...t.meta,
              error: s
            }
          },
          k.EventSteps.Error
        ), s;
      }
    else
      return this.notify(t), n;
  }
};
d(k, "biEvents", {
  PLATFORM_WORKER_SPAWN: 123,
  PLATFORM_APP_RUNNER_INIT_APP_API: 124,
  PLATFORM_APP_RUNNER_RUN_APP: 125,
  PLATFORM_APP_RUNNER_REMOVE_APP: 126,
  PLATFORM_WORKER_APP_BUNDLE_LOAD: 127,
  PLATFORM_WORKER_APP_BUNDLE_EXECUTE: 128,
  PLATFORM_IFRAME_INIT: 129,
  PLATFORM_APP_API_INIT: 130,
  PLATFORM_APP_API_GET: 131
}), d(k, "EventSteps", {
  Start: "start",
  End: "end",
  Error: "error"
});
let Ot = k;
var Ft = /* @__PURE__ */ ((i) => (i.WorkerSpawn = "WorkerSpawn", i.HostEvent = "HostEvent", i.ApplicationsSpecsReceived = "ApplicationsSpecsReceived", i.InitApplicationApi = "InitApplicationApi", i.RunApplication = "RunApplication", i.getApplicationApi = "getApplicationApi", i.IframeInit = "IframeInit", i))(Ft || {}), ie = /* @__PURE__ */ ((i) => (i.EditorReady = "EditorReady", i))(ie || {}), D = /* @__PURE__ */ ((i) => (i.ApplicationInit = "ApplicationInit", i.ApplicationExecute = "ApplicationExecute", i.ApplicationRemoved = "ApplicationRemoved", i.ApplicationLoad = "ApplicationLoad", i.ApplicationApiInit = "ApplicationApiInit", i.CustomEvent = "CustomEvent", i.HostEvent = "HostEvent", i.EditorReady = "EditorReady", i))(D || {});
class Ge {
  createApplicationRemovedEvent(t) {
    return {
      type: "ApplicationRemoved",
      payload: {
        appDefinitionId: t
      },
      meta: {
        bi: {
          evid: $.biEvents.PLATFORM_WORKER_SPAWN,
          appDefId: t
        }
      }
    };
  }
  createApplicationLoadEvent(t, e) {
    return {
      type: "ApplicationLoad",
      payload: {
        appDefinitionId: t.appDefinitionId,
        url: e
      },
      meta: {
        bi: {
          evid: $.biEvents.PLATFORM_WORKER_APP_BUNDLE_LOAD,
          appDefId: t.appDefinitionId,
          appType: t.appType,
          bundleUrl: e
        }
      }
    };
  }
  createApplicationExecuteEvent(t, e) {
    return {
      type: "ApplicationExecute",
      payload: {
        appDefinitionId: t.appDefinitionId,
        url: e
      },
      meta: {
        bi: {
          evid: $.biEvents.PLATFORM_WORKER_APP_BUNDLE_EXECUTE,
          appDefId: t.appDefinitionId,
          appType: t.appType,
          bundleUrl: e
        }
      }
    };
  }
  createApplicationApiInitEvent(t, e) {
    return {
      type: "ApplicationApiInit",
      payload: { appDefinitionId: t },
      meta: {
        bi: {
          evid: $.biEvents.PLATFORM_APP_API_INIT,
          appDefId: t,
          scope: e
        }
      }
    };
  }
}
class $ extends Ot {
  constructor() {
    super(...arguments);
    d(this, "factories", new Ge());
  }
}
const mt = class mt {
  constructor(t) {
    this.events = t;
  }
  mapToPlatformHostEvent(t) {
    if (typeof t == "string")
      try {
        t = JSON.parse(t);
      } catch {
      }
    return {
      type: Ft.HostEvent,
      payload: {
        type: t.args.eventType,
        ...t.args.eventPayload
      },
      meta: {
        appDefinitionId: t.appDefinitionId ?? null,
        intent: t.intent
      }
    };
  }
  /**
   * Notify by event from Worker Manager (platform infrastructure)
   */
  notify(t) {
    const e = this.mapToPlatformHostEvent(t);
    mt.allowedEvents.includes(e.payload.type) && this.events.notify(e);
  }
};
d(mt, "allowedEvents", [
  U.EventType.componentSelectionChanged,
  U.EventType.appInstalled,
  U.EventType.appUpdateCompleted,
  U.EventType.removeAppCompleted
]);
let Gt = mt;
class E extends Error {
  constructor(e, n, s) {
    const r = e ? ` ${e}` : "", o = `[${s}]#${n}`;
    super(`${o}.${r}`);
    d(this, "state", {});
    d(this, "displayName");
    d(this, "prefix");
    d(this, "errorMessage");
    d(this, "parent");
    d(this, "messages", []);
    d(this, "code");
    this.displayName = o, this.errorMessage = e, this.prefix = s, this.code = n, this.name = o, Object.defineProperty(this, "message", {
      get: () => this.getDisplayMessage()
    }), Error.captureStackTrace && Error.captureStackTrace(this, E);
  }
  get parentError() {
    const e = this.parent;
    if (!e)
      return null;
    if (this.parent instanceof E)
      return this.parent;
    const n = e.name ?? "[Unknown Error]";
    return {
      getBreadcrumbs() {
        return [n];
      },
      getMessage() {
        return [n, e.message ?? "unknown error message"].join(
          `
`
        );
      }
    };
  }
  /**
   * Returns formatted error message with breadcrumbs
   */
  getDisplayMessage() {
    return [(this.parentError ? this.getBreadcrumbs() : []).join(" -> "), this.getMessage()].filter((n) => n.trim().length).join(`
`);
  }
  /**
   * Returns formatted error message
   */
  getMessage() {
    const e = Object.entries(this.state).reduce((a, [c, l]) => (l && a.push(` – ${c}: ${l}`), a), []).join(`
`), n = this.messages.reduce((a, c) => (a.push(` - ${c.join(" ")}`), a), []).join(`
`), s = this.parentError, r = s ? ["", s.getMessage(), ""].join(`
`) : "", o = this.errorMessage ? `${this.displayName}: ${this.errorMessage}` : this.displayName;
    return [r, o, e, n].filter((a) => a.trim().length).join(`
`);
  }
  getBreadcrumbs() {
    const e = this.parentError;
    return e ? [...e.getBreadcrumbs(), this.displayName] : [this.displayName];
  }
  withParentError(e) {
    return this.parent = e, this;
  }
  withMessage(...e) {
    return this.messages.push(e), this;
  }
}
function X(i) {
  return function t(e, n = "") {
    const s = new i(n, e);
    return Error.captureStackTrace && Error.captureStackTrace(s, t), s;
  };
}
var Y = /* @__PURE__ */ ((i) => (i.IncorrectEnvironment = "IncorrectEnvironment", i))(Y || {});
class Ye extends E {
  constructor(e, n) {
    super(e, n, "EP Context Error");
    d(this, "state", {});
  }
  withUrl(e) {
    return this.state = { ...this.state, url: e }, this;
  }
  withAppDefinitionId(e) {
    return this.state = { ...this.state, appDefinitionId: e }, this;
  }
}
const et = X(Ye);
async function Ve(i, t) {
  if (!(i != null && i.type))
    return i;
  switch (i.type) {
    case "componentSelectionChanged":
      const e = i.componentRefs || [], n = await Promise.all(
        e.map((s) => t.components.getComponent(s))
      );
      return {
        type: i.type,
        components: n
      };
    default:
      return i;
  }
}
class Je {
  constructor(t, e, n) {
    d(this, "events");
    d(this, "subscribe");
    d(this, "commit");
    d(this, "startTransaction");
    d(this, "silent");
    this.appDefinitionId = t, this.privateAPI = n, this.events = e, this.subscribe = e.subscribe.bind(e), this.commit = e.commit.bind(e), this.startTransaction = e.startTransaction.bind(e), this.silent = e.silent.bind(e);
  }
  notify(t) {
    this.events.notify({
      type: t.type,
      payload: t.payload,
      meta: {
        appDefinitionId: this.appDefinitionId
      }
    });
  }
  notifyCustomEvent(t, e) {
    this.notify({
      type: D.CustomEvent,
      payload: {
        ...e,
        type: t
      }
    });
  }
  /**
   * TODO: we should use same interface for all events
   * (subscribe vs addEventListener)
   */
  addEventListener(t, e) {
    return this.events.subscribe(async (n) => {
      var o, a, c, l;
      const s = ((o = n.meta) == null ? void 0 : o.appDefinitionId) === this.appDefinitionId || ((a = n.meta) == null ? void 0 : a.appDefinitionId) === null, r = () => Ve(n.payload, this.privateAPI);
      t === "*" ? e(await r()) : n.type === D.CustomEvent ? t === ((c = n.payload) == null ? void 0 : c.type) && !s && e(await r()) : n.type === D.HostEvent && t === ((l = n.payload) == null ? void 0 : l.type) && s && e(await r());
    });
  }
}
const Xe = 200, Qe = 50;
var W, Nt, se;
class ne {
  constructor(t) {
    u(this, W);
    d(this, "injectionUUID");
    d(this, "injectionUUID_Deprecated");
    this.injectionUUID_Deprecated = `__${t}_CONTEXT_INJECTION_STATUS_KEY`, this.injectionUUID = `__${t}_CONTEXT_INJECTION_STATUS_KEY#0.1`, f(this, W, Nt).call(this) || f(this, W, se).call(this);
  }
  resolveInjected() {
    var t;
    (t = globalThis[this.injectionUUID]) == null || t.resolve();
  }
  waitInjected() {
    return new Promise((t, e) => {
      var a;
      let n = !1, s, r = 0;
      const o = () => {
        n || (s = setTimeout(() => {
          if (r++, r < Qe) {
            r % 10 === 0 && console.log(
              et(
                Y.IncorrectEnvironment,
                "contexts are not resolved, still re-trying"
              ).withMessage(`try number ${r}`).message
            ), o();
            return;
          }
          if (!n) {
            const c = et(
              Y.IncorrectEnvironment,
              "contexts are not resolved, threw by timeout"
            );
            e(c);
          }
        }, Xe));
      };
      o(), (a = f(this, W, Nt).call(this)) == null || a.then(() => {
        n = !0, clearTimeout(s), t();
      });
    });
  }
}
W = new WeakSet(), Nt = function() {
  const t = globalThis[this.injectionUUID];
  return t == null ? void 0 : t.promise;
}, se = function() {
  let t;
  const e = new Promise((n) => {
    t = n;
  });
  globalThis[this.injectionUUID] = {
    promise: e,
    resolve: t
  }, globalThis[this.injectionUUID_Deprecated] = new Promise((n) => {
    e.then(n);
  });
};
const Dt = "__ENVIRONMENT_CONTEXT_KEY";
var Kt = /* @__PURE__ */ ((i) => (i.Worker = "Worker", i.Frame = "Frame", i.ComponentPanel = "ComponentPanel", i))(Kt || {});
const wt = class wt {
  constructor(t) {
    this.environmentContext = t;
  }
  static async inject(t) {
    if (globalThis[Dt])
      throw et(
        Y.IncorrectEnvironment,
        "Environment context already exists and should not be overridden"
      );
    globalThis[Dt] = new wt(t), this.status.resolveInjected();
  }
  static async getInstance() {
    return await this.status.waitInjected(), globalThis[Dt];
  }
  getPrivateAPI() {
    return this.environmentContext.privateApi;
  }
  getEvents() {
    return this.environmentContext.events;
  }
  getApplicationAPIs() {
    return this.environmentContext.applicationAPIs ?? {};
  }
  getEnvironment() {
    return this.environmentContext.environment;
  }
};
d(wt, "status", new ne("environment"));
let V = wt;
const Pt = "__APPLICATION_CONTEXT_KEY", It = class It {
  constructor(t, e) {
    d(this, "events");
    this.context = t, this.environment = e, this.events = new Je(
      t.appDefinitionId ? t.appDefinitionId : null,
      this.environment.getEvents(),
      this.environment.getPrivateAPI()
    );
  }
  /**
   * TODO: use generics for context type
   * - application
   * - editor
   */
  static async inject(t) {
    if (globalThis[Pt])
      throw et(
        Y.IncorrectEnvironment,
        "Application context already exists and should not be overridden"
      );
    globalThis[Pt] = new It(
      t,
      await V.getInstance()
    ), this.status.resolveInjected();
  }
  static async getInstance() {
    return typeof __APPLICATION_CONTEXT_KEY < "u" ? __APPLICATION_CONTEXT_KEY : (await this.status.waitInjected(), globalThis[Pt]);
  }
  getContext() {
    return this.context;
  }
  getAppDefinitionId() {
    return this.context.appDefinitionId;
  }
  getManifestContextId() {
    return this.context.manifestContextId;
  }
  getEvents() {
    return this.events;
  }
  getEnvironmentContext() {
    return this.environment;
  }
  getPrivateAPI() {
    return this.environment.getPrivateAPI();
  }
  getPrivateApplicationAPI() {
    const t = this.getAppDefinitionId();
    if (!t)
      throw et(
        Y.IncorrectEnvironment,
        "appDefinitionId is not available"
      );
    return this.environment.getApplicationAPIs()[t];
  }
};
d(It, "status", new ne("application"));
let S = It;
const dt = (i) => `"editor-platform-transport": ${i}`, re = (i) => dt(`[Internal Error] ${i}`), ae = "ƒ", oe = "∂", ce = "_get_", le = "_set_", gt = "+", Yt = "-", Wt = "·", jt = "×", Lt = "°", pe = (i) => i[0] === jt ? "" : i, Vt = (i) => i === null || typeof i > "u" || typeof i == "symbol" || typeof i == "number" || typeof i == "boolean" || typeof i == "function" || typeof i == "string", Ze = (i) => !!i && typeof i == "object" && !Array.isArray(i) && !(i instanceof Date) && !(i instanceof Set) && !(i instanceof Map), ti = (i) => q(i.split(Wt)), q = (i) => i.map(pe).filter(Boolean).join(".");
function xt(i, t) {
  return {
    marker: i,
    ...t
  };
}
const ei = xt("A", {
  shouldUse: (i) => Array.isArray(i),
  serialize: (i, t) => {
    i.length ? i.forEach((e, n) => {
      t(`${n}`, e);
    }) : t("", Lt);
  },
  deserialize: {
    create: () => [],
    has: (i, t) => !(typeof i[t] > "u"),
    append: (i, t, e) => {
      i.push(e);
    }
  }
}), ii = xt("M", {
  shouldUse: (i) => i instanceof Map,
  serialize: (i, t) => {
    i.forEach((e, n) => {
      t(n, e);
    });
  },
  deserialize: {
    create: () => /* @__PURE__ */ new Map(),
    has: (i, t) => i.has(t),
    append: (i, t, e) => {
      i.set(t, e);
    }
  }
}), ni = xt("S", {
  shouldUse: (i) => i instanceof Set,
  serialize: (i, t) => {
    let e = 0;
    i.forEach((n) => {
      t(`${e++}`, n);
    });
  },
  deserialize: {
    create: () => /* @__PURE__ */ new Set(),
    has: (i, t) => i.has(t),
    append: (i, t, e) => {
      i.add(e);
    }
  }
}), kt = xt(
  "O",
  {
    shouldUse: (i) => typeof i == "object",
    serialize: (i, t) => {
      const e = (n) => {
        const r = Reflect.ownKeys(n).filter((a) => a !== "constructor").filter((a) => typeof a != "symbol");
        r.length ? r.filter((a) => a !== "constructor").filter((a) => typeof a != "symbol").forEach((a) => {
          const c = Reflect.get(i, a);
          t(a, c);
        }) : t("", Lt);
        const o = Reflect.getPrototypeOf(n);
        !o || o != null && o.hasOwnProperty("__proto__") || e(o);
      };
      e(i);
    },
    deserialize: {
      create: () => ({}),
      has: (i, t) => !!i[t],
      append: (i, t, e) => {
        i[t] = e;
      }
    }
  }
), he = [ei, ni, ii];
function si(i, t) {
  let e = i;
  for (; e; ) {
    const n = Object.getOwnPropertyDescriptor(e, t);
    if (n)
      return n;
    e = Reflect.getPrototypeOf(e);
  }
  return null;
}
function ri(i, t) {
  const e = /* @__PURE__ */ new WeakMap(), n = (r) => {
    const o = r.slice(1).map(pe).filter(Boolean);
    return o.slice(1).reduce(
      (a, c) => ({
        context: a.context[a.pointer],
        pointer: c
      }),
      {
        context: i,
        pointer: o[0]
      }
    );
  }, s = (r, o = []) => {
    var c;
    if (e.has(r) && ((c = e.get(r)) == null ? void 0 : c.some((p) => o.join(".").startsWith(p)))) {
      t(o, {
        ...n(o),
        value: "[Circular]"
      });
      return;
    }
    if (r && !Vt(r) && (e.has(r) && e.set(r, []), e.set(r, [
      ...e.get(r) ?? [],
      o.join(".")
    ])), Vt(r)) {
      t(o, {
        ...n(o),
        value: r
      });
      return;
    }
    const a = he.find((l) => l.shouldUse(r)) ?? kt;
    if (a) {
      a.serialize(r, (l, p) => {
        s(p, [
          ...o,
          `${jt}${a.marker}`,
          l
        ]);
      });
      return;
    }
  };
  return s(i);
}
const ai = (i, t) => {
  if (!Ze(i))
    throw new Error(
      dt("only objects are serializable at the root level")
    );
  const e = {
    data: []
  }, n = (r, o) => {
    e.data.push([r, o]);
  }, s = (r, o) => {
    t(ti(r), (...a) => o.context[o.pointer](...a)), n(r, ae);
  };
  return ri(i, (r, { value: o, context: a, pointer: c }) => {
    const l = r.slice(1).join(Wt), p = si(a, c);
    if (p != null && p.get || p != null && p.set) {
      p != null && p.get && t(
        q([...r, ce]),
        () => a[c]
      ), p != null && p.set && t(
        q([...r, le]),
        (I) => {
          a[c] = I;
        }
      );
      const g = [
        p != null && p.get ? gt : Yt,
        p != null && p.set ? gt : Yt
      ];
      n(l, `${oe}${g.join("")}`);
    } else typeof o == "function" ? s(l, { context: a, pointer: c }) : n(l, o);
  }), e;
}, oi = (i, t) => typeof i != "object" || i === null ? i : i.data.reduce(
  (e, [n, s]) => {
    let r = e;
    const o = n.split(Wt);
    let a = kt, c = null;
    for (let l = 0; l < o.length; l++) {
      const p = o[l];
      if (p[0] === jt) {
        const g = a.deserialize.has(r, c);
        if (a = [kt, ...he].find(
          (I) => I.marker === p[1]
        ), !a)
          throw new Error(dt(`unknown marker "${p[1]}"`));
        g || (r[c] = a.deserialize.create()), r = r[c];
      } else
        c = p;
    }
    if ((s == null ? void 0 : s.toString()) === Lt)
      return e;
    if ((s == null ? void 0 : s.toString()) === ae)
      a.deserialize.append(
        r,
        c,
        t(q(o))
      );
    else if ((s == null ? void 0 : s.toString()[0]) === oe) {
      const l = (s == null ? void 0 : s.toString()[1]) === gt, p = (s == null ? void 0 : s.toString()[2]) === gt, g = {};
      if (l) {
        const I = t(
          q([...o, ce])
        );
        g.get = () => I();
      }
      p && (g.set = t(
        q([...o, le])
      )), Object.defineProperty(r, c, g);
    } else
      a.deserialize.append(r, c, s);
    return e;
  },
  // TODO: define as enumrable
  {
    [Symbol("transferred object")]: `${(JSON.stringify(i.data).length / 1024).toFixed(2)}Kb`
  }
);
function de() {
  const i = globalThis.performance;
  if (i && i.now)
    return i.now();
  let t = "";
  const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n = e.length;
  let s = 0;
  const r = 10;
  for (; s < r; )
    t += e.charAt(Math.floor(Math.random() * n)), s += 1;
  return t;
}
var tt = /* @__PURE__ */ ((i) => (i.ExposeAPI = "ExposeAPI", i.Call = "Call", i.Response = "Response", i.Cleanup = "Cleanup", i))(tt || {});
class _ {
  constructor(t, e) {
    d(this, "correlationId", `M-${de()}`);
    d(this, "parentCorrelationId");
    this.type = t, this.payload = e;
  }
  withParentCorrelationId(t) {
    return this.parentCorrelationId = t, this;
  }
  serialize(t) {
    return JSON.stringify({
      parentCorrelationId: this.parentCorrelationId,
      correlationId: this.correlationId,
      type: this.type,
      payload: ai(this.payload, (e, n) => {
        t(this.correlationId, e, n);
      })
    });
  }
  static fromEvent(t, e) {
    const n = JSON.parse(t);
    return new _(
      n.type,
      oi(n.payload, (s) => e(n.correlationId, s))
    ).withParentCorrelationId(n.correlationId);
  }
}
class ci extends _ {
  constructor(t) {
    super("Cleanup", t);
  }
}
class li extends _ {
  constructor(t) {
    super("Response", t);
  }
}
class Jt extends _ {
  constructor(t) {
    super("Response", t);
  }
}
class pi extends _ {
  constructor(t) {
    super("Call", t);
  }
}
const Tt = (i, t) => `${i}_${t}`;
var At, yt, z, v;
class hi {
  constructor(t) {
    u(this, At, new FinalizationRegistry((t) => {
      this.postMessage(new ci(t));
    }));
    u(this, yt, {
      [tt.Cleanup]: (t) => {
        const e = t.payload.functionMarkerKey, n = t.payload.callId;
        delete h(this, z)[e], n && delete h(this, v)[n];
      },
      /**
       * Return function response between threads
       */
      [tt.Response]: async (t) => {
        var s, r, o;
        const e = t.payload.callId, n = t.payload.errorMessage;
        if (n)
          if (t.payload.errorStack) {
            const c = new Error(n);
            c.stack = t.payload.errorStack, (s = h(this, v)[e]) == null || s.reject(c);
          } else
            (r = h(this, v)[e]) == null || r.reject(n);
        else {
          const a = t.payload.response;
          (o = h(this, v)[e]) == null || o.resolve(a);
        }
        delete h(this, v)[e];
      },
      /**
       * Calling function between threads
       */
      [tt.Call]: async (t) => {
        const e = t.payload.functionMarkerKey, n = h(this, z)[e];
        if (!n) {
          this.postMessage(
            new Jt({
              callId: t.payload.callId,
              errorMessage: dt("function is not available")
            })
          );
          return;
        }
        try {
          const s = await n.value(...t.payload.props ?? []);
          this.postMessage(
            new li({
              callId: t.payload.callId,
              response: s
            })
          );
        } catch (s) {
          this.postMessage(
            new Jt({
              callId: t.payload.callId,
              /**
               * for better DX we need to pass Error object to keep stack trace available
               * but in some cases our custom error messages are not serialized correctly
               */
              errorMessage: s.message,
              errorStack: s.stack
            })
          );
        }
      }
    });
    u(this, z, {});
    u(this, v, {});
    d(this, "queue", []);
    this.port = t, this.port.onmessage = (e) => {
      this.onMessage(e);
    };
  }
  onMessage(t) {
    var n, s, r, o;
    const e = _.fromEvent(t.data, (a, c) => {
      const l = this.replaceTransferredFunction(
        a,
        c
      );
      return h(this, At).register(l, {
        functionMarkerKey: Tt(a, c)
        // callId: message.payload?.callId,
      }), l;
    });
    (s = (n = h(this, yt))[e.type]) == null || s.call(n, e), (o = (r = this.messageEvents)[e.type]) == null || o.call(r, e);
  }
  postMessage(t) {
    this.port.postMessage(
      t.serialize(this.registerTransferredFunction.bind(this))
    );
  }
  registerTransferredFunction(t, e, n) {
    const s = Tt(t, e);
    h(this, z)[s] = {
      path: e,
      value: n
    };
  }
  replaceTransferredFunction(t, e) {
    return (...n) => {
      const s = `CALL-${crypto.randomUUID()}`;
      return this.postMessage(
        new pi({
          callId: s,
          functionMarkerKey: Tt(t, e),
          props: n
        })
      ), new Promise((r, o) => {
        h(this, v)[s] = { resolve: r, reject: o };
      });
    };
  }
  flush() {
    this.queue.forEach((t) => {
      this.postMessage(t);
    }), this.queue = [];
  }
  /**
   * TODO:
   * before message port is disposed
   * we need to cleanup all pending promises (probably reject or cancel with AbortController)
   * note, this function should be async, and we need
   * to wait it before dispose port and create a new port
   */
  // shutdown() {
  //   this.postMessage(new MessageShutdown());
  //
  //   Object.keys(this.#pendingFunctionResponse).forEach((key) => {
  //     const value = this.#pendingFunctionResponse[key]
  //     if (value && value.reject && value.resolve) {
  //       value.reject(new Error('transport port shutdown'));
  //     }
  //   })
  // }
}
At = new WeakMap(), yt = new WeakMap(), z = new WeakMap(), v = new WeakMap();
class ue extends hi {
  constructor() {
    super(...arguments);
    d(this, "messageEvents", {});
  }
  expose(e) {
    if (!e.type)
      throw new Error(
        dt('wrong exposed API instance, "type" property is required')
      );
    this.queue.push(new _(tt.ExposeAPI, e)), this.flush();
  }
}
var Q = /* @__PURE__ */ ((i) => (i.Ping = "EDITOR_PLATFORM_TRANSPORT_EVENT:__Ping", i.RequestPort = "EDITOR_PLATFORM_TRANSPORT_EVENT:__RequestPort", i.Pong = "EDITOR_PLATFORM_TRANSPORT_EVENT:__Pong", i.Port = "EDITOR_PLATFORM_TRANSPORT_EVENT:__Port", i))(Q || {}), H, M, vt, fe;
class di {
  constructor(t, e) {
    u(this, vt);
    u(this, H, /* @__PURE__ */ new Set());
    u(this, M);
    this.postMessage = t, this.onMessage = e;
  }
  setActivePort(t) {
    this.dispose(), A(this, M, t), f(this, vt, fe).call(this);
  }
  dispose() {
    h(this, M) && (h(this, M).close(), h(this, M).onmessage = null);
  }
  onHandshake(t) {
    return h(this, H).add(t), () => {
      h(this, H).delete(t);
    };
  }
}
H = new WeakMap(), M = new WeakMap(), vt = new WeakSet(), fe = function() {
  const t = h(this, M);
  if (!t) {
    console.warn(
      re(
        "port is required no notify onHandshake listeners"
      )
    );
    return;
  }
  h(this, H).forEach((e) => e(t));
};
var it, nt, T, ge, me, we;
class Pe extends di {
  constructor(e, n) {
    super(e, n);
    u(this, T);
    u(this, it, !1);
    u(this, nt, `consumer-${de()}`);
    f(this, T, ge).call(this);
    const s = {
      type: Q.Ping
    };
    e(JSON.stringify(s));
  }
}
it = new WeakMap(), nt = new WeakMap(), T = new WeakSet(), ge = function() {
  this.onMessage((e) => {
    var n;
    try {
      const s = JSON.parse(e.data);
      switch (s.type) {
        case Q.Pong: {
          f(this, T, me).call(this);
          break;
        }
        case Q.Port: {
          f(this, T, we).call(this, s.targetMemberId, (n = e.ports) == null ? void 0 : n[0]);
          break;
        }
      }
    } catch {
    }
  });
}, me = function() {
  if (h(this, it))
    return;
  A(this, it, !0);
  const e = {
    type: Q.RequestPort,
    memberId: h(this, nt)
  };
  this.postMessage(JSON.stringify(e));
}, we = function(e, n) {
  if (e === h(this, nt)) {
    if (!n)
      throw new Error(re("no port at consumer handshake"));
    this.setActivePort(n);
  }
};
class Ie {
  get onConnect() {
    return this.handshake.onHandshake.bind(this.handshake);
  }
}
class Ut extends Ie {
  constructor() {
    super(...arguments);
    d(this, "handshake", new Pe(
      (e) => {
        globalThis.parent.postMessage(e, "*");
      },
      (e) => {
        globalThis.addEventListener("message", e);
      }
    ));
  }
  static exposeAPI(e) {
    new Ut().onConnect((s) => {
      new ue(s).expose(e);
    });
  }
}
class $t extends Ie {
  constructor() {
    super(...arguments);
    d(this, "handshake", new Pe(
      (e) => {
        globalThis.postMessage(e);
      },
      (e) => {
        globalThis.addEventListener("message", e);
      }
    ));
  }
  static exposeAPI(e) {
    new $t().onConnect((s) => {
      new ue(s).expose(e);
    });
  }
}
class Ae {
  constructor(t) {
    this.platformAppEvents = t;
  }
  /**
   * Notify by event from Worker Manager (platform infrastructure)
   */
  notify(t) {
    switch (t.type) {
      case ie.EditorReady:
        this.platformAppEvents.notify({
          ...t,
          // @ts-expect-error TODO: fix me
          type: D.EditorReady
        });
        break;
      case Ft.HostEvent:
        this.platformAppEvents.notify({
          ...t,
          type: D.HostEvent
        });
        break;
    }
  }
  /**
   * Subscribe to Worker (Application) event
   */
  subscribe(t) {
    this.platformAppEvents.subscribe((e) => {
      t(e);
    });
  }
}
var Bt = /* @__PURE__ */ ((i) => (i.Frame = "PLATFORM_FRAME_API", i.Worker = "PLATFORM_WORKER_API", i))(Bt || {});
class ye {
  constructor(t, e) {
    this.type = t, this.envType = e;
  }
  async injectEnvironmentContext({
    events: t,
    privateApi: e
  }) {
    await V.inject({
      environment: this.envType,
      events: t,
      privateApi: e,
      applicationAPIs: {}
    });
  }
  async injectApplicationContext(t) {
    await S.inject(t);
  }
}
const ui = {
  classic: "https://www.unpkg.com/@wix/design-system/dist/statics/tokens-default.global.css",
  studio: "https://www.unpkg.com/@wix/design-system/dist/statics/tokens-studio.global.css"
};
var st, rt, bt, at, Et, ve;
class fi extends ye {
  constructor() {
    super(Bt.Frame, Kt.Frame);
    u(this, Et);
    u(this, st, new $());
    u(this, rt, new Ae(h(this, st)));
    u(this, bt);
    u(this, at);
    f(this, Et, ve).call(this);
  }
  /**
   *
   * We need to introduce context versions
   * to simplify handling the backward compatibility issues
   */
  async initEnvironment(e) {
    var c;
    const { applicationPrivateAPI: n, privateAPI: s, context: r } = e, o = ((c = e.context) == null ? void 0 : c.appDefinitionId) ?? e.appDefinitionId, a = e.context ? e.context : {
      appDefinitionId: o
    };
    A(this, at, n), A(this, bt, s), await this.injectEnvironmentContext({
      privateApi: s,
      events: h(this, st),
      applicationAPIs: o ? {
        [o]: h(this, at)
      } : {}
    }), await this.injectApplicationContext(a);
  }
  notify(e) {
    h(this, rt).notify(e);
  }
  subscribe(e) {
    h(this, rt).subscribe(e);
  }
}
st = new WeakMap(), rt = new WeakMap(), bt = new WeakMap(), at = new WeakMap(), Et = new WeakSet(), ve = function() {
  var e, n, s;
  if (typeof ((n = (e = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : e.head) == null ? void 0 : n.prepend) == "function") {
    const o = new URL(globalThis.location.href).searchParams.get("editorType") === "CLASSIC" ? "classic" : "studio", a = ui[o], c = a && !!((s = document.querySelectorAll(`link[type="text/css"][href="${a}"]`)) != null && s.length);
    if (a && !c) {
      const l = document.createElement("link");
      l.setAttribute("rel", "stylesheet"), l.setAttribute("type", "text/css"), l.setAttribute("href", a), globalThis.document.head.prepend(l);
    }
  }
};
var x = /* @__PURE__ */ ((i) => (i.ApplicationLoadError = "ApplicationLoadError", i.ApplicationFetchError = "ApplicationFetchError", i.ApplicationExecuteError = "ApplicationExecuteError", i))(x || {});
class Pi extends E {
  constructor(e, n) {
    super(e, n, "EP Application Container Error");
    d(this, "state", {});
  }
  withUrl(e) {
    return this.state = { ...this.state, url: e }, this;
  }
  withAppDefinitionId(e) {
    return this.state = { ...this.state, appDefinitionId: e }, this;
  }
  withApiMethod(e) {
    return this.state = { ...this.state, apiMethod: e }, this;
  }
  withApiType(e) {
    return this.state = { ...this.state, apiType: e }, this;
  }
}
const O = X(Pi), gi = "__APPLICATION_REGISTRY_KEY";
async function mi(i, t, e) {
  const n = new Function(
    Pt,
    gi,
    e
  );
  let s;
  const r = (o) => {
    if (s)
      throw O(
        x.ApplicationExecuteError,
        "Application registry called more than once"
      ).withAppDefinitionId(t.appDefinitionId);
    if (o.type !== t.type)
      throw O(
        x.ApplicationExecuteError,
        "Application has different type"
      ).withMessage("expected type", t.type).withMessage("received type", o.type);
    s = o;
  };
  try {
    const o = { ...t };
    n.call(
      null,
      new S(o, await V.getInstance()),
      r
    );
  } catch (o) {
    throw O(
      x.ApplicationExecuteError,
      o.message
    ).withAppDefinitionId(t.appDefinitionId).withParentError(o);
  }
  return new Promise((o, a) => {
    const c = i.subscribe((l) => {
      const p = setTimeout(() => {
        clearTimeout(p), c(), s || a(
          O(
            x.ApplicationExecuteError,
            "Application registry was not called, threw by timeout"
          ).withAppDefinitionId(t.appDefinitionId)
        );
      }, 5e3);
      l.type === D.ApplicationInit && l.meta.appDefinitionId === t.appDefinitionId && (clearTimeout(p), c(), s || a(
        O(
          x.ApplicationExecuteError,
          "Application registry was not called"
        ).withAppDefinitionId(t.appDefinitionId)
      ), o({ instance: s }));
    });
  });
}
var F, ot, w;
class wi {
  constructor(t, e) {
    u(this, F, {});
    u(this, ot);
    u(this, w);
    A(this, ot, t), A(this, w, e), h(this, w).subscribe((n) => {
      switch (n.type) {
        case D.HostEvent: {
          n.payload.type === U.EventType.removeAppCompleted && h(this, w).withEvent(
            h(this, w).factories.createApplicationRemovedEvent(
              n.payload.appDefinitionId
            ),
            () => this.removeApplication(n.payload.appDefinitionId)
          );
          break;
        }
      }
    });
  }
  async runApplication(t) {
    const e = await this.loadApplication(t), n = await this.executeApplication(t, e);
    return this.setApplication(t.appDefinitionId, n), n;
  }
  setApplication(t, e) {
    var n;
    h(this, F)[t] = e, h(this, w).withEvent(
      h(this, w).factories.createApplicationApiInitEvent(
        t,
        // TODO: both types are set here...
        // @ts-expect-error TODO: fix me
        (n = e == null ? void 0 : e.api) != null && n.private ? "private" : "public"
      ),
      () => {
        h(this, ot).applicationManager.setApplication(e);
      }
    );
  }
  getApplication(t) {
    return h(this, F)[t];
  }
  getAppDefinitionIds() {
    return Object.keys(h(this, F));
  }
  removeApplication(t) {
    delete h(this, F)[t];
  }
  async loadApplication(t) {
    const e = t.url;
    return h(this, w).withEvent(
      h(this, w).factories.createApplicationLoadEvent(t, e),
      async () => {
        try {
          return await this.loadApplicationBundle(e);
        } catch (n) {
          throw O(
            x.ApplicationLoadError
          ).withUrl(e).withAppDefinitionId(t.appDefinitionId).withParentError(n);
        }
      }
    );
  }
  async loadApplicationBundle(t) {
    const e = await fetch(t, {
      method: "GET"
    });
    if (!(e.status >= 200 && e.status <= 299))
      throw O(
        x.ApplicationFetchError
      ).withUrl(t);
    return e.text();
  }
  async executeApplication(t, e) {
    return h(this, w).withEvent(
      h(this, w).factories.createApplicationExecuteEvent(
        t,
        t.url
      ),
      async () => {
        const { instance: n } = await mi(
          h(this, w),
          t,
          e
        );
        return n;
      }
    );
  }
}
F = new WeakMap(), ot = new WeakMap(), w = new WeakMap();
var G, ct, lt, K, pt;
class Ii extends ye {
  constructor() {
    super(
      Bt.Worker,
      Kt.Worker
    );
    u(this, G, new $());
    u(this, ct, new Ae(h(this, G)));
    u(this, lt, null);
    u(this, K);
    u(this, pt, []);
  }
  create() {
  }
  async initEnvironment(e) {
    const { buildPrivateAPI: n } = e;
    A(this, K, await n({
      // TODO: should be per application (within the container before app execution)
      type: "EDITOR_ADDON"
    })), await this.injectEnvironmentContext({
      events: h(this, G),
      privateApi: h(this, K),
      applicationAPIs: {}
    }), A(this, lt, new wi(
      h(this, K),
      h(this, G)
    )), h(this, pt).forEach((s) => s(this));
  }
  async notify(e) {
    await this.waitReady(), h(this, ct).notify(e);
  }
  subscribe(e) {
    h(this, ct).subscribe(e);
  }
  async runApplication(e) {
    await this.waitReady(), await h(this, lt).runApplication(e);
  }
  // TODO: should not be any waiters here
  // or should be implemented inside the events instances
  // collect queue until app is not ready
  waitReady() {
    return new Promise((e) => {
      if (h(this, K))
        return e(this);
      h(this, pt).push(e);
    });
  }
}
G = new WeakMap(), ct = new WeakMap(), lt = new WeakMap(), K = new WeakMap(), pt = new WeakMap();
const _t = "$_EP_TRANSPORT_ENV_CONTEXT_GUARD";
var J, be, Ee;
class Ai {
  constructor() {
    u(this, J);
  }
  isEnvironmentApiExposed() {
    return !!globalThis[_t];
  }
  async getContexts() {
    const [t, e] = await Promise.all([
      V.getInstance(),
      S.getInstance()
    ]);
    return {
      environmentContext: t,
      applicationContext: e
    };
  }
  expose() {
    if (this.isEnvironmentApiExposed())
      return;
    const t = typeof importScripts == "function", e = globalThis.self && globalThis.top && globalThis.self !== globalThis.top;
    t ? (f(this, J, be).call(this), globalThis[_t] = !0) : e && (f(this, J, Ee).call(this), globalThis[_t] = !0);
  }
}
J = new WeakSet(), be = function() {
  $t.exposeAPI(new Ii());
}, Ee = function() {
  Ut.exposeAPI(new fi());
};
var y = {};
function yi() {
  const i = typeof $wixContext < "u" && $wixContext.initWixModules ? $wixContext.initWixModules : typeof globalThis.__wix_context__ < "u" && globalThis.__wix_context__.initWixModules ? globalThis.__wix_context__.initWixModules : void 0;
  if (i)
    return {
      // @ts-expect-error
      initWixModules(n, s) {
        return Rt(() => i(n, s));
      },
      fetchWithAuth() {
        throw new Error("fetchWithAuth is not available in this context");
      },
      graphql() {
        throw new Error("graphql is not available in this context");
      }
    };
  const t = typeof $wixContext < "u" ? $wixContext.client : typeof y.client < "u" ? y.client : typeof globalThis.__wix_context__ < "u" ? globalThis.__wix_context__.client : void 0, e = typeof $wixContext < "u" ? $wixContext.elevatedClient : typeof y.elevatedClient < "u" ? y.elevatedClient : typeof globalThis.__wix_context__ < "u" ? globalThis.__wix_context__.elevatedClient : void 0;
  if (!(!t && !e))
    return {
      initWixModules(n, s) {
        if (s) {
          if (!e)
            throw new Error("An elevated client is required to use elevated modules. Make sure to initialize the Wix context with an elevated client before using elevated SDK modules");
          return Rt(() => e.use(n));
        }
        if (!t)
          throw new Error("Wix context is not available. Make sure to initialize the Wix context before using SDK modules");
        return Rt(() => t.use(n));
      },
      fetchWithAuth: (n, s) => {
        if (!t)
          throw new Error("Wix context is not available. Make sure to initialize the Wix context before using SDK modules");
        return t.fetchWithAuth(n, s);
      },
      getAuth() {
        if (!t)
          throw new Error("Wix context is not available. Make sure to initialize the Wix context before using SDK modules");
        return t.auth;
      },
      async graphql(n, s, r) {
        if (!t)
          throw new Error("Wix context is not available. Make sure to initialize the Wix context before using SDK modules");
        return t.graphql(n, s, r);
      }
    };
}
function Rt(i) {
  const t = globalThis.__wix_context__, e = {
    client: y.client,
    elevatedClient: y.elevatedClient
  };
  let n;
  globalThis.__wix_context__ = void 0, y.client = void 0, y.elevatedClient = void 0, typeof $wixContext < "u" && (n = {
    client: $wixContext == null ? void 0 : $wixContext.client,
    elevatedClient: $wixContext == null ? void 0 : $wixContext.elevatedClient
  }, delete $wixContext.client, delete $wixContext.elevatedClient);
  try {
    return i();
  } finally {
    globalThis.__wix_context__ = t, y.client = e.client, y.elevatedClient = e.elevatedClient, typeof $wixContext < "u" && ($wixContext.client = n.client, $wixContext.elevatedClient = n.elevatedClient);
  }
}
function vi(i, t) {
  return {
    ...i,
    ...Object.fromEntries(t.map((e) => [
      e,
      (...n) => {
        const s = yi();
        if (!s)
          throw new Error("Wix context is not available. Make sure to initialize the Wix context before using SDK modules");
        return s.initWixModules(i)[e].apply(void 0, n);
      }
    ]))
  };
}
function bi(i) {
  return vi({
    __type: "host",
    create: (t) => Object.entries(i).reduce((e, [n, s]) => ({
      ...e,
      [n]: s(t)
    }), {})
  }, Object.keys(i));
}
var Ei = (i) => i != null && i !== "", ut = (i) => Se(i, Ei);
function Se(i, t = (e) => !!e) {
  if (!i)
    return {};
  const e = {};
  for (const n in i)
    t(i[n], n) && (e[n] = i[n]);
  return e;
}
var Si = (i) => {
  const t = ut({
    "app.id": i.appId,
    "app.version": i.appVersion,
    "app.instanceId": i.appInstanceId,
    "extension.id": i.extensionId,
    "extension.name": i.extensionName,
    "extension.type": i.extensionType,
    platform: i.platform
  }), e = Se(
    {
      "extension.data": ut({
        ...i.extensionData
      }),
      site: ut({
        url: i.siteUrl,
        id: i.tenantType === "SITE" ? i.tenantId : void 0
      }),
      account: ut({
        id: i.tenantType === "ACCOUNT" ? i.tenantId : void 0
      })
    },
    (n) => !!n && Object.keys(n).length > 0
  );
  return {
    tags: t,
    contexts: e
  };
}, Ci = class {
  constructor(i) {
    this.message = i, this.captureException = () => {
      console.error(this.message);
    }, this.captureMessage = () => {
      console.error(this.message);
    }, this.startSpan = (t, e) => (console.error(this.message), e(void 0)), this.startSpanManual = () => (console.error(this.message), {
      end: () => {
      },
      fail: () => {
      }
    }), this.endSpanManual = () => {
      console.error(this.message);
    }, this.addBreadcrumb = () => {
      console.error(this.message);
    };
  }
}, B = (i) => new Ci(i), qt = (i) => typeof (i == null ? void 0 : i.then) == "function", Xt = (i, t) => t ? qt(i) ? i.then((e) => (t(e, !0), e)) : (t(i, !1), i) : i, xi = (i, t) => {
  i && (t ? setTimeout(i, t) : i());
}, Qt = () => Date.now() + Math.random(), Mi = class {
  constructor(i) {
    this.options = i, this.spanMap = /* @__PURE__ */ new Map();
  }
  createSpan(i, t) {
    let e, n, s;
    const r = Date.now();
    let o;
    const a = Xt(
      t,
      ({ sentrySDK: p, scope: g }, I) => {
        I && (o = Date.now() - r);
        const C = p.startSpan(
          {
            ...i,
            scope: g,
            forceTransaction: this.options.forceTransaction
          },
          () => new Promise((j, Ne) => {
            e = j, n = Ne;
          })
        );
        C == null || C.catch((j) => {
          if ((j == null ? void 0 : j.message) !== (s == null ? void 0 : s.message))
            throw j;
        });
      }
    ), c = (p) => {
      this.spanMap.delete(i.name), Xt(a, () => {
        xi(p, o);
      });
    }, l = {
      end: () => {
        c(() => e == null ? void 0 : e());
      },
      fail: (p) => {
        s = s ?? p, c(() => n == null ? void 0 : n(p));
      }
    };
    return this.spanMap.set(i.name, l), l;
  }
  getSpan(i) {
    return this.spanMap.get(i.name);
  }
}, Di = (i) => new Mi(i), Ti = (i, { tags: t, contexts: e }) => {
  t && i.setTags(t), e && Object.entries(e).forEach(
    ([n, s]) => typeof s < "u" && i.setContext(n, s)
  );
}, _i = (i, t) => {
  if (!t)
    return;
  const { tags: e, contexts: n } = Si(t);
  Ti(i, { tags: e, contexts: n });
}, Ri = ["onLoad", "forceLoad"], Zt = /* @__PURE__ */ new Map(), Oi = class {
  constructor(i) {
    this.options = i, this.resolvedState = null, this.validateOptions = (e) => {
      const n = Ri.filter(
        (s) => {
          var r;
          return typeof ((r = e.sentrySDK) == null ? void 0 : r[s]) != "function";
        }
      );
      if (n.length > 0)
        throw new Error(
          `Missing the following options.sentrySDK methods: ${n.join(", ")}`
        );
    }, this.validateOptions(i);
    let t = Zt.get(i.dsn);
    t || (t = Di({
      // Force spans to be reported as individual transactions (one http request per one span)
      forceTransaction: !0
    }), Zt.set(i.dsn, t)), this.manualSpanRegistry = t;
  }
  isFullSDK() {
    return typeof this.options.sentrySDK.BrowserClient == "function";
  }
  init() {
    if (this.resolvedState)
      return this.resolvedState;
    const {
      sentrySDK: i,
      transport: t,
      hostContext: e,
      dsn: n,
      release: s,
      environment: r,
      tracesSampleRate: o = 1,
      debug: a = !1
    } = this.options, c = new i.Scope(), l = new i.BrowserClient({
      dsn: n,
      transport: t ?? i.makeFetchTransport,
      integrations: i.getDefaultIntegrations({}),
      stackParser: i.defaultStackParser,
      tracesSampleRate: o || 1,
      debug: a,
      environment: r,
      release: s
    });
    return _i(c, e), c.setClient(l), l.init(), this.resolvedState = {
      sentrySDK: i,
      scope: c,
      sentryClient: l
    }, this.resolvedState;
  }
  loadFullSDK(i) {
    if (this.isFullSDK()) {
      i == null || i(this.init());
      return;
    }
    if (this.promise) {
      this.promise.then(i);
      return;
    }
    this.promise = new Promise((t) => {
      this.options.sentrySDK.onLoad(() => {
        if (this.resolvedState)
          return;
        const e = this.init();
        t(e), i == null || i(e);
      });
    }), this.options.sentrySDK.forceLoad();
  }
}, Ni = class extends Oi {
  constructor() {
    super(...arguments), this.addBreadcrumb = (i) => {
      const t = {
        type: i.type,
        category: i.category,
        message: i.message,
        level: i.level,
        data: i.data
      };
      this.loadFullSDK(({ scope: e }) => {
        e.addBreadcrumb(t);
      });
    }, this.captureException = (i, t) => {
      this.loadFullSDK(({ sentryClient: e, scope: n }) => {
        e.captureException(
          i,
          {
            captureContext: {
              level: (t == null ? void 0 : t.level) ?? "error",
              tags: t == null ? void 0 : t.tags,
              contexts: t == null ? void 0 : t.contexts
            }
          },
          n
        );
      });
    }, this.captureMessage = (i, t) => {
      this.loadFullSDK(({ sentryClient: e, scope: n }) => {
        e.captureMessage(
          i,
          (t == null ? void 0 : t.level) ?? "error",
          {
            captureContext: {
              level: (t == null ? void 0 : t.level) ?? "error",
              tags: t == null ? void 0 : t.tags,
              contexts: t == null ? void 0 : t.contexts
            }
          },
          n
        );
      });
    }, this.startSpan = (i, t) => {
      if (this.isFullSDK()) {
        const { sentrySDK: a, scope: c } = this.init();
        return a.startSpan({ ...i, scope: c }, t);
      }
      this.loadFullSDK();
      const e = (a, c) => {
        const l = Date.now() - c, p = () => new Promise(
          (g) => setTimeout(() => g(a), l)
        );
        this.loadFullSDK(async ({ sentrySDK: g, scope: I }) => g.startSpan(
          { ...i, scope: I },
          p
        ));
      }, n = async (a, c) => {
        const l = Date.now() - c, p = () => new Promise(
          (g, I) => setTimeout(() => I(a), l)
        );
        this.loadFullSDK(async ({ sentrySDK: g, scope: I }) => {
          try {
            await g.startSpan(
              { ...i, scope: I },
              p
            );
          } catch (C) {
            if ((C == null ? void 0 : C.message) !== (a == null ? void 0 : a.message))
              throw C;
          }
        });
      }, s = Date.now();
      let r, o;
      try {
        r = t();
      } catch (a) {
        o = a;
      }
      if (o)
        throw n(o, s), o;
      return qt(r) ? r.then((a) => e(a, s)).catch((a) => n(a, s)) : e(r, s), r;
    }, this.startSpanManual = (i) => {
      const t = this.isFullSDK() ? this.init() : new Promise((n) => this.loadFullSDK(n));
      return this.manualSpanRegistry.createSpan(
        i,
        t
      );
    }, this.endSpanManual = (i) => {
      const t = this.manualSpanRegistry.getSpan(i);
      t == null || t.end();
    };
  }
}, ki = (i) => `Sentry SDK version "${i}" is not supported. Please make sure to use monitoring SDK only in supported environments.`, Fi = (i) => {
  try {
    return parseInt(i.split(".")[0], 10);
  } catch {
    console.warn("Failed to parse Sentry SDK version");
    return;
  }
}, Ki = ({
  sentrySDK: i,
  dsn: t,
  ...e
}) => {
  if (!i)
    return B(
      "Unsupported environment - Sentry SDK is not loaded into the environment. Please make sure to use monitoring SDK only in supported environments."
    );
  if (!t)
    return B(
      "Missing Sentry DSN in the app's monitoring configuration. Please make sure to set it."
    );
  try {
    const n = i.SDK_VERSION && Fi(i.SDK_VERSION);
    return n && n < 7 ? B(
      ki(i.SDK_VERSION)
    ) : new Ni({ ...e, dsn: t, sentrySDK: i });
  } catch (n) {
    return B(
      `Failed to initialize monitoring client: ${n.message}`
    );
  }
}, Wi = class {
  constructor(i) {
    this.options = i, this.captureException = (t, e) => {
      const { panoramaClient: n } = this.options;
      t instanceof Error || (t = new Error(t)), n.errorMonitor().reportError(t, this.contextToData(e));
    }, this.captureMessage = (t, e) => {
      const { panoramaClient: n } = this.options, s = n.logger();
      let r;
      switch (e == null ? void 0 : e.level) {
        case "error":
          r = s.error;
          break;
        case "warning":
          r = s.warn;
          break;
        default:
          r = s.info;
      }
      r(t, this.contextToData(e));
    }, this.startSpan = (t, e) => {
      const { panoramaClient: n } = this.options, { name: s } = t;
      let r;
      const o = n.transaction(s, {
        id: Qt()
      }), a = this.contextToData(t);
      o.start(a);
      try {
        r = e(), qt(r) ? r = r.then((c) => (o.finish(a), c)).catch((c) => {
          throw this.reportErrorInContextOfSpan(c, t), c;
        }) : o.finish(a);
      } catch (c) {
        throw this.reportErrorInContextOfSpan(c, t), c;
      }
      return r;
    }, this.addBreadcrumb = (t) => {
      const { panoramaClient: e } = this.options;
      e.errorMonitor().addBreadcrumb(t);
    };
  }
  contextToData(i) {
    return i && {
      ...(i == null ? void 0 : i.tags) && { tags: i.tags },
      ...(i == null ? void 0 : i.contexts) && { context: i.contexts },
      ...(i == null ? void 0 : i.level) && {
        severity: i.level
      }
    };
  }
  reportErrorInContextOfSpan(i, t) {
    const { panoramaClient: e } = this.options, { name: n } = t, s = this.contextToData({
      ...t,
      contexts: { transaction: { name: n } }
    });
    e.errorMonitor().reportError(i, s);
  }
  startSpanManual(i) {
    const { panoramaClient: t } = this.options, { name: e } = i, n = t.transaction(e, {
      id: Qt()
    }), s = this.contextToData(i);
    n.start(s);
    let r = !1;
    const o = (a) => {
      r || (r = !0, a());
    };
    return {
      end: () => {
        o(() => n.finish(s));
      },
      fail: (a) => {
        o(() => this.reportErrorInContextOfSpan(a, i));
      }
    };
  }
  endSpanManual(i) {
    const { panoramaClient: t } = this.options, { name: e } = i;
    t.transaction(e).finish();
  }
}, ji = (i) => {
  const { panoramaClient: t } = i;
  return t ? new Wi(i) : B("Missing Panorama client");
}, Li = (i) => (i == null ? void 0 : i.type) === "SENTRY", Ui = (i) => (i == null ? void 0 : i.type) === "PANORAMA", $i = ({
  sentrySDK: i,
  sentryTransport: t,
  panoramaClient: e,
  monitoringConfig: n,
  hostContext: s
}) => {
  if (Li(n)) {
    const { sentryOptions: r } = n;
    return () => Ki({
      dsn: r == null ? void 0 : r.dsn,
      hostContext: s,
      sentrySDK: i,
      transport: t
    });
  } else if (Ui(n))
    return () => ji({ panoramaClient: e });
  return () => B(
    "Invalid monitoring configuration. Please check the monitoring setup of your application."
  );
};
new Ai().expose();
class Bi extends E {
  constructor(e, n) {
    super(e, n, "Auth Strategy Error");
    d(this, "state", {});
  }
  withAppDefinitionId(e) {
    return this.state = { ...this.state, appDefinitionId: e }, this;
  }
}
const te = X(Bi);
function qi(i, t) {
  const e = Date.now(), n = i ? new Date(i).getTime() : null;
  return n && n - e > t;
}
const zi = 30 * 60 * 1e3, Hi = () => {
  let i;
  return {
    getAuthHeaders: async () => {
      const t = await S.getInstance(), e = t.getAppDefinitionId(), n = t.getPrivateAPI();
      if (!e)
        throw te(
          "EmptyAppDefinitionId"
          /* EmptyAppDefinitionId */
        );
      return (!i || qi(
        i.expires,
        zi
      )) && (i = await n.auth.getAccessToken(
        e,
        await n.info.getMetaSiteId()
      )), i != null && i.token ? {
        headers: {
          Authorization: i.token
        }
      } : (console.error(
        te(
          "EmptyAppAuthInstance"
          /* EmptyAppAuthInstance */
        ).withAppDefinitionId(e)
      ), {
        headers: {
          Authorization: ""
        }
      });
    }
  };
};
class P {
  constructor(t, e = []) {
    this.ShapeConstructor = t, this.selectedMethods = e;
  }
  withPublicMethod(t) {
    return new P(this.ShapeConstructor, [
      ...this.selectedMethods,
      t
    ]);
  }
  build() {
    if (!this.selectedMethods.length)
      throw new Error("methods are not defined for the SDK shape");
    const t = this.selectedMethods.reduce(
      (e, n) => ({
        ...e,
        [n]: (s) => {
          const r = new this.ShapeConstructor(
            s == null ? void 0 : s.applicationContext
          );
          return r[n] ? r[n].bind(r) : () => {
            console.error(`"${n}" is not defined in the SDK shape`);
          };
        }
      }),
      {}
    );
    return bi(t);
  }
}
class Gi extends E {
  constructor(t, e) {
    super(t, e, "Base SDK Error");
  }
}
const Yi = X(
  Gi
);
class m {
  constructor(t = null) {
    this.overriddenApplicationContext = t;
  }
  getApplicationContext() {
    return this.overriddenApplicationContext ? this.overriddenApplicationContext : S.getInstance();
  }
  async getAppDefinitionId() {
    return (await this.getApplicationContext()).getAppDefinitionId();
  }
  async getManifestContextId() {
    return (await this.getApplicationContext()).getManifestContextId();
  }
  async getRequiredManifestContextId() {
    const t = await this.getManifestContextId();
    if (!t)
      throw Yi(
        "ManifestContextIdRequired"
        /* ManifestContextIdRequired */
      );
    return t;
  }
  async getEnvironmentContext() {
    return (await this.getApplicationContext()).getEnvironmentContext();
  }
  async getPlatformPrivateAPI() {
    return (await this.getApplicationContext()).getPrivateAPI();
  }
  // NOTE: don't remove this for now
  // protected dep<TDep extends IBaseSDKShape>(Factory: TDep) {
  //   let instance: InstanceType<TDep>;
  //
  //   return () => {
  //     if (!instance) {
  //       instance = new Factory(this.getApplicationContext());
  //     }
  //
  //     return instance;
  //   };
  // }
}
class Vi extends m {
  async getPrivateAPI() {
    return (await this.getApplicationContext()).getPrivateApplicationAPI();
  }
  async getPublicAPI(t) {
    return (await this.getPlatformPrivateAPI()).applicationManager.getPublicApplicationAPI(
      t
    );
  }
  async getAppInstance() {
    return (await this.getPlatformPrivateAPI()).info.getAppInstance(await this.getAppDefinitionId());
  }
}
new P(Vi).withPublicMethod("getPrivateAPI").withPublicMethod("getPublicAPI").withPublicMethod("getAppInstance").build();
class Ce extends m {
  async addEventListener(t, e) {
    return (await this.getApplicationContext()).getEvents().addEventListener(t, e);
  }
}
new P(Ce).withPublicMethod("addEventListener").build();
class Ji extends m {
  async getSelection() {
    const t = await this.getPlatformPrivateAPI(), e = await t.components.getSelectedComponents();
    return Promise.all(
      e.map(
        (n) => t.components.getComponent(n)
      )
    );
  }
  async onSelectionChange(t) {
    new Ce(this.getApplicationContext()).addEventListener("componentSelectionChanged", (n) => {
      t(n.components);
    });
  }
}
new P(Ji).withPublicMethod("onSelectionChange").withPublicMethod("getSelection").build();
class Xi extends m {
  async getViewMode() {
    return (await this.getPlatformPrivateAPI()).info.getViewMode();
  }
  async getLanguageCode() {
    return (await this.getPlatformPrivateAPI()).info.getLanguageCode();
  }
  async getSiteDirection() {
    return (await this.getPlatformPrivateAPI()).info.getSiteDirection();
  }
  async siteHasCustomClasses() {
    return (await this.getPlatformPrivateAPI()).info.siteHasCustomClasses();
  }
  async getThemeCustomProperties(t) {
    return (await this.getPlatformPrivateAPI()).info.getThemeCustomProperties(t);
  }
  async getSiteFonts(t) {
    return (await this.getPlatformPrivateAPI()).info.getSiteFonts(t);
  }
}
new P(Xi).withPublicMethod("getViewMode").withPublicMethod("getLanguageCode").withPublicMethod("getSiteDirection").withPublicMethod("siteHasCustomClasses").withPublicMethod("getThemeCustomProperties").withPublicMethod("getSiteFonts").build();
var Z = /* @__PURE__ */ ((i) => (i.UndefinedCompRef = "UndefinedCompRef", i.NotAvailableMethod = "NotAvailableMethod", i))(Z || {});
class Qi extends E {
  constructor(t, e) {
    super(t, e, "Widget Error");
  }
}
const ft = X(Qi), xe = "underline";
function Zi(i) {
  return i.map((t) => Me({ font: t }).family).filter(Boolean);
}
function Me(i) {
  var e;
  const t = {
    family: void 0,
    size: void 0
  };
  if (i != null && i.font) {
    const { variableName: n, fallbackValue: s } = tn(
      i.font
    );
    t.cssVariableName = n;
    const r = s.match(/(?:(["']).*?\1|\S)+/g) || [];
    for (let o = 0; o < r.length; o++) {
      const a = r[o];
      switch (a) {
        case "bold":
          t.bold = !0;
          break;
        case "italic":
          t.italic = !0;
          break;
        default:
          a != null && a.endsWith("px") ? t.size = parseInt(a, 10) : o === r.length - 1 ? t.family = a : t.family = (t.family || "") + " " + a;
      }
    }
  }
  return i != null && i.textDecoration && (t.underline = i.textDecoration === xe), t.family = (e = t.family) == null ? void 0 : e.trim().replace(/['"]+/g, ""), t;
}
function tn(i) {
  var n;
  const t = i.trim(), e = t.match(/var\((--[\w-]+),\s*(.+)\)/);
  return e ? {
    variableName: e[1],
    fallbackValue: ((n = e[2]) == null ? void 0 : n.trim()) ?? ""
  } : {
    variableName: void 0,
    fallbackValue: t
  };
}
class N {
  constructor(t, e) {
    this.compRef = t, this.privateAPI = e;
  }
  async getProp(t) {
    const e = await this.privateAPI.refComponents.getProps(this.compRef);
    return e == null ? void 0 : e[t];
  }
  async setProp(t, e) {
    await this.privateAPI.refComponents.setProps(this.compRef, {
      [t]: e
    });
  }
  async getDesignPreset() {
    return this.privateAPI.designPresets.getDesignPresetName(this.compRef);
  }
  async setDesignPreset(t) {
    await this.privateAPI.designPresets.setDesignPresetByName(
      this.compRef,
      t
    );
  }
  async getNestedWidget(t) {
    const e = await this.privateAPI.refComponents.findComponentBySelector(
      this.compRef,
      t
    );
    return e ? new N(e, this.privateAPI) : null;
  }
}
var b, R;
class en extends m {
  constructor() {
    super(...arguments);
    u(this, b);
  }
  async setPreloadFonts(e) {
    const n = await this.getPlatformPrivateAPI(), s = await f(this, b, R).call(this);
    if (await n.refComponents.isRefComponent(s))
      throw ft(
        Z.NotAvailableMethod,
        "not available for the current component type"
      );
    const r = Zi(e);
    await n.customElement.setPreloadFonts(s, r);
  }
  async getProp(e) {
    const n = await this.getPlatformPrivateAPI(), s = await f(this, b, R).call(this);
    return await n.refComponents.isRefComponent(s) ? new N(s, n).getProp(e) : n.customElement.getAttribute(s, e);
  }
  async setProp(e, n) {
    const s = await this.getPlatformPrivateAPI(), r = await f(this, b, R).call(this);
    if (await s.refComponents.isRefComponent(r))
      return new N(r, s).setProp(e, n);
    await s.customElement.setAttribute(r, e, n);
  }
  async getDesignPreset() {
    const e = await this.getPlatformPrivateAPI(), n = await f(this, b, R).call(this);
    if (!await e.refComponents.isRefComponent(n))
      throw ft(
        Z.NotAvailableMethod,
        "not available for the current component type"
      );
    return new N(n, e).getDesignPreset();
  }
  async setDesignPreset(e) {
    const n = await this.getPlatformPrivateAPI(), s = await f(this, b, R).call(this);
    if (!await n.refComponents.isRefComponent(s))
      throw ft(
        Z.NotAvailableMethod,
        "not available for the current component type"
      );
    return new N(s, n).setDesignPreset(
      e
    );
  }
  async getNestedWidget(e) {
    const n = await this.getPlatformPrivateAPI(), s = await f(this, b, R).call(this);
    return new N(s, n).getNestedWidget(e);
  }
}
b = new WeakSet(), R = async function() {
  const s = (await (await this.getPlatformPrivateAPI()).components.getSelectedComponents())[0];
  if (!s)
    throw ft(Z.UndefinedCompRef);
  return s;
};
const nn = new P(en).withPublicMethod("getNestedWidget").withPublicMethod("setDesignPreset").withPublicMethod("getDesignPreset").withPublicMethod("setProp").withPublicMethod("getProp").withPublicMethod("setPreloadFonts");
nn.build();
function sn(i) {
  var t;
  return `${i.cssVariableName ? `var(${i.cssVariableName}, ` : ""}${i.italic ? "italic " : ""}${i.bold ? "bold " : ""}${i.size || 16}px ${// wrap each font family with quotes
  ((t = i.family) == null ? void 0 : t.split(",").map((e) => `"${e.replace(/['"]+/g, "")}"`).join(",")) || "serif"}${i.cssVariableName ? ")" : ""}`;
}
function rn(i) {
  if (!i)
    return null;
  const t = i, e = t.match(/var\((--[\w-]+),\s*(.+)\)/);
  return e ? {
    cssVariableName: e[1],
    color: e[2]
  } : {
    color: t
  };
}
function ee(i) {
  return i ? i.cssVariableName ? `var(${i.cssVariableName}, ${i.color})` : i.color : "";
}
const an = {
  transformFontInternalValue: (i) => {
    if (i) {
      const { theme: t, cssVariableName: e, bold: n, italic: s, underline: r, ...o } = i;
      return {
        ...o,
        style: {
          bold: n,
          italic: s,
          underline: r
        },
        editorKey: e || t || ""
      };
    } else
      return {
        editorKey: "font_7",
        family: "helvetica-w01-roman",
        size: 16,
        style: {}
      };
  }
};
class on extends m {
  async selectColor(t, e) {
    const n = await this.getPlatformPrivateAPI();
    let s = rn(t), r = ee(s);
    return await n.inputs.openColorPicker(
      {
        color: (s == null ? void 0 : s.cssVariableName) || (s == null ? void 0 : s.theme) || (s == null ? void 0 : s.color)
      },
      ({
        color: o,
        theme: a,
        cssVariableTheme: c
      }) => {
        var l;
        s = {
          color: o,
          theme: a,
          cssVariableName: c
        }, r = ee(s), (l = e == null ? void 0 : e.onChange) == null || l.call(e, r);
      }
    ), r;
  }
  async selectFont(t, e) {
    const n = await this.getPlatformPrivateAPI(), s = Me(t);
    let r = t;
    return await n.inputs.openFontPickerV2(
      {
        ...e,
        panelSectionsDefinition: {
          htmlTag: "hidden"
        },
        componentStyle: an.transformFontInternalValue(s)
      },
      (o, a) => {
        var c;
        r = {
          font: sn(o),
          textDecoration: o.underline ? xe : void 0
        }, (c = e == null ? void 0 : e.onChange) == null || c.call(e, r);
      }
    ), r;
  }
}
new P(on).withPublicMethod("selectColor").withPublicMethod("selectFont").build();
class cn extends m {
  async openLanguageSupportPanel() {
    return (await this.getPlatformPrivateAPI()).panels.openLanguageSupportPanel();
  }
  async openFontsUploadPanel() {
    return (await this.getPlatformPrivateAPI()).panels.openFontsUploadPanel();
  }
}
new P(cn).withPublicMethod("openLanguageSupportPanel").withPublicMethod("openFontsUploadPanel").build();
class ln extends m {
  async openDashboardModal(t) {
    return (await this.getPlatformPrivateAPI()).panels.openDashboardPanel(
      await this.getAppDefinitionId(),
      t
    );
  }
}
new P(ln).withPublicMethod("openDashboardModal").build();
class De extends m {
  constructor(t = null, e = []) {
    super(t), this.overriddenApplicationContext = t, this.childPath = e;
  }
  async getStyleDefinitions() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getStyleDefinitions(
      e,
      this.childPath
    );
  }
  async getStyles() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getStyles(
      e,
      this.childPath
    );
  }
  async setStyles({
    cssProperties: t,
    cssCustomProperties: e
  } = {}) {
    const n = await this.getPlatformPrivateAPI(), s = await this.getRequiredManifestContextId();
    return n.builderComponent.setStyles(
      s,
      this.childPath,
      {
        cssProperties: t,
        cssCustomProperties: e
      }
    );
  }
  async removeStyles(t = {}) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.removeStyles(
      n,
      this.childPath,
      t
    );
  }
  async getDataDefinitions() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getDataDefinitions(
      e,
      this.childPath
    );
  }
  async getData() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getData(
      e,
      this.childPath
    );
  }
  async getResolvedData({ dataItemKey: t }) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.getResolvedData(
      n,
      this.childPath,
      {
        dataItemKey: t
      }
    );
  }
  async setData(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.setData(
      n,
      this.childPath,
      t
    );
  }
  async getPresetDefinitions() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getPresetDefinitions(
      e,
      this.childPath
    );
  }
  async getAppliedPreset() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getAppliedPreset(
      e,
      this.childPath
    );
  }
  async applyPreset(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.applyPreset(
      n,
      this.childPath,
      t
    );
  }
  // TODO: group type should come from builder enum
  async getDisplayGroupDefinitions(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.getDisplayGroupDefinitions(
      n,
      this.childPath,
      t
    );
  }
  async getState() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getState(
      e,
      this.childPath
    );
  }
  async setState(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.setState(
      n,
      this.childPath,
      t
    );
  }
  async getStateDefinitions() {
    const t = await this.getPlatformPrivateAPI(), e = await this.getRequiredManifestContextId();
    return t.builderComponent.getStateDefinitions(
      e,
      this.childPath
    );
  }
  /**
   * TODO: use type from the ManifestChangeDetection,
   * but type should be moved to editor-platform-public-interfaces
   */
  async onChange(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.onChange(
      n,
      this.childPath,
      t
    );
  }
  async selectFont(t) {
    try {
      const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
      return await e.builderComponent.selectFont(
        n,
        this.childPath,
        {
          ...t,
          showWeights: !0
        }
      );
    } catch {
    }
  }
  async selectFontFamily(t) {
    try {
      const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
      return await e.builderComponent.selectFont(
        n,
        this.childPath,
        {
          ...t,
          showWeights: !1
        }
      );
    } catch {
    }
  }
  async selectMedia(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.selectMedia(
      n,
      this.childPath,
      t
    );
  }
  async selectLink(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.selectLink(
      n,
      this.childPath,
      t
    );
  }
  async selectColor(t) {
    const e = await this.getPlatformPrivateAPI();
    try {
      const n = await this.getRequiredManifestContextId();
      return await e.builderComponent.selectColor(
        n,
        this.childPath,
        t
      );
    } catch {
    }
  }
  async selectFontWeight(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return {
      weight: await e.builderComponent.selectFontWeight(
        n,
        this.childPath,
        t
      )
    };
  }
  async selectTextTheme(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.selectTextTheme(
      n,
      t
    );
  }
  async getArrayItemsSelectedIndex(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.getArrayItemsSelectedIndex(
      n,
      this.childPath,
      t
    );
  }
  async setArrayItemsSelectedIndex(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.setArrayItemsSelectedIndex(
      n,
      this.childPath,
      t
    );
  }
  async resetArrayItemsSelectedIndex(t) {
    const e = await this.getPlatformPrivateAPI(), n = await this.getRequiredManifestContextId();
    return e.builderComponent.resetArrayItemsSelectedIndex(
      n,
      this.childPath,
      t
    );
  }
}
new P(De).withPublicMethod("getDataDefinitions").withPublicMethod("getData").withPublicMethod("getResolvedData").withPublicMethod("setData").withPublicMethod("getStyleDefinitions").withPublicMethod("getStyles").withPublicMethod("setStyles").withPublicMethod("removeStyles").withPublicMethod("getPresetDefinitions").withPublicMethod("getAppliedPreset").withPublicMethod("applyPreset").withPublicMethod("getDisplayGroupDefinitions").withPublicMethod("getState").withPublicMethod("setState").withPublicMethod("onChange").withPublicMethod("getStateDefinitions").withPublicMethod("selectFont").withPublicMethod("selectFontFamily").withPublicMethod("selectMedia").withPublicMethod("selectLink").withPublicMethod("selectColor").withPublicMethod("selectFontWeight").withPublicMethod("selectTextTheme").withPublicMethod("getArrayItemsSelectedIndex").withPublicMethod("setArrayItemsSelectedIndex").withPublicMethod("resetArrayItemsSelectedIndex").build();
class pn extends m {
  async get(t) {
    return (await this.getPlatformPrivateAPI()).userPreferences.get(
      await this.getAppDefinitionId(),
      t
    );
  }
  async set(t) {
    return (await this.getPlatformPrivateAPI()).userPreferences.set(
      await this.getAppDefinitionId(),
      t
    );
  }
}
new P(pn).withPublicMethod("set").withPublicMethod("get").build();
class hn extends m {
  async getData() {
    return (await this.getPlatformPrivateAPI()).externalPanels.getData();
  }
  async setData(t) {
    return (await this.getPlatformPrivateAPI()).externalPanels.setData(t);
  }
  async getStyle() {
    return (await this.getPlatformPrivateAPI()).externalPanels.getStyle();
  }
  async setStyle(t) {
    return (await this.getPlatformPrivateAPI()).externalPanels.setStyle(t);
  }
  async getTheme() {
    return (await this.getPlatformPrivateAPI()).externalPanels.getTheme();
  }
  async selectMedia() {
    return (await this.getPlatformPrivateAPI()).externalPanels.selectMedia();
  }
  async selectLink(...t) {
    return (await this.getPlatformPrivateAPI()).externalPanels.selectLink(...t);
  }
  async selectColor(...t) {
    return async () => (await this.getPlatformPrivateAPI()).externalPanels.selectColor(...t);
  }
  async translate(t, e) {
    return (await this.getPlatformPrivateAPI()).externalPanels.translate(t, e);
  }
}
new P(hn).withPublicMethod("getTheme").withPublicMethod("getData").withPublicMethod("getStyle").withPublicMethod("selectColor").withPublicMethod("selectLink").withPublicMethod("selectMedia").withPublicMethod("setData").withPublicMethod("setStyle").withPublicMethod("translate").build();
var Te = /* @__PURE__ */ ((i) => (i.UndefinedCompRef = "UndefinedCompRef", i))(Te || {});
class dn extends E {
  constructor(t, e) {
    super(t, e, "Controllers Error");
  }
}
const un = X(dn);
var St, _e;
class fn extends m {
  constructor() {
    super(...arguments);
    u(this, St);
  }
  async get() {
    return (await this.getPlatformPrivateAPI()).controllers.get(
      await this.getAppDefinitionId(),
      await f(this, St, _e).call(this)
    );
  }
}
St = new WeakSet(), _e = async function() {
  const s = (await (await this.getPlatformPrivateAPI()).components.getSelectedComponents())[0];
  if (!s)
    throw un(Te.UndefinedCompRef);
  return s;
};
new P(fn).withPublicMethod("get").build();
class Re {
  constructor(t, e, n, s) {
    this.privateAPI = t, this.compRef = e, this.bindingTargetId = n, this.config = s;
  }
  update(t) {
    return this.privateAPI.bindings.update(this.compRef, this.bindingTargetId, {
      config: t.config,
      role: t.role
    });
  }
  delete() {
    return this.privateAPI.bindings.delete(this.compRef, this.bindingTargetId);
  }
  get connectionConfig() {
    return this.config;
  }
}
class Pn extends m {
  async get(t) {
    const e = await this.getPlatformPrivateAPI(), n = await e.components.getSelectedComponents();
    if (n.length !== 1)
      return null;
    const [s] = n, r = e.bindings.get(
      t.id,
      s
    );
    return r ? new Re(
      e,
      s,
      t.id,
      r
    ) : null;
  }
}
new P(Pn).withPublicMethod("get").build();
class gn {
  constructor(t, e, n, s) {
    this.privateAPI = t, this.compRef = e, this.dataItemTarget = n, this.name = s;
  }
  select() {
    return this.privateAPI.bindings.openDataBindingPanel(
      this.dataItemTarget.id
    );
  }
  createBinding(t) {
    return this.privateAPI.bindings.create(this.compRef, {
      dataItemId: this.dataItemTarget.id,
      bindingItemType: "dataBinding",
      ...t
    }) ? new Re(
      this.privateAPI,
      this.compRef,
      this.dataItemTarget.id,
      JSON.stringify(t)
    ) : null;
  }
}
class mn extends m {
  async list(t) {
    const e = await this.getPlatformPrivateAPI(), n = await e.components.getSelectedComponents();
    if (n.length !== 1)
      return [];
    const [s] = n;
    return await e.bindings.canCreateBindingsProvider(s) ? [
      new gn(e, s, t, "dataBinding")
    ] : [];
  }
}
new P(mn).withPublicMethod("list").build();
class wn {
  constructor(t) {
    d(this, "getContextIds", () => {
      throw new Error("Not implemented yet");
    });
    d(this, "openItemSelector", (t) => {
      throw new Error("Not implemented yet");
    });
    d(this, "apps", {
      startInstallFlow: async (t) => (await this.workspaceAPI()).apps.startInstallFlow(t),
      startPurchasePlanFlow: async (t) => (await this.workspaceAPI()).apps.startPurchasePlanFlow(t),
      startUpdateFlow: async (t) => (await this.workspaceAPI()).apps.startUpdateFlow(t),
      openContactSupport: async (t) => (await this.workspaceAPI()).apps.openContactSupport(t)
    });
    this.applicationContext = t;
  }
  async workspaceAPI() {
    return await (await this.applicationContext).getPrivateAPI().workspace;
  }
}
var ht;
class Oe {
  constructor(t) {
    u(this, ht);
    A(this, ht, new wn(t));
  }
  getAPI() {
    return h(this, ht);
  }
}
ht = new WeakMap();
const In = () => {
  const i = new URLSearchParams(window.location.search), t = i.has("essentials") ? JSON.parse(i.get("essentials")) : void 0, { monitoring: e, ...n } = t || {}, s = i.get("appDefinitionId"), { context: r, config: o } = e || {}, a = $i({
    hostContext: { appId: s, ...r },
    monitoringConfig: o,
    sentrySDK: typeof window < "u" ? window.Sentry : void 0
  }), c = S.getInstance(), l = new Oe(c);
  return {
    environment: {},
    applicationContext: c,
    channel: {
      observeState: async () => ({ disconnect() {
      } })
    },
    getMonitoringClient: a,
    workspace: l.getAPI(),
    essentials: n
  };
}, An = () => {
  const i = S.getInstance(), t = new Oe(i);
  return {
    environment: {},
    applicationContext: i,
    channel: {
      observeState: async () => ({ disconnect() {
      } })
    },
    workspace: t.getAPI()
  };
}, yn = {
  host: () => typeof importScripts == "function" ? An() : In(),
  auth: Hi
}, vn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaseSDKShape: m,
  ElementSDKShape: De,
  PlatformSDKShape: P,
  editor: yn
}, Symbol.toStringTag, { value: "Module" }));
