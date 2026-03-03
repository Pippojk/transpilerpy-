export function tokenize(code) {
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
      if (['if', 'elif', 'else', 'while', 'for', 'print', 'input', 'range', 'break', 'continue', 'len', 'def', 'return'].includes(id)) {
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
      ',': 'COMA',
      '.': 'DOT'
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