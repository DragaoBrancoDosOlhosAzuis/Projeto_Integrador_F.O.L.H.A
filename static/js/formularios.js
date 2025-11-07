// Gerenciamento de Formulários

// Funcionários
function limparFormularioFuncionario() {
    console.log('Limpando formulário de funcionário');
    document.getElementById('formFuncionario').reset();
    document.getElementById('funcionarioId').value = '';
    document.getElementById('btnSalvarFuncionario').innerHTML = '<i class="fas fa-save"></i> Cadastrar Funcionário';
    document.getElementById('dataEntrada').value = new Date().toISOString().split('T')[0];
    mostrarMensagem('Formulário limpo', 'info');
}

async function salvarFuncionario() {
    try {
        console.log('Iniciando salvamento de funcionário...');
        
        const form = document.getElementById('formFuncionario');
        const formData = new FormData(form);
        
        const funcionario = {
            nome: formData.get('nome'),
            data_entrada: formData.get('data_entrada'),
            cargo: formData.get('cargo'),
            salario: parseFloat(formData.get('salario') || 0),
            telefone: formData.get('telefone'),
            email: formData.get('email'),
            ativo: document.getElementById('ativo').checked
        };
        
        console.log('Dados do funcionário preparados:', funcionario);
        
        // Validação básica
        if (!funcionario.nome || !funcionario.data_entrada) {
            mostrarMensagem('Por favor, preencha o nome e data de entrada', 'error');
            return;
        }
        
        if (funcionario.email && !Utils.validarEmail(funcionario.email)) {
            mostrarMensagem('Por favor, insira um e-mail válido', 'error');
            return;
        }
        
        let resultado;
        const id = document.getElementById('funcionarioId').value;
        
        console.log(`ID do funcionário: ${id || 'Novo registro'}`);
        
        if (id) {
            console.log('Atualizando funcionário existente...');
            resultado = await ApiService.updateFuncionario(parseInt(id), funcionario);
        } else {
            console.log('Criando novo funcionário...');
            resultado = await ApiService.createFuncionario(funcionario);
        }
        
        console.log('Resposta da API:', resultado);
        
        if (resultado.success) {
            const mensagem = id ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!';
            mostrarMensagem(mensagem, 'success');
            limparFormularioFuncionario();
            await carregarFuncionarios();
        } else {
            throw new Error(resultado.message || 'Erro ao salvar funcionário');
        }
        
    } catch (error) {
        console.error('Erro detalhado ao salvar funcionário:', error);
        mostrarMensagem(error.message || 'Erro ao salvar funcionário', 'error');
    }
}

// Lojas
function limparFormularioLoja() {
    console.log('Limpando formulário de loja');
    document.getElementById('formLoja').reset();
    document.getElementById('lojaId').value = '';
    document.getElementById('btnSalvarLoja').innerHTML = '<i class="fas fa-save"></i> Cadastrar Loja';
    mostrarMensagem('Formulário limpo', 'info');
}

async function salvarLoja() {
    try {
        console.log('Iniciando salvamento de loja...');
        
        const form = document.getElementById('formLoja');
        const formData = new FormData(form);
        
        const loja = {
            nome: formData.get('nome'),
            telefone: formData.get('telefone'),
            responsavel: formData.get('responsavel'),
            endereco: formData.get('endereco'),
            limite_credito: parseFloat(formData.get('limite_credito') || 0)
        };
        
        console.log('Dados da loja preparados:', loja);
        
        if (!loja.nome) {
            mostrarMensagem('Por favor, preencha o nome da loja', 'error');
            return;
        }
        
        let resultado;
        const id = document.getElementById('lojaId').value;
        
        console.log(`ID da loja: ${id || 'Novo registro'}`);
        
        if (id) {
            console.log('Atualizando loja existente...');
            resultado = await ApiService.updateLoja(parseInt(id), loja);
        } else {
            console.log('Criando nova loja...');
            resultado = await ApiService.createLoja(loja);
        }
        
        console.log('Resposta da API:', resultado);
        
        if (resultado.success) {
            const mensagem = id ? 'Loja atualizada com sucesso!' : 'Loja cadastrada com sucesso!';
            mostrarMensagem(mensagem, 'success');
            limparFormularioLoja();
            await carregarLojas();
        } else {
            throw new Error(resultado.message || 'Erro ao salvar loja');
        }
        
    } catch (error) {
        console.error('Erro detalhado ao salvar loja:', error);
        mostrarMensagem(error.message || 'Erro ao salvar loja', 'error');
    }
}

// Produtos
function limparFormularioProduto() {
    console.log('Limpando formulário de produto');
    document.getElementById('formProduto').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('btnSalvarProduto').innerHTML = '<i class="fas fa-save"></i> Cadastrar Produto';
    mostrarMensagem('Formulário limpo', 'info');
}

async function salvarProduto() {
    try {
        console.log('Iniciando salvamento de produto...');
        
        const form = document.getElementById('formProduto');
        const formData = new FormData(form);
        
        const produto = {
            nome: formData.get('nome'),
            subcategoria: formData.get('subcategoria'),
            valor: parseFloat(formData.get('valor') || 0),
            ativo: document.getElementById('ativoProduto').checked
        };
        
        console.log('Dados do produto preparados:', produto);
        
        if (!produto.nome || !produto.valor) {
            mostrarMensagem('Por favor, preencha o nome e valor do produto', 'error');
            return;
        }
        
        if (produto.valor <= 0) {
            mostrarMensagem('O valor do produto deve ser maior que zero', 'error');
            return;
        }
        
        let resultado;
        const id = document.getElementById('produtoId').value;
        
        console.log(`ID do produto: ${id || 'Novo registro'}`);
        
        if (id) {
            console.log('Atualizando produto existente...');
            resultado = await ApiService.updateProduto(parseInt(id), produto);
        } else {
            console.log('Criando novo produto...');
            resultado = await ApiService.createProduto(produto);
        }
        
        console.log('Resposta da API:', resultado);
        
        if (resultado.success) {
            const mensagem = id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
            mostrarMensagem(mensagem, 'success');
            limparFormularioProduto();
            await carregarProdutos();
        } else {
            throw new Error(resultado.message || 'Erro ao salvar produto');
        }
        
    } catch (error) {
        console.error('Erro detalhado ao salvar produto:', error);
        mostrarMensagem(error.message || 'Erro ao salvar produto', 'error');
    }
}

