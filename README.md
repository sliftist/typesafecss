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
    <div class={
        css.pad(2).margin(2)
            .absolute.pos(0, 0).zIndex(1)
            .hsl(0, 0, 25)
            .vbox(2).alignItems("stretch")
            .overflow("auto")
            .maxHeight("50vh")
            .border("1px solid hsl(0, 0%, 10%)")
            .toString()
    }>   
    </div>
)
```

# Advanced Usage

## Appending (for conditional styles)
```jsx
import { css } from "typesafecss";
return <div class={css.hsl(0, 0, 50) + (this.props.bold && css.fontWeight("bold").toString())} />
```

## Precedence
The generated CSS is dynamically injected, following regular cascading CSS rules.
s
"soft" as a second parameter will inject a CSS rule with a lower precedence than the default rule. This allows generic components to have a default style that can be overridden by the parent component.

```jsx
import { css } from "typesafecss";
return <div class={this.props.inputClassName + css.alignItems("center", "soft").toString()} />
```

## Hover
```jsx
import { css } from "typesafecss";
return <div class={css.background("hsl(0, 0%, 50%)", "hover").toString()} />
```

## Active
```jsx
import { css } from "typesafecss";
return <div class={css.background("hsl(0, 0%, 50%)", "active").toString()} />
```

## Focus
```jsx
import { css } from "typesafecss";
return <div class={css.background("hsl(0, 0%, 50%)", "focus").toString()} />
```

## Important
```jsx
import { css } from "typesafecss";
// { background: hsl(0, 0%, 50%) !important; }
return <div class={css.background("hsl(0, 0%, 50%)", "important").toString()} />
```

## Soft can be added as a modifier to any values
```jsx
import { css } from "typesafecss";
// :focus { background: hsl(0, 0%, 50%); }
return <div class={css.background("hsl(0, 0%, 50%)", "focus", "soft").toString()} />
```

## Multiple parameters will be combined
```jsx
import { css } from "typesafecss";
// $ELEMENT_ID$:hover:active:focus { background: hsl(0, 0%, 50%) !important; }
return <div class={css.background("hsl(0, 0%, 50%)", "hover", "active", "focus", "important").toString()} />
```

## Calc
Values such as "100%" are typesafe, but more complex values such as "calc(100% - 10px)" are not. To use these values, cast them to an example of the desired type (ex, a percentage or pixel value).
```jsx
import { css } from "typesafecss";
return <div class={css.width("calc(100% - 10px)" as "100%").toString()} />
```
