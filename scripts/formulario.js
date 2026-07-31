const produtos = [
  {
    id: "fc-1888",
    nome: "Combo: Hamburguer + fritas + Coca lata ",
    classificacaomedia: 4.5
  },
  {
    id: "fc-2050",
    nome: "Pizza GG com borda",
    classificacaomedia: 4.7
  },
  {
    id: "fs-1987",
    nome: "Combo: Porção de camarão + Batatas fritas",
    classificacaomedia: 3.5
  },
  {
    id: "ac-2000",
    nome: "Combo: Pizza G + Pizza P + Coca-Cola 2Ltrs.",
    classificacaomedia: 3.9
  },
  {
    id: "jj-1969",
    nome: "Combo Saudavél: Suco 300ml + Sanduiche Natural",
    classificacaomedia: 5.0
  }
];

// Preenche o campo <select id="product_name"> dinamicamente
const selectProduto = document.getElementById("product_name");

if (selectProduto) {
  produtos.forEach(produto => {
    const option = document.createElement("option");
    option.value = produto.id; // Atribui o id ao value (ex: fc-1888)
    option.textContent = produto.nome; // Atribui o nome como texto (ex: capacitor de fluxo)
    selectProduto.appendChild(option);
  });
}