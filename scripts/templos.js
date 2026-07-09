// exibição das datas no rodapé
let d = new Date();
document.getElementById("currentYear").innerHTML = `&copy;${d.getFullYear()}`;
document.querySelector('#lastModified').textContent = `Última Modificação: ${document.lastModified}`;

// menu do tipo Hamburger (mobile)
const hambutton = document.querySelector('#hambutton');

hambutton.addEventListener('click', () => {
  document.querySelector('h1').classList.toggle('show');
  document.querySelector('#navmenu').classList.toggle('show');
  hambutton.classList.toggle('show');
});

// gerenciamento dos links
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("#navmenu a");

    function seletorAtivo(event) {
        // Remove a classe 'active' de todos os links antes de aplicar no atual
        links.forEach(link => link.classList.remove("active"));
        
        // Adiciona a classe 'active' no link que recebeu o clique/toque
        event.currentTarget.classList.add("active");
    }

    // Vincula o evento a todos os links do menu de forma externa e limpa
    links.forEach(link => {
        link.addEventListener("click", seletorAtivo);
        link.addEventListener("touchstart", seletorAtivo, { passive: true });
    });
});