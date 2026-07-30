// exibição das datas no rodapé
let d = new Date();
document.getElementById("ano-atual").innerHTML = `&copy;${d.getFullYear()}`;
document.querySelector('#lastModified').textContent = `Última Modificação: ${document.lastModified}`;