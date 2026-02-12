# Mermaid v11 Cheat Sheet — Detailed Syntax Reference

> Version: 11.12.2 (latest)

## 1. FLOWCHART

**Declaration:** `flowchart <direction>` (or `graph <direction>`)

**Directions:** `TB` / `TD` (top→bottom), `BT`, `LR`, `RL`

### Node Shapes (Classic Syntax)

```
id            %% rectangle (default), displays "id"
id[text]      %% rectangle with text
id(text)      %% rounded rectangle
id([text])    %% stadium / pill
id[[text]]    %% subroutine
id[(text)]    %% cylinder / database
id((text))    %% circle
id>text]      %% asymmetric / flag
id{text}      %% diamond / rhombus
id{{text}}    %% hexagon
id[/text/]    %% parallelogram
id[\text\]    %% parallelogram alt
id[/text\]    %% trapezoid
id[\text/]    %% trapezoid alt
id(((text)))  %% double circle
```

### Node Shapes (v11.3+ Generic Syntax)

```
A@{ shape: rect, label: "Process" }
```

Key shape names: `rect`, `rounded`, `stadium`, `circle`, `sm-circ`, `dbl-circ`, `fr-circ`, `diam`, `hex`, `odd`, `lean-r`, `lean-l`, `trap-t`, `trap-b`, `cyl`, `h-cyl`, `lin-cyl`, `doc`, `docs`, `lin-doc`, `tag-doc`, `notch-rect`, `fr-rect`, `div-rect`, `lin-rect`, `st-rect`, `tag-rect`, `sl-rect`, `bow-rect`, `cloud`, `delay`, `fork`, `f-circ`, `cross-circ`, `hourglass`, `bolt`, `brace`, `brace-r`, `braces`, `tri`, `flip-tri`, `notch-pent`, `flag`, `win-pane`, `text`, `bang`

### Edges / Links

```
A --> B        %% arrow
A --- B        %% line (no arrow)
A -.- B        %% dotted line
A -.-> B       %% dotted arrow
A ==> B        %% thick arrow
A === B        %% thick line
A ~~~ B        %% invisible link
A --text--> B  %% arrow with text (inline)
A -->|text| B  %% arrow with text (pipe)
A o--o B       %% circle endpoints
A x--x B       %% cross endpoints
A <--> B       %% bidirectional
```

**Longer links:** add extra dashes: `A ---->  B` (spans more ranks)

| Style    | Len 1 | Len 2  | Len 3   |
|----------|-------|--------|---------|
| Normal   | `---` | `----` | `-----` |
| Arrow    | `-->` | `--->` | `---->` |
| Thick    | `===` | `====` | `=====` |
| Thick→   | `==>` | `===>` | `====>` |
| Dotted   | `-.-` | `-..-` | `-...-` |
| Dotted→  | `-.->` | `-..->` | `-...->` |

### Chaining

```
A --> B --> C          %% chain
A --> B & C --> D      %% fan-out and fan-in
A & B --> C & D        %% all-to-all
```

### Subgraphs

```
subgraph id [Title]
  direction LR
  A --> B
end
C --> id          %% link to subgraph
```

### Styling

```
style id fill:#f9f,stroke:#333,stroke-width:2px
classDef className fill:#bbf,stroke:#333
class A,B className
A:::className --> B    %% inline class assignment
```

### Edge IDs & Animation (v11+)

```
e1@ A --> B            %% assign ID "e1" to edge
e1@{ animate: true }   %% animate the edge
e1@{ animation: fast }  %% fast or slow
```

### Edge Curve Types (v11.10+)

Per-edge (requires edge ID):
```
e1@ A --> B
e1@{ curve: basis }
```
Diagram-level (in frontmatter):
```
---
config:
  flowchart:
    curve: monotoneX
---
```
Available curves: `basis`, `bumpX`, `bumpY`, `cardinal`, `catmullRom`, `linear`, `monotoneX`, `monotoneY`, `natural`, `step`, `stepAfter`, `stepBefore`

### linkStyle (by index)

