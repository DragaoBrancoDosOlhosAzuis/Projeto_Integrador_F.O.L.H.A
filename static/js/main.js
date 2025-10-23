// Gerenciamento principal da aplicação
class AppManager {
  constructor() {
    this.abas = {
      dashboard: "Dashboard",
      vendas: "Vendas",
      servicos: "Serviços",
      clientes: "Clientes",
      funcionarios: "Funcionários",
      produtos: "Produtos",
      lojas: "Lojas",
    };

    this.init();
  }

  async init() {
    // A ordem é importante: primeiro verifica a autenticação, depois carrega a aba
    this.verificarAutenticacao();
    this.configurarEventos();
    this.carregarAbaInicial();

    // Se estiver no dashboard (que não é uma página separada no Flask)
    if (this.estaNoDashboard()) {
      this.carregarDashboard();
    }
  }

  verificarAutenticacao() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
      // Não precisa de 'return' aqui, pois o redirecionamento interrompe a execução.
    }
  }

  // NOVA FUNÇÃO: Checa se o usuário está na página inicial (Dashboard)
  estaNoDashboard() {
    const caminho = window.location.pathname.toLowerCase();
    return (
      caminho === "/" ||
      caminho === "/index" ||
      caminho === "/dashboard" ||
      caminho === ""
    );
  }

  // CORREÇÃO CRÍTICA: Remove a lógica de prevenção e redirecionamento de links
  configurarEventos() {
    // Os links <a> nos elementos .nav-tab farão o redirecionamento padrão do navegador
    // Não precisamos de um event listener para navegação se vamos confiar no HTML (MPA)

    /* *** CÓDIGO ANTIGO REMOVIDO ***
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault(); // <--- ISTO CAUSAVA O PROBLEMA DE REDIRECIONAMENTO MANUAL
        // ... sua lógica de redirecionamento ...
      });
    });
    */

    // Configura o evento de Logout
    const btnSair = document.querySelector('[onclick="sair()"]');
    if (btnSair) {
      btnSair.addEventListener("click", () => this.sair());
    }
  }

  // Objetivo: Apenas ativar a aba correta no menu ao carregar a página
  carregarAbaInicial() {
    // Obtém o caminho da URL e remove a barra inicial
    let caminho = window.location.pathname.toLowerCase().substring(1);

    // Trata caminhos vazios, a raiz (/) ou subcaminhos
    const partes = caminho.split("/");
    const abaAtual = partes[0] || "dashboard";

    // Garante que a aba existe, senão usa dashboard
    const aba = this.abas[abaAtual] ? abaAtual : "dashboard";

    this.ativarAbaNoMenu(aba);
  }

  // NOVO MÉTODO: Apenas ativa o item de menu, não redireciona
  ativarAbaNoMenu(aba) {
    console.log(`Ativando menu para aba: ${aba}`);

    // 1. Remove 'active' de todos
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.remove("active");
    });

    // 2. Adiciona 'active' ao elemento correto
    // Se você estiver usando <a href="/vendas" class="nav-tab" onclick="mostrarAba('vendas')">...</a>
    // o seletor baseado no 'onclick' ainda funciona para identificar o item do menu.
    const tabSelecionada = document.querySelector(
      `[onclick*="mostrarAba('${aba}')"]`
    );
    if (tabSelecionada) {
      tabSelecionada.classList.add("active");
    }

    // Se o elemento .nav-tab for o <a>, você pode tentar:
    // const tabSelecionadaPelaURL = document.querySelector(`a[href^='/${aba}']`);
    // if (tabSelecionadaPelaURL) {
    //    tabSelecionadaPelaURL.classList.add("active");
    // }
  }

  // MANTIDO: Função mostrarAba agora é apenas um invólucro para Redirecionamento DIRETO
  // Esta função só é necessária se os elementos HTML ainda usarem 'onclick="mostrarAba(..)"'
  // e se você quiser que este clique force a navegação mesmo que o href não funcione.
  async mostrarAba(aba) {
    if (this.abas[aba]) {
      console.log(`Redirecionamento FORÇADO para aba: ${aba}`);
      const urlDestino = aba === "dashboard" ? "/" : `/${aba}`;

      // O redirecionamento é feito aqui.
      if (window.location.pathname.toLowerCase() !== urlDestino) {
        window.location.href = urlDestino;
      } else {
        // Apenas ativa o menu se for o caso de um subcaminho (/clientes/1)
        this.ativarAbaNoMenu(aba);
      }
    }
  }

  async carregarDashboard() {
    // Este método é carregado APENAS quando a página é a raiz (index.html),
    // pois as outras páginas serão carregadas pelo Flask (vendas.html, clientes.html, etc.)
    try {
      // CORREÇÃO: No modelo MPA, não é necessário esconder/mostrar conteúdo-dinamico
      // pois ele não deve existir em páginas como vendas.html, apenas no index.html.

      // ... (Lógica de fetch do dashboard) ...
      const response = await fetch("/api/dashboard/resumo");
      if (!response.ok) {
        throw new Error("Erro ao carregar dashboard");
      }
      const data = await response.json();

      const resumoDia = document.getElementById("resumoDia");
      if (resumoDia) {
        resumoDia.innerHTML = `
                      <p><strong>Vendas Hoje:</strong> ${
                        data.vendas_hoje.quantidade
                      } (R$ ${data.vendas_hoje.total.toFixed(2)})</p>
                      <p><strong>Serviços Hoje:</strong> ${
                        data.servicos_hoje.quantidade
                      } (R$ ${data.servicos_hoje.total.toFixed(2)})</p>
                      <p><strong>Total Geral:</strong> R$ ${data.total_geral.toFixed(
                        2
                      )}</p>
                  `;
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      const resumoDia = document.getElementById("resumoDia");
      if (resumoDia) {
        resumoDia.innerHTML = "<p>Erro ao carregar dados do dashboard</p>";
      }
    }
  }

  mostrarMensagem(mensagem, tipo) {
    alert(`${tipo.toUpperCase()}: ${mensagem}`);
  }

  sair() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("usuarioNome");
    window.location.href = "/login";
  }
}

// Funções globais (mantidas)
function mostrarAba(aba) {
  if (window.appManager) {
    window.appManager.mostrarAba(aba);
  }
}

function sair() {
  if (window.appManager) {
    window.appManager.sair();
  } else {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "/login";
  }
}

// Inicializar aplicação
document.addEventListener("DOMContentLoaded", () => {
  window.appManager = new AppManager();
});
