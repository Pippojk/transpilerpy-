const readline = require('readline');
const fs = require('node:fs');

const CreatedVariable = new Set();

//funzione per prendere gli input
function input(prompt = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

function tokenize(code) {
  const tokens = [];
  let i = 0;
  let isSpazi = false;
  let spazi = 0;

  while (i < code.length) {
    const char = code[i];

    //controllo se nel codice si va a capo
    if (char === '\n') {
      tokens.push({ type: 'NEWLINE' });
      isSpazi = true;
      i++;
      continue;
    }

    //controllo per la intentazione
    if (isSpazi) {
      if (char == ' ') {
        spazi++;
        i++;
        continue;
      } else {
        tokens.push({ type: "INDENTENTION", value: spazi });
        isSpazi = false;
        spazi = 0;
      }
    }

    //controllo per gli spazi semplici
    if (char == ' ') {
      i++;
      continue;
    }

    //controllo dei numeri
    if (/[0-9]/.test(char)) {
      let num = '';
      while (/[0-9]/.test(code[i])) {
        num += code[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    //controllo lettere
    if (/[a-zA-Z_]/.test(char)) {
      let id = '';
      while (/[a-zA-Z0-9_]/.test(code[i])) {
        id += code[i];
        i++;
      }

      //controllo istruzione o nome
      if (['if', 'elif', 'else', 'while', 'for', 'print', 'input', 'range', 'break', 'continue', 'len'].includes(id)) {
        tokens.push({ type: "KEYWORD", value: id });
      } else {
        tokens.push({ type: "IDENTIFIER", value: id });
      }
      continue;
    }

    //controllo stringa
    if (char === "'" || char === '"') {
      let quote = char;
      let str = '';
      i++;
      while (code[i] != quote) {
        str += code[i];
        i++;
      }
      i++;
      tokens.push({ type: "STRING", value: str });
      continue;
    }

    //controllo tokens
    const singleCharTokens = {
      '=': 'EQUALS',
      '!': 'NOT',
      '<': 'MINOR',
      '>': 'MORE',
      '+': 'PLUS',
      '*': 'STAR',
      '/': 'SLASH',
      '%': 'PERCENT',
      '-': 'MINUS',
      '(': 'LPAREN',
      ')': 'RPAREN',
      '[': 'LSQUARE',
      ']': 'RSQUARE',
      ':': 'COLON',
      ',': 'COMA'
    };

    if (singleCharTokens[char]) {
      tokens.push({ type: singleCharTokens[char] });
      i++;
      continue;
    }

    throw new Error("carattere non riconosciuto: " + char);
  }

  return tokens;
}

//parser
function parser(tokens) {
  let pos = 0;
  const indentStack = [0];

  function next() {
    return tokens[pos++];
  }

  function peek() {
    return tokens[pos];
  }

  function skipNewLine() {
    while (peek() && peek().type == 'NEWLINE') {
      next();
    }
  }

  function readIndent() {
    const tok = peek();
    if (tok && tok.type === "INDENTENTION") {
      next();
      return tok.value;
    }
    return null;
  }

  //parse per un espressione
  function parseEspressione() {
    let left = parseAtom();
    while (
      peek() &&
      ["PLUS", "MINUS", "STAR", "SLASH", "PERCENT"].includes(peek().type)
    ) {
      const op = next();
      const right = parseAtom();
      left = { type: "binary", op: op.type, left, right };
    }

    return left;
  }

  //capisci se lespressione e un valore o una variabile
  function parseAtom() {
    const tok = peek();

    if (tok.type == "NUMBER") {
      next();
      return { type: "number", value: tok.value };
    }

    if (tok.type == "IDENTIFIER") {
      next();
      let node = { type: "name", value: tok.value };
      if(peek().type == "LSQUARE"){
        next();
        let index =parseEspressione();
        if(next().type != "RSQUARE")  throw new Error("quadra chiusa mancante nella lettura dell'array");
        node = {type: "index", object: node, index};
      }

      return node;
    }

    if (tok.type == "STRING") {
      next();
      return { type: "string", value: tok.value };
    }

    if(tok.type == "LSQUARE"){
      next();
      let args = []

      args.push(parseEspressione());
      while(peek() && peek().type == "COMA"){
        next();
        args.push(parseEspressione());
      }

      if(next().type != "RSQUARE") throw new Error("lista non chiusa")

      return {type: "list", args}
    }

    // -----input(arg)------
    if (tok.type == "KEYWORD" && tok.value == "input") {
      next();

      const lpar = next();
      if (lpar.type != "LPAREN") throw new Error("( mancante in input");

      let argument = null;
      if(peek().type !== "RPAREN"){
        argument = parseEspressione();
      }

      const rpar = next();
      if (rpar.type != "RPAREN") throw new Error(") mancante in input");

      return { type: "input", argument };
    }else if(tok.type == "KEYWORD" && tok.value == "break"){
      next();
      return {type: "break"};
    }else if(tok.type == "KEYWORD" && tok.value == "continue"){
      next();
      return {type: "continue"};
    }else if(tok.type == "KEYWORD" && tok.value == "len"){
      next();
      if(next().type != "LPAREN") throw new Error("( mancante in len");
      let arg = parseEspressione();
      if(next().type != "RPAREN") throw new Error(") mancante in len");

      return {type: "len", arg};
    }

    throw new Error(tok.type +  " espressione non valida " + tok.value);
  }

  //funzione per fare il parsing effettivo dei token
  function parseStatement() {
    skipNewLine();
    const tok = peek();
    if (!tok) return null;

    if (tok.type == "KEYWORD") {

      // ---- print(expr) ----
      if (tok.value == "print") {
        next();
        const lpar = next();
        if (lpar.type != "LPAREN") throw new Error("( mancante dopo print");

        const argument = [];
        argument.push(parseEspressione());
        let argEnd = null;

        while(peek().type == 'COMA') {
          next();
          const end = peek();

          if (end.type == "IDENTIFIER" && end.value == 'end') {
            next();
            const equal = next();
            if (equal.type != "EQUALS") throw new Error("= mancante dopo end in print");
            argEnd = parseEspressione();
            break
          }

          argument.push(parseEspressione());
        }

        const rpar = next();


        if (rpar.type != "RPAREN") throw new Error(") mancante dopo print");

        skipNewLine();
        return { type: "print", value: argument, argEnd };
      }

      // ---- if(cond): expr
      else if (tok.value == "if") {
        next();
        if (next().type != "LPAREN") throw new Error("( mancante dopo l'if");

        let left = parseEspressione();
        let eq = next();
        let op = null;

        if (peek().type == "EQUALS") {
          if (eq.type === "EQUALS") op = "==";
          else if (eq.type === "NOT") op = "!=";
          else if (eq.type === "MINOR") op = "<=";
          else if (eq.type === "MORE") op = ">=";
          else throw new Error("operatore mancante nell'if");
          next();
        } else {
          if (eq.type == "MINOR") op = "<";
          else if (eq.type == "MORE") op = ">";
          else throw new Error("operatore mancante nell'if");
        }

        let right = parseEspressione();
        if (next().type != "RPAREN") throw new Error(") mancante nell if");
        if (next().type != "COLON") throw new Error(": mancante nell if");

        skipNewLine();
        let indent = readIndent();
        if (indent == null) throw new Error("risultato dell if mancante");

        const current = indentStack[indentStack.length - 1];
        if (indent <= current) throw new Error("indentazione per if sbagliata");

        indentStack.push(indent);

        let body = [];
        while (true) {
          skipNewLine();
          const tok = peek();
          if (!tok) break;

          if (tok.type === "INDENTENTION" && tok.value < indentStack[indentStack.length - 1]) break;
          if(tok.type === "INDENTENTION" && tok.value == indentStack[indentStack.length - 1]) next();
          body.push(parseStatement());
        }
        indentStack.pop();

        //inizio parsing else se esiste
        skipNewLine();
        readIndent();
        let elsebody = null;

        if (peek() && peek().type === "KEYWORD" && peek().value == "else") {
          elsebody = [];
          next();

          if (peek() && next().type != "COLON") throw new Error(": mancante nell'else");

          skipNewLine();

          const bodyIndent = readIndent();

          if (bodyIndent <= indentStack[indentStack.length - 1]) throw new Error("indentazione corpo else errata");

          indentStack.push(bodyIndent);

          while (true) {
            skipNewLine();
            const tok = peek();
            if (!tok) break;
            if (tok.type === "INDENTENTION" && tok.value < indentStack[indentStack.length - 1]) break;
            if(tok.type === "INDENTENTION" && tok.value == indentStack[indentStack.length - 1]) next();
            elsebody.push(parseStatement());
          }

          indentStack.pop();
        }

        return {
          type: 'if',
          condition: { type: "binary", op, left, right },
          body,
          elsebody
        };
      }

      // ---- for
      else if (tok.value == "for") {

        next();//salto la parola for
        const locVar = next();
        if (locVar.type != "IDENTIFIER") throw new Error("manca la variabile nel for");

        const intok = next();
        if (intok.value != "in") throw new Error("manca in nel for");

        const rangeTok = next();
        if (rangeTok.type != "KEYWORD" && rangeTok.value != "range") throw new Error("manca range nel for");

        const lpar = next();
        if (lpar.type != "LPAREN") throw new Error("manca ( dopo range");

        const Sexpr = parseEspressione();
        let Eexpr = null;

        if (peek().type === "COMA") {
          next();
          Eexpr = parseEspressione();
        }

        if (next().type !== "RPAREN") throw new Error(") mancante in range");
        if (next().type !== "COLON") throw new Error(": mancante nel for");

        skipNewLine();
        const indent = readIndent();
        if (indent === null) throw new Error("indentazione mancante nel for");

        const current = indentStack[indentStack.length - 1];
        if (indent <= current) throw new Error("indentazione sbagliata nel for");

        indentStack.push(indent);

        let body = [];
        while (true) {
          skipNewLine();
          const tok = peek();
          if (!tok) break;
          if (tok.type === "INDENTENTION" && tok.value < indentStack[indentStack.length - 1]){
            break;
          }else if(tok.type === "INDENTENTION" && tok.value == indentStack[indentStack.length - 1]){
            next();
          }
          const val = parseStatement();
         
          body.push(val);
        }

        indentStack.pop();

        return {
          type: "for",
          locVar,
          start: Eexpr ? Sexpr : { type: "number", value: "0" },
          end: Eexpr ? Eexpr : Sexpr,
          body
        };
      }
      else if(tok.value == "while"){
        next();//saltiamo la parola while
        const lPar = next();
        if(lPar.type != "LPAREN") throw new Error("( mancante nel while")

        const left = parseEspressione();
        let eq = next();
        let op = null;

        if (peek().type == "EQUALS") {
          if (eq.type === "EQUALS") op = "==";
          else if (eq.type === "NOT") op = "!=";
          else if (eq.type === "MINOR") op = "<=";
          else if (eq.type === "MORE") op = ">=";
          else throw new Error("operatore mancante nell'if");
          next();
        } else {
          if (eq.type == "MINOR") op = "<";
          else if (eq.type == "MORE") op = ">";
          else throw new Error("operatore mancante nell'if");
        }

        let right = parseEspressione();

        const rPar = next();
        if(rPar.type != "RPAREN") throw new Error(") mancante nel while");

        const colon = next();
        if(colon.type != "COLON") throw new Error(": mancante nel while");

        skipNewLine();
        const indent = readIndent();
        if (indent == null) throw new Error("risultato dell if mancante");
        
        const current = indentStack[indentStack.length - 1];
        if(indent <= current) throw new Error("intentazione sbagliata nel while");

        indentStack.push(indent);
        let body = [];
        while (true) {
          skipNewLine();
          const tok = peek();
          if (!tok) break;
          if (tok.type === "INDENTENTION" && tok.value < indentStack[indentStack.length - 1]){
            break;
          }else if(tok.type === "INDENTENTION" && tok.value == indentStack[indentStack.length - 1]){
            next();
          }
          const val = parseStatement();
         
          body.push(val);
        }

        indentStack.pop();

        return {
          type: 'while',
          condition: { type: "binary", op, left, right },
          body
        };
      }
    }

    // ---- val+=10 (variabile esistente)
    if (tok.type == "IDENTIFIER") {
      if (CreatedVariable.has(tok.value)) {
        next();
        let index;
        if(peek().type == "LSQUARE"){
          next();
          index = parseEspressione();
          if(next().type !== "RSQUARE") throw new Error("[ mancante");
        }

        let op = "";
        const eq = next();

        if (eq.type == "PLUS") op = "+=";
        else if (eq.type == "MINUS") op = "-=";
        else if (eq.type == "STAR") op = "*=";
        else if (eq.type == "SLASH") op = "/=";
        else if (eq.type == "EQUALS") op = "=";
        else throw new Error("= mancante per cambiare valore della variabile 1");

        if (op != "=") {
          if (next().type != 'EQUALS') throw new Error("= mancante per cambiare valore della variabile 2");
        }

        const argument = parseEspressione();
        skipNewLine();

        return {
          type: "change",
          target: { type: "name",  value: tok.value },
          op,
          index,
          value: argument
        };
      } else {
        // ---- val = expr ---- (nuova variabile)
        const nameToken = next();
        const eq = next();
        if (eq.type != "EQUALS") throw new Error("= mancante nella creazione della variabile");

        const argument = parseEspressione();
        CreatedVariable.add(nameToken.value);
        skipNewLine();

        return {
          type: "assign",
          target: { type: "name", value: nameToken.value },
          value: argument
        };
      }
    }

    //parsing per le espressioni libere nel codice (3+4, input(), "ciao")
    if (["KEYWORD", "NUMBER", "STRING", "IDENTIFIER"].includes(tok.type)) {
      const expr = parseEspressione();
      skipNewLine();
      return { type: "expr", value: expr };
    }

    throw new Error(peek().type + " " + peek().value + " statement sconosciuto in pos: " + pos);
  }

  //loop nei token
  const body = [];
  while (pos < tokens.length) {
    skipNewLine();

    // ✅ ignora INDENTENTION SOLO a livello globale
    if (peek() && peek().type === "INDENTENTION" && indentStack.length === 1) {
      next();
      continue;
    }

    const stmt = parseStatement();
    if (stmt) body.push(stmt);
    skipNewLine();
  }

  return { type: "program", body };
}

//codegen
function jsComposer(node) {
  function opToJs(op) {
    return {
      PLUS: "+",
      MINUS: "-",
      STAR: "*",
      SLASH: "/",
      PERCENT: "%"
    }[op];
  }

  switch (node.type) {
    case "program":
      return node.body.map(jsComposer).join("\n");

    case "assign":
      return `let ${jsComposer(node.target)} = ${jsComposer(node.value)};`;

    case "change":
      if(node.index == null){
        return `${jsComposer(node.target)} ${node.op} ${jsComposer(node.value)};`;
      }else{
        return `${jsComposer(node.target)}[${jsComposer(node.index)}] ${node.op} ${jsComposer(node.value)};`;
      }

    case "name":
      return node.value;

    case "number":
      return node.value;

    case "string":
      return '"' + node.value + '"';

    case "list":
      return "[" + node.args.map(jsComposer).join(", ") + "]";
    case "index":
      return `${jsComposer(node.object)}[${jsComposer(node.index)}]`;
    case "print": {
      // converte ogni argomento in stringa
      const args = node.value
        .map(v => `String(${jsComposer(v)})`)
        .join(' + " " + ');

      // se non è specificato end → newline
      if (!node.argEnd)
        return `process.stdout.write(${args} + "\\n");`;

      // altrimenti usa end personalizzato
      return `process.stdout.write(${args} + String(${jsComposer(node.argEnd)}));`;
    }


    case "binary":
      return `${jsComposer(node.left)} ${opToJs(node.op)} ${jsComposer(node.right)}`;

    case "if": {
      let code = `if (${jsComposer(node.condition.left)} ${node.condition.op} ${jsComposer(node.condition.right)}) {\n`;
      code += node.body.map(jsComposer).join("\n");
      code += `\n}`;
      if (node.elsebody) {
        code += ` else {\n${node.elsebody.map(jsComposer).join("\n")}\n}`;
      }
      return code;
    }

    case "input":
      if (node.argument) return `await input(${jsComposer(node.argument)})`;
      return `await input()`;

    case "expr":
      return jsComposer(node.value) + ";";

    case "for": {
      const it = node.locVar.value;
      const start = jsComposer(node.start);
      const end = jsComposer(node.end);
      const bodyCode = node.body.map(jsComposer).join("\n");

      return `for (let ${it} = ${start}; ${it} < ${end}; ${it}++) {\n${bodyCode}\n}`;
    }
    case "while": {
      let code = `while(${jsComposer(node.condition.left)} ${node.condition.op} ${jsComposer(node.condition.right)}){\n`;
      code += node.body.map(jsComposer).join("\n");
      code += `\n}`;
      return code;
    }
    case "break":
      return node.type + ";";
    case "continue":
      return node.type + ";";
    case "len":
      return `${jsComposer(node.arg)}.length`;
  }
}


fs.readFile('fakepy.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  let tokens = tokenize(data);
  //console.log(tokens);

  let parse = parser(tokens);
  //console.log(parse);

  let result = jsComposer(parse);
  //console.log(result);

  eval(`(async () => { ${result} })()`);
});


const tests = [
`n = 1
n = n + 2
print(n)`, 

`x = 5
if (x > 3):
    print("maggiore")
else:
    print("minore o uguale")`,

`n = 1
while (n < 4):
    print(n)
    n = n + 1
print("fine")`,

`for i in range(3):
    print(i)
print("done")`,

`for n in range(1, 5):
    if (n % 2 == 0):
        print("pari")
    else:
        print("dispari")`,

`x = 0
while (x < 2):
    y = 0
    while (y < 2):
        print(x, y)
        y = y + 1
    x = x + 1
print("done")`,

`name = "Alice"
if (name == "Alice"):
    print("Ciao Alice")
else:
    print("Chi sei?")`,

`total = 0
for n in range(1, 4):
    total = total + n
print(total)`,

`n = 0
while (n < 10):
    print(n)
    if (n == 2):
        break
    n = n + 1
print("stop")`,

`n = 0
while (n < 5):
    n = n + 1
    if (n % 2 == 0):
        continue
    print(n)
print("fine")`

];

const expected = [
`3
`,

`maggiore
`,

`1
2
3
fine
`,

`0
1
2
done
`,

`dispari
pari
dispari
pari
`,

`0 0
0 1
1 0
1 1
done
`,

`Ciao Alice
`,

`6
`,

`0
1
2
stop
`,

`1
3
5
fine
`
];


async function test(){
for (let i = 0; i < tests.length; i++) {
  const tokens = tokenize(tests[i]);
  const ast = parser(tokens);
  const js = jsComposer(ast);

  // cattura stdout
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (str) => { output += str; return true };
  
  await eval(`(async () => { ${js} })()`);

  process.stdout.write = originalWrite;

  if (output !== expected[i]) {
    console.log(`❌ Test ${i+1} fallito`);
    console.log("Atteso:\n", expected[i]);
    console.log("Ottenuto:\n", output);
  } else {
    console.log(`✅ Test ${i+1} ok`);
  }
}
}
//test();