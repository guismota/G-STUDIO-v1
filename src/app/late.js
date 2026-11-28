// Ponte para quando um arquivo dá valor a uma variável que mora em OUTRO arquivo (etapa de transição da
// modularização): um módulo não pode mudar diretamente a variável importada de outro, então a atribuição vira
// LATE.nome = valor, e o arquivo dono registra o nome no seu começo com late({ get nome(){...}, set nome(v){...} }).
/** @type {Record<string, any>} */
export const LATE = {};
export const late = o => {
  for (const k of Object.keys(o)) if (Object.prototype.hasOwnProperty.call(LATE, k)) throw new Error('LATE.' + k + ' recebeu valor antes de o arquivo dono carregar');
  Object.defineProperties(LATE, Object.getOwnPropertyDescriptors(o));
};
