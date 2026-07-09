# typesafecss

Type-safe CSS-in-JS: `css.width("50%").color("red")` generates a class per unique declaration and inserts a rule into a shared `<style>`, returning the class name(s) to put on your element.

## Dynamic values are expensive — use inline styles for them

Every distinct value you feed through `css.*` mints a brand-new class and a brand-new CSS rule (e.g. `css.width(\`${pct}%\`)` driven each animation frame generates one rule per frame). This has a surprisingly high, easy-to-miss overhead: rules accumulate, and because every stylesheet mutation invalidates computed style document-wide, each forced style recalc gets steadily slower — roughly linear in the total rule count. Inline styles (`element.style.width = ...`, or a React `style={{ width }}` prop) have essentially none of this cost, because they don't touch the shared stylesheet at all.

So the rule of thumb: **`css.*` is for values that come from a small fixed set (they get deduped to a handful of rules); inline styles are for values that change freely.** When a value changes a lot, reach for an inline style, or keep the fixed parts in `css.*`/a `<style>` tag and only vary what must vary inline.

## Rule garbage collection

To bound the recalc cost above, unused rules are garbage-collected (see `index.ts`, `gcSweep`): on a fixed cadence (`gcIntervalMs`, default 15s) we drop rules that are both stale (untouched for `gcMaxAgeMs`) and not applied to any element in the DOM. Dropping is always safe — a class name is a pure function of its styles, so a dropped rule regenerates identically if needed again.

Dropped rules are not forgotten: they're kept in `removedRules` and restored to the stylesheet the moment they're requested again (a new `css.*` call) or are found reapplied to a DOM element during a sweep. If you want a rule to persist regardless of GC, keep it applied to the DOM (e.g. an invisible `<div>` that uses the class) or — better for dynamic values — use an inline style. The GC warns (throttled) when it has to re-add rules, and once it has collected a lot of rules over the page lifetime it warns with examples pointing back to the inline-style guidance above.

## House style

- No manual line wrapping inside paragraphs/comments — one logical line per paragraph; let the editor soft-wrap.
- Comments carry only non-obvious *why*, never restated values or narration of what the code does.
- `undefined`, not `null`. Truthy/falsy checks, never `=== true`/`=== false`.
