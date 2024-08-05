# Description
A simple library for typesafe CSS.

"All" (hopefully) built-in CSS fields are supported. A proxy is used, so any field will work at runtime, even if it raises a TypeScript error.

# Usage

There are also some convenience aliases for common CSS patterns, such as "pad", "hbox", "vbox", and "wrap". Some aliases are parameterless, such as "absolute".

Go to definition to see the underlying alias or CSS field.

```jsx
import { css } from "typesafecss";

preact.render(
    document.getElementById("main"),
    <div className={
        css.pad(2).margin(2)
            .absolute.pos(0, 0).zIndex(1)
            .hsl(0, 0, 25)
            .vbox(2).alignItems("stretch")
            .overflow("auto")
            .maxHeight("50vh")
            .border("1px solid hsl(0, 0%, 10%)")
    }>   
    </div>
)
```

# Advanced Usage

## Appending (for conditional styles)
```jsx
import { css } from "typesafecss";
return <div className={css.hsl(0, 0, 50) + (this.props.bold && css.fontWeight("bold"))} />
```

## Precedence
"soft" as a second parameter will inject a CSS rule with a lower precedence than the default rule. This allows generic components to have a default style that can be overridden by the parent component.

```jsx
import { css } from "typesafecss";
return <div className={this.props.inputClassName + css.alignItems("center", "soft")} />
```

## Hover
```jsx
import { css } from "typesafecss";
return <div className={css.background("hsl(0, 0%, 50%)", "hover")} />
```

## Active
```jsx
import { css } from "typesafecss";
return <div className={css.background("hsl(0, 0%, 50%)", "active")} />
```

## Focus
```jsx
import { css } from "typesafecss";
return <div className={css.background("hsl(0, 0%, 50%)", "focus")} />
```

## Important
```jsx
import { css } from "typesafecss";
// { background: hsl(0, 0%, 50%) !important; }
return <div className={css.background("hsl(0, 0%, 50%)", "important")} />
```

## Soft can be added as a modifier to any values
```jsx
import { css } from "typesafecss";
// :focus { background: hsl(0, 0%, 50%); }
return <div className={css.background("hsl(0, 0%, 50%)", "focus", "soft")} />
```

## Multiple parameters will be combined
```jsx
import { css } from "typesafecss";
// $ELEMENT_ID$:hover:active:focus { background: hsl(0, 0%, 50%) !important; }
return <div className={css.background("hsl(0, 0%, 50%)", "hover", "active", "focus", "important")} />
```

## Calc
Values such as "100%" are typesafe, but more complex values such as "calc(100% - 10px)" are not. To use these values, cast them to an example of the desired type (ex, a percentage or pixel value).
```jsx
import { css } from "typesafecss";
return <div className={css.width("calc(100% - 10px)" as "100%")} />
```


## Explicit hover states
All hover states may also be triggered by a parent class called "trigger-hover"
```jsx
import { css } from "typesafecss";
return <div className={"trigger-hover"}>
    text here
    <div className={css.opacity(0.5).opacity(1, "hover")}>
        more text here
    </div>
</div>
```
