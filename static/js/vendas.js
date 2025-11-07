// Gerenciamento de Vendas
let produtosVenda = [];
let produtosDisponiveis = [];

// Inicialização do módulo de vendas
function inicializarVendas() {
    console.log('Inicializando módulo de vendas...');
    carregarDadosVendas();
    configurarEventosVendas();
}

// Carregar dados para vendas
async function carregarDadosVendas() {
    try {
        console.log('Carregando dados para vendas...');
        
        // Carregar produtos ativos
        produtosDisponiveis = await ApiService.getProdutos(true);
        console.log('Produtos carregados:', produtosDisponiveis);
        
        // Carregar funcionários ativos
        const funcionarios = await ApiService.getFuncionarios(true);
        console.log('Funcionários carregados:', funcionarios);
        
        // Popular select de vendedores
        const selectVendedor = document.getElementById('vendedor');
        if (selectVendedor) {
            selectVendedor.innerHTML = '<option value="">Selecione o vendedor</option>';
            funcionarios.forEach(funcionario => {
                const option = document.createElement('option');
                option.value = funcionario.id;
                option.textContent = funcionario.nome;
                selectVendedor.appendChild(option);
            });
        }
        
        // Popular select de produtos
        atualizarSelectProdutos();
        
        console.log('Dados de vendas carregados com sucesso');
        
    } catch (error) {
        console.error('Erro ao carregar dados para vendas:', error);
        mostrarMensagem('Erro ao carregar dados para vendas', 'error');
    }
}