// Inicialização dos formulários
function inicializarFormularios() {
    console.log('Inicializando formulários...');
    
    // Configurar data atual
    const hoje = new Date().toISOString().split('T')[0];
    const dataEntrada = document.getElementById('dataEntrada');
    if (dataEntrada && !dataEntrada.value) {
        dataEntrada.value = hoje;
    }
    
    const dataServico = document.getElementById('data-servico');
    if (dataServico && !dataServico.value) {
        dataServico.value = hoje;
    }
    
    // Configurar máscaras de telefone
    const inputsTelefone = document.querySelectorAll('input[type="tel"]');
    inputsTelefone.forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = Utils.aplicarMascaraTelefone(this.value);
        });
        
        // Aplicar máscara no valor inicial se existir
        if (input.value) {
            input.value = Utils.aplicarMascaraTelefone(input.value);
        }
    });
    
    // Configurar formatação automática de valores monetários
    const inputsValor = document.querySelectorAll('input[type="number"][step="0.01"]');
    inputsValor.forEach(input => {
        input.addEventListener('blur', function() {
            const valor = parseFloat(this.value);
            if (!isNaN(valor)) {
                this.value = valor.toFixed(2);
            }
        });
    });
    
    // Prevenir submit padrão dos formulários
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Submit do formulário prevenido:', form.id);
        });
    });
    
    // Configurar filtros de busca
    const buscarFuncionario = document.getElementById('buscarFuncionario');
    if (buscarFuncionario) {
        buscarFuncionario.addEventListener('input', filtrarFuncionarios);
    }
    
    const filtroCargo = document.getElementById('filtroCargo');
    if (filtroCargo) {
        filtroCargo.addEventListener('change', filtrarFuncionarios);
    }
    
    const buscarLoja = document.getElementById('buscarLoja');
    if (buscarLoja) {
        buscarLoja.addEventListener('input', filtrarLojas);
    }
    
    const buscarProduto = document.getElementById('buscarProduto');
    if (buscarProduto) {
        buscarProduto.addEventListener('input', filtrarProdutos);
    }
    
    const filtroCategoria = document.getElementById('filtroCategoria');
    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', filtrarProdutos);
    }
    
    console.log('Formulários inicializados com sucesso');
}

// Funções de filtro
function filtrarFuncionarios() {
    const termo = document.getElementById('buscarFuncionario').value.toLowerCase();
    const cargoFiltro = document.getElementById('filtroCargo').value;
    const linhas = document.querySelectorAll('#tabelaFuncionarios tr');
    
    linhas.forEach(linha => {
        if (linha.querySelector('td')) { // Ignora a linha de "Carregando..."
            const textoLinha = linha.textContent.toLowerCase();
            const cargoLinha = linha.cells[1]?.textContent || '';
            
            const correspondeTermo = textoLinha.includes(termo);
            const correspondeCargo = !cargoFiltro || cargoLinha === cargoFiltro;
            
            if (correspondeTermo && correspondeCargo) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        }
    });
}

function filtrarLojas() {
    const termo = document.getElementById('buscarLoja').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabelaLojas tr');
    
    linhas.forEach(linha => {
        if (linha.querySelector('td')) {
            const textoLinha = linha.textContent.toLowerCase();
            if (textoLinha.includes(termo)) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        }
    });
}

function filtrarProdutos() {
    const termo = document.getElementById('buscarProduto').value.toLowerCase();
    const categoriaFiltro = document.getElementById('filtroCategoria').value;
    const linhas = document.querySelectorAll('#tabelaProdutos tr');
    
    linhas.forEach(linha => {
        if (linha.querySelector('td')) {
            const textoLinha = linha.textContent.toLowerCase();
            const subcategoria = linha.cells[1]?.textContent || '';

            const correspondeTermo = textoLinha.includes(termo);
            const correspondeCategoria = 
                !categoriaFiltro ||
                (categoriaFiltro === "Outro" && subcategoria === "-") ||
                (categoriaFiltro !== "Outro" && subcategoria !== "-" && 
                 subcategoria.toLowerCase().includes(categoriaFiltro.toLowerCase()));

            if (correspondeTermo && correspondeCategoria) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        }
    });
}

// Configuração do método de pagamento para mostrar/ocultar parcelas
document.addEventListener('DOMContentLoaded', function() {
    const metodoPagamento = document.getElementById('metodo-pagamento');
    const parcelasGroup = document.getElementById('parcelas-group');
    
    if (metodoPagamento && parcelasGroup) {
        metodoPagamento.addEventListener('change', function() {
            if (this.value === 'credito') {
                parcelasGroup.style.display = 'block';
            } else {
                parcelasGroup.style.display = 'none';
            }
        });
    }
});

// Debug: verificar se as funções estão disponíveis
console.log('Formulários carregados - Funções disponíveis:');
console.log('- limparFormularioFuncionario');
console.log('- salvarFuncionario');
console.log('- limparFormularioLoja');
console.log('- salvarLoja');
console.log('- limparFormularioProduto');
console.log('- salvarProduto');
console.log('- inicializarFormularios');