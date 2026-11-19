// Gera js/dados-faixa.js (módulo ES) a partir de jogo_a_faixa/data.js,
// para o Concerto das Nações reaproveitar partidos, estados e projetos da A Faixa.
// Uso: node concerto/ferramentas/gerar-dados-faixa.mjs
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const src = fs.readFileSync(path.join(raiz, 'jogo_a_faixa/data.js'), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src + '\n;globalThis.__x={PARTIDOS,ESTADOS,PROJETOS};', ctx);
const { PARTIDOS, ESTADOS, PROJETOS } = ctx.__x;
const proj = PROJETOS.map(p => ({ id:p.id, nome:p.nome, tipo:p.tipo, e:p.e, s:p.s, we:p.we??1, ws:p.ws??1, pop:p.pop, desc:p.desc,
  fx:{ aprov:p.fx?.aprov||0, eco:p.fx?.eco||{} } }));
const out = `// GERADO por ferramentas/gerar-dados-faixa.mjs a partir de jogo_a_faixa/data.js. Não edite à mão.
export const PARTIDOS = ${JSON.stringify(PARTIDOS)};
export const ESTADOS = ${JSON.stringify(ESTADOS.map(({uf,nome,reg,peso})=>({uf,nome,reg,peso})))};
export const PROJETOS = ${JSON.stringify(proj)};
`;
fs.writeFileSync(path.join(raiz, 'concerto/js/dados-faixa.js'), out);
console.log('ok', PARTIDOS.length, ESTADOS.length, proj.length);