```
linkStyle 0 stroke:#ff3,stroke-width:4px    %% style first edge (0-indexed)
linkStyle default stroke:#333,stroke-width:2px  %% style all edges
```

### Click Events

```
click A callback "Tooltip"     %% JS callback (securityLevel: loose)
click A href "https://..." "Tooltip" _blank  %% hyperlink
```

---

## 2. SEQUENCE DIAGRAM

**Declaration:** `sequenceDiagram`

### Participants

```
participant A           %% box participant
participant A as Alice  %% alias
actor B as Bob          %% stick figure
create participant C    %% dynamic creation (v10.3+)
destroy C               %% dynamic destruction
```

**Participant types** (v11.10+ extended types via JSON config):
```
participant A as Alice            %% box (default)
actor B as Bob                    %% stick figure
participant C as DB               %% then configure via JSON:
```
Types: `participant`, `actor`, `boundary`, `control`, `entity`, `database`, `collections`, `queue`

### Grouping

```
box Aqua Group Title
  participant A
  participant B
end
box transparent Name     %% force transparent if name is a color
  actor C
end
```

### Messages (Arrows)

| Syntax    | Description                          |
|-----------|--------------------------------------|
| `->`      | Solid without arrow                  |
| `-->`     | Dotted without arrow                 |
| `->>`     | Solid with arrowhead                 |
| `-->>`    | Dotted with arrowhead                |
| `<<->>` | Solid bidirectional (v11+)           |
| `<<-->>` | Dotted bidirectional (v11+)         |
| `-x`      | Solid with cross                     |
| `--x`     | Dotted with cross                    |
| `-)`      | Solid async (open arrow)             |
| `--)`     | Dotted async                         |

```
Alice->>Bob: Hello
Bob-->>Alice: Hi
Alice->>+Bob: Request     %% activate Bob (+)
Bob-->>-Alice: Response   %% deactivate Bob (-)
```

### Activations

```
activate Alice
deactivate Alice
%% or shorthand: + and - on arrows (see above)
```

### Notes

```
Note right of Alice: Single actor note
Note left of Bob: Left note
Note over Alice,Bob: Spanning note
Note over Alice: Line1<br/>Line2
```

### Control Flow

```
loop Every minute
  Alice->>Bob: ping
end

alt Success
  Alice->>Bob: ok
else Failure
  Alice->>Bob: error
end

opt Optional step
  Alice->>Bob: maybe
end

par Action1
  Alice->>Bob: msg1
and Action2
  Alice->>Charlie: msg2
end

critical Must succeed
  Alice->>Bob: important
option Fallback A
  Alice->>Bob: planB
end

break Something failed
  Alice->>Bob: abort
end

rect rgb(200, 220, 255)
  Alice->>Bob: highlighted section
end
```

### Sequence Numbers

```
autonumber
```

---

## 3. CLASS DIAGRAM

**Declaration:** `classDiagram`

### Define Classes

```
class Animal
class Animal {
  +String name
  -int age
  #List~Food~ diet
  +eat(food) bool
  +sleep()* 
  +getId()$ int
}
```

**Visibility:** `+` public, `-` private, `#` protected, `~` package

**Classifiers:** `*` abstract (after method), `$` static (after method or field)

**Generics:** `class Box~T~`

**Labels:** `class MyClass["Display Label"]`

### Relationships

| Syntax   | Meaning       |
|----------|---------------|
| `<\|--`  | Inheritance   |
| `*--`    | Composition   |
| `o--`    | Aggregation   |
| `-->`    | Association   |
| `--`     | Link (solid)  |
| `..>`    | Dependency    |
| `..\|>`  | Realization   |
| `..`     | Link (dashed) |

```
classA <|-- classB : inherits
classC *-- classD : "1" composes "many"
classE o-- classF
classG --> classH
classI ..> classJ : uses
classK ..|> classL : implements
```

**Cardinality:** `classA "1" --> "*" classB : has`

**Two-way:** `classA <|--|> classB`

**Lollipop interface:** `bar ()-- foo` or `foo --() bar`

### Annotations

```
class Animal {
  <<interface>>
}
class Shape {
  <<abstract>>
}
class Color {
  <<enumeration>>
  RED
  GREEN
  BLUE
}
```

