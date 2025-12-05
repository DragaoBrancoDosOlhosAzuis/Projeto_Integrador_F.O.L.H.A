// Variáveis globais
let usuarioLogado = null;
let dadosCarregados = false;

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM carregado - inicializando sistema");
  verificarAutenticacao();
  inicializarSistema();
});

// Autenticação
async function verificarAutenticacao() {
  const usuario = localStorage.getItem("usuario");
  if (!usuario && !window.location.href.includes("/login")) {
    window.location.href = "/login";
    return;
  }

  if (usuario) {
    usuarioLogado = JSON.parse(usuario);
    atualizarInterfaceUsuario();
  }
}

function sair() {
  localStorage.removeItem("usuario");
  window.location.href = "/login";
}

// Navegação
function mostrarAba(abaNome) {
  console.log("Mostrando aba:", abaNome);

  // Esconder todas as abas
  document.querySelectorAll(".aba-conteudo").forEach((aba) => {
    aba.classList.remove("active");
  });

  // Remover classe active de todos os itens do menu
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Mostrar aba selecionada
  const abaAlvo = document.getElementById(abaNome);
  if (abaAlvo) {
    abaAlvo.classList.add("active");
  }

  // Ativar item do menu correspondente
  document.querySelectorAll(".nav-item").forEach((item) => {
    const span = item.querySelector("span");
    if (span && span.textContent.toLowerCase().includes(abaNome)) {
      item.classList.add("active");
    }
  });

  // Carregar dados específicos da aba
  carregarDadosAba(abaNome);
}

async function carregarDadosAba(abaNome) {
  try {
    console.log("Carregando dados para aba:", abaNome);
    switch (abaNome) {
      case "dashboard":
        await atualizarDashboard();
        await carregarVendasRecentes();
        break;
      case "funcionarios":
        await carregarFuncionarios();
        break;
      case "lojas":
        await carregarLojas();
        break;
      case "produtos":
        await carregarProdutos();
        break;
      case "vendas":
        await carregarVendas();
        break;
    }
  } catch (error) {
    console.error(`Erro ao carregar dados da aba ${abaNome}:`, error);
    mostrarMensagem(`Erro ao carregar dados: ${error.message}`, "error");
  }
}

// Dashboard
async function atualizarDashboard() {
  try {
    const resumo = await ApiService.getDashboardResumo();

    if (document.getElementById("totalVendas")) {
      document.getElementById("totalVendas").textContent = Utils.formatarMoeda(
        resumo.vendas_hoje.total
      );
    }

    if (document.getElementById("totalFiado")) {
      document.getElementById("totalFiado").textContent = Utils.formatarMoeda(
        resumo.servicos_hoje.total
      );
    }

    if (document.getElementById("totalProdutos")) {
      document.getElementById("totalProdutos").textContent =
        resumo.vendas_hoje.quantidade + resumo.servicos_hoje.quantidade;
    }
  } catch (error) {
    console.error("Erro ao atualizar dashboard:", error);
  }
}

