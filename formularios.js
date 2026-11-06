/* O popup só pode ser aberto depois de uma resposta JSON explícita do servidor. */
async function enviarFormularioConfirmado(dados) {
  if (window.location.protocol === 'file:') {
    throw new Error('Esta é uma prévia local: nada foi enviado. Abra a prévia pelo servidor local ou use o site publicado.');
  }
  if (window.navigator.onLine === false) {
    throw new Error('Você está sem conexão. Seus dados foram mantidos; conecte-se à internet antes de enviar.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(function() { controller.abort(); }, 30000);
  let resposta;
  let resultado;
  try {
    resposta = await fetch('https://script.google.com/macros/s/AKfycbzKNq5fK64aso8-YL4iGIpjq3M-mVGDPvdVtcoMy4mml675Bd6UNpjv2LiRz2fq1gmNtA/exec', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(dados),
      signal: controller.signal
    });
    if (!resposta.ok || resposta.type === 'opaque') throw new Error('Resposta indisponível');
    resultado = await resposta.json();
    if (!resultado || typeof resultado.ok !== 'boolean') throw new Error('Resposta inválida');
  } catch (erro) {
    // Não repetir automaticamente: a gravação pode ter ocorrido antes da falha de rede.
    throw new Error('Não foi possível confirmar o recebimento. Seus dados foram mantidos. O envio pode ter chegado; aguarde e confira a confirmação antes de reenviar.');
  } finally {
    clearTimeout(timeout);
  }
  if (resultado.ok !== true) {
    throw new Error('O servidor não confirmou o envio. Confira os campos; seus dados foram mantidos. Se já enviou antes, confira a confirmação ou fale com os noivos antes de reenviar.');
  }
  return resultado;
}