### Namespaces

```
namespace com.example {
  class Foo
  class Bar
}
```

### Direction

```
classDiagram
  direction RL
```

---

## 4. STATE DIAGRAM

**Declaration:** `stateDiagram-v2`

```
[*] --> Still            %% start
Still --> [*]            %% end
Still --> Moving
Moving --> Still
Moving --> Crash
Crash --> [*]

state "Long name" as s1  %% alias

state Fork <<fork>>      %% fork/join
state Choice <<choice>>  %% choice

%% Composite state
state Active {
  [*] --> Running
  Running --> Paused
  Paused --> Running
}

%% Concurrency
state Active {
  [*] --> Thread1
  --
  [*] --> Thread2
}
```

### Transitions

```
s1 --> s2 : event / action
```

### Notes

```
note right of s1 : Some note
note left of s2
  Multi-line
  note
end note
```

### Direction

```
direction LR   %% at top of diagram
```

---

## 5. ENTITY RELATIONSHIP DIAGRAM

**Declaration:** `erDiagram`

### Syntax

```
ENTITY1 ||--o{ ENTITY2 : "relationship label"
```

### Relationship Markers

Markers on each side of `--` (identifying) or `..` (non-identifying):
```
Left side:    Right side:    Meaning:
|o            o|             zero or one
||            ||             exactly one
}o            o{             zero or more
}|            |{             one or more
```

**Pattern:** `ENTITY1 <left>--<right> ENTITY2 : "label"`

Common combinations:
```
||--||    one to one
||--o{    one to zero-or-more
|o--o{    zero-or-one to zero-or-more
||--|{    one to one-or-more
}o--o{    zero-or-more to zero-or-more
```

### Attributes

```
CUSTOMER {
  string name PK
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

Attribute format: `type name [PK|FK|UK]` (keys are optional markers)

---

## 6. GANTT

**Declaration:** `gantt`

```
gantt
  title Project Plan
  dateFormat YYYY-MM-DD
  axisFormat %m/%d
  excludes weekends
  todayMarker on

  section Planning
  Research        :done, a1, 2024-01-01, 2024-01-15
  Requirements    :active, a2, after a1, 10d
  
  section Development  
  Design          :crit, des1, 2024-01-20, 15d
  Coding          :des2, after des1, 30d
  Testing         :des3, after des2, 2024-04-01

  section Release
  Deploy          :milestone, m1, 2024-04-01, 0d
```

**Task format:** `Title :metadata, id, start, end_or_duration`

**Metadata tags:** `done`, `active`, `crit`, `milestone`

**Date formats:** `YYYY-MM-DD`, `HH:mm`, etc.

**Duration:** `1d`, `5d`, `1w`, `2h`

**Dependencies:** `after taskId1 taskId2`

---

## 7. PIE CHART

**Declaration:** `pie`

```
pie title Favorite Pets
  "Dogs" : 45
  "Cats" : 30
  "Birds" : 15
  "Fish" : 10
```

Optional: `showData` after title line to display values.

---

## 8. MINDMAP

**Declaration:** `mindmap`

Uses **indentation** (spaces, not tabs) for hierarchy:

```
mindmap
  root((Central Topic))
    Topic A
      Subtopic A1
      Subtopic A2
    Topic B
      Subtopic B1
    Topic C
