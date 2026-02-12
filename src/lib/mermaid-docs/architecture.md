# Architecture Diagram

**Declaration:** `architecture-beta`

## Core Building Blocks

Architecture diagrams have four primary components: groups, services, edges, and junctions.

## Groups

Organize related services visually:

```
group {group_id}({icon_name})[{title}]
```

```
architecture-beta
    group api(cloud)[API Layer]
    group private(server)[Private] in api    %% nested group
```

Groups can be nested using `in`:
```
group private_api(cloud)[Private API] in public_api
```

## Services

Individual components:

```
service {service_id}({icon_name})[{title}]
```

```
architecture-beta
    service gateway(server)[Gateway] in api
    service auth(lock)[Auth Service] in api
    service db(database)[Database]
```

Services belong to groups using `in`:
```
service database1(database)[My Database] in private_api
```

## Edges

Connect services with directional relationships:

```
{serviceId}{group}?:{T|B|L|R} {<}?--{>}? {T|B|L|R}:{serviceId}{group}?
```

### Edge Sides

Use T (top), B (bottom), L (left), R (right):

```
db:R -- L:server           %% undirected edge
subnet:R --> L:gateway      %% directed edge (arrow)
gateway:B --> T:db          %% top-to-bottom
```

### Group Edges

For edges crossing group boundaries, add `{group}` after service:

```
architecture-beta
    group groupOne(cloud)[Group 1]
    group groupTwo(cloud)[Group 2]

    service server(server)[Server] in groupOne
    service subnet(internet)[Subnet] in groupTwo

    server{group}:B --> T:subnet{group}
```

## Junctions

Four-way connection points:

```
junction {junction_id} (in {parent_id})?
```

```
architecture-beta
    service a(server)[A]
    service b(server)[B]
    service c(server)[C]
    junction hub in api
    a:R --> L:hub
    hub:R --> L:b
    hub:B --> T:c
```

## Icons

### Default Icons

Built-in: `cloud`, `database`, `disk`, `internet`, `server`, `lock`

### Custom Icons (Iconify)

200,000+ icons from iconify.design. Format: `{pack}:{icon-name}`

## Full Example

```
architecture-beta
    group api(cloud)[API Layer]

    service gateway(server)[Gateway] in api
    service auth(lock)[Auth Service] in api
    service db(database)[Database]
    service cache(disk)[Cache]

    gateway:R --> L:auth
    auth:B --> T:db
    gateway:B --> T:cache
```

## Important Notes

- Components can be declared in any order
- Identifiers must be defined before use in edges
- Edge sides (T/B/L/R) specify connection points on services
- Use `{group}` suffix when edges cross group boundaries
