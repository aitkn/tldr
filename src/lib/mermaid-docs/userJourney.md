# User Journey Diagram

**Declaration:** `journey`

## Basic Syntax

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

## Structure

### Title

```
journey
    title My Working Day
```

### Sections

Sections group related tasks:
```
section Section Name
    Task1: score: actors
    Task2: score: actors
```

### Task Format

```
Task name: <score>: <comma separated list of actors>
```

- **Task name**: Description of the step
- **Score**: Numeric value 1-5 (1 = bad, 5 = great)
- **Actors**: Comma-separated list of participants

## Example

```
journey
    title Customer Purchase Flow
    section Discovery
        Visit website: 4: Customer
        Browse products: 3: Customer
        Read reviews: 4: Customer
    section Purchase
        Add to cart: 5: Customer
        Enter payment: 2: Customer, System
        Confirm order: 4: Customer, System
    section Delivery
        Track shipment: 3: Customer
        Receive package: 5: Customer, Courier
```
