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

// https://github.com/preactjs/preact/blob/main/src/constants.js#L15C1-L16C70
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
let addedCSS = new Set<string>();
let lastDoc: unknown;
function getClassNames(styles: Styles): string[] {
    // This check allows us to support serverside rendering. Any serverside rendering implementation
    //  should change the document instance between renders, and so if the document changes, we need to
    //  re-add our css.
    //  (This is also true if the document were to change clientside, as this would mean our css was
    //      removed from the document!)
    if (lastDoc !== document) {
        lastDoc = document;
        addedCSS.clear();
    }
    let result: string[] = [];
    let newCSSByOrder = new Map<number, string[]>();
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
        if (typeof value === "number" && !IS_NON_DIMENSIONAL.test(key.toLowerCase().replaceAll("-", ""))) {
            value = value + "px";
        }

        let selector = `.${className}${prependSelector}`;
        let contents = ` { ${key}: ${value}${suffix || ""}; }`;
        let css = selector + contents;
        if (selector.includes(":hover")) {
            let hoverInnerSelector = selector.replace(":hover", "");
            css += ` .trigger-hover:hover ${hoverInnerSelector}${contents}`;
        }
        if (!addedCSS.has(css)) {
            addedCSS.add(css);
            let newCSS = newCSSByOrder.get(order);
            if (!newCSS) {
                newCSS = [];
                newCSSByOrder.set(order, newCSS);
            }
            newCSS.push(css);
        }
        result.push(className);
    }
    for (let [order, newCSS] of newCSSByOrder) {
        let orderMarker = document.querySelector(`style[data-order="${order}"]`);
        if (!orderMarker) {
            orderMarker = document.createElement("style");
            orderMarker.setAttribute("data-order", order.toString());
            let allOrderMarkers = Array.from(document.querySelectorAll(`style[data-order]`));
            let afterMarker = allOrderMarkers.find(a => +(a.getAttribute("data-order") as any) > order);
            if (afterMarker) {
                afterMarker.before(orderMarker);
            } else {
                document.head.append(orderMarker);
            }
        }

        let style = document.createElement("style");
        style.innerHTML = newCSS.join("\n");
        orderMarker.after(style);
    }

    return result;
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
    hsla: (c: CSSHelperTypeBase, h: number, s: number, l: number, a: number): CSSHelperTypeBase => c.background(`hsla(${h}, ${s}%, ${l}%, ${a})`),
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
            if (key === Symbol.toPrimitive) {
                return () => {
                    return " " + getClassNames(styles).join(" ") + " ";
                };
            }
            if (typeof key === "symbol") return undefined;
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
    }
);

export const css = cssHelper("", {}) as CSSHelperType;