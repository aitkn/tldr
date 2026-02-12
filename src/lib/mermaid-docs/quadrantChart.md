# Quadrant Chart

**Declaration:** `quadrantChart`

## Basic Syntax

```
quadrantChart
    title Skills Assessment
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Eliminate
    Campaign A: [0.3, 0.6]
    Campaign B: [0.7, 0.8]
    Campaign C: [0.5, 0.2]
```

## Structure

### Title
```
quadrantChart
    title This is a sample example
```

### X-Axis
- Both labels: `x-axis Low Effort --> High Effort`
- Left only: `x-axis Low Effort`

### Y-Axis
- Both labels: `y-axis Low Impact --> High Impact`
- Bottom only: `y-axis Low Impact`

### Quadrant Labels
- `quadrant-1`: top right
- `quadrant-2`: top left
- `quadrant-3`: bottom left
- `quadrant-4`: bottom right

### Data Points
`Point Name: [x, y]` where x and y range from 0 to 1.

## Point Styling

### Direct Styling
```
Point A: [0.9, 0.0] radius: 12
Point B: [0.8, 0.1] color: #ff3300, radius: 10
Point C: [0.7, 0.2] radius: 25, color: #00ff33, stroke-color: #10f0f0
Point D: [0.6, 0.3] radius: 15, stroke-color: #00ff0f, stroke-width: 5px, color: #ff33f0
```

### Class-Based Styling
```
Point A:::class1: [0.9, 0.0]
Point B:::class2: [0.8, 0.1]
classDef class1 color: #109060
classDef class2 color: #908342, radius: 10, stroke-color: #310085, stroke-width: 10px
```

Style parameters: `color`, `radius`, `stroke-width`, `stroke-color`

Priority: Direct styles > Class styles > Theme styles

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| chartWidth | Chart width | 500 |
| chartHeight | Chart height | 500 |
| titlePadding | Title padding | 10 |
| titleFontSize | Title font size | 20 |
| quadrantPadding | External padding | 5 |
| quadrantLabelFontSize | Quadrant text size | 16 |
| quadrantInternalBorderStrokeWidth | Inner border width | 1 |
| quadrantExternalBorderStrokeWidth | Outer border width | 2 |
| xAxisLabelFontSize | X-axis font size | 16 |
| xAxisPosition | X-axis placement | 'top' |
| yAxisLabelFontSize | Y-axis font size | 16 |
| yAxisPosition | Y-axis placement | 'left' |
| pointLabelFontSize | Point label size | 12 |
| pointRadius | Point radius | 5 |

## Theme Variables

- `quadrant1Fill` to `quadrant4Fill`: Background colors
- `quadrant1TextFill` to `quadrant4TextFill`: Text colors
- `quadrantPointFill`: Point color
- `quadrantPointTextFill`: Point label color
- `quadrantXAxisTextFill`, `quadrantYAxisTextFill`: Axis text colors
- `quadrantTitleFill`: Title color
