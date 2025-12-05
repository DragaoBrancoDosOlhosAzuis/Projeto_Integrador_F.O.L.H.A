// Gerenciamento de Serviços (Vendas Fiadas)
let produtosServico = [];
let lojasDisponiveis = [];

// Inicialização do módulo de serviços
function inicializarServicos() {
  console.log("Inicializando módulo de serviços...");
  carregarDadosServicos();
  configurarEventosServicos();
}

// Carregar dados para serviços
async function carregarDadosServicos() {
  try {
    console.log("Carregando dados para serviços...");

    // Carregar produtos ativos
    produtosDisponiveis = await ApiService.getProdutos(true);
    console.log("Produtos carregados:", produtosDisponiveis);

    // Carregar lojas
    lojasDisponiveis = await ApiService.getLojas();
    console.log("Lojas carregadas:", lojasDisponiveis);

    // Popular select de lojas
    const selectLoja = document.getElementById("loja-fiado");
    if (selectLoja) {
      selectLoja.innerHTML = '<option value="">Selecione a loja</option>';
      lojasDisponiveis.forEach((loja) => {
        const option = document.createElement("option");
        option.value = loja.id;
        option.textContent = loja.nome;
        selectLoja.appendChild(option);
      });
    }

    // Configurar data atual
    const dataServico = document.getElementById("data-servico");
    if (dataServico && !dataServico.value) {
      dataServico.value = new Date().toISOString().split("T")[0];
    }

    console.log("Dados de serviços carregados com sucesso");
  } catch (error) {
    console.error("Erro ao carregar dados para serviços:", error);
    mostrarMensagem("Erro ao carregar dados para serviços", "error");
  }
}

// Configurar eventos do módulo de serviços
function configurarEventosServicos() {
  console.log("Configurando eventos de serviços...");

  // Evento para buscar funcionário (pode ser implementado autocomplete)
  const inputFuncionario = document.getElementById("funcionario-fiado");
  if (inputFuncionario) {
    inputFuncionario.addEventListener("input", function () {
      // Futuramente implementar autocomplete
    });
  }

  console.log("Eventos de serviços configurados");
}

