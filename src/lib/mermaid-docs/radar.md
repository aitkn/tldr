# Radar Diagram

**Declaration:** `radar-beta`

## Basic Syntax

```
radar-beta
    title Skill Assessment
    axis Frontend, Backend, DevOps, Design, Communication
    curve a["Alice"] { 4, 5, 3, 2, 4 }
    curve b["Bob"] { 3, 2, 5, 4, 3 }
    options
        max 5
        ticks 5
```

## Components

### Title (Optional)

```
radar-beta
    title Title of the Radar Diagram
```

### Axis Definition

Define axes with IDs and optional labels:

```
axis id1["Label1"], id2["Label2"], id3["Label3"]
```

Or on separate lines:
```
axis id1["Label1"]
axis id2["Label2"]
```

### Curves

Represent data points with ID, optional label, and values.

**Ordered list:**
```
curve id1["Alice"] { 4, 5, 3, 2, 4 }
```

**Key-value pairs:**
```
curve id4{ axis3: 30, axis1: 20, axis2: 10 }
```

**Multiple curves per line:**
```
curve id2["Label2"]{4, 5, 6}, id3{7, 8, 9}
```

### Options

```
options
    showLegend true     %% display/hide legend (default: true)
    max 5               %% maximum value for scaling
    min 0               %% minimum value (default: 0)
    graticule circle    %% grid type: circle or polygon
    ticks 5             %% number of concentric rings (default: 5)
```

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| width | Diagram width | 600 |
| height | Diagram height | 600 |
| marginTop | Top margin | 50 |
| marginBottom | Bottom margin | 50 |
| marginLeft | Left margin | 50 |
| marginRight | Right margin | 50 |
| axisScaleFactor | Axis scaling | 1 |
| axisLabelFactor | Label position | 1.05 |
| curveTension | Rounded curve tension | 0.17 |

## Theme Variables

### Global

- `fontSize`: Title font size
- `titleColor`: Title color
- `cScale${i}`: Color for i-th curve (0-12)

### Radar-Specific

| Property | Default |
|----------|---------|
| axisColor | black |
| axisStrokeWidth | 1 |
| axisLabelFontSize | 12px |
| curveOpacity | 0.7 |
| curveStrokeWidth | 2 |
| graticuleColor | black |
| graticuleOpacity | 0.5 |
| graticuleStrokeWidth | 1 |
| legendBoxSize | 10 |
| legendFontSize | 14px |
