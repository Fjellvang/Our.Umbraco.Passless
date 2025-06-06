import { OpenAPI as B } from "@umbraco-cms/backoffice/external/backend-api";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const F = globalThis, Q = F.ShadowRoot && (F.ShadyCSS === void 0 || F.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, X = Symbol(), re = /* @__PURE__ */ new WeakMap();
let ge = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== X)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Q && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = re.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && re.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const be = (r) => new ge(typeof r == "string" ? r : r + "", void 0, X), ee = (r, ...e) => {
  const t = r.length === 1 ? r[0] : e.reduce((s, i, n) => s + ((o) => {
    if (o._$cssResult$ === !0)
      return o.cssText;
    if (typeof o == "number")
      return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[n + 1], r[0]);
  return new ge(t, r, X);
}, Ee = (r, e) => {
  if (Q)
    r.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else
    for (const t of e) {
      const s = document.createElement("style"), i = F.litNonce;
      i !== void 0 && s.setAttribute("nonce", i), s.textContent = t.cssText, r.appendChild(s);
    }
}, ne = Q ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules)
    t += s.cssText;
  return be(t);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Se, defineProperty: xe, getOwnPropertyDescriptor: Ce, getOwnPropertyNames: Pe, getOwnPropertySymbols: Oe, getPrototypeOf: ke } = Object, _ = globalThis, oe = _.trustedTypes, Me = oe ? oe.emptyScript : "", V = _.reactiveElementPolyfillSupport, T = (r, e) => r, W = { toAttribute(r, e) {
  switch (e) {
    case Boolean:
      r = r ? Me : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, e) {
  let t = r;
  switch (e) {
    case Boolean:
      t = r !== null;
      break;
    case Number:
      t = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(r);
      } catch {
        t = null;
      }
  }
  return t;
} }, te = (r, e) => !Se(r, e), ae = { attribute: !0, type: String, converter: W, reflect: !1, useDefault: !1, hasChanged: te };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), _.litPropertyMetadata ?? (_.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let P = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ae) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(e, s, t);
      i !== void 0 && xe(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: i, set: n } = Ce(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: i, set(o) {
      const l = i == null ? void 0 : i.call(this);
      n == null || n.call(this, o), this.requestUpdate(e, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ae;
  }
  static _$Ei() {
    if (this.hasOwnProperty(T("elementProperties")))
      return;
    const e = ke(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(T("finalized")))
      return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(T("properties"))) {
      const t = this.properties, s = [...Pe(t), ...Oe(t)];
      for (const i of s)
        this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0)
        for (const [s, i] of t)
          this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const i = this._$Eu(t, s);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const i of s)
        t.unshift(ne(i));
    } else
      e !== void 0 && t.push(ne(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys())
      this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ee(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostConnected) == null ? void 0 : s.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostDisconnected) == null ? void 0 : s.call(t);
    });
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    var n;
    const s = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : W).toAttribute(t, s.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, o;
    const s = this.constructor, i = s._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const l = s.getPropertyOptions(i), a = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((n = l.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? l.converter : W;
      this._$Em = i, this[i] = a.fromAttribute(t, l.type) ?? ((o = this._$Ej) == null ? void 0 : o.get(i)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(e, t, s) {
    var i;
    if (e !== void 0) {
      const n = this.constructor, o = this[e];
      if (s ?? (s = n.getPropertyOptions(e)), !((s.hasChanged ?? te)(o, t) || s.useDefault && s.reflect && o === ((i = this._$Ej) == null ? void 0 : i.get(e)) && !this.hasAttribute(n._$Eu(e, s))))
        return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: i, wrapped: n }, o) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep)
          this[n] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0)
        for (const [n, o] of i) {
          const { wrapped: l } = o, a = this[n];
          l !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, o, a);
        }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (s = this._$EO) == null || s.forEach((i) => {
        var n;
        return (n = i.hostUpdate) == null ? void 0 : n.call(i);
      }), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var i;
      return (i = s.hostUpdated) == null ? void 0 : i.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[T("elementProperties")] = /* @__PURE__ */ new Map(), P[T("finalized")] = /* @__PURE__ */ new Map(), V == null || V({ ReactiveElement: P }), (_.reactiveElementVersions ?? (_.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = globalThis, J = N.trustedTypes, le = J ? J.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, $e = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, me = "?" + v, Ue = `<${me}>`, C = document, H = () => C.createComment(""), j = (r) => r === null || typeof r != "object" && typeof r != "function", se = Array.isArray, Te = (r) => se(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", Z = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, de = />/g, b = RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), he = /'/g, ue = /"/g, ve = /^(?:script|style|textarea|title)$/i, Ae = (r) => (e, ...t) => ({ _$litType$: r, strings: e, values: t }), p = Ae(1), Ne = Ae(2), O = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), pe = /* @__PURE__ */ new WeakMap(), E = C.createTreeWalker(C, 129);
function _e(r, e) {
  if (!se(r) || !r.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return le !== void 0 ? le.createHTML(e) : e;
}
const Re = (r, e) => {
  const t = r.length - 1, s = [];
  let i, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = U;
  for (let l = 0; l < t; l++) {
    const a = r[l];
    let d, h, c = -1, g = 0;
    for (; g < a.length && (o.lastIndex = g, h = o.exec(a), h !== null); )
      g = o.lastIndex, o === U ? h[1] === "!--" ? o = ce : h[1] !== void 0 ? o = de : h[2] !== void 0 ? (ve.test(h[2]) && (i = RegExp("</" + h[2], "g")), o = b) : h[3] !== void 0 && (o = b) : o === b ? h[0] === ">" ? (o = i ?? U, c = -1) : h[1] === void 0 ? c = -2 : (c = o.lastIndex - h[2].length, d = h[1], o = h[3] === void 0 ? b : h[3] === '"' ? ue : he) : o === ue || o === he ? o = b : o === ce || o === de ? o = U : (o = b, i = void 0);
    const m = o === b && r[l + 1].startsWith("/>") ? " " : "";
    n += o === U ? a + Ue : c >= 0 ? (s.push(d), a.slice(0, c) + $e + a.slice(c) + v + m) : a + v + (c === -2 ? l : m);
  }
  return [_e(r, n + (r[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class D {
  constructor({ strings: e, _$litType$: t }, s) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const l = e.length - 1, a = this.parts, [d, h] = Re(e, t);
    if (this.el = D.createElement(d, s), E.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (i = E.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes())
          for (const c of i.getAttributeNames())
            if (c.endsWith($e)) {
              const g = h[o++], m = i.getAttribute(c).split(v), z = /([.?@])?(.*)/.exec(g);
              a.push({ type: 1, index: n, name: z[2], strings: m, ctor: z[1] === "." ? je : z[1] === "?" ? De : z[1] === "@" ? Ie : q }), i.removeAttribute(c);
            } else
              c.startsWith(v) && (a.push({ type: 6, index: n }), i.removeAttribute(c));
        if (ve.test(i.tagName)) {
          const c = i.textContent.split(v), g = c.length - 1;
          if (g > 0) {
            i.textContent = J ? J.emptyScript : "";
            for (let m = 0; m < g; m++)
              i.append(c[m], H()), E.nextNode(), a.push({ type: 2, index: ++n });
            i.append(c[g], H());
          }
        }
      } else if (i.nodeType === 8)
        if (i.data === me)
          a.push({ type: 2, index: n });
        else {
          let c = -1;
          for (; (c = i.data.indexOf(v, c + 1)) !== -1; )
            a.push({ type: 7, index: n }), c += v.length - 1;
        }
      n++;
    }
  }
  static createElement(e, t) {
    const s = C.createElement("template");
    return s.innerHTML = e, s;
  }
}
function k(r, e, t = r, s) {
  var o, l;
  if (e === O)
    return e;
  let i = s !== void 0 ? (o = t._$Co) == null ? void 0 : o[s] : t._$Cl;
  const n = j(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== n && ((l = i == null ? void 0 : i._$AO) == null || l.call(i, !1), n === void 0 ? i = void 0 : (i = new n(r), i._$AT(r, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = i : t._$Cl = i), i !== void 0 && (e = k(r, i._$AS(r, e.values), i, s)), e;
}
class He {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? C).importNode(t, !0);
    E.currentNode = i;
    let n = E.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let d;
        a.type === 2 ? d = new I(n, n.nextSibling, this, e) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (d = new Le(n, this, e)), this._$AV.push(d), a = s[++l];
      }
      o !== (a == null ? void 0 : a.index) && (n = E.nextNode(), o++);
    }
    return E.currentNode = C, i;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV)
      s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class I {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, s, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = k(this, e, t), j(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== O && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Te(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && j(this._$AH) ? this._$AA.nextSibling.data = e : this.T(C.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: s } = e, i = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = D.createElement(_e(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === i)
      this._$AH.p(t);
    else {
      const o = new He(i, this), l = o.u(this.options);
      o.p(t), this.T(l), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = pe.get(e.strings);
    return t === void 0 && pe.set(e.strings, t = new D(e)), t;
  }
  k(e) {
    se(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, i = 0;
    for (const n of e)
      i === t.length ? t.push(s = new I(this.O(H()), this.O(H()), this, this.options)) : s = t[i], s._$AI(n), i++;
    i < t.length && (this._$AR(s && s._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, t); e && e !== this._$AB; ) {
      const i = e.nextSibling;
      e.remove(), e = i;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class q {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, i, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(e, t = this, s, i) {
    const n = this.strings;
    let o = !1;
    if (n === void 0)
      e = k(this, e, t, 0), o = !j(e) || e !== this._$AH && e !== O, o && (this._$AH = e);
    else {
      const l = e;
      let a, d;
      for (e = n[0], a = 0; a < n.length - 1; a++)
        d = k(this, l[s + a], t, a), d === O && (d = this._$AH[a]), o || (o = !j(d) || d !== this._$AH[a]), d === u ? e = u : e !== u && (e += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class je extends q {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class De extends q {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class Ie extends q {
  constructor(e, t, s, i, n) {
    super(e, t, s, i, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = k(this, e, t, 0) ?? u) === O)
      return;
    const s = this._$AH, i = e === u && s !== u || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== u && (s === u || i);
    i && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Le {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    k(this, e);
  }
}
const G = N.litHtmlPolyfillSupport;
G == null || G(D, I), (N.litHtmlVersions ?? (N.litHtmlVersions = [])).push("3.3.0");
const ze = (r, e, t) => {
  const s = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = s._$litPart$;
  if (i === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    s._$litPart$ = i = new I(e.insertBefore(H(), n), n, void 0, t ?? {});
  }
  return i._$AI(r), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = globalThis;
class x extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ze(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return O;
  }
}
var ye;
x._$litElement$ = !0, x.finalized = !0, (ye = S.litElementHydrateSupport) == null || ye.call(S, { LitElement: x });
const Y = S.litElementPolyfillSupport;
Y == null || Y({ LitElement: x });
(S.litElementVersions ?? (S.litElementVersions = [])).push("4.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = (r) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(r, e);
  }) : customElements.define(r, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Be = { attribute: !0, type: String, converter: W, reflect: !1, hasChanged: te }, Fe = (r = Be, e, t) => {
  const { kind: s, metadata: i } = t;
  let n = globalThis.litPropertyMetadata.get(i);
  if (n === void 0 && globalThis.litPropertyMetadata.set(i, n = /* @__PURE__ */ new Map()), s === "setter" && ((r = Object.create(r)).wrapped = !0), n.set(t.name, r), s === "accessor") {
    const { name: o } = t;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(o, a, r);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, r, l), l;
    } };
  }
  if (s === "setter") {
    const { name: o } = t;
    return function(l) {
      const a = this[o];
      e.call(this, l), this.requestUpdate(o, a, r);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function L(r) {
  return (e, t) => typeof t == "object" ? Fe(r, e, t) : ((s, i, n) => {
    const o = i.hasOwnProperty(n);
    return i.constructor.createProperty(n, s), o ? Object.getOwnPropertyDescriptor(i, n) : void 0;
  })(r, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function y(r) {
  return L({ ...r, state: !0, attribute: !1 });
}
function R(r, e = void 0) {
  if (typeof r == "string") {
    r = r.replace(/-/g, "+").replace(/_/g, "/");
    const t = window.atob(r), s = new Uint8Array(t.length);
    for (let i = 0; i < t.length; i++)
      s[i] = t.charCodeAt(i);
    r = s;
  }
  if (Array.isArray(r) && (r = new Uint8Array(r)), r instanceof Uint8Array && (r = r.buffer), !(r instanceof ArrayBuffer))
    throw new TypeError("could not coerce '" + e + "' to ArrayBuffer");
  return r;
}
function A(r) {
  if (Array.isArray(r) && (r = Uint8Array.from(r)), r instanceof ArrayBuffer && (r = new Uint8Array(r)), r instanceof Uint8Array) {
    let e = "";
    const t = r.byteLength;
    for (let s = 0; s < t; s++)
      e += String.fromCharCode(r[s]);
    r = window.btoa(e);
  }
  if (typeof r != "string")
    throw new Error("could not coerce to string");
  return r = r.replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/g, ""), r;
}
const fe = {
  lastCredentialsIdentifier: "lastCredentials"
};
class We {
  constructor() {
    this.assertionOptionsEndpoint = "/umbraco/backoffice/passless/assertionoptions", this.makeAssertionEndpoint = "/umbraco/backoffice/passless/makeassertion", this.forgotCredentialsEndpoint = "/umbraco/backoffice/passless/forgotcredentials";
  }
  async handleSignInSubmit(e = !0) {
    try {
      const t = localStorage.getItem(fe.lastCredentialsIdentifier), s = await fetch(this.assertionOptionsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          lastCredentialId: e ? t : ""
        })
      });
      if (!s.ok)
        throw new Error(`Failed to get assertion options: ${s.statusText}`);
      const i = await s.json();
      await this.getCredentials(i);
    } catch (t) {
      throw console.error("Sign in failed:", t), new Error("Sign in failed. Please try again.");
    }
  }
  async requestAuthReset(e) {
    try {
      const t = await fetch(this.forgotCredentialsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email: e })
      });
      if (!t.ok)
        throw new Error(`Failed to request auth reset: ${t.statusText}`);
    } catch (t) {
      throw console.error("Auth reset failed:", t), new Error("Failed to send reset email. Please try again.");
    }
  }
  async getCredentials(e) {
    var t;
    e.challenge = R(e.challenge), e.allowCredentials = (t = e.allowCredentials) == null ? void 0 : t.map((s) => (s.id = R(s.id), s));
    try {
      const s = await navigator.credentials.get({ publicKey: e });
      if (!s)
        throw new Error("No credential received");
      await this.verifyAssertionWithServer(s);
    } catch (s) {
      throw console.error("Credential get failed:", s), new Error("User cancelled, or the operation timed out");
    }
  }
  /**
   * Sends the credential to the FIDO2 server for assertion
   */
  async verifyAssertionWithServer(e) {
    try {
      const t = e.response, s = new Uint8Array(t.authenticatorData), i = new Uint8Array(e.response.clientDataJSON), n = new Uint8Array(e.rawId), o = new Uint8Array(t.signature), l = t.userHandle ? new Uint8Array(t.userHandle) : null, a = {
        id: e.id,
        rawId: A(n),
        type: e.type,
        extensions: e.getClientExtensionResults(),
        response: {
          authenticatorData: A(s),
          clientDataJSON: A(i),
          userHandle: l ? A(l) : null,
          signature: A(o)
        }
      }, d = await fetch(this.makeAssertionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(a)
      });
      if (!d.ok)
        throw new Error(`Server validation failed: ${d.statusText}`);
      const h = await d.json();
      h.isPasskey === !1 && localStorage.setItem(fe.lastCredentialsIdentifier, h.credentialId), window.location.href = h.redirectUrl;
    } catch (t) {
      throw console.error("Assertion verification failed:", t), new Error("Your credentials could not be validated, please try again");
    }
  }
}
var Je = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, M = (r, e, t, s) => {
  for (var i = s > 1 ? void 0 : s ? Ke(e, t) : e, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (i = (s ? o(e, t, i) : o(i)) || i);
  return s && i && Je(e, t, i), i;
};
let w = class extends x {
  constructor() {
    super(), this.userLoginState = "", this.isLoading = !1, this.errorMessage = "", this.authService = new We();
  }
  get displayName() {
    var r;
    return ((r = this.manifest.meta) == null ? void 0 : r.label) ?? this.manifest.forProviderName;
  }
  async handlePasslessLogin() {
    try {
      this.isLoading = !0, this.errorMessage = "", this.userLoginState = "Authenticating...", await this.authService.handleSignInSubmit(!0), this.userLoginState = "Authentication successful!";
    } catch (r) {
      console.error("Passless login failed:", r), this.errorMessage = r instanceof Error ? r.message : "Authentication failed", this.userLoginState = "Authentication failed";
    } finally {
      this.isLoading = !1;
    }
  }
  render() {
    return p`
        <h3>Passless Authentication</h3>
        <p>Sign in to Umbraco using your passkey or security key.</p>
        ${this.userLoginState ? p`<p>Status: ${this.userLoginState}</p>` : ""}
        ${this.errorMessage ? p`<p style="color: red;">Error: ${this.errorMessage}</p>` : ""}
        <uui-button 
          type="button" 
          id="button" 
          look="primary" 
          label="${this.displayName}" 
          ?disabled=${this.isLoading}
          @click=${this.handlePasslessLogin}>
          <uui-icon name="icon-fingerprint"></uui-icon>
          ${this.isLoading ? "Authenticating..." : this.displayName}
        </uui-button>
    `;
  }
};
w.styles = ee`
    :host {
      display: block;
      width: 100%;
    }
    #button {
      width: 100%;
    }
    p[style*="color: red"] {
      margin: 8px 0;
      font-size: 14px;
    }
  `;
M([
  L({ type: Object })
], w.prototype, "manifest", 2);
M([
  L({ type: Function })
], w.prototype, "onSubmit", 2);
M([
  y()
], w.prototype, "userLoginState", 2);
M([
  y()
], w.prototype, "isLoading", 2);
M([
  y()
], w.prototype, "errorMessage", 2);
w = M([
  ie("my-lit-view")
], w);
class qe {
  constructor() {
    this.makeCredentialsEndpoint = "/umbraco/management/api/v1/passless/credentials/make", this.credentialsOptionsEndpoint = "/umbraco/management/api/v1/passless/credentials/options", this.getCredentialsEndpoint = "/umbraco/management/api/v1/passless/credentials", this.deleteCredentialsEndpoint = "/umbraco/management/api/v1/passless/credentials/delete";
  }
  async deleteCredential(e) {
    const t = B.TOKEN, s = await t(), i = await fetch(`${this.deleteCredentialsEndpoint}?id=${e}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + s
      },
      credentials: "include",
      body: JSON.stringify({})
    });
    if (!i.ok)
      throw new Error(`Failed to delete credential: ${i.statusText}`);
  }
  async getCredentials() {
    const e = B.TOKEN, t = await e(), s = await fetch(this.getCredentialsEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + t
      },
      credentials: "include"
    });
    if (!s.ok)
      throw new Error(`Failed to get credentials: ${s.statusText}`);
    return await s.json();
  }
  async registerNewCredentials(e) {
    try {
      const t = B.TOKEN, s = await t(), i = await fetch(this.credentialsOptionsEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + s
        },
        credentials: "include"
      });
      if (!i.ok)
        throw new Error(`Failed to get credential options: ${i.statusText}`);
      const n = await i.json();
      return await this.handleUserCredentials(n, e);
    } catch (t) {
      throw console.error("Error contacting server:", t), new Error("Error contacting server");
    }
  }
  async handleUserCredentials(e, t) {
    var s, i;
    e.challenge = R(e.challenge), e.user.id = R(e.user.id), e.excludeCredentials = (s = e.excludeCredentials) == null ? void 0 : s.map((n) => (n.id = R(n.id), n)), ((i = e.authenticatorSelection) == null ? void 0 : i.authenticatorAttachment) === null && (e.authenticatorSelection.authenticatorAttachment = void 0);
    try {
      const n = await navigator.credentials.create({
        publicKey: e
      });
      if (!n)
        throw new Error("Failed to create credentials");
      return await this.prepareNewCredentials(n, t);
    } catch (n) {
      throw new Error(`Credential creation failed: ${n}`);
    }
  }
  async prepareNewCredentials(e, t) {
    const s = new Uint8Array(
      e.response.attestationObject
    ), i = new Uint8Array(e.response.clientDataJSON), n = new Uint8Array(e.rawId), o = A(n), l = {
      id: e.id,
      rawId: o,
      type: e.type,
      extensions: e.getClientExtensionResults(),
      response: {
        attestationObject: A(s),
        clientDataJSON: A(i)
      }
    };
    return await this.registerCredentialWithServer(l, t);
  }
  async registerCredentialWithServer(e, t) {
    const s = B.TOKEN, i = await s(), n = await fetch(`${this.makeCredentialsEndpoint}?alias=${t}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + i
      },
      credentials: "include",
      body: JSON.stringify(e)
    });
    if (!n.ok)
      throw new Error(`Failed to register credential: ${n.statusText}`);
    return await n.json();
  }
}
var Ve = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, $ = (r, e, t, s) => {
  for (var i = s > 1 ? void 0 : s ? Ze(e, t) : e, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (i = (s ? o(e, t, i) : o(i)) || i);
  return s && i && Ve(e, t, i), i;
};
let f = class extends x {
  constructor() {
    super(), this.open = !1, this.loading = !1, this.credentials = null, this.state = "ready", this.registrationAlias = "", this.errorMessage = "", this.successMessage = "", this.credentialsService = new qe();
  }
  connectedCallback() {
    super.connectedCallback(), this.open && this.init();
  }
  updated(r) {
    r.has("open") && this.open && this.init();
  }
  async init() {
    await this.getCredentials();
  }
  async getCredentials() {
    try {
      this.loading = !0, this.errorMessage = "", this.credentials = await this.credentialsService.getCredentials();
    } catch (r) {
      console.error("Failed to get credentials:", r), this.errorMessage = r instanceof Error ? r.message : "Failed to load credentials";
    } finally {
      this.loading = !1;
    }
  }
  async deleteCredential(r) {
    if (confirm(`Are you sure you want to delete the credential "${r.alias}"?`))
      try {
        if (await this.credentialsService.deleteCredential(r.credentialsId), this.successMessage = `Registration deleted: ${r.alias}`, this.credentials) {
          const e = this.credentials.userCredentials.indexOf(r);
          this.credentials.userCredentials.splice(e, 1), this.requestUpdate();
        }
      } catch (e) {
        console.error("Failed to delete credential:", e), this.errorMessage = e instanceof Error ? e.message : "Failed to delete credential";
      }
  }
  addNewCredentials() {
    this.state = "adding", this.registrationAlias = "", this.errorMessage = "", this.successMessage = "";
  }
  async submitRegisterPasslessForm() {
    if (!this.registrationAlias.trim()) {
      this.errorMessage = "Please enter an alias for the authenticator";
      return;
    }
    try {
      this.loading = !0, this.errorMessage = "", await this.credentialsService.registerNewCredentials(this.registrationAlias), this.onKeyRegisteredWithServer();
    } catch (r) {
      console.error("Registration failed:", r), this.errorMessage = r instanceof Error ? r.message : "Registration failed";
    } finally {
      this.loading = !1;
    }
  }
  onKeyRegisteredWithServer() {
    this.successMessage = `Successfully added new credentials with the alias "${this.registrationAlias}"`, this.state = "ready", this.registrationAlias = "", this.getCredentials();
  }
  handleClose() {
    this.state = "ready", this.registrationAlias = "", this.errorMessage = "", this.successMessage = "", this.onClose && this.onClose();
  }
  handleAliasInput(r) {
    const e = r.target;
    this.registrationAlias = e.value;
  }
  handleKeyDown(r) {
    r.key === "Enter" && this.state === "adding" ? this.submitRegisterPasslessForm() : r.key === "Escape" && this.handleClose();
  }
  render() {
    var r, e;
    return this.open ? p`
      <div class="overlay-backdrop" @click=${this.handleClose}>
        <div class="overlay-content" @click=${(t) => t.stopPropagation()}>
          <div class="overlay-header">
            <h2>Manage Passkeys</h2>
            <uui-button 
              type="button" 
              look="primary" 
              @click=${this.handleClose}
              class="close-button">
              <uui-icon name="icon-delete"></uui-icon>
            </uui-button>
          </div>

          <div class="overlay-body">
            ${this.loading ? p`
              <div class="loading">
                <uui-loader></uui-loader>
                <p>Loading...</p>
              </div>
            ` : p`
              <div class="content">
                <h3>Registrations</h3>
                <p>Here you can manage your Passless Authenticators</p>

                ${this.errorMessage ? p`
                  <div class="message error">${this.errorMessage}</div>
                ` : ""}

                ${this.successMessage ? p`
                  <div class="message success">${this.successMessage}</div>
                ` : ""}

                <div class="credentials-list">
                  ${(e = (r = this.credentials) == null ? void 0 : r.userCredentials) == null ? void 0 : e.map((t) => p`
                    <div class="credential-item">
                      <span class="credential-info">
                        <uui-icon name="icon-keychain"></uui-icon>
                        ${t.alias}
                      </span>
                      <uui-button 
                        type="button" 
                        look="primary" 
                        color="danger"
                        @click=${() => this.deleteCredential(t)}>
                        Delete
                      </uui-button>
                    </div>
                  `)}

                  ${this.state === "ready" ? p`
                    <uui-button 
                      type="button" 
                      look="primary" 
                      @click=${this.addNewCredentials}>
                      Add Device
                    </uui-button>
                  ` : ""}

                  ${this.state === "adding" ? p`
                    <div class="add-credential">
                      <uui-input 
                        type="text"
                        placeholder="Alias of the authenticator"
                        .value=${this.registrationAlias}
                        @input=${this.handleAliasInput}
                        @keydown=${this.handleKeyDown}
                        auto-focus>
                      </uui-input>
                      <uui-button 
                        type="button" 
                        look="primary" 
                        ?disabled=${this.loading}
                        @click=${this.submitRegisterPasslessForm}>
                        ${this.loading ? "Adding..." : "Add"}
                      </uui-button>
                    </div>
                  ` : ""}
                </div>
              </div>
            `}
          </div>

          <div class="overlay-footer">
            <uui-button 
              type="button" 
              look="secondary" 
              @click=${this.handleClose}>
              Close
            </uui-button>
          </div>
        </div>
      </div>
    ` : p``;
  }
};
f.styles = ee`
    .overlay-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .overlay-content {
      background: var(--uui-color-surface, #fff);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .overlay-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--uui-color-border, #e0e0e0);
    }

    .overlay-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .close-button {
      min-width: auto;
      padding: 8px;
    }

    .overlay-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      gap: 16px;
    }

    .content h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .content p {
      margin: 0 0 24px 0;
      color: var(--uui-color-text-alt, #666);
    }

    .message {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .message.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .message.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .credentials-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .credential-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid var(--uui-color-border, #e0e0e0);
      border-radius: 4px;
      background: var(--uui-color-surface-alt, #f9f9f9);
    }

    .credential-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .add-credential {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--uui-color-border, #e0e0e0);
      border-radius: 4px;
      background: var(--uui-color-surface-alt, #f9f9f9);
    }

    .add-credential uui-input {
      flex: 1;
    }

    .overlay-footer {
      padding: 20px;
      border-top: 1px solid var(--uui-color-border, #e0e0e0);
      display: flex;
      justify-content: flex-end;
    }
  `;
$([
  L({ type: Boolean })
], f.prototype, "open", 2);
$([
  L({ type: Function })
], f.prototype, "onClose", 2);
$([
  y()
], f.prototype, "loading", 2);
$([
  y()
], f.prototype, "credentials", 2);
$([
  y()
], f.prototype, "state", 2);
$([
  y()
], f.prototype, "registrationAlias", 2);
$([
  y()
], f.prototype, "errorMessage", 2);
$([
  y()
], f.prototype, "successMessage", 2);
f = $([
  ie("passkeys-overlay")
], f);
var Ge = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, we = (r, e, t, s) => {
  for (var i = s > 1 ? void 0 : s ? Ye(e, t) : e, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (i = (s ? o(e, t, i) : o(i)) || i);
  return s && i && Ge(e, t, i), i;
};
let K = class extends x {
  constructor() {
    super(...arguments), this.overlayOpen = !1;
  }
  handlePasskeysClick() {
    this.overlayOpen = !0;
  }
  handleOverlayClose() {
    this.overlayOpen = !1;
  }
  get passkeyIcon() {
    return Ne`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
        <g>
          <circle cx="10.5" cy="6" r="4.5" style="fill:currentColor"/>
          <path d="M22.5,10.5a3.5,3.5,0,1,0-5,3.15V19L19,20.5,21.5,18,20,16.5,21.5,15l-1.24-1.24A3.5,3.5,0,0,0,22.5,10.5Zm-3.5,0a1,1,0,1,1,1-1A1,1,0,0,1,19,10.5Z" style="fill:currentColor"/>
          <path d="M14.44,12.52A6,6,0,0,0,12,12H9a6,6,0,0,0-6,6v2H16V14.49A5.16,5.16,0,0,1,14.44,12.52Z" style="fill:currentColor"/>
        </g>
      </svg>
    `;
  }
  render() {
    return p`
      <div class="passkeys-container">
        <uui-button 
          type="button" 
          look="primary" 
          label="Manage Passkeys"
          @click=${this.handlePasskeysClick}>
          ${this.passkeyIcon}
          Manage Passkeys
        </uui-button>
        
        <passkeys-overlay 
          .open=${this.overlayOpen}
          .onClose=${this.handleOverlayClose}>
        </passkeys-overlay>
      </div>
    `;
  }
};
K.styles = ee`
    .passkeys-container {
      display: block;
      width: 100%;
    }
    
    uui-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;
we([
  y()
], K.prototype, "overlayOpen", 2);
K = we([
  ie("passkeys-manager")
], K);
export {
  w as MyLitView,
  K as PasskeysManager,
  f as PasskeysOverlay
};
//# sourceMappingURL=client.js.map
