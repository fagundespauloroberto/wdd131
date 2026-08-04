//let d = new Date();  //comentado para testes e analisando formas diferentes de fazer...
//document.getElementById("ano-atual").innerHTML = `&copy;${d.getFullYear()}`;
//document.querySelector('#lastModified').textContent = `Última Modificação: ${document.lastModified}`;

document.getElementById("ano-atual").textContent = new Date().getFullYear();
document.getElementById("ultima-modificacao").textContent = document.lastModified;

const hambutton = document.querySelector('#hambutton');

hambutton.addEventListener('click', () => {
  document.querySelector('h1').classList.toggle('show');
  document.querySelector('#navmenu').classList.toggle('show');
  hambutton.classList.toggle('show');
});

function toggleActive(element) {
  document.querySelectorAll('a').forEach(link => {
    link.classList.remove('active');
  });

  element.classList.add("active");
}

//definições chamada menu...
const cutoffDate = new Date('1900-01-01');
const cutonDate = new Date('2000-01-01');
const largeArea = 90000;
const smallArea = 10000;

const temples = [
  {
    nomeDoTemplo: "Aba Nigeria",
    localizacao: "Aba, Nigéria",
    consagracao: "2005-08-07",
    area: 11500,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Manti Utah",
    localizacao: "Manti, Utah, Estados Unidos",
    consagracao: "1888-05-21",
    area: 74792,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Payson Utah",
    localizacao: "Payson, Utah, Estados Unidos",
    consagracao: "2015-06-07",
    area: 96630,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Yigo Guam",
    localizacao: "Yigo, Guam",
    consagracao: "2020-05-02",
    area: 6861,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    nomeDoTemplo: "Washington D.C.",
    localizacao: "Kensington, Maryland, Estados Unidos",
    consagracao: "1974-11-19",
    area: 156558,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    nomeDoTemplo: "Lima Peru",
    localizacao: "Lima, Peru",
    consagracao: "1986-01-10",
    area: 9600,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Cidade do México, México",
    localizacao: "Cidade do México, México",
    consagracao: "1983-12-02",
    area: 116642,
    urlDaImagem:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Templo de Porto Alegre, Brasil",
    localizacao: "Porto Alegre, Brasil",
    consagracao: "2000-12-17",
    area: 1238,
    urlDaImagem:
    "https://churchofjesuschristtemples.org/assets/img/temples/porto-alegre-brazil-temple/porto-alegre-brazil-temple-59769.jpg"
  },
  {
    nomeDoTemplo: "Templo de Curitiba, Brasil",
    localizacao: "Curitiba, Brasil",
    consagracao: "2008-07-01",
    area: 959,
    urlDaImagem:
    "https://churchofjesuschristtemples.org/assets/img/temples/curitiba-brazil-temple/curitiba-brazil-temple-60228-thumb.jpg"
  },

];

function setFiler(seletor, filterFunction) {
  const element = document.querySelector(seletor);

  element.addEventListener('click', () => {
    toggleActive(element);
    createTempleCard(temples.filter(filterFunction));
  });
}

// condições para validar conforme chamada do menu
setFiler('#all', () => true);
setFiler('#old', temple => new Date(temple.consagracao) < cutoffDate);
setFiler('#new', temple => new Date(temple.consagracao) >= cutonDate);
setFiler('#large', temple => temple.area >= largeArea);
setFiler('#small', temple => temple.area < smallArea);

createTempleCard(temples);

function createTempleCard(templos) {
  document.querySelector('.res-grid').innerHTML = '';

  templos.forEach(temple => {
    let card = document.createElement("section");
    let name = document.createElement("h3");
    let location = document.createElement("p");
    let dedication = document.createElement("p");
    let area = document.createElement("p");
    let img = document.createElement("img");

    name.textContent = temple.nomeDoTemplo;
    location.innerHTML = `<span class="label">Localização:</span> ${temple.localizacao}`;
    dedication.innerHTML = `<span class="label">Dedicado:</span> ${temple.consagracao}`;
    area.innerHTML = `<span class="label">Tamanho:</span> ${temple.area} pés²`;
    img.setAttribute("src", temple.urlDaImagem);
    img.setAttribute("alt", `Templo ${temple.nomeDoTemplo}`);
    img.setAttribute("loading", "lazy");

    card.appendChild(name);
    card.appendChild(location);
    card.appendChild(dedication);
    card.appendChild(area);
    card.appendChild(img);

    document.querySelector(".res-grid").appendChild(card);
  });
}