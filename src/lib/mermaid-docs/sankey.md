# Sankey Diagram

**Declaration:** `sankey-beta`

## Basic Syntax

CSV-like format with exactly 3 columns (source, target, value):

```
sankey-beta

Agricultural "waste",Bio-energy,124.729
Bio-energy,Electricity grid,26.862
Bio-energy,Losses,3.5
Bio-energy,Industry,10.0
Oil,Industry,50.0
Oil,Transport,100.0
```

## CSV Format

Follows RFC 4180 with key differences:
- Requires exactly 3 columns: source, target, value
- Empty lines (without commas) are permitted for visual organization
- Commas within double-quoted values are supported
- Escaped quotes use doubling: `""`

## Configuration Options

### Diagram Dimensions

```
---
config:
  sankey:
    width: 800
    height: 400
---
```

### Link Coloring (`linkColor`)

Four options:
- `source` - inherits source node color
- `target` - inherits target node color
- `gradient` - smooth transition between nodes
- Hex color code (e.g., `#a1a1a1`)

### Node Alignment (`nodeAlignment`)

Options: `justify`, `center`, `left`, `right`

## Full Configuration Example

```
---
config:
  sankey:
    width: 800
    height: 400
    linkColor: source
    nodeAlignment: left
---
sankey-beta

Source1,Target1,100
Source1,Target2,200
Source2,Target1,150
```
