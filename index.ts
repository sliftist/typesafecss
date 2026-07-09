// TODO: Support dynamically extending css to a version with custom aliases.

export function isNode() {
    // Use window, as document is sometimes available during server-side rendering
    return typeof window === "undefined";
}
import type { LengthOrPercentage, StrictStyles } from "./cssTypes";
if (typeof module !== "undefined") {
    (module as any).allowclient = true;
}

type Styles = {
    [key: string]: {
        value: string | number;
        order: number;
        suffix?: string;
    }
};

type MeasureBlock = {
    <T>(code: () => T, name?: string): T;
};

function measureBlockDefault<T>(code: () => T, name?: string): T {
    return code();
}
let measureBlock: MeasureBlock = measureBlockDefault;
// We can profile our internal code, if you provide us the functino you want us to call when running code.
export function setMeasureBlock(newMeasureBlock: MeasureBlock) {
    measureBlock = newMeasureBlock;
}


type DelayFnc = {
    (fnc: () => void): void;
};
function delayFncDefault(fnc: () => void) {
    void Promise.resolve().finally(fnc);
}
let delayFnc: DelayFnc = delayFncDefault;

// You can override how we delay style insertions (which we do to batch multiple, which makes our code 100X faster). This is useful if you need to know when all styles are added, so you can measure things, etc.
export function setDelayFnc(newDelayFnc: DelayFnc) {
    delayFnc = newDelayFnc;
}


// https://github.com/preactjs/preact/blob/main/src/constants.js#L15C1-L16C70
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
// Every generated declaration is emitted once as a CSS rule and remembered
// here, keyed by its (unique) class name. `rules` is the 1-2 rule strings that
// make up the class (2 when there's a :hover trigger). `lastUsedMs` is the wall
// time we last handed this class out, used to garbage-collect stale rules.
type RuleRec = { order: number; rules: string[]; lastUsedMs: number };
let ruleByClass = new Map<string, RuleRec>();
// One persistent <style> per order (0 = "soft" defaults, 1 = normal). We append
// rules into these via insertRule instead of creating a fresh <style> per flush;
// that keeps the <style> node count tiny and lets us delete individual rules.
let sheetByOrder = new Map<number, HTMLStyleElement>();
let lastDoc: unknown;

// ---- Garbage collection of unused rules ------------------------------------
// Feeding an ever-changing value through css.* (e.g. css.width(`${pct}%`) driven
// every animation frame) generates a brand-new rule per distinct value. Without
// cleanup these accumulate without bound: memory grows, and — because every
// stylesheet mutation invalidates computed style document-wide — each forced
// style recalc gets steadily slower (measured: linear in total rule count).
//
// So we periodically drop rules that BOTH (a) haven't been requested for a while
// (cheap LRU filter) AND (b) are not currently applied to any element in the DOM.
// Dropping is always safe: a class name is a pure function of its styles, so if a
// dropped rule is needed again the next render regenerates it identically. The
// worst case is one extra insert later, never a wrong style.
//
// Liveness is checked with a SINGLE O(nodes) sweep of the DOM into a Set of the
// class tokens currently in use, then one Set.has() per candidate. This is NOT
// the same as calling document.getElementsByClassName(token) per candidate:
// measured on Chromium, a query for a never-seen token is O(nodes) (~0.28 ms on
// a 44k-node page), because the class index is populated lazily and a miss walks
// the tree. K such queries cost K*O(nodes) — seconds when K is large. The single
// sweep is O(nodes) total (~41 ms on that same page, but once), after which each
// check is ~0.1 µs. Break-even is ~150 candidates; GC only runs far above that.
let gcEnabled = true;
// Don't bother collecting until we exceed this many rules. Below ~2-3k the extra
// recalc from leaked rules is < ~0.5 ms/frame (measured ~0.17 µs/rule/reflow), so
// touching the DOM to reclaim them isn't worth it.
let gcMaxRules = 3000;
let gcMaxAgeMs = 60_000;   // only evict rules untouched for at least this long
// Require at least this many age-gated (stale) candidates before we pay for the
// O(nodes) DOM sweep — keeps a sweep from ever costing more than it reclaims.
let gcMinCandidates = 200;
let gcScheduled = false;

