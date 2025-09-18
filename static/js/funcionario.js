// Gerenciamento de funcionários
class FuncionarioManager {
  constructor() {
    this.funcionarios = [];
    this.init();
  }

  async init() {
    await this.carregarFuncionarios();
    this.configurarEventos();
  }

  async carregarFuncionarios() {
    try {
      const response = await fetch("/api/funcionarios");
      this.funcionarios = await response.json();
      this.renderizarFuncionarios();
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      this.mostrarMensagem("Erro ao carregar funcionários", "error");
    }
  }

  configurarEventos() {
    document
      .getElementById("formFuncionario")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.cadastrarFuncionario();
      });

    document
      .getElementById("btnLimparFuncionario")
      .addEventListener("click", () => {
        this.limparFormulario();
      });
  }

  async cadastrarFuncionario() {
    const formData = new FormData(document.getElementById("formFuncionario"));
    const funcionario = {
      nome: formData.get("nome"),
      data_entrada: formData.get("data_entrada"),
      cargo: formData.get("cargo"),
      ativo: formData.get("ativo") === "on",
    };

    try {
      const response = await fetch("/api/funcionarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(funcionario),
      });

      if (response.ok) {
        this.mostrarMensagem("Funcionário cadastrado com sucesso!", "success");
        this.limparFormulario();
        await this.carregarFuncionarios();
      } else {
        throw new Error("Erro ao cadastrar funcionário");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao cadastrar funcionário", "error");
    }
  }

  async excluirFuncionario(id) {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) {
      return;
    }

    try {
      const response = await fetch(`/api/funcionarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        this.mostrarMensagem("Funcionário excluído com sucesso!", "success");
        await this.carregarFuncionarios();
      } else {
        throw new Error("Erro ao excluir funcionário");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao excluir funcionário", "error");
    }
  }

  renderizarFuncionarios() {
    const tbody = document.getElementById("tabelaFuncionarios");
    tbody.innerHTML = "";

    this.funcionarios.forEach((funcionario) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${funcionario.nome}</td>
                <td>${funcionario.data_entrada}</td>
                <td>${funcionario.cargo || "Vendedor"}</td>
                <td>
                    <span class="badge ${
                      funcionario.ativo ? "badge-success" : "badge-warning"
                    }">
                        ${funcionario.ativo ? "Ativo" : "Inativo"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="funcionarioManager.editarFuncionario(${
                      funcionario.id
                    })">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="funcionarioManager.excluirFuncionario(${
                      funcionario.id
                    })">
                        Excluir
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async editarFuncionario(id) {
    const funcionario = this.funcionarios.find((f) => f.id === id);
    if (!funcionario) return;

    document.getElementById("funcionarioId").value = funcionario.id;
    document.getElementById("nomeFuncionario").value = funcionario.nome;
    document.getElementById("dataEntrada").value = funcionario.data_entrada;
    document.getElementById("cargo").value = funcionario.cargo || "";
    document.getElementById("ativo").checked = funcionario.ativo;

    document.getElementById("btnSalvarFuncionario").textContent =
      "Atualizar Funcionário";
  }

  limparFormulario() {
    document.getElementById("formFuncionario").reset();
    document.getElementById("funcionarioId").value = "";
    document.getElementById("btnSalvarFuncionario").textContent =
      "Cadastrar Funcionário";
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

const funcionarioManager = new FuncionarioManager();
