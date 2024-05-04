# Description
A simple library to make creating CSS typesafe.

The generated CSS is dynamically injected, following regular cascading CSS rules.

"All" (hopefully) built-in CSS fields are supported. A proxy is used, so any field will work at runtime, even if it raises a TypeScript error.

There are also some convenience aliases for common CSS patterns, such as "pad", "hbox", "vbox", and "wrap". Some aliases are parameterless, such as "absolute".

Go to definition to see the underlying alias or CSS field.

# Usage
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
    }>   
    </div>
)
```

# Advanced Usage

## Appending (for conditional styles)
```jsx
import { css } from "typesafecss";
return <div class={css.hsl(0, 0, 50) + (this.props.bold && css.fontWeight("bold"))} />
```

## Precedence
"soft" as a second parameter will inject a CSS rule with a lower precedence than the default rule. This allows generic components to have a default style that can be overridden by the parent component.
```jsx
import { css } from "typesafecss";
return <div class={this.props.inputClassName + css.alignItems("center", "soft")} />
```

## Hover
```jsx
import { css } from "typesafecss";
return <div class={css.hover.hsl(0, 0, 50)} />
```

## Active
```jsx
import { css } from "typesafecss";
return <div class={css.active.hsl(0, 0, 50)} />
```

## Focus
```jsx
import { css } from "typesafecss";
return <div class={css.focus.hsl(0, 0, 50)} />
```

## Calc
Values such as "100%" are typesafe, but more complex values such as "calc(100% - 10px)" are not. To use these values, cast them to an example of the desired type (ex, a percentage or pixel value).
```jsx
import { css } from "typesafecss";
return <div class={css.width("calc(100% - 10px)" as "100%")} />
```