export function setGarbageCollection(cfg: { enabled?: boolean; maxRules?: number; maxAgeMs?: number; minCandidates?: number; }) {
    if (cfg.enabled !== undefined) gcEnabled = cfg.enabled;
    if (cfg.maxRules !== undefined) gcMaxRules = cfg.maxRules;
    if (cfg.maxAgeMs !== undefined) gcMaxAgeMs = cfg.maxAgeMs;
    if (cfg.minCandidates !== undefined) gcMinCandidates = cfg.minCandidates;
}

function scheduleGC() {
    if (gcScheduled) return;
    gcScheduled = true;
    let schedule: (fn: () => void, timeout: number) => void = (
        (globalThis as any).requestIdleCallback
        || ((fn: () => void, timeout: number) => setTimeout(fn, timeout))
    );
    schedule(() => { gcScheduled = false; runGarbageCollectionNow(); }, 15000);
}

export function runGarbageCollectionNow() {
    let document = globalThis.document;
    if (!document) return;
    if (ruleByClass.size <= gcMaxRules) return;
    let nowMs = Date.now();

    // Cheap LRU pass first: gather rules untouched for at least gcMaxAgeMs. This
    // needs no DOM access. If too few are stale, bail before the sweep — a sweep
    // that reclaims a handful of rules costs more than it saves.
    let candidates: string[] = [];
    for (let [className, rec] of ruleByClass) {
        if (nowMs - rec.lastUsedMs >= gcMaxAgeMs) candidates.push(className);
    }
    if (candidates.length < gcMinCandidates) return;

    // One O(nodes) sweep: collect every class token currently on the page.
    let live = new Set<string>();
    let all = document.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
        let list = all[i].classList;
        for (let j = 0; j < list.length; j++) live.add(list[j]);
    }

    // Evict stale candidates that no live element is using.
    let dirtyOrders = new Set<number>();
    for (let className of candidates) {
        if (live.has(className)) continue;
        let rec = ruleByClass.get(className);
        if (!rec) continue;
        ruleByClass.delete(className);
        dirtyOrders.add(rec.order);
    }
    // Rebuild only the sheets we actually removed rules from. GC is infrequent,
    // so a single O(rules-in-order) textContent rebuild here is fine (and it
    // reparses far less often than the per-value inserts it replaces).
    for (let order of dirtyOrders) {
        let el = sheetByOrder.get(order);
        if (!el) continue;
        let text: string[] = [];
        for (let rec of ruleByClass.values()) if (rec.order === order) text.push(...rec.rules);
        el.textContent = text.join("\n");
    }
}

function ensureSheet(document: Document, order: number): HTMLStyleElement {
    let el = sheetByOrder.get(order);
    if (el && el.isConnected) return el;
    el = document.createElement("style");
    el.setAttribute("data-order", order.toString());
    // Keep the <style> nodes ordered in <head> by their order value so the
    // cascade still sees soft defaults (order 0) before normal rules (order 1).
    let siblings = Array.from(document.querySelectorAll(`style[data-order]`));
    let after = siblings.find(a => +(a.getAttribute("data-order") as any) > order);
    if (after) after.before(el); else document.head.append(el);
    sheetByOrder.set(order, el);
    return el;
}

let pendingByOrder: Map<number, string[]> | undefined;

