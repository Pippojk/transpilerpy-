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
  Input,
  Method
} from "./ast.js"

export function parser(tokens) {
  let pos = 0;
  const indentStack = [0];
  const CreatedVariable = new Set();

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
  function parseEspressione(){
    let left = parseAtom();
    while (
      peek() &&
      ["PLUS", "MINUS", "STAR", "SLASH", "PERCENT"].includes(peek().type)
    ) {
      const op = next();
      const right = parseAtom();
      left = new Binary(op.type, left, right);
    }

    return left;
  }

  //capisci se lespressione e un valore o una variabile
  function parseAtom(creazioneFunzione = false) {
    const tok = peek();

    if (tok.type == "NUMBER") {
      next();
      return new Number(tok.value);
    }

    if (tok.type == "IDENTIFIER") {
      next();
      //controllo se si sta chiamando lelemento di una lista
      if(peek() && peek().type == "LSQUARE"){
        next();
        let index =parseEspressione();
        if(next().type != "RSQUARE")  throw new Error("quadra chiusa mancante nella lettura dell'array");
        return new Index(
          new Name(tok.value),
          index
        );
      //controllo se si sta chiamando una funzione
      }else if(peek && peek().type == "LPAREN" && creazioneFunzione == false){
        next();
        let args = [];

        if(peek().type !== "RPAREN"){
          args.push(parseEspressione());
          while (peek().type === "COMA") {
            next();
            args.push(parseEspressione());
          }
        }

        if(next().type !== "RPAREN") throw new Error(") mancante nella chiamata della funzione");

        return new Call(new Name(tok.value), args);
      //controllo se si sta chiamando un metodo di una lista  
      }else if(peek() && peek().type == "DOT"){
        next();
        const name = next();
        if(next().type != "LPAREN") throw new Error("( mancante nel metodo della lista");

        if(peek().type != "RPAREN"){
          let args = [];
          args.push(parseEspressione());
          while(peek().type == "COMA"){
            next();
            args.push(parseEspressione());
          }

          next();//consumiamo )

          return new Method(new Name(tok.value), new Name(name.value), args);
        }else{
          next();//consumiamo )
          return new Method(new Name(tok.value), new Name(name.value), []);
        }

      }
      //se non si sta richiamando ne una funzione ne un elemento di lista
      return new Name(tok.value);
    }

    if (tok.type == "STRING") {
      next();
      return new String(tok.value);
    }

    //creazione di una nuova lista
    if(tok.type == "LSQUARE"){
      next();
      let args = []

      if(peek() && peek().type !== "RSQUARE"){
      args.push(parseEspressione());
      while(peek() && peek().type == "COMA"){
        next();
        args.push(parseEspressione());
      }
      }
      if(next().type != "RSQUARE") throw new Error("lista non chiusa")

      return new List(args);
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

      return new Input(argument);
    }else if(tok.type == "KEYWORD" && tok.value == "break"){
      next();
      return new Break;
    }else if(tok.type == "KEYWORD" && tok.value == "continue"){
      next();
      return new Continue;
    }else if(tok.type == "KEYWORD" && tok.value == "len"){
      next();
      if(next().type != "LPAREN") throw new Error("( mancante in len");
      let arg = parseEspressione();
      if(next().type != "RPAREN") throw new Error(") mancante in len");

      return new Len(arg);
    }else if(tok.type == "KEYWORD" && tok.value == "return"){
      next();
      const arg = parseEspressione();
      return new Return(arg);
    }

    throw new Error(tok.type +  " espressione non valida " + tokens[pos-3].value + " " + pos);
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
        return new Print(argument, argEnd);
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
        if (peek() && peek().type === "INDENTENTION") {
          readIndent(); // consumo temporaneo
          if (!(peek() && peek().type === "KEYWORD" && peek().value == "else")) {
            pos--; // nessun else → rimetto il token INDENTENTION
          }
        }
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

        return new If(
          new Binary(op, left, right),
          body,
          elsebody
        );
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

        return new For(
          new Name(locVar.value),
          Eexpr ? Sexpr : new Number("0"),
          Eexpr ? Eexpr : Sexpr,
          body
        );
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

        return new While(
         new Binary(op, left, right),
          body
        );
      }else if(tok.value == "def"){
        next();
        const nome = parseAtom(true);

        let lp = next();
        if(lp.type !== "LPAREN") throw new Error("( mancante nella creazione della funzione " + lp.type);
        
        //controllo numeri di parametri
        let par = [];
        if(peek().type !== "RPAREN"){
          par.push(parseEspressione());
          while(true){
            if(peek().type != "COMA"){ 
              break;
            }else{
              next();
            }

            par.push(parseEspressione());
          }
        }

        if(next().type !== "RPAREN") throw new Error(") mancante nella creazione della funzione ");

        if(next().type !== "COLON") throw new Error(": mancante nella creazione della funzione");
        
        skipNewLine();
        const indent = readIndent();
        if(indent == null) throw new Error("funzione vuota");
        const currentIndent = indentStack[indentStack.length-1];

        if(indent <= currentIndent) throw new Error("intentazione sbagliata dopo la funzione");
        indentStack.push(indent);
        
        const screenShot = new Set(CreatedVariable);

        // Aggiungi i parametri al set di variabili create
        for (const p of par) {
          if (p instanceof Name) {
            CreatedVariable.add(p.value);
          }
        }


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

        for(const v of [...CreatedVariable]){
          if(!(screenShot.has(v))) CreatedVariable.delete(v);
        }

        return new Function(
          nome,
          par,
          body
        );
      }
    }

    // ---- val+=10 (variabile esistente)
    if (tok.type == "IDENTIFIER") {
      const nextTok = tokens[pos+1];

      if(nextTok.type == "DOT"){
        return new Exp(parseAtom());
      }else if(nextTok.type == "LPAREN") {
        return parseAtom(); // parseAtom gestisce le call
      } else if (CreatedVariable.has(tok.value)) {
        next();
        let index;
        if(peek().type == "LSQUARE"){
          next();
          index = parseEspressione();
          if(next().type !== "RSQUARE") throw new Error("] mancante");
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

        return new Change(
          new Name(tok.value),
          op,
          index,
          argument
        );
      } else {
        // ---- val = expr ---- (nuova variabile)
        const nameToken = next();
        const eq = next();
        if (eq.type != "EQUALS") throw new Error(nameToken.value + " = mancante nella creazione della variabile");

        const argument = parseEspressione();
        CreatedVariable.add(nameToken.value);
        skipNewLine();

        return new Assign(
          new Name(nameToken.value),
          argument
        );
      }
    }

    //parsing per le espressioni libere nel codice (3+4, input(), "ciao")
    if (["KEYWORD", "NUMBER", "STRING", "IDENTIFIER"].includes(tok.type)) {
      const expr = parseEspressione();
      skipNewLine();
      return new Exp(expr);
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
  }

  return new Program(body);
}