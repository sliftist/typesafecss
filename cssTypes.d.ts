
export type Length = number | `${number}px` | `${number}%` | `${number}em` | `${number}rem` | `${number}vh` | `${number}vw` | `${number}vmin` | `${number}vmax` | `${number}ex` | `${number}ch` | `${number}cm` | `${number}mm` | `${number}in` | `${number}pt` | `${number}pc` | `calc(${string})`;
export type LengthOrPercentage = Length | `${number}%`;
export type LengthOrPercentageOrAuto = Length | `${number}%` | "auto";
export type Rotate = `${number}deg` | `${number}grad` | `${number}rad` | `${number}turn`;
export type StrictStyles = {
    display?: "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "inline-grid" | "none" | "contents" | "flow-root" | "table" | "table-row-group" | "table-header-group" | "table-footer-group" | "table-row" | "table-cell" | "table-column-group" | "table-column" | "table-caption";
    flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
    justifyContent?: "start" | "end" | "left" | "right" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    alignItems?: "start" | "end" | "self-start" | "self-end" | "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
    alignContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "stretch";
    flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: string | number; // Generally a length value (e.g., "0%", "50px", "auto")
    order?: number;
    alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "baseline" | "stretch" | "start" | "end";
    position?: "static" | "relative" | "fixed" | "absolute" | "sticky";
    top?: LengthOrPercentage; // Length values or percentages
    right?: LengthOrPercentage; // Length values or percentages
    bottom?: LengthOrPercentage; // Length values or percentages
    left?: LengthOrPercentage; // Length values or percentages
    width?: LengthOrPercentageOrAuto; // Length values, percentages, or "auto"
    height?: LengthOrPercentageOrAuto; // Length values, percentages, or "auto"
    minWidth?: LengthOrPercentage; // Length values or percentages
    minHeight?: LengthOrPercentage; // Length values or percentages
    maxWidth?: LengthOrPercentage; // Length values or percentages
    maxHeight?: LengthOrPercentage; // Length values or percentages
    margin?: LengthOrPercentageOrAuto; // Length values, percentages, or "auto"
    padding?: LengthOrPercentage; // Length values or percentages
    paddingTop?: LengthOrPercentage; // Length values or percentages
    paddingRight?: LengthOrPercentage; // Length values or percentages
    paddingBottom?: LengthOrPercentage; // Length values or percentages
    paddingLeft?: LengthOrPercentage; // Length values or percentages
    marginTop?: LengthOrPercentage; // Length values or percentages
    marginRight?: LengthOrPercentage; // Length values or percentages
    marginBottom?: LengthOrPercentage; // Length values or percentages
    marginLeft?: LengthOrPercentage; // Length values or percentages
    backgroundColor?: string; // Color values
    color?: string; // Color values
    fontSize?: string | number; // Length values, percentages, or keyword sizes (e.g., "small", "medium", "large")
    fontFamily?: string;
    fontWeight?: "normal" | "bold" | "bolder" | "lighter" | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    textAlign?: "left" | "right" | "center" | "justify" | "justify-all" | "start" | "end";
    textTransform?: "none" | "capitalize" | "uppercase" | "lowercase" | "full-width" | "full-size-kana";
    textDecoration?: "none" | "underline" | "overline" | "line-through";
    border?: string; // A shorthand property for border-width, border-style, and border-color
    borderRadius?: LengthOrPercentage; // Length values or percentages
    opacity?: number; // A number between 0 (fully transparent) and 1 (fully opaque)
    zIndex?: number;
    rotate?: Rotate;

    overflow?: "visible" | "hidden" | "scroll" | "auto" | "clip";
    overflowX?: "visible" | "hidden" | "scroll" | "auto" | "clip";
    overflowY?: "visible" | "hidden" | "scroll" | "auto" | "clip";
    cursor?: "auto" | "default" | "none" | "context-menu" | "help" | "pointer" | "progress" | "wait" | "cell" | "crosshair" | "text" | "vertical-text" | "alias" | "copy" | "move" | "no-drop" | "not-allowed" | "grab" | "grabbing" | "all-scroll" | "col-resize" | "row-resize" | "n-resize" | "e-resize" | "s-resize" | "w-resize" | "ne-resize" | "nw-resize" | "se-resize" | "sw-resize" | "ew-resize" | "ns-resize" | "nesw-resize" | "nwse-resize" | "zoom-in" | "zoom-out";
    boxSizing?: "content-box" | "border-box";
    boxShadow?: string; // e.g., "10px 5px 5px black"
    transition?: string; // e.g., "all 0.3s ease-out"
    transform?: string; // e.g., "rotate(90deg)"
    background?: string; // Color values, gradients, images
    backgroundImage?: string; // URL or gradient
    backgroundPosition?: string; // e.g., "top left", "center center"
    backgroundSize?: string; // e.g., "cover", "contain", "50%"
    backgroundRepeat?: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
    backgroundAttachment?: "scroll" | "fixed" | "local";
    borderBottom?: string; // Border shorthand property
    borderLeft?: string; // Border shorthand property
    borderRight?: string; // Border shorthand property
    borderTop?: string; // Border shorthand property
    borderBottomColor?: string; // Color values
    borderLeftColor?: string; // Color values
    borderRightColor?: string; // Color values
    borderTopColor?: string; // Color values
    borderBottomStyle?: "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
    borderLeftStyle?: "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
    borderRightStyle?: "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
    borderTopStyle?: "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
    borderBottomWidth?: string | number; // Length values
    borderLeftWidth?: string | number; // Length values
    borderRightWidth?: string | number; // Length values
    borderTopWidth?: string | number; // Length values
    borderRadiusTopLeft?: LengthOrPercentage; // Length values or percentages
    borderRadiusTopRight?: LengthOrPercentage; // Length values or percentages
    borderRadiusBottomLeft?: LengthOrPercentage; // Length values or percentages
    borderRadiusBottomRight?: LengthOrPercentage; // Length values or percentages
    visibility?: "visible" | "hidden" | "collapse";
    whiteSpace?: "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line";
    letterSpacing?: string | number; // Length values
    lineHeight?: string; // Number, length values, or percentages
    textShadow?: string; // e.g., "1px 1px 2px black"
    verticalAlign?: "baseline" | "sub" | "super" | "text-top" | "text-bottom" | "middle" | "top" | "bottom";
    listStyle?: string; // e.g., "square inside"
    listStyleType?: "disc" | "circle" | "square" | "decimal" | "lower-roman" | "upper-roman" | "lower-greek" | "lower-latin" | "upper-latin" | "armenian" | "georgian" | "lower-alpha" | "upper-alpha" | "none";
    listStylePosition?: "inside" | "outside";
    listStyleImage?: string; // URL of an image or "none"
    tableLayout?: "auto" | "fixed";
    borderCollapse?: "collapse" | "separate";
    borderSpacing?: string; // e.g., "5px", "10px 15px"
    captionSide?: "top" | "bottom";
    emptyCells?: "show" | "hide";
    backfaceVisibility?: "visible" | "hidden";
    perspective?: string | number; // Length values
    perspectiveOrigin?: string; // Percentage or length values
    transformOrigin?: string; // e.g., "left top", "50% 50%", "100px 100px"
    transformStyle?: "flat" | "preserve-3d";
    clip?: string; // Deprecated, but sometimes used, e.g., "rect(1px, 1px, 1px, 1px)"
    clipPath?: string; // e.g., "circle(50%)", "url(#myClip)"
    filter?: string; // e.g., "blur(5px)", "brightness(0.4)"
    backdropFilter?: string; // e.g., "blur(5px)", "brightness(0.4)"
    gridTemplateColumns?: string; // e.g., "auto 1fr auto", "repeat(3, 1fr)"
    gridTemplateRows?: string; // e.g., "auto 1fr auto", "repeat(3, 1fr)"
    gridColumnGap?: string | number; // Length values
    gridRowGap?: string | number; // Length values
    gridColumnStart?: string; // e.g., "1", "2", "span 2"
    gridColumnEnd?: string; // e.g., "1", "2", "span 2"
    gridRowStart?: string; // e.g., "1", "2", "span 2"
    gridRowEnd?: string; // e.g., "1", "2", "span 2"
    gridAutoFlow?: "row" | "column" | "dense" | "row dense" | "column dense";
    gridAutoColumns?: string; // e.g., "auto", "minmax(100px, auto)"
    gridAutoRows?: string; // e.g., "auto", "minmax(100px, auto)"
    gap?: string | number; // e.g., "10px", "10px 20px"
    rowGap?: string | number; // e.g., "10px", "10px 20px"
    columnGap?: string | number; // e.g., "10px", "10px 20px"
    justifyContentSelf?: "start" | "end" | "center" | "stretch" | "self-start" | "self-end";
    alignContentSelf?: "start" | "end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly" | "baseline";
    placeContent?: string; // Combination of align-content and justify-content values
    placeItems?: string; // Combination of align-items and justify-items values
    placeSelf?: string; // Combination of align-self and justify-self values
    writingMode?: "horizontal-tb" | "vertical-rl" | "vertical-lr";
    textOrientation?: "mixed" | "upright" | "sideways";
    textOverflow?: "clip" | "ellipsis";
    unicodeBidi?: "normal" | "embed" | "bidi-override" | "isolate" | "isolate-override" | "plaintext";
    userSelect?: "none" | "auto" | "text" | "contain" | "all";
    pointerEvents?: "auto" | "none" | "visiblePainted" | "visibleFill" | "visibleStroke" | "visible" | "painted" | "fill" | "stroke" | "all";
    resize?: "none" | "both" | "horizontal" | "vertical" | "block" | "inline";
    scrollBehavior?: "auto" | "smooth";
    willChange?: string; // e.g., "opacity", "transform"
    gridColumn?: string; // e.g., "1 / span 2", "1 / 3"
    gridRow?: string; // e.g., "1 / span 2", "1 / 3"
    gridArea?: string; // e.g., "1 / col4-start / last-line / 6"
    columnCount?: number | "auto";
    columnFill?: "auto" | "balance";
    columnRule?: string; // A shorthand property for column-rule-width, column-rule-style, and column-rule-color
    columnRuleColor?: string; // Color values
    columnRuleStyle?: "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
    columnRuleWidth?: string | number; // Length values
    columnSpan?: "none" | "all";
    columnWidth?: string | "auto"; // Length values
    columns?: string; // A shorthand property for column-width and column-count
    flexFlow?: string; // A shorthand property for flex-direction and flex-wrap
    orphans?: number;
    widows?: number;
    animation?: string; // e.g., "slidein 3s ease-in 1s infinite reverse both paused"
    animationDelay?: string; // e.g., "1s", "100ms"
    animationDirection?: "normal" | "reverse" | "alternate" | "alternate-reverse";
    animationDuration?: string; // e.g., "3s", "200ms"
    animationFillMode?: "none" | "forwards" | "backwards" | "both";
    animationIterationCount?: number | "infinite";
    animationName?: string; // e.g., "slidein", "fadeIn"
    animationPlayState?: "paused" | "running";
    animationTimingFunction?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "step-start" | "step-end" | string; // Custom timing function
    backgroundClip?: "border-box" | "padding-box" | "content-box" | "text";
    backgroundOrigin?: "padding-box" | "border-box" | "content-box";
    blockSize?: LengthOrPercentage; // Length values or percentages
    borderImage?: string; // e.g., "url(border.png) 30 round"
    borderImageOutset?: string; // e.g., "30px"
    borderImageRepeat?: "stretch" | "repeat" | "round" | "space";
    borderImageSlice?: string; // e.g., "30%"
    borderImageSource?: string; // e.g., "url(border.png)"
    borderImageWidth?: string; // e.g., "10px", "1em", "30%"
    borderWidth?: string | number; // Length values
    boxDecorationBreak?: "slice" | "clone";
    breakAfter?: "auto" | "avoid" | "avoid-page" | "page" | "left" | "right" | "recto" | "verso";
    breakBefore?: "auto" | "avoid" | "avoid-page" | "page" | "left" | "right" | "recto" | "verso";
    breakInside?: "auto" | "avoid" | "avoid-page" | "avoid-column" | "avoid-region";
    caretColor?: string; // Color values or "auto"
    clear?: "none" | "left" | "right" | "both";
    // Existing definitions...
    // Further properties
    clipRule?: "nonzero" | "evenodd";
    colorAdjust?: "economy" | "exact";
    contain?: "none" | "strict" | "content" | "size" | "layout" | "style" | "paint";
    content?: string; // e.g., "'Hello'", "attr(data-name)"
    counterIncrement?: string; // e.g., "section"
    counterReset?: string; // e.g., "section"
    counterSet?: string; // e.g., "item 1", "section"
    direction?: "ltr" | "rtl";
    dominantBaseline?: "auto" | "text-bottom" | "alphabetic" | "ideographic" | "middle" | "central" | "mathematical" | "hanging" | "text-top";
    fill?: string; // Color values or "none"
    fillOpacity?: number; // From 0 to 1
    fillRule?: "nonzero" | "evenodd";
    flex?: string; // e.g., "1 1 auto", "0 1 auto"
    float?: "left" | "right" | "none" | "inline-start" | "inline-end";
    floodColor?: string; // Color values
    floodOpacity?: number; // From 0 to 1
    font?: string; // e.g., "12px/14px Arial, sans-serif"
    fontFeatureSettings?: string; // e.g., "'liga' 1", "'frac' 0"
    fontKerning?: "auto" | "normal" | "none";
    fontLanguageOverride?: string;
    fontSizeAdjust?: string | "none";
    fontStretch?: "normal" | "condensed" | "semi-condensed" | "extra-condensed" | "expanded" | "semi-expanded" | "extra-expanded";
    fontStyle?: "normal" | "italic" | "oblique";
    fontSynthesis?: "none" | "weight" | "style";
    fontVariant?: string; // e.g., "small-caps", "oldstyle-nums"
    fontVariantCaps?: "normal" | "small-caps" | "all-small-caps" | "petite-caps" | "all-petite-caps" | "unicase" | "titling-caps";
    objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
    // top | center | bottom | left | right | "25% 75%"
    objectPosition?: string;
    outline?: string; // A shorthand property for outline-width, outline-style, and outline-color
};
