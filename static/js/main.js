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
    this.configurarEventos();
    this.verificarAutenticacao();
    this.carregarAbaInicial();
  }

  verificarAutenticacao() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
      return;
    }
  }

  configurarEventos() {
    // Eventos de navegação
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const aba = e.target
          .getAttribute("onclick")
          .replace("mostrarAba('", "")
          .replace("')", "");
        this.mostrarAba(aba);
      });
    });

    // Logout
    const btnSair = document.querySelector('[onclick="sair()"]');
    if (btnSair) {
      btnSair.addEventListener("click", () => this.sair());
    }
  }

  carregarAbaInicial() {
    const urlParams = new URLSearchParams(window.location.search);
    const aba = urlParams.get("aba") || "dashboard";
    this.mostrarAba(aba);
  }

  async mostrarAba(aba) {
    if (this.abas[aba]) {
      console.log(`Mudando para aba: ${aba}`);

      // Ativar tab selecionada
      document.querySelectorAll(".nav-tab").forEach((tab) => {
        tab.classList.remove("active");
      });

      const tabSelecionada = document.querySelector(
        `[onclick="mostrarAba('${aba}')"]`
      );
      if (tabSelecionada) {
        tabSelecionada.classList.add("active");
      }

      // Para o dashboard, carregar localmente
      if (aba === "dashboard") {
        this.carregarDashboard();
      } else {
        // Para outras abas, redirecionar para a página específica
        window.location.href = `/${aba}?aba=${aba}`;
      }
    }
  }

  async carregarDashboard() {
    try {
      // Esconder conteúdo dinâmico e mostrar dashboard
      const conteudoDinamico = document.getElementById("conteudo-dinamico");
      if (conteudoDinamico) {
        conteudoDinamico.classList.add("hidden");
      }

      const dashboard = document.getElementById("dashboard");
      if (dashboard) {
        dashboard.classList.remove("hidden");
      }

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
    // Implementação simplificada da mensagem
    alert(`${tipo.toUpperCase()}: ${mensagem}`);
  }

  sair() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("usuarioNome");
    window.location.href = "/login";
  }
}

// Funções globais
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
