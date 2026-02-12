# Entity Relationship Diagram

**Declaration:** `erDiagram`

## Basic Syntax

```
ENTITY1 ||--o{ ENTITY2 : "relationship label"
```

Statement structure: `<first-entity> [<relationship> <second-entity> : <relationship-label>]`

All three parts are required when specifying a relationship.

## Relationship Cardinality

Markers on each side of `--` (identifying) or `..` (non-identifying):

| Left | Right | Meaning |
|------|-------|---------|
| `\|o` | `o\|` | Zero or one |
| `\|\|` | `\|\|` | Exactly one |
| `}o` | `o{` | Zero or more |
| `}\|` | `\|{` | One or more |

### Common Combinations

```
||--||    one to one (identifying)
||--o{    one to zero-or-more
|o--o{    zero-or-one to zero-or-more
||--|{    one to one-or-more
}o--o{    zero-or-more to zero-or-more
||..o{    one to zero-or-more (non-identifying)
```

### Identifying vs Non-Identifying

- **Identifying** (solid line `--`): child entity cannot exist without parent
- **Non-identifying** (dashed line `..`): entities can exist independently

```
PERSON ||..o{ CAR : "driver"     %% non-identifying
PERSON ||--|{ ORDER : "places"   %% identifying
```

## Attributes

```
CUSTOMER {
    int id PK
    string name
    string email UK
    int age
}
ORDER {
    int id PK
    date created
    string status
    int customer_id FK
}
CUSTOMER ||--o{ ORDER : places
```

### Attribute Format

`type name [PK|FK|UK]`

- `PK` - Primary Key
- `FK` - Foreign Key
- `UK` - Unique Key
- Multiple constraints: `PK, FK`

### Attribute Comments

```
CUSTOMER {
    int id PK "unique identifier"
    string email UK "customer email"
}
```

## Entity Name Aliases

```
CUSTOMER [Client]
```

Displays "Client" instead of "CUSTOMER".

## Direction

```
erDiagram
    direction TB
```

Options: `TB`, `BT`, `LR`, `RL`

## Styling

### Individual Node
```
style CUSTOMER fill:#f9f,stroke:#333,stroke-width:4px
```

Multiple nodes:
```
style CUSTOMER,ORDER fill:#f9f
```

### Class Definition
```
classDef className fill:#f9f,stroke:#333,stroke-width:4px
class CUSTOMER className
```

Shorthand:
```
CUSTOMER:::className
```

### Default Class
```
classDef default fill:#f9f,stroke:#333,stroke-width:4px
```

## Layout Configuration

For complex diagrams, use ELK layout:
```
---
config:
  layout: elk
---
erDiagram
```

## Important Notes

- Entity names with spaces need `"double quotes"`
- Entity names should use singular nouns
- All relationship statements require the `: "label"` part