// Adicionar produto ao serviço
function adicionarProdutoFiado() {
  console.log("Adicionando produto ao serviço...");

  const produtosContainer = document.getElementById("produtos-fiado");
  const index = produtosServico.length;

  const produtoHtml = `
        <div class="produto-item-servico" data-index="${index}">
            <div class="form-row">
                <div class="form-group">
                    <select class="form-control produto-select-servico" onchange="selecionarProdutoServico(${index}, this.value)" required>
                        <option value="">Selecione o produto</option>
                        ${produtosDisponiveis
                          .map(
                            (produto) =>
                              `<option value="${produto.id}">${
                                produto.nome
                              } - ${Utils.formatarMoeda(
                                produto.valor
                              )}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control quantidade-servico" placeholder="Qtd" min="1" value="1" 
                           onchange="atualizarSubtotalServico(${index})" oninput="atualizarSubtotalServico(${index})">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control valor-unitario-servico" placeholder="R$ 0,00" readonly>
                </div>
                <div class="form-group">
                    <input type="text" class="form-control subtotal-servico" placeholder="R$ 0,00" readonly>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removerProdutoServico(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

  produtosContainer.insertAdjacentHTML("beforeend", produtoHtml);
  produtosServico.push({
    produto_id: null,
    quantidade: 1,
    valor_unitario: 0,
    subtotal: 0,
    produto_nome: "",
  });

  console.log("Produto adicionado ao serviço. Total:", produtosServico.length);
}

// Selecionar produto no serviço
function selecionarProdutoServico(index, produtoId) {
  console.log(`Selecionando produto ${produtoId} no serviço índice ${index}`);

  if (!produtoId) return;

  const produto = produtosDisponiveis.find((p) => p.id == produtoId);
  if (produto) {
    produtosServico[index].produto_id = produto.id;
    produtosServico[index].valor_unitario = produto.valor;
    produtosServico[index].produto_nome = produto.nome;

    const itemElement = document.querySelector(
      `.produto-item-servico[data-index="${index}"]`
    );
    itemElement.querySelector(".valor-unitario-servico").value =
      Utils.formatarMoeda(produto.valor);

    atualizarSubtotalServico(index);

    console.log(`Produto "${produto.nome}" selecionado para serviço`);
  }
}

// Atualizar subtotal do item do serviço
function atualizarSubtotalServico(index) {
  const itemElement = document.querySelector(
    `.produto-item-servico[data-index="${index}"]`
  );
  const quantidade =
    parseInt(itemElement.querySelector(".quantidade-servico").value) || 0;

  produtosServico[index].quantidade = quantidade;
  produtosServico[index].subtotal =
    produtosServico[index].valor_unitario * quantidade;

  itemElement.querySelector(".subtotal-servico").value = Utils.formatarMoeda(
    produtosServico[index].subtotal
  );

  calcularTotalServico();

  console.log(
    `Subtotal do serviço atualizado: ${Utils.formatarMoeda(
      produtosServico[index].subtotal
    )}`
  );
}

// Remover produto do serviço
function removerProdutoServico(index) {
  console.log(`Removendo produto do serviço índice ${index}`);

  produtosServico.splice(index, 1);
  const elemento = document.querySelector(
    `.produto-item-servico[data-index="${index}"]`
  );
  if (elemento) {
    elemento.remove();
  }

  // Reindexar elementos restantes
  document
    .querySelectorAll(".produto-item-servico")
    .forEach((item, newIndex) => {
      item.setAttribute("data-index", newIndex);
      item
        .querySelector(".produto-select-servico")
        .setAttribute(
          "onchange",
          `selecionarProdutoServico(${newIndex}, this.value)`
        );
      item
        .querySelector(".quantidade-servico")
        .setAttribute("onchange", `atualizarSubtotalServico(${newIndex})`);
      item
        .querySelector(".quantidade-servico")
        .setAttribute("oninput", `atualizarSubtotalServico(${newIndex})`);
      item
        .querySelector("button")
        .setAttribute("onclick", `removerProdutoServico(${newIndex})`);
    });

  calcularTotalServico();

  console.log(
    "Produto removido do serviço. Total restante:",
    produtosServico.length
  );
}

// Calcular total do serviço
function calcularTotalServico() {
  const total = produtosServico.reduce((sum, item) => sum + item.subtotal, 0);
  document.getElementById(
    "total-fiado"
  ).textContent = `Total: ${Utils.formatarMoeda(total)}`;

  console.log("Total do serviço calculado:", Utils.formatarMoeda(total));
}

// Confirmar venda fiada
async function confirmarVendaFiada() {
  try {
    console.log("Confirmando venda fiada...");

    const lojaId = document.getElementById("loja-fiado").value;
    const dataServico = document.getElementById("data-servico").value;
    const funcionarioNome = document.getElementById("funcionario-fiado").value;
    const observacoes = ""; // Pode ser adicionado campo de observações

    console.log("Dados do serviço:", {
      lojaId,
      dataServico,
      funcionarioNome,
      produtos: produtosServico,
    });

    // Validações
    if (!lojaId) {
      mostrarMensagem("Selecione uma loja!", "error");
      return;
    }

    if (!dataServico) {
      mostrarMensagem("Informe a data do serviço!", "error");
      return;
    }

    if (!funcionarioNome) {
      mostrarMensagem("Informe o nome do funcionário!", "error");
      return;
    }

    if (produtosServico.length === 0) {
      mostrarMensagem("Adicione pelo menos um produto ao serviço!", "error");
      return;
    }

    // Verificar se todos os produtos foram selecionados corretamente
    const produtosInvalidos = produtosServico.filter(
      (item) => !item.produto_id || item.quantidade <= 0
    );
    if (produtosInvalidos.length > 0) {
      mostrarMensagem(
        "Verifique os produtos adicionados. Todos devem ter quantidade válida.",
        "error"
      );
      return;
    }

    // Buscar ou criar funcionário
    let funcionarioId = await obterOuCriarFuncionario(funcionarioNome);

    const total = produtosServico.reduce((sum, item) => sum + item.subtotal, 0);

    const servicoData = {
      loja_id: parseInt(lojaId),
      funcionario_id: funcionarioId,
      data: formatarDataParaBr(dataServico),
      observacoes: observacoes,
      itens: produtosServico.map((item) => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        subtotal: item.subtotal,
      })),
      total: total,
    };

    console.log("Enviando dados do serviço:", servicoData);

    const resultado = await ApiService.createServico(servicoData);

    if (resultado.success) {
      mostrarMensagem("Venda fiada registrada com sucesso!", "success");
      limparServico();
      await carregarContasReceber(); // Atualizar contas a receber
    } else {
      throw new Error(resultado.message || "Erro ao registrar venda fiada");
    }
  } catch (error) {
    console.error("Erro ao confirmar venda fiada:", error);
    mostrarMensagem(error.message || "Erro ao registrar venda fiada", "error");
  }
}

