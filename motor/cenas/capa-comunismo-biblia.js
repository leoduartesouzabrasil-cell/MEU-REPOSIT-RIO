// Capa do Reels "QUEM DISSE ISSO? A Bíblia ou o comunismo?": a MESMA cena do ringue da abertura do vídeo (bonecos de Jesus e Marx
// brigando, X, BÍBLIA × COMUNISMO), os dois parados em guarda com o X no meio, com o título e os logos d'O Camarada e do Coletivo Lufã no alto.
// Reaproveita o desenho de motor/cenas/comunismo-biblia.js (modo window.CAPA_BIBLIA).
// Render: node motor/render.js capa-comunismo-biblia saida/capa-comunismo-biblia.png --still 0
window.CAPA_BIBLIA = true;
(function () {
  const x = new XMLHttpRequest(); x.open('GET', 'cenas/comunismo-biblia.js', false); x.send();
  (0, eval)(x.responseText);   // define window.CENA no escopo global
})();
