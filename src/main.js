// Ponto de entrada do G-STUDIO.
// Etapa de transição da modularização: o código do app foi cortado em arquivos dentro de src/, na ordem original
// (a lista está em src/app/parts.json), e o build junta os pedaços num bloco só, exatamente como era no index.html
// antigo. Nas próximas etapas cada pedaço vira um módulo de verdade (com import/export) e sai dessa lista.
import 'virtual:gstudio-app';