function getClassNames(styles: Styles): string[] {
    return measureBlock(() => {
        let document = globalThis.document;
        if (!document) return [];
        // This check allows us to support serverside rendering. Any serverside rendering implementation
        //  should change the document instance between renders, and so if the document changes, we need to
        //  re-add our css.
        //  (This is also true if the document were to change clientside, as this would mean our css was
        //      removed from the document!)
        if (lastDoc !== document) {
            lastDoc = document;
            ruleByClass.clear();
            sheetByOrder.clear();
            pendingByOrder = undefined;
        }
        let nowMs = Date.now();
        let result: string[] = [];
        measureBlock(function generateCSS() {
            for (let [key, { value, order, suffix }] of Object.entries(styles)) {
                let prependSelector = key.split(":").slice(1).join(":");
                if (prependSelector) prependSelector = ":" + prependSelector;
                key = key.split(":")[0];
                function sanitize(text: string) {
                    let sanitized = "";
                    for (let ch of text) {
                        // If it isn't a letter, number, or dash, replace it with the char code
                        if (!/[a-zA-Z0-9-]/.test(ch)) {
                            ch = "-" + ch.charCodeAt(0).toString(16);
                        }
                        sanitized += ch;
                    }
                    return sanitized;
                }
                let className = `${key}-${prependSelector.replaceAll(":", "")}-${sanitize(String(value))}-${order}`;

                // Already emitted — just refresh its last-used stamp (keeps hot
                // classes from being garbage-collected) and reuse it.
                let existing = ruleByClass.get(className);
                if (existing) {
                    existing.lastUsedMs = nowMs;
                    result.push(className);
                    continue;
                }

                if (typeof value === "number" && !IS_NON_DIMENSIONAL.test(key.toLowerCase().replaceAll("-", ""))) {
                    value = value + "px";
                }
                let selector = `.${className}${prependSelector}`;
                let contents = ` { ${key}: ${value}${suffix || ""}; }`;
                let rules = [selector + contents];
                if (selector.includes(":hover")) {
                    let hoverInnerSelector = selector.replace(":hover", "");
                    rules.push(`.trigger-hover:hover ${hoverInnerSelector}${contents}`);
                }
                ruleByClass.set(className, { order, rules, lastUsedMs: nowMs });

                if (!pendingByOrder) {
                    pendingByOrder = new Map();
                    delayFnc(() => {
                        measureBlock(function addCSS() {
                            if (!pendingByOrder) return;
                            let doc = globalThis.document;
                            if (doc) {
                                for (let [order, ruleList] of pendingByOrder) {
                                    let el = ensureSheet(doc, order);
                                    let sheet = el.sheet;
                                    if (sheet) {
                                        for (let r of ruleList) {
                                            try { sheet.insertRule(r, sheet.cssRules.length); } catch { /* ignore invalid rule */ }
                                        }
                                    } else {
                                        el.textContent = (el.textContent || "") + "\n" + ruleList.join("\n");
                                    }
                                }
                            }
                            pendingByOrder = undefined;
                        }, "typesafecss|insertStyleTag");
                    });
                }
                let arr = pendingByOrder.get(order);
                if (!arr) { arr = []; pendingByOrder.set(order, arr); }
                arr.push(...rules);
                result.push(className);
            }
        }, "typesafecss|generateRawCSS");

        if (gcEnabled && ruleByClass.size > gcMaxRules) scheduleGC();
        return result;
    }, "typesafecss|getClassNames");
}


