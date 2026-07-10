const n = 6; // número de dias adiante
// obtenha o local de saída no documento a ser anexado na lista
const output = document.getElementsByTagName("ul");
// Intl.DateTimeFormat Opções
const options = { weekday: 'long'}; // vs. short, etc.

// INICIO
const hoje = new Date();
// saída com o dia de hoje
let hojestring = new Intl.DateTimeFormat('pt-BR', options).format(hoje);
document.getElementById('hoje').innerHTML = `Hoje é ${hojestring}. `;

// próximos n dias
for (let i = 1; i <= n; i++ ) {
	let diaseguinte = new Date();
	diaseguinte.setDate(hoje.getDate() + i);
	let diaseguintestring = new Intl.DateTimeFormat('pt-BR', options).format(diaseguinte);
	item = document.createElement("li"); 
	item.textContent = diaseguintestring;
	output[0].appendChild(item);
}