// Funcionários
async function carregarFuncionarios() {
  try {
    const funcionarios = await ApiService.getFuncionarios();
    const tabela = document.getElementById("tabelaFuncionarios");

    if (tabela) {
      tabela.innerHTML = "";

      funcionarios.forEach((funcionario) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${funcionario.nome}</td>
                    <td>${funcionario.cargo}</td>
                    <td>${Utils.formatarData(funcionario.data_entrada)}</td>
                    <td>${Utils.formatarMoeda(funcionario.salario)}</td>
                    <td>${funcionario.telefone || "-"}</td>
                    <td><span class="status ${
                      funcionario.ativo ? "completed" : "pending"
                    }">${funcionario.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editarFuncionario(${
                          funcionario.id
                        })">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="excluirFuncionario(${
                          funcionario.id
                        })" style="margin-left: 0.25rem;">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </td>
                `;
        tabela.appendChild(tr);
      });
    }

    // Atualizar estatísticas
    const totalAtivos = funcionarios.filter((f) => f.ativo).length;
    const totalVendedores = funcionarios.filter(
      (f) => f.cargo === "Vendedor" && f.ativo
    ).length;
    const totalAdministrativos = funcionarios.filter(
      (f) => f.cargo === "Administrativo" && f.ativo
    ).length;

    if (document.getElementById("totalFuncionarios")) {
      document.getElementById("totalFuncionarios").textContent = totalAtivos;
    }
    if (document.getElementById("totalVendedores")) {
      document.getElementById("totalVendedores").textContent = totalVendedores;
    }
    if (document.getElementById("totalAdministrativos")) {
      document.getElementById("totalAdministrativos").textContent =
        totalAdministrativos;
    }
  } catch (error) {
    console.error("Erro ao carregar funcionários:", error);
    mostrarMensagem("Erro ao carregar lista de funcionários", "error");
  }
}

// Lojas
async function carregarLojas() {
  try {
    const lojas = await ApiService.getLojas();
    const servicos = await ApiService.getServicos();
    const tabela = document.getElementById("tabelaLojas");

    if (tabela) {
      tabela.innerHTML = "";

      lojas.forEach((loja) => {
        // Calcular total em fiado para esta loja
        const totalFiado = servicos
          .filter((s) => s.loja_id === loja.id)
          .reduce((total, servico) => total + servico.total, 0);

        const status =
          totalFiado > loja.limite_credito ? "Limite excedido" : "Em dia";
        const statusClass =
          totalFiado > loja.limite_credito ? "pending" : "completed";

        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${loja.nome}</td>
                    <td>${loja.telefone || "-"}</td>
                    <td>${loja.responsavel || "-"}</td>
                    <td>${Utils.formatarMoeda(loja.limite_credito)}</td>
                    <td>${Utils.formatarMoeda(totalFiado)}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editarLoja(${
                          loja.id
                        })">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="excluirLoja(${
                          loja.id
                        })" style="margin-left: 0.25rem;">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </td>
                `;
        tabela.appendChild(tr);
      });
    }

    // Atualizar estatísticas
    const totalFiadoGeral = servicos.reduce(
      (total, servico) => total + servico.total,
      0
    );

    if (document.getElementById("totalLojas")) {
      document.getElementById("totalLojas").textContent = lojas.length;
    }
    if (document.getElementById("totalFiadoGeral")) {
      document.getElementById("totalFiadoGeral").textContent =
        Utils.formatarMoeda(totalFiadoGeral);
    }
  } catch (error) {
    console.error("Erro ao carregar lojas:", error);
    mostrarMensagem("Erro ao carregar lista de lojas", "error");
  }
}

// Produtos
async function carregarProdutos() {
  try {
    const produtos = await ApiService.getProdutos();
    const tabela = document.getElementById("tabelaProdutos");

    if (tabela) {
      tabela.innerHTML = "";

      produtos.forEach((produto) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>${produto.subcategoria || "-"}</td>
                    <td>${Utils.formatarMoeda(produto.valor)}</td>
                    <td><span class="status ${
                      produto.ativo ? "completed" : "pending"
                    }">${produto.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editarProduto(${
                          produto.id
                        })">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="excluirProduto(${
                          produto.id
                        })" style="margin-left: 0.25rem;">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </td>
                `;
        tabela.appendChild(tr);
      });
    }

    // Atualizar estatísticas
    const totalAtivos = produtos.filter((p) => p.ativo).length;

    if (document.getElementById("totalProdutosCadastrados")) {
      document.getElementById("totalProdutosCadastrados").textContent =
        produtos.length;
    }
    if (document.getElementById("totalProdutosAtivos")) {
      document.getElementById("totalProdutosAtivos").textContent = totalAtivos;
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    mostrarMensagem("Erro ao carregar lista de produtos", "error");
  }
}

// Vendas
async function carregarVendas() {
  try {
    const vendas = await ApiService.getVendas();
    const tabela = document.getElementById("tabela-vendas");

    if (tabela) {
      const tbody = tabela.querySelector("tbody");
      tbody.innerHTML = "";

      vendas.forEach((venda) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>#${venda.id.toString().padStart(5, "0")}</td>
                    <td>${venda.data}</td>
                    <td>${Utils.formatarMoeda(venda.total)}</td>
                    <td>${venda.vendedor_nome}</td>
                    <td>${venda.metodo_pagamento}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="verDetalhesVenda(${
                          venda.id
                        })">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </td>
                `;
        tbody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar vendas:", error);
    mostrarMensagem("Erro ao carregar histórico de vendas", "error");
  }
}

