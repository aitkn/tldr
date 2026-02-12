# Treemap Diagram

**Declaration:** `treemap-beta`

## Basic Syntax

```
treemap-beta
    "Section 1"
        "Leaf 1.1": 12
        "Section 1.2"
            "Leaf 1.2.1": 12
    "Section 2"
        "Leaf 2.1": 20
        "Leaf 2.2": 25
```

## Node Rules

- **Parent nodes**: Quoted text `"Section Name"` (no value)
- **Leaf nodes**: Quoted text with colon and value `"Leaf Name": value`
- **Hierarchy**: Created through indentation (spaces or tabs)

## Styling

### classDef

```
classDef className property:value;
"Node Name":::className
```

## Configuration

| Option | Purpose | Default |
|--------|---------|---------|
| useMaxWidth | Sets diagram to 100% width | true |
| padding | Internal node spacing | 10 |
| diagramPadding | Outer diagram spacing | 8 |
| showValues | Display values | true |
| nodeWidth | Node width | 100 |
| nodeHeight | Node height | 40 |
| borderWidth | Border thickness | 1 |
| valueFontSize | Value text size | 12 |
| labelFontSize | Label text size | 14 |
| valueFormat | Number formatting | ',' |

## Value Formatting

Supports D3 format specifiers:
- `,` - Thousands separator
- `$` - Dollar sign
- `.1f` - One decimal place
- `.1%` - Percentage format
- `$0,0` - Dollar with separator
- `$.2f` - Dollar with 2 decimals
- `$,.2f` - Dollar, separator, 2 decimals

## Example

```
treemap-beta
    "Company Revenue"
        "Products"
            "Widget A": 300
            "Widget B": 200
            "Widget C": 100
        "Services"
            "Consulting": 250
            "Support": 150
```

## Limitations

- Works best with natural hierarchies
- Tiny values may be hard to see/label
- Deep hierarchies challenge clarity
- Not suited for negative values
