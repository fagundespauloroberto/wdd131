// 1. Obter dinamicamente o ano atual para os direitos autorais
const elementoAno = document.getElementById("ano-atual");
const anoAtual = new Date().getFullYear();
elementoAno.textContent = anoAtual;

// 2. Obter dinamicamente a data da última modificação do documento
const elementoModificacao = document.getElementById("ultima-modificacao");
const dataModificacao = document.lastModified;
elementoModificacao.textContent = dataModificacao;