// Funções de edição
async function editarFuncionario(id) {
  try {
    const funcionarios = await ApiService.getFuncionarios();
    const funcionario = funcionarios.find((f) => f.id === id);

    if (funcionario) {
      document.getElementById("funcionarioId").value = funcionario.id;
      document.getElementById("nomeFuncionario").value = funcionario.nome;
      document.getElementById("dataEntrada").value = funcionario.data_entrada;
      document.getElementById("cargo").value = funcionario.cargo;
      document.getElementById("salario").value = funcionario.salario;
      document.getElementById("telefoneFuncionario").value =
        funcionario.telefone || "";
      document.getElementById("email").value = funcionario.email || "";
      document.getElementById("ativo").checked = funcionario.ativo;

      document.getElementById("btnSalvarFuncionario").innerHTML =
        '<i class="fas fa-save"></i> Atualizar Funcionário';

      // Scroll para o formulário
      document.querySelector(".card").scrollIntoView({ behavior: "smooth" });

      mostrarMensagem("Funcionário carregado para edição", "info");
    }
  } catch (error) {
    console.error("Erro ao carregar funcionário para edição:", error);
    mostrarMensagem("Erro ao carregar dados do funcionário", "error");
  }
}

async function editarLoja(id) {
  try {
    const lojas = await ApiService.getLojas();
    const loja = lojas.find((l) => l.id === id);

    if (loja) {
      document.getElementById("lojaId").value = loja.id;
      document.getElementById("nomeLoja").value = loja.nome;
      document.getElementById("telefoneLoja").value = loja.telefone || "";
      document.getElementById("responsavel").value = loja.responsavel || "";
      document.getElementById("enderecoLoja").value = loja.endereco || "";
      document.getElementById("limiteCredito").value = loja.limite_credito;

      document.getElementById("btnSalvarLoja").innerHTML =
        '<i class="fas fa-save"></i> Atualizar Loja';

      document.querySelector(".card").scrollIntoView({ behavior: "smooth" });

      mostrarMensagem("Loja carregada para edição", "info");
    }
  } catch (error) {
    console.error("Erro ao carregar loja para edição:", error);
    mostrarMensagem("Erro ao carregar dados da loja", "error");
  }
}

async function editarProduto(id) {
  try {
    const produtos = await ApiService.getProdutos();
    const produto = produtos.find((p) => p.id === id);

    if (produto) {
      document.getElementById("produtoId").value = produto.id;
      document.getElementById("nomeProduto").value = produto.nome;
      document.getElementById("subcategoria").value =
        produto.subcategoria || "";
      document.getElementById("valor").value = produto.valor;
      document.getElementById("ativoProduto").checked = produto.ativo;

      document.getElementById("btnSalvarProduto").innerHTML =
        '<i class="fas fa-save"></i> Atualizar Produto';

      document.querySelector(".card").scrollIntoView({ behavior: "smooth" });

      mostrarMensagem("Produto carregado para edição", "info");
    }
  } catch (error) {
    console.error("Erro ao carregar produto para edição:", error);
    mostrarMensagem("Erro ao carregar dados do produto", "error");
  }
}

// Funções de exclusão
async function excluirFuncionario(id) {
  if (confirm("Tem certeza que deseja excluir este funcionário?")) {
    try {
      const resultado = await ApiService.deleteFuncionario(id);
      if (resultado.success) {
        mostrarMensagem("Funcionário excluído com sucesso!", "success");
        await carregarFuncionarios();
      } else {
        throw new Error(resultado.message || "Erro ao excluir funcionário");
      }
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      mostrarMensagem(error.message || "Erro ao excluir funcionário", "error");
    }
  }
}

async function excluirLoja(id) {
  if (confirm("Tem certeza que deseja excluir esta loja?")) {
    try {
      const resultado = await ApiService.deleteLoja(id);
      if (resultado.success) {
        mostrarMensagem("Loja excluída com sucesso!", "success");
        await carregarLojas();
      } else {
        throw new Error(resultado.message || "Erro ao excluir loja");
      }
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      mostrarMensagem(error.message || "Erro ao excluir loja", "error");
    }
  }
}

