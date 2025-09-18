// Gerenciamento de serviços
class ServicoManager {
  constructor() {
    this.servicos = [];
    this.produtos = [];
    this.funcionarios = [];
    this.lojas = [];
    this.servicoAtual = {
      itens: [],
      total: 0,
    };
    this.init();
  }

  async init() {
    await this.carregarDados();
    this.configurarEventos();
    this.atualizarTotal();
  }

  async carregarDados() {
    try {
      const [servicosRes, produtosRes, funcionariosRes, lojasRes] =
        await Promise.all([
          fetch("/api/servicos"),
          fetch("/api/produtos?ativos=true"),
          fetch("/api/funcionarios?ativos=true"),
          fetch("/api/lojas"),
        ]);

      this.servicos = await servicosRes.json();
      this.produtos = await produtosRes.json();
      this.funcionarios = await funcionariosRes.json();
      this.lojas = await lojasRes.json();

      this.preencherCombos();
      this.renderizarServicos();
      this.calcularTotalPorLoja();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.mostrarMensagem("Erro ao carregar dados", "error");
    }
  }

  preencherCombos() {
    // Preencher combo de produtos
    const comboProduto = document.getElementById("produtoServico");
    comboProduto.innerHTML =
      '<option value="">Selecione um produto/serviço</option>';
    this.produtos.forEach((produto) => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = `${produto.nome} - R$ ${produto.valor.toFixed(2)}`;
      option.dataset.preco = produto.valor;
      comboProduto.appendChild(option);
    });

    // Preencher combo de funcionários
    const comboFuncionario = document.getElementById("funcionarioServico");
    comboFuncionario.innerHTML =
      '<option value="">Selecione um funcionário</option>';
    this.funcionarios.forEach((funcionario) => {
      const option = document.createElement("option");
      option.value = funcionario.id;
      option.textContent = funcionario.nome;
      comboFuncionario.appendChild(option);
    });

