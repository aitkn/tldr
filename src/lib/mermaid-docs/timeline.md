# Timeline

**Declaration:** `timeline`

## Basic Syntax

```
timeline
    title History of CSS
    2000 : CSS1 released
    2004 : CSS2 released
         : Flexbox proposed
    2012 : CSS3 modules
    2020 : CSS Grid widespread
```

Format: `{time period} : {event}`

Multiple events for same period:
```
{time period} : {event1} : {event2}
```
Or:
```
{time period} : {event1}
               : {event2}
               : {event3}
```

## Title (Optional)

```
timeline
    title {title text}
```

## Sections

```
timeline
    title My Career
    section Education
        2010 : Started university
        2014 : Graduated
    section Work
        2014 : First job
        2018 : Promotion
```

All periods belong to current section until a new section is declared.

## Text Wrapping

Text wraps automatically. Force line breaks with `<br>`:

```
{time period} : {event with <br> line break}
```

## Color Styling

### Default Behavior
Without sections, each time period gets its own color (multiColor mode).

### Disable MultiColor
```javascript
mermaid.initialize({
    timeline: { disableMulticolor: false }
});
```

### Custom Colors

Use theme variables `cScale0` to `cScale11` for background colors (up to 12).
Use `cScaleLabel0` to `cScaleLabel11` for foreground colors.

```javascript
mermaid.initialize({
    theme: 'base',
    timeline: {
        cScale0: '#color1',
        cScale1: '#color2'
    }
});
```

## Themes

Available: `base`, `forest`, `dark`, `default`, `neutral`

## Important Notes

- Time periods and events are simple text (not limited to numbers)
- First time period appears left, last appears right
- First event appears at top, last at bottom
- Sequence matters for ordering