async function excluirProduto(id) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    try {
      const resultado = await ApiService.deleteProduto(id);
      if (resultado.success) {
        mostrarMensagem("Produto excluído com sucesso!", "success");
        await carregarProdutos();
      } else {
        throw new Error(resultado.message || "Erro ao excluir produto");
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      mostrarMensagem(error.message || "Erro ao excluir produto", "error");
    }
  }
}

// Utilitários
function mostrarMensagem(mensagem, tipo = "info") {
  // Criar ou reutilizar container de mensagens
  let container = document.getElementById("mensagens");
  if (!container) {
    container = document.createElement("div");
    container.id = "mensagens";
    container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
    document.body.appendChild(container);
  }

  const mensagemDiv = document.createElement("div");
  mensagemDiv.style.cssText = `
        padding: 1rem;
        margin-bottom: 0.5rem;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;

  const cores = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  mensagemDiv.style.backgroundColor = cores[tipo] || cores.info;
  mensagemDiv.textContent = mensagem;

  container.appendChild(mensagemDiv);

  // Remover após 5 segundos
  setTimeout(() => {
    if (mensagemDiv.parentNode) {
      mensagemDiv.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => mensagemDiv.remove(), 300);
    }
  }, 5000);
}

function inicializarSistema() {
  console.log("Inicializando sistema...");

  // Configurar menu toggle
  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });
  }

  // Configurar data atual nos campos de data
  const hoje = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.value && input.id !== "dataEntrada") {
      input.value = hoje;
    }
  });

  // Inicializar formulários
  inicializarFormularios();

  // Carregar dados iniciais
  carregarDadosIniciais();

  console.log("Sistema inicializado com sucesso");
}

async function carregarDadosIniciais() {
  try {
    console.log("Carregando dados iniciais...");
    await atualizarDashboard();
    console.log("Dados iniciais carregados");
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
  }
}

async function exportarPlanilha() {
  try {
    const response = await fetch("/api/vendas/dados_exportacao");
    if (!response.ok) {
      throw new Error(`Erro ao carregar os dados: ${response.statusText}`);
    }
    const dadosVendas = await response.json();

    const filename = "vendas";

    const vendasArray = Object.values(dadosVendas["_default"] || {}).filter(
      (item) => item && typeof item === "object"
    );

    if (vendasArray.length === 0) {
      alert("Não há dados de vendas para exportar.");
      return;
    }

    const headers = Object.keys(vendasArray[0]);

    const headerRow = headers.join(";");

    const bodyRows = vendasArray
      .map((obj) =>
        headers
          .map((header) => {
            let value = obj[header];

            if (value === null || value === undefined) {
              value = "";
            }

            let stringValue = String(value);
            if (stringValue.includes(";") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
          })
          .join(";")
      )
      .join("\n");

    const csvContent = headerRow + "\n" + bodyRows;

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename + ".csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(
        "Seu navegador não suporta downloads automáticos. Por favor, copie o conteúdo e salve em um arquivo .csv."
      );
    }
  } catch (error) {
    console.error("Erro na exportação de planilha:", error);
    alert("Não foi possível carregar os dados de vendas para exportação.");
  }
}
function verDetalhesVenda(id) {
  mostrarMensagem(`Visualizando venda #${id}`, "info");
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar módulos quando as abas são carregadas
document.addEventListener("DOMContentLoaded", function () {
  // Observar mudanças nas abas para inicializar módulos específicos
  const abas = ["vendas", "lojas"];

  abas.forEach((abaId) => {
    const aba = document.getElementById(abaId);
    if (aba) {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            if (aba.classList.contains("active")) {
              switch (abaId) {
                case "vendas":
                  if (typeof inicializarVendas === "function") {
                    inicializarVendas();
                  }
                  break;
                case "lojas":
                  if (typeof inicializarServicos === "function") {
                    inicializarServicos();
                    if (typeof carregarContasReceber === "function") {
                      carregarContasReceber();
                    }
                  }
                  break;
              }
            }
          }
        });
      });

      observer.observe(aba, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  });
});
