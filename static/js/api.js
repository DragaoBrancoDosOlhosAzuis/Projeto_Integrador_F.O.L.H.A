// API Service - Comunicação com o backend
class ApiService {
    static baseUrl = '/api';

    // Autenticação
    static async login(usuario, senha) {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, senha })
        });
        return await response.json();
    }

    // Funcionários
    static async getFuncionarios(ativos = false) {
        const url = ativos ? `${this.baseUrl}/funcionarios?ativos=true` : `${this.baseUrl}/funcionarios`;
        const response = await fetch(url);
        return await response.json();
    }

    static async createFuncionario(funcionario) {
        console.log('Enviando dados do funcionário:', funcionario);
        const response = await fetch(`${this.baseUrl}/funcionarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(funcionario)
        });
        return await response.json();
    }

    static async updateFuncionario(id, funcionario) {
        const response = await fetch(`${this.baseUrl}/funcionarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(funcionario)
        });
        return await response.json();
    }

    static async deleteFuncionario(id) {
        const response = await fetch(`${this.baseUrl}/funcionarios/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    // Lojas
    static async getLojas() {
        const response = await fetch(`${this.baseUrl}/lojas`);
        return await response.json();
    }

    static async createLoja(loja) {
        console.log('Enviando dados da loja:', loja);
        const response = await fetch(`${this.baseUrl}/lojas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loja)
        });
        return await response.json();
    }

    static async updateLoja(id, loja) {
        const response = await fetch(`${this.baseUrl}/lojas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loja)
        });
        return await response.json();
    }

    static async deleteLoja(id) {
        const response = await fetch(`${this.baseUrl}/lojas/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    // Produtos
    static async getProdutos(ativos = false) {
        const url = ativos ? `${this.baseUrl}/produtos?ativos=true` : `${this.baseUrl}/produtos`;
        const response = await fetch(url);
        return await response.json();
    }

    static async createProduto(produto) {
        console.log('Enviando dados do produto:', produto);
        const response = await fetch(`${this.baseUrl}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produto)
        });
        return await response.json();
    }

    static async updateProduto(id, produto) {
        const response = await fetch(`${this.baseUrl}/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produto)
        });
        return await response.json();
    }

    static async deleteProduto(id) {
        const response = await fetch(`${this.baseUrl}/produtos/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    // Vendas
    static async getVendas() {
        const response = await fetch(`${this.baseUrl}/vendas`);
        return await response.json();
    }

    static async createVenda(venda) {
        const response = await fetch(`${this.baseUrl}/vendas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(venda)
        });
        return await response.json();
    }

    static async getVenda(id) {
        const response = await fetch(`${this.baseUrl}/vendas/${id}`);
        return await response.json();
    }

    // Serviços
    static async getServicos() {
        const response = await fetch(`${this.baseUrl}/servicos`);
        return await response.json();
    }

    static async createServico(servico) {
        const response = await fetch(`${this.baseUrl}/servicos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(servico)
        });
        return await response.json();
    }

    // Dashboard
    static async getDashboardResumo() {
        const response = await fetch(`${this.baseUrl}/dashboard/resumo`);
        return await response.json();
    }

    // Debug
    static async debugTables() {
        const response = await fetch(`${this.baseUrl}/debug/tables`);
        return await response.json();
    }

    static async testPost(data) {
        const response = await fetch(`${this.baseUrl}/debug/test-post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}

// Utilitários
class Utils {
    static formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    static formatarData(data) {
        if (!data) return '-';
        try {
            // Tenta converter de YYYY-MM-DD para DD/MM/YYYY
            if (data.includes('-')) {
                const [ano, mes, dia] = data.split('-');
                return `${dia}/${mes}/${ano}`;
            }
            return data;
        } catch (error) {
            return data;
        }
    }

    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static aplicarMascaraTelefone(telefone) {
        const numeros = telefone.replace(/\D/g, '');
        if (numeros.length === 11) {
            return numeros.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numeros.length === 10) {
            return numeros.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    }

    static gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}