# 🐍➡️ FakePy Transpiler

A Python-to-JavaScript transpiler written in Node.js. It converts a subset of Python syntax into runnable JavaScript, executing it directly in the terminal.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Supported Syntax](#supported-syntax)
- [Examples](#examples)
- [Running Tests](#running-tests)
- [Limitations](#limitations)

---

## Overview

FakePy Transpiler takes Python source code (written in `fakepy.txt`), tokenizes it, parses it into an AST, and generates equivalent JavaScript code that is then executed at runtime. It supports a meaningful subset of Python including variables, control flow, functions, lists, and more.

---

## ✨ Features

- ✅ Variables (assignment and reassignment)
- ✅ Arithmetic and comparison operators
- ✅ `print()` with optional `end=` argument
- ✅ `input()` with async support
- ✅ `if / else` conditionals
- ✅ `for` loops with `range()` (start, stop, step)
- ✅ `while` loops
- ✅ `break` and `continue`
- ✅ Function definitions (`def`) and calls
- ✅ `return` statements
- ✅ Lists with index access
- ✅ List methods: `append`, `pop`, `reverse`, `sort`, `index`, `copy`, `extend`, `insert`, `remove`, `count`
- ✅ Built-ins: `len()`, `int()`, `float()`, `str()`
- ✅ Boolean literals: `True` / `False`
- ✅ Logical operators: `and`, `or`
- ✅ String concatenation via `+`
- ✅ Comments with `#`

---

## 📁 Project Structure

```
transpiler/
│
├── index.js        # Entry point — CLI interface, runs txt file or test suite
├── lexer.js        # Tokenizer — converts raw source code into a token list
├── parser.js       # Parser — builds an AST from the token list
├── ast.js          # AST node class definitions
├── codegen.js      # Code generator — converts AST into JavaScript source
├── runetime.js     # Runtime helper — executes generated JS via eval
├── tests.js        # Test cases and expected outputs
├── fakepy.txt      # Sample Python-like source file to transpile and run
└── package.json    # Project metadata (ES modules)
```

---

## ⚙️ How It Works

The transpiler follows the classic compiler pipeline:

```
Source Code (fakepy.txt)
        │
        ▼
   [ Lexer ]          → Tokenizes the raw text into a stream of tokens
        │
        ▼
   [ Parser ]         → Builds an Abstract Syntax Tree (AST)
        │
        ▼
  [ Code Generator ]  → Traverses the AST and emits JavaScript code
        │
        ▼
   [ Runtime ]        → Executes the generated JS using eval()
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher (ES modules support required)

### Installation

```bash
git clone https://github.com/your-username/fakepy-transpiler.git
cd fakepy-transpiler
```

No dependencies to install — the project uses only Node.js built-ins.

### Run

```bash
node index.js
```

You'll be prompted to choose between:

1. **Run `fakepy.txt`** — transpiles and executes the sample Python file
2. **Run tests** — runs the built-in test suite and shows pass/fail results

---

## 📝 Supported Syntax

### Variables
```python
x = 10
name = "Filippo"
x += 5
```

### Conditionals
```python
if x > 5:
    print("grande")
else:
    print("piccolo")
```

### Loops
```python
for i in range(10):
    print(i)

for i in range(0, 10, 2):
    print(i)

while x > 0:
    x -= 1
```

### Functions
```python
def somma(a, b):
    return a + b

risultato = somma(3, 7)
print(risultato)
```

### Lists
```python
a = [1, 2, 3]
a.append(4)
a.reverse()
print(a[0])
print(len(a))
```

### Input
```python
nome = input("Come ti chiami? ")
print(nome)
```

---

## 🧪 Running Tests

When you launch the program and select option `2`, it runs 16 automated tests covering:

- Function definitions and calls
- Nested functions
- List manipulation
- Loops and conditionals
- Return values
- List methods (`append`, `pop`, `reverse`, `sort`, `index`, `copy`)

Results are printed as ✅ (pass) or ❌ (fail) with expected vs actual output.

---

## ⚠️ Limitations

- Only `for i in range(...)` loops are supported — no `for x in list` iteration
- No classes or object-oriented features
- No `elif` chains (only `if / else`)
- No multi-line strings or f-strings
- No exception handling (`try / except`)
- Indentation must use **spaces** (tabs not supported)
- No module imports within the fake Python source

---

## 👤 Author

**Filippo Chiarolla**