// Atualizar select de produtos
function atualizarSelectProdutos() {
    const selectProduto = document.getElementById('produto-venda-select');
    if (selectProduto && produtosDisponiveis.length > 0) {
        selectProduto.innerHTML = '<option value="">Selecione o produto</option>';
        produtosDisponiveis.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} - ${Utils.formatarMoeda(produto.valor)}`;
            selectProduto.appendChild(option);
        });
    }
}

// Configurar eventos do módulo de vendas
function configurarEventosVendas() {
    console.log('Configurando eventos de vendas...');
    
    // Evento para método de pagamento
    const metodoPagamento = document.getElementById('metodo-pagamento');
    const parcelasGroup = document.getElementById('parcelas-group');
    
    if (metodoPagamento && parcelasGroup) {
        metodoPagamento.addEventListener('change', function() {
            if (this.value === 'credito') {
                parcelasGroup.style.display = 'block';
            } else {
                parcelasGroup.style.display = 'none';
                document.getElementById('parcelas').value = '1';
            }
        });
    }
    
    // Evento para filtrar vendas
    const filtroVendas = document.getElementById('filtro-vendas');
    if (filtroVendas) {
        filtroVendas.addEventListener('change', filtrarVendas);
    }
    
    console.log('Eventos de vendas configurados');
}

// Adicionar produto à venda
function adicionarProduto() {
    console.log('Adicionando produto à venda...');
    
    const produtosContainer = document.getElementById('produtos-venda');
    const index = produtosVenda.length;
    
    const produtoHtml = `
        <div class="produto-item-venda" data-index="${index}">
            <div class="form-row">
                <div class="form-group">
                    <select class="form-control produto-select" onchange="selecionarProdutoVenda(${index}, this.value)" required>
                        <option value="">Selecione o produto</option>
                        ${produtosDisponiveis.map(produto => 
                            `<option value="${produto.id}">${produto.nome} - ${Utils.formatarMoeda(produto.valor)}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control quantidade" placeholder="Qtd" min="1" value="1" 
                           onchange="atualizarSubtotalVenda(${index})" oninput="atualizarSubtotalVenda(${index})">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control valor-unitario" placeholder="R$ 0,00" readonly>
                </div>
                <div class="form-group">
                    <input type="text" class="form-control subtotal" placeholder="R$ 0,00" readonly>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removerProdutoVenda(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    produtosContainer.insertAdjacentHTML('beforeend', produtoHtml);
    produtosVenda.push({ 
        produto_id: null, 
        quantidade: 1, 
        valor_unitario: 0, 
        subtotal: 0,
        produto_nome: ''
    });
    
    console.log('Produto adicionado à venda. Total:', produtosVenda.length);
}

// Selecionar produto na venda
function selecionarProdutoVenda(index, produtoId) {
    console.log(`Selecionando produto ${produtoId} no índice ${index}`);
    
    if (!produtoId) return;
    
    const produto = produtosDisponiveis.find(p => p.id == produtoId);
    if (produto) {
        produtosVenda[index].produto_id = produto.id;
        produtosVenda[index].valor_unitario = produto.valor;
        produtosVenda[index].produto_nome = produto.nome;
        
        const itemElement = document.querySelector(`.produto-item-venda[data-index="${index}"]`);
        itemElement.querySelector('.valor-unitario').value = Utils.formatarMoeda(produto.valor);
        
        atualizarSubtotalVenda(index);
        
        console.log(`Produto "${produto.nome}" selecionado`);
    }
}

// Atualizar subtotal do item
function atualizarSubtotalVenda(index) {
    const itemElement = document.querySelector(`.produto-item-venda[data-index="${index}"]`);
    const quantidade = parseInt(itemElement.querySelector('.quantidade').value) || 0;
    
    produtosVenda[index].quantidade = quantidade;
    produtosVenda[index].subtotal = produtosVenda[index].valor_unitario * quantidade;
    
    itemElement.querySelector('.subtotal').value = Utils.formatarMoeda(produtosVenda[index].subtotal);
    
    calcularTotalVenda();
    
    console.log(`Subtotal atualizado: ${Utils.formatarMoeda(produtosVenda[index].subtotal)}`);
}

// Remover produto da venda
function removerProdutoVenda(index) {
    console.log(`Removendo produto do índice ${index}`);
    
    produtosVenda.splice(index, 1);
    document.querySelector(`.produto-item-venda[data-index="${index}"]`).remove();
    
    // Reindexar elementos restantes
    document.querySelectorAll('.produto-item-venda').forEach((item, newIndex) => {
        item.setAttribute('data-index', newIndex);
        item.querySelector('.produto-select').setAttribute('onchange', `selecionarProdutoVenda(${newIndex}, this.value)`);
        item.querySelector('.quantidade').setAttribute('onchange', `atualizarSubtotalVenda(${newIndex})`);
        item.querySelector('.quantidade').setAttribute('oninput', `atualizarSubtotalVenda(${newIndex})`);
        item.querySelector('button').setAttribute('onclick', `removerProdutoVenda(${newIndex})`);
    });
    
    calcularTotalVenda();
    
    console.log('Produto removido. Total restante:', produtosVenda.length);
}

// Calcular total da venda
function calcularTotalVenda() {
    const total = produtosVenda.reduce((sum, item) => sum + item.subtotal, 0);
    document.getElementById('total-venda').textContent = `Total: ${Utils.formatarMoeda(total)}`;
    
    console.log('Total da venda calculado:', Utils.formatarMoeda(total));
}

// Confirmar venda
async function confirmarVenda() {
    try {
        console.log('Confirmando venda...');
        
        const vendedorId = document.getElementById('vendedor').value;
        const metodoPagamento = document.getElementById('metodo-pagamento').value;
        const parcelas = document.getElementById('parcelas').value || 1;
        
        console.log('Dados da venda:', { vendedorId, metodoPagamento, parcelas, produtos: produtosVenda });
        
        // Validações
        if (!vendedorId) {
            mostrarMensagem('Selecione um vendedor!', 'error');
            return;
        }
        
        if (produtosVenda.length === 0) {
            mostrarMensagem('Adicione pelo menos um produto à venda!', 'error');
            return;
        }
        
        // Verificar se todos os produtos foram selecionados corretamente
        const produtosInvalidos = produtosVenda.filter(item => !item.produto_id || item.quantidade <= 0);
        if (produtosInvalidos.length > 0) {
            mostrarMensagem('Verifique os produtos adicionados. Todos devem ter quantidade válida.', 'error');
            return;
        }
        
        const total = produtosVenda.reduce((sum, item) => sum + item.subtotal, 0);
        
        const vendaData = {
            vendedor_id: parseInt(vendedorId),
            metodo_pagamento: metodoPagamento,
            parcelas: parseInt(parcelas),
            itens: produtosVenda.map(item => ({
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                valor_unitario: item.valor_unitario,
                subtotal: item.subtotal
            })),
            total: total
        };
        
        console.log('Enviando dados da venda:', vendaData);
        
        const resultado = await ApiService.createVenda(vendaData);
        
        if (resultado.success) {
            mostrarMensagem('Venda registrada com sucesso!', 'success');
            limparVenda();
            await carregarVendas(); // Recarregar histórico
        } else {
            throw new Error(resultado.message || 'Erro ao registrar venda');
        }
        
    } catch (error) {
        console.error('Erro ao confirmar venda:', error);
        mostrarMensagem(error.message || 'Erro ao registrar venda', 'error');
    }
}

// Limpar venda
function limparVenda() {
    console.log('Limpando venda atual...');
    
    produtosVenda = [];
    document.getElementById('produtos-venda').innerHTML = '';
    document.getElementById('total-venda').textContent = 'Total: R$ 0,00';
    document.getElementById('vendedor').value = '';
    document.getElementById('metodo-pagamento').value = 'dinheiro';
    document.getElementById('parcelas').value = '1';
    document.getElementById('parcelas-group').style.display = 'none';
    
    console.log('Venda limpa');
}

// Filtrar vendas
async function filtrarVendas() {
    try {
        console.log('Filtrando vendas...');
        
        const filtro = document.getElementById('filtro-vendas').value;
        const vendas = await ApiService.getVendas();
        
        let vendasFiltradas = [...vendas];
        const hoje = new Date();
        
        switch(filtro) {
            case 'hoje':
                const hojeStr = hoje.toLocaleDateString('pt-BR');
                vendasFiltradas = vendas.filter(v => v.data === hojeStr);
                break;
                
            case 'semana':
                const umaSemanaAtras = new Date(hoje);
                umaSemanaAtras.setDate(hoje.getDate() - 7);
                vendasFiltradas = vendas.filter(v => {
                    const dataVenda = parseDataBr(v.data);
                    return dataVenda >= umaSemanaAtras && dataVenda <= hoje;
                });
                break;
                
            case 'mes':
                const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                vendasFiltradas = vendas.filter(v => {
                    const dataVenda = parseDataBr(v.data);
                    return dataVenda >= primeiroDiaMes && dataVenda <= hoje;
                });
                break;
        }
        
        atualizarTabelaVendas(vendasFiltradas);
        console.log(`Vendas filtradas: ${vendasFiltradas.length} de ${vendas.length}`);
        
    } catch (error) {
        console.error('Erro ao filtrar vendas:', error);
        mostrarMensagem('Erro ao filtrar vendas', 'error');
    }
}

// Atualizar tabela de vendas
function atualizarTabelaVendas(vendas) {
    const tbody = document.querySelector('#tabela-vendas tbody');
    
    if (vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma venda encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    vendas.forEach(venda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${venda.id.toString().padStart(5, '0')}</td>
            <td>${venda.data}</td>
            <td>${venda.itens ? venda.itens.length : 0} itens</td>
            <td>${Utils.formatarMoeda(venda.total)}</td>
            <td>${venda.vendedor_nome}</td>
            <td>${formatarMetodoPagamento(venda.metodo_pagamento)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="verDetalhesVenda(${venda.id})">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Ver detalhes da venda
async function verDetalhesVenda(id) {
    try {
        console.log(`Carregando detalhes da venda #${id}`);
        
        const venda = await ApiService.getVenda(id);
        
        if (venda.error) {
            throw new Error(venda.error);
        }
        
        // Criar modal de detalhes
        const modalHtml = `
            <div class="modal-overlay" id="modal-venda-${id}" style="
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
                    max-width: 600px;
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
                        <h3 style="margin: 0;">Detalhes da Venda #${venda.id.toString().padStart(5, '0')}</h3>
                        <button onclick="fecharModal('modal-venda-${id}')" style="
                            background: none;
                            border: none;
                            font-size: 1.5rem;
                            cursor: pointer;
                            color: #666;
                        ">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <div>
                                <strong>Data:</strong> ${venda.data}
                            </div>
                            <div>
                                <strong>Vendedor:</strong> ${venda.vendedor_nome}
                            </div>
                        </div>
                        
                        <div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                            <div>
                                <strong>Pagamento:</strong> ${formatarMetodoPagamento(venda.metodo_pagamento)}
                            </div>
                            <div>
                                <strong>Parcelas:</strong> ${venda.parcelas}x
                            </div>
                        </div>
                        
                        <h4 style="margin-bottom: 1rem;">Itens da Venda</h4>
                        <div class="table-container">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f8f9fa;">
                                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">Produto</th>
                                        <th style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #eee;">Qtd</th>
                                        <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">Valor Unit.</th>
                                        <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${venda.itens ? venda.itens.map(item => `
                                        <tr>
                                            <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${item.produto_nome || 'Produto'}</td>
                                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #eee;">${item.quantidade}</td>
                                            <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">${Utils.formatarMoeda(item.valor_unitario)}</td>
                                            <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">${Utils.formatarMoeda(item.subtotal)}</td>
                                        </tr>
                                    `).join('') : ''}
                                </tbody>
                                <tfoot>
                                    <tr style="background: #f8f9fa;">
                                        <td colspan="3" style="padding: 0.75rem; text-align: right; font-weight: bold;">Total:</td>
                                        <td style="padding: 0.75rem; text-align: right; font-weight: bold;">${Utils.formatarMoeda(venda.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <div class="modal-footer" style="
                        margin-top: 1.5rem;
                        border-top: 1px solid #eee;
                        padding-top: 1rem;
                        text-align: right;
                    ">
                        <button onclick="fecharModal('modal-venda-${id}')" class="btn btn-primary">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes da venda:', error);
        mostrarMensagem('Erro ao carregar detalhes da venda', 'error');
    }
}

// Fechar modal
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Funções auxiliares
function formatarMetodoPagamento(metodo) {
    const metodos = {
        'dinheiro': 'Dinheiro',
        'debito': 'Cartão de Débito',
        'credito': 'Cartão de Crédito',
        'pix': 'PIX'
    };
    return metodos[metodo] || metodo;
}

function parseDataBr(dataStr) {
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(ano, mes - 1, dia);
}

// Exportar planilha de vendas
function exportarPlanilhaVendas() {
    console.log('Exportando planilha de vendas...');
    // Implementação básica - pode ser expandida para gerar CSV/Excel
    mostrarMensagem('Funcionalidade de exportação em desenvolvimento', 'info');
}

// Inicializar quando a aba de vendas for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        if (document.getElementById('vendas') && document.getElementById('vendas').classList.contains('active')) {
            inicializarVendas();
        }
    }, 100);
});

// Também inicializar quando a aba for mostrada
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (mutation.target.id === 'vendas' && mutation.target.classList.contains('active')) {
                inicializarVendas();
            }
        }
    });
});

observer.observe(document.getElementById('vendas'), {
    attributes: true,
    attributeFilter: ['class']
});

console.log('Módulo de vendas carregado e pronto');