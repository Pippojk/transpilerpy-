export async function run(jsCode) {
  await eval(`(async () => { ${jsCode} })()`);
}