// Obter ou criar funcionário
async function obterOuCriarFuncionario(nomeFuncionario) {
  try {
    console.log(`Buscando ou criando funcionário: ${nomeFuncionario}`);

    // Buscar funcionários existentes
    const funcionarios = await ApiService.getFuncionarios(true);
    const funcionarioExistente = funcionarios.find(
      (f) => f.nome.toLowerCase() === nomeFuncionario.toLowerCase()
    );

    if (funcionarioExistente) {
      console.log("Funcionário encontrado:", funcionarioExistente);
      return funcionarioExistente.id;
    }

    // Criar novo funcionário
    console.log("Criando novo funcionário...");
    const novoFuncionario = {
      nome: nomeFuncionario,
      data_entrada: new Date().toISOString().split("T")[0],
      cargo: "Vendedor",
      salario: 0,
      ativo: true,
    };

    const resultado = await ApiService.createFuncionario(novoFuncionario);

    if (resultado.success) {
      console.log("Novo funcionário criado com ID:", resultado.id);
      return resultado.id;
    } else {
      throw new Error("Não foi possível criar o funcionário");
    }
  } catch (error) {
    console.error("Erro ao obter/criar funcionário:", error);
    throw error;
  }
}

// Limpar serviço
function limparServico() {
  console.log("Limpando serviço atual...");

  produtosServico = [];
  document.getElementById("produtos-fiado").innerHTML = "";
  document.getElementById("total-fiado").textContent = "Total: R$ 0,00";
  document.getElementById("loja-fiado").value = "";
  document.getElementById("data-servico").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("funcionario-fiado").value = "";

  console.log("Serviço limpo");
}

