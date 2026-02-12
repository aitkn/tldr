# ZenUML Sequence Diagram

**Declaration:** `zenuml`

> Alternative syntax for sequence diagrams. Experimental.

## Participants

```
zenuml
    participant A
    participant B
    participant C
```

### Annotators

Available participant types: person, component, database, queue (displayed as specialized icons).

### Aliases

```
participant user as User
participant db as Database
```

## Messages

### Sync Messages (Blocking)

```
A -> B: methodCall()
```

### Async Messages (Non-Blocking)

```
A --> B: asyncCall()
```

### Creation Messages

```
A -> new B: constructor()
```

### Reply Messages

Three expression styles:
- Direct returns
- Explicit response notation
- `@return` for level-up returns

## Nesting

Sync and creation messages support nesting via braces `{}`:

```
zenuml
    A -> B.method() {
        B -> C.call() {
            return result
        }
    }
```

## Control Structures

### Loops

Supports `while`, `for`, `forEach`/`foreach`, `loop`:

```
zenuml
    while(condition) {
        A -> B: ping()
    }
```

```
zenuml
    for(item in list) {
        A -> B: process(item)
    }
```

### Conditionals (Alt/Else)

```
zenuml
    if(condition1) {
        A -> B: path1()
    } else if(condition2) {
        A -> B: path2()
    } else {
        A -> B: default()
    }
```

### Optional (Opt)

```
zenuml
    opt {
        A -> B: optional()
    }
```

### Parallel (Par)

```
zenuml
    par {
        A -> B: action1()
        A -> C: action2()
        A -> D: action3()
    }
```

### Exception Handling (Try/Catch/Finally)

```
zenuml
    try {
        A -> B: riskyCall()
    } catch {
        A -> C: handleError()
    } finally {
        A -> D: cleanup()
    }
```

## Comments

Use `//` syntax (supports Markdown formatting):

```
zenuml
    // **Important**: This starts the flow
    A -> B: start()
```

Comments render above messages and fragments. Comments placed elsewhere are ignored.