    // Preencher combo de lojas
    const comboLoja = document.getElementById("lojaServico");
    comboLoja.innerHTML = '<option value="">Selecione uma loja</option>';
    this.lojas.forEach((loja) => {
      const option = document.createElement("option");
      option.value = loja.id;
      option.textContent = loja.nome;
      comboLoja.appendChild(option);
    });
  }

  configurarEventos() {
    // Adicionar item ao serviço
    document
      .getElementById("btnAdicionarItemServico")
      .addEventListener("click", () => {
        this.adicionarItem();
      });

    // Finalizar serviço
    document
      .getElementById("btnFinalizarServico")
      .addEventListener("click", () => {
        this.finalizarServico();
      });

    // Limpar serviço
    document
      .getElementById("btnLimparServico")
      .addEventListener("click", () => {
        this.limparServico();
      });

    // Filtros de relatório
    document
      .getElementById("btnFiltrarServicos")
      .addEventListener("click", () => {
        this.filtrarServicos();
      });
  }

  adicionarItem() {
    const produtoId = document.getElementById("produtoServico").value;
    const quantidade = document.getElementById("quantidadeServico").value;
    const produto = this.produtos.find((p) => p.id == produtoId);

    if (!produtoId || !quantidade || quantidade <= 0) {
      this.mostrarMensagem(
        "Selecione um produto e informe a quantidade",
        "error"
      );
      return;
    }

    const item = {
      produto_id: produtoId,
      produto_nome: produto.nome,
      quantidade: parseInt(quantidade),
      preco_unitario: produto.valor,
      subtotal: produto.valor * parseInt(quantidade),
    };

    this.servicoAtual.itens.push(item);
    this.servicoAtual.total += item.subtotal;

    this.renderizarItensServico();
    this.atualizarTotal();
    this.limparCamposItem();
  }

  removerItem(index) {
    const item = this.servicoAtual.itens[index];
    this.servicoAtual.total -= item.subtotal;
    this.servicoAtual.itens.splice(index, 1);

    this.renderizarItensServico();
    this.atualizarTotal();
  }

  renderizarItensServico() {
    const tbody = document.getElementById("itensServico");
    tbody.innerHTML = "";

    this.servicoAtual.itens.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${item.produto_nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.preco_unitario.toFixed(2)}</td>
                <td>R$ ${item.subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="servicoManager.removerItem(${index})">
                        Remover
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async finalizarServico() {
    if (this.servicoAtual.itens.length === 0) {
      this.mostrarMensagem("Adicione pelo menos um item ao serviço", "error");
      return;
    }

    const lojaId = document.getElementById("lojaServico").value;
    const funcionarioId = document.getElementById("funcionarioServico").value;
    const observacoes = document.getElementById("observacoesServico").value;

    if (!lojaId || !funcionarioId) {
      this.mostrarMensagem("Preencha todos os campos obrigatórios", "error");
      return;
    }

    const servico = {
      itens: this.servicoAtual.itens,
      loja_id: parseInt(lojaId),
      funcionario_id: parseInt(funcionarioId),
      observacoes: observacoes,
      total: this.servicoAtual.total,
    };

    try {
      const response = await fetch("/api/servicos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servico),
      });

      if (response.ok) {
        this.mostrarMensagem("Serviço registrado com sucesso!", "success");
        this.limparServico();
        await this.carregarDados();
      } else {
        throw new Error("Erro ao registrar serviço");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao registrar serviço", "error");
    }
  }

  limparServico() {
    this.servicoAtual = { itens: [], total: 0 };
    document.getElementById("formServico").reset();
    this.renderizarItensServico();
    this.atualizarTotal();
  }

  limparCamposItem() {
    document.getElementById("produtoServico").value = "";
    document.getElementById("quantidadeServico").value = "1";
  }

  atualizarTotal() {
    document.getElementById(
      "totalServico"
    ).textContent = `R$ ${this.servicoAtual.total.toFixed(2)}`;
  }

  renderizarServicos() {
    const tbody = document.getElementById("tabelaServicos");
    tbody.innerHTML = "";

    this.servicos.forEach((servico) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${servico.data}</td>
                <td>${servico.loja_nome}</td>
                <td>${servico.itens.length} itens</td>
                <td>R$ ${servico.total.toFixed(2)}</td>
                <td>${servico.funcionario_nome}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="servicoManager.verDetalhes(${
                      servico.id
                    })">
                        Detalhes
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async filtrarServicos() {
    const dataInicio = document.getElementById("dataInicioServicos").value;
    const dataFim = document.getElementById("dataFimServicos").value;
    const lojaId = document.getElementById("filtroLoja").value;

    try {
      let url = "/api/servicos/filtrar?";
      if (dataInicio) url += `data_inicio=${dataInicio}&`;
      if (dataFim) url += `data_fim=${dataFim}&`;
      if (lojaId) url += `loja_id=${lojaId}`;

      const response = await fetch(url);
      this.servicos = await response.json();
      this.renderizarServicos();
    } catch (error) {
      console.error("Erro ao filtrar serviços:", error);
      this.mostrarMensagem("Erro ao filtrar serviços", "error");
    }
  }

  async calcularTotalPorLoja() {
    try {
      const response = await fetch("/api/servicos/total-por-loja");
      const totais = await response.json();

      const tbody = document.getElementById("tabelaTotalLoja");
      tbody.innerHTML = "";

      totais.forEach((total) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${total.loja_nome}</td>
                    <td>R$ ${total.total.toFixed(2)}</td>
                `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Erro ao calcular totais por loja:", error);
    }
  }

  async verDetalhes(id) {
    try {
      const response = await fetch(`/api/servicos/${id}`);
      const servico = await response.json();

      this.mostrarModalDetalhes(servico);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      this.mostrarMensagem("Erro ao carregar detalhes do serviço", "error");
    }
  }

  mostrarModalDetalhes(servico) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

    modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 100%;">
                <h2>Detalhes do Serviço #${servico.id}</h2>
                <p><strong>Data:</strong> ${servico.data}</p>
                <p><strong>Loja:</strong> ${servico.loja_nome}</p>
                <p><strong>Funcionário:</strong> ${servico.funcionario_nome}</p>
                <p><strong>Total:</strong> R$ ${servico.total.toFixed(2)}</p>
                <h3>Itens:</h3>
                <ul>
                    ${servico.itens
                      .map(
                        (item) => `
                        <li>${item.produto_nome} - ${
                          item.quantidade
                        } x R$ ${item.preco_unitario.toFixed(
                          2
                        )} = R$ ${item.subtotal.toFixed(2)}</li>
                    `
                      )
                      .join("")}
                </ul>
                ${
                  servico.observacoes
                    ? `<p><strong>Observações:</strong> ${servico.observacoes}</p>`
                    : ""
                }
                <button onclick="this.closest('.modal').remove()" class="btn btn-primary">Fechar</button>
            </div>
        `;

    document.body.appendChild(modal);
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

const servicoManager = new ServicoManager();
