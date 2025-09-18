// Gerenciamento de vendas
class VendaManager {
  constructor() {
    this.vendas = [];
    this.produtos = [];
    this.funcionarios = [];
    this.clientes = [];
    this.vendaAtual = {
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
      const [vendasRes, produtosRes, funcionariosRes, clientesRes] =
        await Promise.all([
          fetch("/api/vendas"),
          fetch("/api/produtos?ativos=true"),
          fetch("/api/funcionarios?ativos=true"),
          fetch("/api/clientes"),
        ]);

      this.vendas = await vendasRes.json();
      this.produtos = await produtosRes.json();
      this.funcionarios = await funcionariosRes.json();
      this.clientes = await clientesRes.json();

      this.preencherCombos();
      this.renderizarVendas();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.mostrarMensagem("Erro ao carregar dados", "error");
    }
  }

  preencherCombos() {
    // Preencher combo de produtos
    const comboProduto = document.getElementById("produtoVenda");
    comboProduto.innerHTML = '<option value="">Selecione um produto</option>';
    this.produtos.forEach((produto) => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = `${produto.nome} - R$ ${produto.valor.toFixed(2)}`;
      option.dataset.preco = produto.valor;
      comboProduto.appendChild(option);
    });

    // Preencher combo de vendedores
    const comboVendedor = document.getElementById("vendedorVenda");
    comboVendedor.innerHTML = '<option value="">Selecione um vendedor</option>';
    this.funcionarios.forEach((funcionario) => {
      const option = document.createElement("option");
      option.value = funcionario.id;
      option.textContent = funcionario.nome;
      comboVendedor.appendChild(option);
    });

