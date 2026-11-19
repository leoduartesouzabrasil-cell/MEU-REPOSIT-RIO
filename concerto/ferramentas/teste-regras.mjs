import { novoServidor, aplicar, vagasLivres, composicao, placar, projecao, candidatosDisputa } from '../js/regras.js';
let est = novoServidor({ id:'s1', nome:'Teste', dono:'P', perfil:{nome:'Ana Presidente', partido:'PT', uf:'BA'}, agora:0, cfg:{intervaloPresidente:0} });
const go = (q,a)=>{ const r = aplicar(est,q,a,Date.now()); est=r.est; return r.msg; };
const tenta = (q,a)=>{ try { return go(q,a);} catch(e){ return 'ERRO: '+e.message; } };
for (let i=0;i<5;i++) { go('j'+i,{tipo:'entrar',nome:'Jogador '+i, partido:i%2?'PL':'PSOL', uf:'RR'}); }
for (let i=0;i<5;i++) console.log(i, tenta('j'+i,{tipo:'candidatar',cargo:'senador'}));
console.log('livres', vagasLivres(est,'senador','RR'));
console.log(tenta('j3',{tipo:'campanha',acao:'comicio'}), tenta('j0',{tipo:'campanha',acao:'visita',seg:'evang'}), tenta('j3',{tipo:'campanha',acao:'apoio'}));
console.log(projecao(est,'senador','RR',candidatosDisputa(est,'senador:RR')).lista);
console.log(tenta('j0',{tipo:'propor',catalogo:'fim6x1'}));
console.log(tenta('j1',{tipo:'votar',projeto:1,voto:'nao'}), tenta('j0',{tipo:'votar',projeto:1,voto:'sim'}));
for (let m=0;m<7;m++) tenta('P',{tipo:'passar_mes'});
console.log(est.mes, est.eco, est.eleicoes[0]?.lista, est.projetos.map(p=>[p.titulo,p.casa,p.fim,p.hist.map(h=>h.casa+h.sim+'-'+h.nao)]));
console.log(est.noticias.slice(0,12).map(n=>n.t).join('\n'));
console.log(composicao(est,'senado').npc.slice(0,4), JSON.stringify(est).length);