let nonCallAliases = {
    center: (c: CSSHelperTypeBase) => c.display("flex").justifyContent("center").alignItems("center"),
    button: (c: CSSHelperTypeBase) => c.cursor("pointer").userSelect("none").filter("brightness(1.1)", "hover"),
    flex: (c: CSSHelperTypeBase) => c.display("flex"),
    relative: (c: CSSHelperTypeBase) => c.position("relative"),
    absolute: (c: CSSHelperTypeBase) => c.position("absolute"),
    fixed: (c: CSSHelperTypeBase) => c.position("fixed"),
    wrap: (c: CSSHelperTypeBase) => c.flexWrap("wrap").display("flex", "soft").alignItems("center", "soft"),
    marginAuto: (c: CSSHelperTypeBase) => c.margin("auto"),
    nowrap: (c: CSSHelperTypeBase) => c.flexWrap("nowrap"),
    fillBoth: (c: CSSHelperTypeBase) => c.width("100%").height("100%"),
    fillWidth: (c: CSSHelperTypeBase) => c.width("100%"),
    fillHeight: (c: CSSHelperTypeBase) => c.height("100%"),
    shrink: (c: CSSHelperTypeBase) => c.flexShrink(100000000000),
    flexFillWidth: (c: CSSHelperTypeBase) => c.flexGrow(1).minWidth(0).flexShrink(1000000000),
    flexFillHeight: (c: CSSHelperTypeBase) => c.flexGrow(1).minHeight(0).flexShrink(1000000000),
    fillWidthFlex: (c: CSSHelperTypeBase) => c.flexGrow(1).minWidth(0).flexShrink(1000000000),
    fillHeightFlex: (c: CSSHelperTypeBase) => c.flexGrow(1).minHeight(0).flexShrink(1000000000),
    fillFlex: (c: CSSHelperTypeBase) => c.flexGrow(1).minWidth(0).minHeight(0).flexShrink(1000000000),
    fill: (c: CSSHelperTypeBase) => c.flexGrow(1).minWidth(0).minHeight(0).flexShrink(1000000000),
    flexShrink0: (c: CSSHelperTypeBase) => c.flexShrink(0),
    flexExpand: (c: CSSHelperTypeBase) => c.width(0).minWidth(0).flexGrow(1),
    vbox0: (c: CSSHelperTypeBase) => c.display("flex").flexDirection("column").alignItems("start", "soft"),
    hbox0: (c: CSSHelperTypeBase) => c.display("flex").flexDirection("row").alignItems("center", "soft"),
    top0: (c: CSSHelperTypeBase) => c.top(0),
    bottom0: (c: CSSHelperTypeBase) => c.bottom(0),
    left0: (c: CSSHelperTypeBase) => c.left(0),
    right0: (c: CSSHelperTypeBase) => c.right(0),
    pointer: (c: CSSHelperTypeBase) => c.cursor("pointer"),
    ellipsis: (c: CSSHelperTypeBase) => c.overflow("hidden").textOverflow("ellipsis").whiteSpace("nowrap").display("inline-block"),
    overflowAuto: (c: CSSHelperTypeBase) => c.overflow("auto"),
    overflowHidden: (c: CSSHelperTypeBase) => c.overflow("hidden"),
    alignEnd: (c: CSSHelperTypeBase) => c.alignItems("end"),
    alignStart: (c: CSSHelperTypeBase) => c.alignItems("start"),
    alignCenter: (c: CSSHelperTypeBase) => c.alignItems("center"),
    scroll: (c: CSSHelperTypeBase) => c.overflow("auto"),
    scrollX: (c: CSSHelperTypeBase) => c.overflowX("auto").overflowY("hidden"),
    scrollY: (c: CSSHelperTypeBase) => c.overflowY("auto").overflowX("hidden"),
    italic: (c: CSSHelperTypeBase) => c.fontStyle("italic"),
    boldStyle: (c: CSSHelperTypeBase) => c.fontWeight("bold"),
};
let callAliases = {
    hbox: (c: CSSHelperTypeBase, gap: number, rowGap?: number) => c.display("flex").flexDirection("row").rowGap(rowGap ?? gap).columnGap(gap).alignItems("center", "soft"),
    vbox: (c: CSSHelperTypeBase, gap: number, columnGap?: number) => c.display("flex").flexDirection("column").rowGap(gap).columnGap(columnGap ?? gap).alignItems("start", "soft"),
    pad: (c: CSSHelperTypeBase, value: number, horizontalValue?: number): CSSHelperTypeBase => {
        if (horizontalValue !== undefined) return c.padding(`${value}px ${horizontalValue}px` as any);
        return c.padding(value);
    },
    margins: (c: CSSHelperTypeBase, value: number, horizontalValue?: number): CSSHelperTypeBase => {
        if (horizontalValue !== undefined) return c.margin(`${value}px ${horizontalValue}px` as any);
        return c.margin(value);
    },
    pad2: (c: CSSHelperTypeBase, value: number, verticalValue?: number): CSSHelperTypeBase => {
        if (verticalValue !== undefined) return c.padding(`${verticalValue}px ${value}px` as any);
        return c.padding(value);
    },
    margins2: (c: CSSHelperTypeBase, value: number, verticalValue?: number): CSSHelperTypeBase => {
        if (verticalValue !== undefined) return c.margin(`${verticalValue}px ${value}px` as any);
        return c.margin(value);
    },
    padh: (c: CSSHelperTypeBase, value: number): CSSHelperTypeBase => c.paddingLeft(value).paddingRight(value),
    padv: (c: CSSHelperTypeBase, value: number): CSSHelperTypeBase => c.paddingTop(value).paddingBottom(value),
    hsl: (c: CSSHelperTypeBase, h: number, s: number, l: number): CSSHelperTypeBase => c.background(`hsl(${h}, ${s}%, ${l}%)`),
    hslhover: (c: CSSHelperTypeBase, h: number, s: number, l: number): CSSHelperTypeBase => c.background(`hsl(${h}, ${s}%, ${l}%)`, "hover"),
    hsla: (c: CSSHelperTypeBase, h: number, s: number, l: number, a: number): CSSHelperTypeBase => c.background(`hsla(${h}, ${s}%, ${l}%, ${a})`),
    hslahover: (c: CSSHelperTypeBase, h: number, s: number, l: number, a: number): CSSHelperTypeBase => c.background(`hsla(${h}, ${s}%, ${l}%, ${a})`, "hover"),
    bord: (c: CSSHelperTypeBase, width: number, color: string | { h: number; s: number; l: number; a?: number; }, style = "solid"): CSSHelperTypeBase => {
        let colorStr = typeof color === "string" ? color : `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a ?? 1})`;
        return c.border(`${width}px ${style} ${colorStr}`);
    },
    bord2: (c: CSSHelperTypeBase, h: number, s: number, l: number, width = 1, style = "solid"): CSSHelperTypeBase => {
        return c.border(`${width}px ${style} hsla(${h}, ${s}%, ${l}%, 1)`);
    },
    hslcolor: (c: CSSHelperTypeBase, h: number, s: number, l: number): CSSHelperTypeBase => c.color(`hsl(${h}, ${s}%, ${l}%)`),
    colorhsl: (c: CSSHelperTypeBase, h: number, s: number, l: number): CSSHelperTypeBase => c.color(`hsl(${h}, ${s}%, ${l}%)`),
    hslacolor: (c: CSSHelperTypeBase, h: number, s: number, l: number, a: number): CSSHelperTypeBase => c.color(`hsla(${h}, ${s}%, ${l}%, ${a})`),
    colorhsla: (c: CSSHelperTypeBase, h: number, s: number, l: number, a: number): CSSHelperTypeBase => c.color(`hsla(${h}, ${s}%, ${l}%, ${a})`),
    size: (c: CSSHelperTypeBase, width: LengthOrPercentage, height: LengthOrPercentage) => c.width(width).height(height),
    pos: (c: CSSHelperTypeBase, x: LengthOrPercentage, y: LengthOrPercentage) => c.left(x).top(y),
    offset: (c: CSSHelperTypeBase, x: LengthOrPercentage, y: LengthOrPercentage) => c.transform(`translate(${x}, ${y})`),
    offsetx: (c: CSSHelperTypeBase, x: LengthOrPercentage) => c.transform(`translateX(${x})`),
    offsety: (c: CSSHelperTypeBase, y: LengthOrPercentage) => c.transform(`translateY(${y})`),
    raw: (c: CSSHelperTypeBase, key: keyof StrictStyles, value: string | number) => c[key as "left"](value as number),
    /** Fractional box, with values between 0 and 1, absolutely positioned */
    box: (c: CSSHelperTypeBase, box: { x: number; y: number; xEnd: number; yEnd: number }) => css.absolute.pos(`${box.x * 100}%`, `${box.y * 100}%`).size(`${(box.xEnd - box.x) * 100}%`, `${(box.yEnd - box.y) * 100}%`),
};