    // Preencher combo de clientes
    const comboCliente = document.getElementById("clienteVenda");
    comboCliente.innerHTML =
      '<option value="">Selecione um cliente (opcional)</option>';
    this.clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.nome;
      comboCliente.appendChild(option);
    });
  }

  configurarEventos() {
    // Adicionar item à venda
    document
      .getElementById("btnAdicionarItem")
      .addEventListener("click", () => {
        this.adicionarItem();
      });

    // Finalizar venda
    document
      .getElementById("btnFinalizarVenda")
      .addEventListener("click", () => {
        this.finalizarVenda();
      });

    // Limpar venda
    document.getElementById("btnLimparVenda").addEventListener("click", () => {
      this.limparVenda();
    });

    // Alteração no método de pagamento
    document
      .getElementById("metodoPagamento")
      .addEventListener("change", (e) => {
        this.toggleParcelas(e.target.value === "Cartão de Crédito");
      });

    // Filtros de relatório
    document
      .getElementById("btnFiltrarVendas")
      .addEventListener("click", () => {
        this.filtrarVendas();
      });
  }

  adicionarItem() {
    const produtoId = document.getElementById("produtoVenda").value;
    const quantidade = document.getElementById("quantidadeVenda").value;
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

    this.vendaAtual.itens.push(item);
    this.vendaAtual.total += item.subtotal;

    this.renderizarItensVenda();
    this.atualizarTotal();
    this.limparCamposItem();
  }

  removerItem(index) {
    const item = this.vendaAtual.itens[index];
    this.vendaAtual.total -= item.subtotal;
    this.vendaAtual.itens.splice(index, 1);

    this.renderizarItensVenda();
    this.atualizarTotal();
  }

  renderizarItensVenda() {
    const tbody = document.getElementById("itensVenda");
    tbody.innerHTML = "";

    this.vendaAtual.itens.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${item.produto_nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.preco_unitario.toFixed(2)}</td>
                <td>R$ ${item.subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="vendaManager.removerItem(${index})">
                        Remover
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async finalizarVenda() {
    if (this.vendaAtual.itens.length === 0) {
      this.mostrarMensagem("Adicione pelo menos um item à venda", "error");
      return;
    }

    const vendedorId = document.getElementById("vendedorVenda").value;
    const metodoPagamento = document.getElementById("metodoPagamento").value;
    const parcelas = document.getElementById("parcelasVenda").value || 1;
    const clienteId = document.getElementById("clienteVenda").value || null;

    if (!vendedorId || !metodoPagamento) {
      this.mostrarMensagem("Preencha todos os campos obrigatórios", "error");
      return;
    }

    const venda = {
      itens: this.vendaAtual.itens,
      vendedor_id: parseInt(vendedorId),
      metodo_pagamento: metodoPagamento,
      parcelas: parseInt(parcelas),
      cliente_id: clienteId ? parseInt(clienteId) : null,
      total: this.vendaAtual.total,
    };

    try {
      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venda),
      });

      if (response.ok) {
        this.mostrarMensagem("Venda registrada com sucesso!", "success");
        this.limparVenda();
        await this.carregarDados();
      } else {
        throw new Error("Erro ao registrar venda");
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("Erro ao registrar venda", "error");
    }
  }

  limparVenda() {
    this.vendaAtual = { itens: [], total: 0 };
    document.getElementById("formVenda").reset();
    document.getElementById("parcelasVenda").disabled = true;
    this.renderizarItensVenda();
    this.atualizarTotal();
  }

  limparCamposItem() {
    document.getElementById("produtoVenda").value = "";
    document.getElementById("quantidadeVenda").value = "1";
  }

  atualizarTotal() {
    document.getElementById(
      "totalVenda"
    ).textContent = `R$ ${this.vendaAtual.total.toFixed(2)}`;
  }

  toggleParcelas(mostrar) {
    const parcelasField = document.getElementById("parcelasVenda");
    parcelasField.disabled = !mostrar;
    if (!mostrar) {
      parcelasField.value = "1";
    }
  }

  renderizarVendas() {
    const tbody = document.getElementById("tabelaVendas");
    tbody.innerHTML = "";

    this.vendas.forEach((venda) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${venda.data}</td>
                <td>${venda.itens.length} itens</td>
                <td>R$ ${venda.total.toFixed(2)}</td>
                <td>${venda.metodo_pagamento}</td>
                <td>${venda.vendedor_nome || "N/A"}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="vendaManager.verDetalhes(${
                      venda.id
                    })">
                        Detalhes
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  async filtrarVendas() {
    const dataInicio = document.getElementById("dataInicioVendas").value;
    const dataFim = document.getElementById("dataFimVendas").value;
    const vendedorId = document.getElementById("filtroVendedor").value;

    try {
      let url = "/api/vendas/filtrar?";
      if (dataInicio) url += `data_inicio=${dataInicio}&`;
      if (dataFim) url += `data_fim=${dataFim}&`;
      if (vendedorId) url += `vendedor_id=${vendedorId}`;

      const response = await fetch(url);
      this.vendas = await response.json();
      this.renderizarVendas();
    } catch (error) {
      console.error("Erro ao filtrar vendas:", error);
      this.mostrarMensagem("Erro ao filtrar vendas", "error");
    }
  }

  async verDetalhes(id) {
    try {
      const response = await fetch(`/api/vendas/${id}`);
      const venda = await response.json();

      // Abrir modal com detalhes da venda
      this.mostrarModalDetalhes(venda);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      this.mostrarMensagem("Erro ao carregar detalhes da venda", "error");
    }
  }

  mostrarModalDetalhes(venda) {
    // Implementar modal com detalhes da venda
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
                <h2>Detalhes da Venda #${venda.id}</h2>
                <p><strong>Data:</strong> ${venda.data}</p>
                <p><strong>Vendedor:</strong> ${venda.vendedor_nome}</p>
                <p><strong>Total:</strong> R$ ${venda.total.toFixed(2)}</p>
                <h3>Itens:</h3>
                <ul>
                    ${venda.itens
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

const vendaManager = new VendaManager();
