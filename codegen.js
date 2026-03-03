import {
  Program,
  Assign,
  Change,
  Name,
  String,
  List,
  Index,
  Print,
  Binary,
  If,
  Number,
  Exp,
  For,
  While,
  Break,
  Len,
  Function,
  Call,
  Return,
  Continue,
  Input
} from "./ast.js"

export function jsComposer(node) {
function opToJs(op) {
  return {
    PLUS: "+",
    MINUS: "-",
    STAR: "*",
    SLASH: "/",
    PERCENT: "%",

    "==": "==",
    "!=": "!=",
    "<": "<",
    "<=": "<=",
    ">": ">",
    ">=": ">="
  }[op] || op;
}

  if(node instanceof Program){
      return node.body.map(jsComposer).join("\n");
  }else if(node instanceof Assign)
  {
      return `let ${jsComposer(node.target)} = ${jsComposer(node.value)};`;
  }
  else if(node instanceof Change)
  {
      if(node.index == null){
        return `${jsComposer(node.target)} ${node.op} ${jsComposer(node.value)};`;
      }else{
        return `${jsComposer(node.target)}[${jsComposer(node.index)}] ${node.op} ${jsComposer(node.value)};`;
      }
  }
  else if(node instanceof Name)
  {
      return node.value;
  }
  else if(node instanceof Number)
  {
      return node.argument;
  }
  else if(node instanceof String)
  {
      return '"' + node.value + '"';
  }
  else if(node instanceof List)
  {
      return "[" + node.args.map(jsComposer).join(", ") + "]";
  }
  else if(node instanceof Index){
    return `${jsComposer(node.object)}[${jsComposer(node.index)}]`;
  }
  else if(node instanceof Print)
  {
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
  else if(node instanceof Binary)
  {
      return `${jsComposer(node.left)} ${opToJs(node.op)} ${jsComposer(node.right)}`;
  }
  else if(node instanceof If){
    let code = `if (${jsComposer(node.condition)}) {\n`;
    code += node.body.map(jsComposer).join("\n");
    code += `\n}`;
    if (node.elseBody) {
      code += ` else {\n${node.elseBody.map(jsComposer).join("\n")}\n}`;
    }
    return code;
  }
  else if(node instanceof Input)
  {
    if (node.arg) return `await input(${jsComposer(node.arg)})`;
    return `await input()`;
  }
  else if(node instanceof Exp)
  {
    return jsComposer(node.value) + ";";
  }
  else if(node instanceof For)
  {
    const it = node.locVar.value;
    const start = jsComposer(node.start);
    const end = jsComposer(node.end);
    const bodyCode = node.body.map(jsComposer).join("\n");

    return `for (let ${it} = ${start}; ${it} < ${end}; ${it}++) {\n${bodyCode}\n}`;
  }
  else if(node instanceof While){
    let code = `while(${jsComposer(node.condition)}){\n`;
    code += node.body.map(jsComposer).join("\n");
    code += `\n}`;
    return code;
  }
  else if(node instanceof Break) return "break;";
  else if(node instanceof Continue) return "continue;";
  else if(node instanceof Len)
  {
    return `${jsComposer(node.arg)}.length`;
  }
  else if(node instanceof Function)
  {
    let code = `function ${jsComposer(node.name)}(`;
    code += node.par.map(jsComposer).join(", ");
    code += `){\n`;
    code += node.body.map(jsComposer).join("\n");
    code += `\n}`;
    return code;
  }
  else if(node instanceof Call){
    return `${jsComposer(node.callee)}(${node.args.map(jsComposer).join(", ")})`;
  }
  else if(node instanceof Return)
  {
    return `return ${jsComposer(node.arg)};`;
  }
}
