// Configuração do Concerto das Nações. Edite aqui ao publicar.
// Sem SUPABASE_URL o jogo roda em MODO DEMONSTRAÇÃO: tudo fica no navegador,
// com jogadores-robô, para testar sem servidor.
export const CONFIG = {
  SUPABASE_URL: '',        // ex.: 'https://xxxx.supabase.co' (projeto Supabase próprio do jogo)
  SUPABASE_ANON_KEY: '',   // chave "anon public" do projeto (pode ficar no código; a segurança vem do RLS)

  // Abrir servidor é pago. Nesta versão o pagamento é conferido à mão:
  // o servidor fica "aguardando pagamento" e um administrador o libera.
  PAGAMENTO: {
    valor: 'R$ 19,90',                 // preço exibido (defina o seu)
    instrucoes: 'Pague via Pix e envie o comprovante com o código do servidor. A liberação é feita por um administrador.',
    chavePix: '',                      // sua chave Pix (vazia = "em breve")
    contato: '',                       // e-mail ou @ para enviar o comprovante
  },
};
