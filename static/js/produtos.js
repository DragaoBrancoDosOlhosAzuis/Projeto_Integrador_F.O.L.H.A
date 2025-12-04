async function carregarProdutosMaisVendidos() {
  const tbody = document.getElementById("produtosMaisVendidos");
  const url = "http://127.0.0.1:5000/api/mais-vendidos"; // Verifique se esta é a URL correta do seu Flask

  // Exibe o estado de carregamento inicial (que já está no seu HTML)
  // tbody.innerHTML = '<tr><td colspan="4" class="text-center">Carregando...</td></tr>';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }

    const produtos = await response.json();

    // Limpa o conteúdo atual
    tbody.innerHTML = "";

    if (produtos.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center">Nenhum dado de vendas encontrado.</td></tr>';
      return;
    }

    // Gera as linhas da tabela com os dados da API
    produtos.forEach((produto) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.subcategoria}</td>
                <td>${produto.vendas}</td>
                <td>${Utils.formatarMoeda(produto.valor_total)}</td>
            `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao buscar produtos mais vendidos:", error);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados. Verifique o console.</td></tr>`;
  }
}

// Garanta que a função seja chamada quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", carregarProdutosMaisVendidos);
