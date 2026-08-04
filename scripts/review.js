// busca o valor atual do localStorage ou define como 0 se não tiver
let reviewCount = Number(localStorage.getItem("reviewCount-ls")) || 0;

// autoincremento +1 a cada carregamento da página de confirmação
reviewCount++;

// atualiza o contador 
localStorage.setItem("reviewCount-ls", reviewCount);

// exibe o valor atualizado no HTML
const countDisplay = document.getElementById("review-count");
if (countDisplay) {
  countDisplay.textContent = reviewCount;
}