```

**Node shapes:** `root`, `id[square]`, `id(rounded)`, `id((circle))`, `id))bang((`, `id)cloud(`, `id{{hexagon}}`

**Icons:** `::icon(fa fa-book)` after node text (requires icon font integration)

**Markdown strings:** Wrap in `` "`text`" `` for bold (`**bold**`) and italic (`*italic*`) support

**Tidy-tree layout** (v11.10+): Use frontmatter for tree-style rendering:
```
---
config:
  layout: tidy-tree
---
mindmap
  root((Root))
    Child1
    Child2
```

---

## 9. TIMELINE

**Declaration:** `timeline`

```
timeline
  title History of CSS
  2000 : CSS1 released
  2004 : CSS2 released
       : Flexbox proposed
  2012 : CSS3 modules
  2020 : CSS Grid widespread
```

**Sections:**
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

---

## 10. GITGRAPH

**Declaration:** `gitGraph`

```
gitGraph
  commit
  commit
  branch develop
  checkout develop
  commit
  commit
  checkout main
  merge develop
  commit
  branch feature
  commit
  checkout main
  merge feature tag:"v1.0"
```

**Commands:** `commit`, `branch <name>`, `checkout <name>`, `merge <name>`, `cherry-pick id:"<id>"`

**Commit options:** `commit id:"abc" msg:"message" type:HIGHLIGHT`

**Types:** `NORMAL`, `REVERSE`, `HIGHLIGHT`

**Direction:** set via frontmatter `%%{init: {'gitGraph': {'mainBranchName': 'main'}} }%%`

---

## 11. USER JOURNEY

**Declaration:** `journey`

```
journey
  title My Working Day
  section Morning
    Make coffee: 5: Me
    Commute: 2: Me, Bus
    Work: 3: Me, Colleagues
  section Afternoon
    Lunch: 4: Me, Friends
    Code review: 3: Me
    Go home: 5: Me
```

Format: `Task name: score(0-5): actor1, actor2`

---

## 12. QUADRANT CHART

**Declaration:** `quadrantChart`

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

---

## 13. XY CHART

**Declaration:** `xychart-beta`

```
xychart-beta
  title "Monthly Sales"
  x-axis [jan, feb, mar, apr, may, jun]
  y-axis "Revenue (USD)" 0 --> 5000
  bar [1200, 1500, 2100, 2800, 3200, 4500]
  line [1000, 1400, 2000, 2600, 3000, 4200]
```

---

## 14. SANKEY

**Declaration:** `sankey-beta`

CSV-like format (source, target, value):

```
sankey-beta

Agricultural "waste",Bio-energy,124.729
Bio-energy,Electricity grid,26.862
Bio-energy,Losses,3.5
```

---

## 15. BLOCK DIAGRAM

**Declaration:** `block-beta`

```
block-beta
  columns 3
  a["Frontend"] b["API"] c["Database"]
  d["Cache"]:2 e["Queue"]
  space f["Worker"]:2
```

**`columns N`** sets the grid width. Each block spans 1 column by default; `block:N` spans N.

`space` creates an empty cell.

**Nesting:**
```
block-beta
  columns 2
  block:2
    columns 2
    a b
  end
  c d
```

**Links between blocks:** `a --> b` (same as flowchart syntax, placed after block definitions)

---

## 16. PACKET

**Declaration:** `packet-beta`

```
packet-beta
  0-15: "Source Port"
  16-31: "Destination Port"
  32-63: "Sequence Number"
  64-95: "Acknowledgment Number"
```

---

## 17. KANBAN (v11+)

**Declaration:** `kanban`

```
kanban
  Todo
    task1[Design mockups]
    task2[Write specs]
  In Progress
    task3[Implement API]
  Done
    task4[Setup CI/CD]
```

Metadata: `task1[label]@{ ticket: "PROJ-1", assigned: "Alice", priority: "High" }`

---

## 18. ARCHITECTURE (v11.1+)

**Declaration:** `architecture-beta`

```
architecture-beta
  group api(cloud)[API Layer]

  service gateway(server)[Gateway] in api
  service auth(lock)[Auth Service] in api
  service db(database)[Database]

  gateway:R --> L:auth
  auth:B --> T:db
```

**Edge sides:** `L`, `R`, `T`, `B` — specify with `service:SIDE --> SIDE:service`

**Groups:** `group id(icon)[Label]`

**Services:** `service id(icon)[Label] in groupId`

**Junctions:** `junction id in groupId`

---

## 19. RADAR (v11+)

**Declaration:** `radar-beta`

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

---

## 20. TREEMAP (v11+)

**Declaration:** `treemap-beta`

```
treemap-beta
  root[Company Revenue]
    Products[Products 600]
      Widget A[300]
      Widget B[200]
      Widget C[100]
    Services[Services 400]
      Consulting[250]
      Support[150]
```

