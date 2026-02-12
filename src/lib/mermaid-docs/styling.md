# Mermaid Styling & Theming

This is a cross-cutting reference for styling any Mermaid diagram.

## Available Themes

| Theme | Description |
|-------|-------------|
| `default` | Standard theme for all diagrams |
| `neutral` | Black/white, optimized for printing |
| `dark` | For dark-mode backgrounds |
| `forest` | Green color palette |
| `base` | **Only modifiable theme** — use for custom colors |

## Applying a Theme

### Via Frontmatter (per-diagram)

```
---
config:
  theme: forest
---
flowchart LR
    A --> B
```

### Via JavaScript (site-wide)

```javascript
mermaid.initialize({ theme: 'base' });
```

## Customizing with themeVariables

**Only works with the `base` theme.** Use hex colors only (`#ff0000`, not `red`).

```
---
config:
  theme: base
  themeVariables:
    primaryColor: '#ff6600'
    primaryTextColor: '#ffffff'
    primaryBorderColor: '#cc4400'
    lineColor: '#333333'
    secondaryColor: '#e8e8e8'
    tertiaryColor: '#f0f0f0'
    background: '#ffffff'
    fontFamily: 'arial, sans-serif'
    fontSize: '16px'
    noteBkgColor: '#fff5ad'
    noteTextColor: '#333'
---
```

### Core Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| darkMode | false | Affects derived color calculations |
| background | #f4f4f4 | Background reference |
| fontFamily | trebuchet ms, verdana, arial | Text font |
| fontSize | 16px | Base text size |
| primaryColor | #fff4dd | Main node backgrounds |
| primaryTextColor | calculated | Text on primary nodes |
| primaryBorderColor | calculated | Primary node borders |
| secondaryColor | calculated | Secondary elements |
| tertiaryColor | calculated | Tertiary elements (subgraphs) |
| lineColor | calculated | Connection lines |
| noteBkgColor | #fff5ad | Note backgrounds |
| noteTextColor | #333 | Note text |

### Color Calculation

Derived colors auto-update when base variables change:
- `primaryBorderColor` derives from `primaryColor`
- `primaryTextColor` calculated for contrast
- Calculations include ~10% darkening/lightening and hue shifts
- `darkMode` reverses many calculations for contrast

### Flowchart-Specific Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| nodeBorder | primaryBorderColor | Node outlines |
| clusterBkg | tertiaryColor | Subgraph backgrounds |
| clusterBorder | tertiaryBorderColor | Subgraph borders |
| defaultLinkColor | lineColor | Edge color |
| titleColor | tertiaryTextColor | Title text |
| nodeTextColor | primaryTextColor | Node text |

### Sequence Diagram Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| actorBkg | mainBkg | Actor box fill |
| actorBorder | primaryBorderColor | Actor outline |
| actorTextColor | primaryTextColor | Actor text |
| signalColor | textColor | Message lines |
| signalTextColor | textColor | Message text |
| activationBkgColor | secondaryColor | Activation fill |
| labelBoxBkgColor | actorBkg | Label backgrounds |

### Pie Chart Variables

Slice colors: `pie1` through `pie12`

| Variable | Default |
|----------|---------|
| pieTitleTextSize | 25px |
| pieTitleTextColor | taskTextDarkColor |
| pieSectionTextSize | 17px |
| pieStrokeColor | black |
| pieStrokeWidth | 2px |
| pieOpacity | 0.7 |

## Look: Classic vs Hand-Drawn

```
---
config:
  look: handDrawn
  handDrawnSeed: 42
---
flowchart LR
    A --> B
```

| Option | Value | Description |
|--------|-------|-------------|
| look | `classic` | Default clean rendering |
| look | `handDrawn` | Sketchy/hand-drawn style |
| handDrawnSeed | number | Seed for consistent hand-drawn rendering (0 = random) |

## Per-Node Styling (inline)

### style keyword

```
flowchart TD
    A[Node]
    style A fill:#f9f,stroke:#333,stroke-width:2px,color:#fff
```

Multiple nodes:
```
style A,B fill:#f9f
```

### Common CSS Properties

| Property | Example |
|----------|---------|
| fill | `#ff9999` |
| stroke | `#333333` |
| stroke-width | `2px` |
| color | `#ffffff` (text color) |
| font-size | `14px` |
| font-weight | `bold` |
| font-style | `italic` |
| stroke-dasharray | `5 5` (dashed border) |
| opacity | `0.8` |
| rx | `15` (border radius) |

## classDef (reusable classes)

### Define

```
classDef highlight fill:#ff6,stroke:#333,stroke-width:3px
classDef dimmed fill:#eee,stroke:#999,color:#999
```

### Apply

```
class A,B highlight           %% via class statement
A:::highlight --> B:::dimmed  %% via ::: operator
```

### Default class (applies to all unclassed nodes)

```
classDef default fill:#f9f,stroke:#333,stroke-width:2px
```

## Link / Edge Styling

### By index (0-based)

```
flowchart LR
    A --> B --> C
    linkStyle 0 stroke:#ff3,stroke-width:4px
    linkStyle 1 stroke:blue
```

### Multiple links

```
linkStyle 0,1,2 stroke:red
```

### Default for all links

```
linkStyle default stroke:#333,stroke-width:2px
```

## Layout Configuration

```
---
config:
  layout: elk
  flowchart:
    curve: monotoneX
    defaultRenderer: elk
---
```

| Option | Values | Description |
|--------|--------|-------------|
| layout | `dagre`, `elk` | Layout algorithm |
| curve | `basis`, `bumpX`, `bumpY`, `cardinal`, `catmullRom`, `linear`, `monotoneX`, `monotoneY`, `natural`, `step`, `stepAfter`, `stepBefore` | Edge curve style |
| useMaxWidth | true/false | Scale to container |
| htmlLabels | true/false | HTML in labels |
| markdownAutoWrap | true/false | Auto-wrap markdown |

## Custom CSS (advanced)

```html
<style>
  .node rect { fill: #ff9999; stroke: #333; }
  .edgePath .path { stroke: #333; stroke-width: 2px; }
  .cluster rect { fill: #f0f0ff; stroke: #99f; }
  .label { font-family: arial; }
</style>
```

Or via `themeCSS` config:
```javascript
mermaid.initialize({
  themeCSS: '.node rect { fill: red; }'
});
```
