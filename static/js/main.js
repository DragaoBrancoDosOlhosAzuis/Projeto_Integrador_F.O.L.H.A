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

    this.abaAtual = "dashboard";
    this.init();
  }

  async init() {
    this.configurarEventos();
    this.verificarAutenticacao();
    await this.carregarConteudo("dashboard");
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

    // Carregar conteúdo inicial baseado na URL
    window.addEventListener("load", () => {
      const urlParams = new URLSearchParams(window.location.search);
      const aba = urlParams.get("aba") || "dashboard";
      this.mostrarAba(aba);
    });
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

      // Carregar conteúdo
      await this.carregarConteudo(aba);
      this.abaAtual = aba;

      // Atualizar URL
      window.history.pushState({}, "", `?aba=${aba}`);
    }
  }

  async carregarConteudo(aba) {
    try {
      console.log(`Carregando conteúdo da aba: ${aba}`);

      // Esconder todos os conteúdos
      document.querySelectorAll(".aba-conteudo").forEach((el) => {
        el.classList.add("hidden");
      });

      if (aba === "dashboard") {
        document.getElementById("dashboard").classList.remove("hidden");
        await this.carregarDashboard();
      } else {
        // Carregar conteúdo da aba
        const response = await fetch(`/templates/${aba}.html`);
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        const html = await response.text();

        document.getElementById("conteudo-dinamico").innerHTML = html;

        // Carregar script específico da aba
        await this.carregarScript(aba);
      }
    } catch (error) {
      console.error(`Erro ao carregar aba ${aba}:`, error);
      this.mostrarMensagem(`Erro ao carregar ${this.abas[aba]}`, "error");

      // Mostrar conteúdo de erro para debugging
      document.getElementById("conteudo-dinamico").innerHTML = `
                <div class="card">
                    <h3>Erro ao carregar ${this.abas[aba]}</h3>
                    <p>Detalhes do erro: ${error.message}</p>
                    <p>Verifique se o servidor está rodando.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Recarregar</button>
                </div>
            `;
    }
  }

  async carregarScript(aba) {
    return new Promise((resolve) => {
      // Remover script anterior se existir
      const scriptAntigo = document.getElementById(`script-${aba}`);
      if (scriptAntigo) {
        scriptAntigo.remove();
      }

      // Adicionar novo script
      const script = document.createElement("script");
      script.id = `script-${aba}`;
      script.src = `../static/js/${aba}.js`;
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    });
  }

  async carregarDashboard() {
    try {
      const response = await fetch("/api/dashboard/resumo");
      if (!response.ok) {
        throw new Error("Erro ao carregar dashboard");
      }
      const data = await response.json();

      document.getElementById("resumoDia").innerHTML = `
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
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      document.getElementById("resumoDia").innerHTML =
        "<p>Erro ao carregar dados do dashboard</p>";
    }
  }

  mostrarMensagem(mensagem, tipo) {
    // Remover mensagens anteriores
    document.querySelectorAll(".alert").forEach((el) => el.remove());

    const div = document.createElement("div");
    div.className = `alert alert-${tipo}`;
    div.textContent = mensagem;
    div.style.margin = "10px";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";

    if (tipo === "error") {
      div.style.backgroundColor = "#f8d7da";
      div.style.color = "#721c24";
      div.style.border = "1px solid #f5c6cb";
    } else {
      div.style.backgroundColor = "#d4edda";
      div.style.color = "#155724";
      div.style.border = "1px solid #c3e6cb";
    }

    const container = document.querySelector(".container");
    if (container) {
      container.insertBefore(div, container.firstChild);

      setTimeout(() => {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
      }, 5000);
    }
  }

  sair() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("usuarioNome");
    window.location.href = "/login";
  }
}

// Funções globais para uso nos templates
function mostrarAba(aba) {
  if (window.appManager) {
    window.appManager.mostrarAba(aba);
  } else {
    console.error("AppManager não inicializado");
    window.location.href = `/${aba}`;
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

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  window.appManager = new AppManager();
});
