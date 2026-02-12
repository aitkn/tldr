# Directives & Frontmatter Configuration

Configuration can be embedded directly in diagram code using **frontmatter** (recommended) or **directives** (deprecated).

## Frontmatter (Recommended)

YAML metadata block at the very start of the diagram code, enclosed by `---`:

```
---
config:
  theme: forest
  look: handDrawn
  layout: elk
---
flowchart LR
    A --> B
```

### Rules
- Triple dashes `---` must be the **first line** (no whitespace before)
- Uses YAML syntax with consistent indentation
- Settings are case-sensitive
- Misspelled keys are silently ignored
- Badly formed YAML will break the diagram
- Must come before the diagram type declaration

### Common Frontmatter Options

```
---
config:
  theme: base               # default | base | dark | forest | neutral
  look: handDrawn           # classic | handDrawn
  layout: elk               # dagre | elk
  themeVariables:
    primaryColor: '#ff6600'
    lineColor: '#333333'
  flowchart:
    curve: monotoneX
    htmlLabels: true
    defaultRenderer: elk
  sequence:
    mirrorActors: false
    showSequenceNumbers: true
    wrap: true
  gantt:
    displayMode: compact
    axisFormat: '%m/%d'
    tickInterval: 1week
---
```

### ELK Layout Options

```
---
config:
  layout: elk
  elk:
    mergeEdges: true
    nodePlacementStrategy: BRANDES_KOEPF
---
```

`nodePlacementStrategy` values: `SIMPLE`, `NETWORK_SIMPLEX`, `LINEAR_SEGMENTS`, `BRANDES_KOEPF` (default)

## Directives (Deprecated since v10.5.0)

Inline `%%{init:...}%%` blocks — still widely used but frontmatter is preferred:

```
%%{init: { "theme": "forest" } }%%
flowchart LR
    A --> B
```

### Single-line
```
%%{init: { "sequence": { "mirrorActors": false } } }%%
```

### Multi-line
```
%%{
  init: {
    "theme": "dark",
    "fontFamily": "monospace",
    "flowchart": {
      "htmlLabels": true,
      "curve": "linear"
    }
  }
}%%
```

### Top-level Directive Keys
- `theme` — `default`, `base`, `dark`, `forest`, `neutral`
- `fontFamily` — CSS font stack
- `logLevel` — 1 (debug) to 5 (fatal)
- `securityLevel` — `strict`, `loose`, `antiscript`, `sandbox`
- `startOnLoad` — boolean

### Diagram-specific Directive Keys
Nested under diagram type name:
- `flowchart: { htmlLabels, curve, diagramPadding, useMaxWidth }`
- `sequence: { width, height, messageAlign, mirrorActors, wrap, showSequenceNumbers }`
- `gantt: { barHeight, barGap, topPadding, fontSize, sectionFontSize }`

### Directive Merging
Multiple `%%init%%` blocks combine into one config; later values override earlier ones.

## Comments

```
%% This is a comment — ignored by the parser
A --> B %% inline comment
```

**Warning:** Avoid curly braces `{}` inside `%%` comments — they confuse the parser.

## Text Formatting

### HTML Entities
```
#amp;   → &
#lt;    → <
#gt;    → >
#35;    → #
#59;    → ; (use in sequence diagram messages)
#quot;  → "
```

### Markdown in Labels (backtick syntax)
```
flowchart TD
    A["`**Bold** and *italic*`"]
```

### Line Breaks
- In labels: `<br>` or `<br/>`
- In markdown strings: actual newlines work

## Diagram-Breaking Gotchas

1. **`end`** — Reserved word. Always wrap: `"end"`, `(end)`, `[end]`, `End`
2. **Misspelled keywords** — Break the diagram silently
3. **Curly braces in comments** — `%%{...}%%` looks like a directive
4. **Nodes inside nodes** — Use quotes to prevent parsing confusion
5. **Badly formed frontmatter YAML** — Breaks entire diagram
