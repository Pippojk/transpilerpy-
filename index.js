import readline from 'readline';
import fs from 'fs';

import { parser } from './parser.js';
import { jsComposer } from './codegen.js';
import { tokenize } from './lexer.js';
import { testList, expected } from './tests.js';

// readline globale per input multipli
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// funzione input compatibile con await
function input(prompt = "") {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer); // NON chiudere rl qui, così puoi usare input più volte
    });
  });
}

console.log("==========================\n");
console.log("BENVENUTO NEL TRANSPILER DI FILIPPO CHIAROLLA");
console.log("    vuoi testare il file txt o i test??");
console.log("          1)txt           2)test");
const scelta = await input();
console.log("==========================\n");

if(scelta == 1){
// Legge il file sorgente del tuo "fakepy"
fs.readFile('fakepy.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    rl.close();
    return;
  }

  try {
    const tokens = tokenize(data);
    const ast = parser(tokens);
    const result = jsComposer(ast);

    console.log("=== Codice JS generato ===");
    console.log(result);
    console.log("==========================\n");

    // Esegue il codice generato passando input come parametro
    (async () => {
      try {
        const func = new Function("input", `"use strict"; return (async () => { ${result} })();`);
        await func(input);
      } catch (e) {
        console.error("Errore durante l'esecuzione:", e);
      } finally {
        rl.close(); // chiudi readline alla fine
      }
    })();
  } catch (e) {
    console.error("Errore nel parsing o codegen:", e);
    rl.close();
  }
});
}else{

async function test(){
for (let i = 0; i < testList.length; i++) {
  const tokens = tokenize(testList[i]);
  const ast = parser(tokens);
  const js = jsComposer(ast);

  // cattura stdout
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (str) => { output += str; return true };
  
  await eval(`(async () => { ${js} })()`);

  process.stdout.write = originalWrite;

  if (output.trim()!== expected[i].trim()) {
    console.log(`❌ Test ${i+1} fallito`);
    console.log("Atteso:\n", expected[i]);
    console.log("Ottenuto:\n", output);
  } else {
    console.log(`✅ Test ${i+1} ok`);
  }
}
}

test().then(() => {
  rl.close();
});
}