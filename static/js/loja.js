// Gerenciamento de lojas
class LojaManager {
  constructor() {
    this.lojas = [];
    this.init();
  }

  async init() {
    await this.carregarLojas();
    this.configurarEventos();
  }

  async carregarLojas() {
    try {
      const response = await fetch("/api/lojas");
      this.lojas = await response.json();
      this.renderizarLojas();
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      this.mostrarMensagem("Erro ao carregar lojas", "error");
    }
  }

  configurarEventos() {
    document.getElementById("formLoja").addEventListener("submit", (e) => {
      e.preventDefault();
      this.cadastrarLoja();
    });

    document.getElementById("btnLimparLoja").addEventListener("click", () => {
      this.limparFormulario();
    });
  }

  async cadastrarLoja() {
    const formData = new FormData(document.getElementById("formLoja"));
    const loja = {
      nome: formData.get("nome"),
      telefone: formData.get("telefone"),
      responsavel: formData.get("responsavel"),
      endereco: formData.get("endereco"),
    };

    try {
      const response = await fetch("/api/lojas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loja),
      });

      if (response.ok) {
        this.mostrarMensagem("Loja cadastrada com sucesso!", "success");
        this.limparFormulario();
        await this.carregarLojas();
      } else {
        throw new Error("Erro ao cadastrar loja");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao cadastrar loja", "error");
    }
  }

  async excluirLoja(id) {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) {
      return;
    }

    try {
      const response = await fetch(`/api/lojas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        this.mostrarMensagem("Loja excluída com sucesso!", "success");
        await this.carregarLojas();
      } else {
        throw new Error("Erro ao excluir loja");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao excluir loja", "error");
    }
  }

  renderizarLojas() {
    const tbody = document.getElementById("tabelaLojas");
    tbody.innerHTML = "";

    this.lojas.forEach((loja) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${loja.nome}</td>
                <td>${loja.telefone || "-"}</td>
                <td>${loja.responsavel || "-"}</td>
                <td>${loja.endereco || "-"}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="lojaManager.editarLoja(${
                      loja.id
                    })">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="lojaManager.excluirLoja(${
                      loja.id
                    })">
                        Excluir
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async editarLoja(id) {
    const loja = this.lojas.find((l) => l.id === id);
    if (!loja) return;

    document.getElementById("lojaId").value = loja.id;
    document.getElementById("nomeLoja").value = loja.nome;
    document.getElementById("telefoneLoja").value = loja.telefone || "";
    document.getElementById("responsavel").value = loja.responsavel || "";
    document.getElementById("enderecoLoja").value = loja.endereco || "";

    document.getElementById("btnSalvarLoja").textContent = "Atualizar Loja";
  }

  limparFormulario() {
    document.getElementById("formLoja").reset();
    document.getElementById("lojaId").value = "";
    document.getElementById("btnSalvarLoja").textContent = "Cadastrar Loja";
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

const lojaManager = new LojaManager();
