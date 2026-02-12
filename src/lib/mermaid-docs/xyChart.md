# XY Chart

**Declaration:** `xychart-beta`

## Basic Syntax

```
xychart-beta
    title "Monthly Sales"
    x-axis [jan, feb, mar, apr, may, jun]
    y-axis "Revenue (USD)" 0 --> 5000
    bar [1200, 1500, 2100, 2800, 3200, 4500]
    line [1000, 1400, 2000, 2600, 3000, 4200]
```

## Minimal Example

Only two requirements: chart name and one dataset:
```
xychart-beta
    line [+1.3, .6, 2.4, -.34]
```

## Orientation

```
xychart-beta horizontal
    ...
```

Default is vertical.

## Title

```
xychart-beta
    title "Multi-word title in quotes"
```

Single-word titles don't require quotes.

## Axes

### X-Axis
- Categorical: `x-axis "title" [cat1, "cat2 with space", cat3]`
- Numeric range: `x-axis title min --> max`
- Optional (auto-generated from data)

### Y-Axis
- With range: `y-axis title min --> max`
- Auto-range: `y-axis title`
- Optional (auto-generated from data)

## Chart Types

### Line Chart
```
line [2.3, 45, .98, -3.4]
```

### Bar Chart
```
bar [2.3, 45, .98, -3.4]
```

Both can be combined in one chart.

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| width | Chart width | 700 |
| height | Chart height | 500 |
| titlePadding | Title padding | 10 |
| titleFontSize | Title font size | 20 |
| showTitle | Display title | true |
| chartOrientation | 'vertical' or 'horizontal' | 'vertical' |
| plotReservedSpacePercent | Minimum plot space | 50 |
| showDataLabel | Display values in bars | false |

### Axis Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| showLabel | Show axis labels | true |
| labelFontSize | Label font size | 14 |
| labelPadding | Label padding | 5 |
| showTitle | Show axis title | true |
| titleFontSize | Axis title font size | 16 |
| titlePadding | Axis title padding | 5 |
| showTick | Display ticks | true |
| tickLength | Tick length | 5 |
| tickWidth | Tick width | 2 |
| showAxisLine | Display axis line | true |
| axisLineWidth | Axis line thickness | 2 |

## Theme Variables

```yaml
---
config:
  themeVariables:
    xyChart:
      titleColor: '#ff0000'
      backgroundColor: '#ffffff'
      xAxisLabelColor: '#333'
      yAxisLabelColor: '#333'
      plotColorPalette: "#f3456, #43445, #bb3322"
---
```

Key variables: `backgroundColor`, `titleColor`, `xAxisLabelColor`, `xAxisTitleColor`, `xAxisTickColor`, `xAxisLineColor`, `yAxisLabelColor`, `yAxisTitleColor`, `yAxisTickColor`, `yAxisLineColor`, `plotColorPalette`

## Text Rules

Single-word values don't require quotes. Multi-word values need double quotes.
