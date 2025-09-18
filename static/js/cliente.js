// Gerenciamento de clientes
class ClienteManager {
  constructor() {
    this.clientes = [];
    this.init();
  }

  async init() {
    await this.carregarClientes();
    this.configurarEventos();
  }

  async carregarClientes() {
    try {
      const response = await fetch("/api/clientes");
      this.clientes = await response.json();
      this.renderizarClientes();
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      this.mostrarMensagem("Erro ao carregar clientes", "error");
    }
  }

  configurarEventos() {
    // Formulário de cadastro
    document.getElementById("formCliente").addEventListener("submit", (e) => {
      e.preventDefault();
      this.cadastrarCliente();
    });

    // Botão de limpar formulário
    document
      .getElementById("btnLimparCliente")
      .addEventListener("click", () => {
        this.limparFormulario();
      });
  }

  async cadastrarCliente() {
    const formData = new FormData(document.getElementById("formCliente"));
    const cliente = {
      nome: formData.get("nome"),
      telefone: formData.get("telefone"),
      email: formData.get("email"),
      endereco: formData.get("endereco"),
    };

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

      if (response.ok) {
        this.mostrarMensagem("Cliente cadastrado com sucesso!", "success");
        this.limparFormulario();
        await this.carregarClientes();
      } else {
        throw new Error("Erro ao cadastrar cliente");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao cadastrar cliente", "error");
    }
  }

  async excluirCliente(id) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        this.mostrarMensagem("Cliente excluído com sucesso!", "success");
        await this.carregarClientes();
      } else {
        throw new Error("Erro ao excluir cliente");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao excluir cliente", "error");
    }
  }

  renderizarClientes() {
    const tbody = document.getElementById("tabelaClientes");
    tbody.innerHTML = "";

    this.clientes.forEach((cliente) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.telefone || "-"}</td>
                <td>${cliente.email || "-"}</td>
                <td>${cliente.endereco || "-"}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="clienteManager.editarCliente(${
                      cliente.id
                    })">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="clienteManager.excluirCliente(${
                      cliente.id
                    })">
                        Excluir
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async editarCliente(id) {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return;

    // Preencher formulário com dados do cliente
    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("nome").value = cliente.nome;
    document.getElementById("telefone").value = cliente.telefone || "";
    document.getElementById("email").value = cliente.email || "";
    document.getElementById("endereco").value = cliente.endereco || "";

    // Mudar texto do botão para "Atualizar"
    document.getElementById("btnSalvarCliente").textContent =
      "Atualizar Cliente";
  }

  limparFormulario() {
    document.getElementById("formCliente").reset();
    document.getElementById("clienteId").value = "";
    document.getElementById("btnSalvarCliente").textContent =
      "Cadastrar Cliente";
  }

  mostrarMensagem(mensagem, tipo) {
    // Implementar lógica de exibição de mensagens
    const div = document.createElement("div");
    div.className = `alert alert-${tipo}`;
    div.textContent = mensagem;

    const container = document.querySelector(".container");
    container.insertBefore(div, container.firstChild);

    setTimeout(() => div.remove(), 3000);
  }
}

// Inicializar gerenciador de clientes
const clienteManager = new ClienteManager();
