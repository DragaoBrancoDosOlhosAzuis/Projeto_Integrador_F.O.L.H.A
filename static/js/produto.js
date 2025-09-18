// Gerenciamento de produtos
class ProdutoManager {
  constructor() {
    this.produtos = [];
    this.init();
  }

  async init() {
    await this.carregarProdutos();
    this.configurarEventos();
  }

  async carregarProdutos() {
    try {
      const response = await fetch("/api/produtos");
      this.produtos = await response.json();
      this.renderizarProdutos();
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      this.mostrarMensagem("Erro ao carregar produtos", "error");
    }
  }

  configurarEventos() {
    document.getElementById("formProduto").addEventListener("submit", (e) => {
      e.preventDefault();
      this.cadastrarProduto();
    });

    document
      .getElementById("btnLimparProduto")
      .addEventListener("click", () => {
        this.limparFormulario();
      });
  }

  async cadastrarProduto() {
    const formData = new FormData(document.getElementById("formProduto"));
    const produto = {
      nome: formData.get("nome"),
      subcategoria: formData.get("subcategoria"),
      valor: parseFloat(formData.get("valor")),
      ativo: formData.get("ativo") === "on",
    };

    try {
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produto),
      });

      if (response.ok) {
        this.mostrarMensagem("Produto cadastrado com sucesso!", "success");
        this.limparFormulario();
        await this.carregarProdutos();
      } else {
        throw new Error("Erro ao cadastrar produto");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao cadastrar produto", "error");
    }
  }

  async excluirProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        this.mostrarMensagem("Produto excluído com sucesso!", "success");
        await this.carregarProdutos();
      } else {
        throw new Error("Erro ao excluir produto");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao excluir produto", "error");
    }
  }

  renderizarProdutos() {
    const tbody = document.getElementById("tabelaProdutos");
    tbody.innerHTML = "";

    this.produtos.forEach((produto) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.subcategoria || "-"}</td>
                <td>R$ ${produto.valor.toFixed(2)}</td>
                <td>
                    <span class="badge ${
                      produto.ativo ? "badge-success" : "badge-warning"
                    }">
                        ${produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="produtoManager.editarProduto(${
                      produto.id
                    })">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="produtoManager.excluirProduto(${
                      produto.id
                    })">
                        Excluir
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async editarProduto(id) {
    const produto = this.produtos.find((p) => p.id === id);
    if (!produto) return;

    document.getElementById("produtoId").value = produto.id;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("subcategoria").value = produto.subcategoria || "";
    document.getElementById("valor").value = produto.valor;
    document.getElementById("ativoProduto").checked = produto.ativo;

    document.getElementById("btnSalvarProduto").textContent =
      "Atualizar Produto";
  }

  limparFormulario() {
    document.getElementById("formProduto").reset();
    document.getElementById("produtoId").value = "";
    document.getElementById("btnSalvarProduto").textContent =
      "Cadastrar Produto";
  }

  mostrarMensagem(mensagem, tipo) {
    const div = document.createElement("div");
    div.className = `alert alert-${tipo}`;
    div.textContent = mensagem;

    const container = document.querySelector(".container");
    container.insertBefore(div, container.firstChild);

    setTimeout(() => div.remove(), 3000);
  }
}

const produtoManager = new ProdutoManager();