function cssHelper(key: string, styles: Styles) {
    return new Proxy(() => { }, {
        get(target, key: string | symbol): any {
            function toString() {
                return " " + getClassNames(styles).join(" ") + " ";
            }
            if (key === Symbol.toPrimitive || key === "toString") {
                return toString;
            }
            if (typeof key === "symbol") return undefined;
            if (key === "getStyles") {
                return () => styles;
            }
            if (key in nonCallAliases) {
                return nonCallAliases[key as "center"](cssHelper(key, styles));
            }
            // Convert from camelCase to kebab-case
            key = key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
            return cssHelper(key, styles);
        },
        apply(target, thisArg, argArray): any {
            if (key in callAliases) {
                return (callAliases as any)[key](cssHelper(key, styles), ...argArray);
            }
            styles = { ...styles };
            let order = 1;
            let suffix = "";
            if (argArray.includes("soft")) {
                order = 0;
            }
            if (argArray.includes("hover")) {
                key += ":hover";
            }
            if (argArray.includes("active")) {
                key += ":active";
            }
            if (argArray.includes("focus")) {
                key += ":focus";
            }
            if (argArray.includes("important")) {
                suffix = " !important";
            }
            if (!(key in styles) || styles[key].order <= order) {
                styles[key] = {
                    value: argArray[0],
                    order,
                    suffix,
                };
            }
            return cssHelper(key, styles);
        },
    }) as any;
}

type NonCallAliases = typeof nonCallAliases;
type CallAliases = typeof callAliases;
type CSSHelperTypeBase = {
    [key in keyof StrictStyles]-?: (
        value: StrictStyles[key],
        ...types: ("soft" | "hover" | "active" | "focus" | "important")[]
    ) => CSSHelperType;
} & string;
type CSSHelperType = (
    CSSHelperTypeBase & {
        [key in keyof NonCallAliases]: CSSHelperType;
    } & {
        [key in keyof CallAliases]: CallAliases[key] extends (c: CSSHelperTypeBase, ...args: infer Args) => any ? (...args: Args) => CSSHelperType : never;
    } & {
        getStyles: () => Styles;
    }
);

export type CSSType = CSSHelperType;

export const css = cssHelper("", {}) as CSSHelperType;