// Carregar contas a receber
async function carregarContasReceber() {
  try {
    console.log("Carregando contas a receber...");

    const lojas = await ApiService.getLojas();
    const servicos = await ApiService.getServicos();

    const tabela = document.getElementById("contasReceber");
    if (!tabela) return;

    tabela.innerHTML = "";

    // Agrupar serviços por loja
    const servicosPorLoja = {};
    servicos.forEach((servico) => {
      if (!servicosPorLoja[servico.loja_id]) {
        servicosPorLoja[servico.loja_id] = [];
      }
      servicosPorLoja[servico.loja_id].push(servico);
    });

    // Criar linhas para cada loja
    lojas.forEach((loja) => {
      const servicosLoja = servicosPorLoja[loja.id] || [];
      const totalFiado = servicosLoja.reduce(
        (total, servico) => total + servico.total,
        0
      );

      // Encontrar última venda
      const ultimaVenda =
        servicosLoja.length > 0
          ? servicosLoja.reduce((maisRecente, servico) => {
              return new Date(servico.data) > new Date(maisRecente.data)
                ? servico
                : maisRecente;
            })
          : null;

      const status =
        totalFiado > loja.limite_credito ? "Limite excedido" : "Em dia";
      const statusClass =
        totalFiado > loja.limite_credito ? "pending" : "completed";

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${loja.nome}</td>
                <td>${Utils.formatarMoeda(totalFiado)}</td>
                <td>${Utils.formatarData(ultimaVenda.data)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="verDetalhesLoja(${
                      loja.id
                    })">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </td>
            `;
      tabela.appendChild(tr);
    });

    if (lojas.length === 0) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="text-center">Nenhuma loja cadastrada</td></tr>';
    }

    console.log("Contas a receber carregadas");
  } catch (error) {
    console.error("Erro ao carregar contas a receber:", error);
    mostrarMensagem("Erro ao carregar contas a receber", "error");
  }
}

// Ver detalhes da loja
async function verDetalhesLoja(lojaId) {
  try {
    console.log(`Carregando detalhes da loja ${lojaId}`);

    const loja = lojasDisponiveis.find((l) => l.id === lojaId);
    const servicos = await ApiService.getServicos();
    const servicosLoja = servicos.filter((s) => s.loja_id === lojaId);

    const totalFiado = servicosLoja.reduce(
      (total, servico) => total + servico.total,
      0
    );

    // Criar modal de detalhes
    const modalHtml = `
            <div class="modal-overlay" id="modal-loja-${lojaId}" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div class="modal-content" style="
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    max-width: 800px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <div class="modal-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1.5rem;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 1rem;
                    ">
                        <h3 style="margin: 0;">Detalhes - ${loja.nome}</h3>
                        <button onclick="fecharModal('modal-loja-${lojaId}')" style="
                            background: none;
                            border: none;
                            font-size: 1.5rem;
                            cursor: pointer;
                            color: #666;
                        ">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="info-grid" style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 1rem;
                            margin-bottom: 2rem;
                        ">
                            <div class="info-card" style="
                                background: #f8f9fa;
                                padding: 1rem;
                                border-radius: 5px;
                            ">
                                <div style="font-size: 0.9rem; color: #666;">Limite de Crédito</div>
                                <div style="font-size: 1.5rem; font-weight: bold;">${Utils.formatarMoeda(
                                  loja.limite_credito
                                )}</div>
                            </div>
                            <div class="info-card" style="
                                background: #f8f9fa;
                                padding: 1rem;
                                border-radius: 5px;
                            ">
                                <div style="font-size: 0.9rem; color: #666;">Total em Fiado</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: ${
                                  totalFiado > loja.limite_credito
                                    ? "#dc3545"
                                    : "#28a745"
                                }">${Utils.formatarMoeda(totalFiado)}</div>
                            </div>
                        </div>
                        
                        <h4 style="margin-bottom: 1rem;">Histórico de Vendas Fiadas</h4>
                        <div class="table-container">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f8f9fa;">
                                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">Data</th>
                                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">Funcionário</th>
                                        <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">Valor</th>
                                        <th style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #eee;">Itens</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${
                                      servicosLoja.length > 0
                                        ? servicosLoja
                                            .map(
                                              (servico) => `
                                        <tr>
                                            <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${
                                              servico.data
                                            }</td>
                                            <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${
                                              servico.funcionario_nome
                                            }</td>
                                            <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">${Utils.formatarMoeda(
                                              servico.total
                                            )}</td>
                                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #eee;">${
                                              servico.itens
                                                ? servico.itens.length
                                                : 0
                                            }</td>
                                        </tr>
                                    `
                                            )
                                            .join("")
                                        : `
                                        <tr>
                                            <td colspan="4" style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #eee;">
                                                Nenhuma venda fiada registrada
                                            </td>
                                        </tr>
                                    `
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="modal-footer" style="
                        margin-top: 1.5rem;
                        border-top: 1px solid #eee;
                        padding-top: 1rem;
                        text-align: right;
                    ">
                        <button onclick="fecharModal('modal-loja-${lojaId}')" class="btn btn-primary">Fechar</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
  } catch (error) {
    console.error("Erro ao carregar detalhes da loja:", error);
    mostrarMensagem("Erro ao carregar detalhes da loja", "error");
  }
}

// Funções auxiliares
function formatarDataParaBr(dataIso) {
  const data = new Date(dataIso);
  return data.toLocaleDateString("pt-BR");
}

// Exportar planilha de lojas
function exportarPlanilhaLojas() {
  console.log("Exportando planilha de lojas...");
  // Implementação básica - pode ser expandida para gerar CSV/Excel
  mostrarMensagem("Funcionalidade de exportação em desenvolvimento", "info");
}

// Inicializar quando a aba de lojas for carregada
document.addEventListener("DOMContentLoaded", function () {
  // Aguardar um pouco para garantir que tudo esteja carregado
  setTimeout(() => {
    if (
      document.getElementById("lojas") &&
      document.getElementById("lojas").classList.contains("active")
    ) {
      inicializarServicos();
      carregarContasReceber();
    }
  }, 100);
});

// Também inicializar quando a aba for mostrada
const observerServicos = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      if (
        mutation.target.id === "lojas" &&
        mutation.target.classList.contains("active")
      ) {
        inicializarServicos();
        carregarContasReceber();
      }
    }
  });
});

if (document.getElementById("lojas")) {
  observerServicos.observe(document.getElementById("lojas"), {
    attributes: true,
    attributeFilter: ["class"],
  });
}

console.log("Módulo de serviços carregado e pronto");
