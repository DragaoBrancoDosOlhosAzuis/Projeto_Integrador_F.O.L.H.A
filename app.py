from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime
import logging
from collections import defaultdict
from tinydb import TinyDB, Query
from tinydb.operations import increment, decrement

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Configurações
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['DATABASE'] = 'data'
CORS(app)

# Criar diretório data se não existir
os.makedirs(app.config['DATABASE'], exist_ok=True)

class Database:
    def __init__(self):
        self.db_path = app.config['DATABASE']
        self.tables = {
            'usuarios': 'usuarios.json',
            'funcionarios': 'funcionarios.json',
            'lojas': 'lojas.json',
            'produtos': 'produtos.json',
            'vendas': 'vendas.json',
            'venda_itens': 'venda_itens.json',
            'servicos': 'servicos.json',
            'servico_itens': 'servico_itens.json'
        }
        self.init_db()
    
    def get_table(self, table_name):
        """Retorna uma instância da tabela TinyDB"""
        file_path = os.path.join(self.db_path, self.tables[table_name])
        return TinyDB(file_path, ensure_ascii=False, encoding='utf-8')
    
    def init_db(self):
        """Inicializa o banco de dados com dados padrão"""
        # Verificar e criar usuário admin se não existir
        usuarios_db = self.get_table('usuarios')
        if len(usuarios_db) == 0:
            usuarios_db.insert({
                'id': 1,
                'usuario': 'admin',
                'senha': 'admin',
                'nome': 'Administrador',
                'nivel': 'admin',
                'data_cadastro': self.formatar_data()
            })
        
        # Inicializar outras tabelas com dados de exemplo se estiverem vazias
        funcionarios_db = self.get_table('funcionarios')
        if len(funcionarios_db) == 0:
            funcionarios_db.insert_multiple([
                {
                    'id': 1,
                    'nome': 'João Silva',
                    'data_entrada': '2022-03-15',
                    'cargo': 'Vendedor',
                    'salario': 2500.00,
                    'telefone': '(11) 99999-9999',
                    'email': 'joao@empresa.com',
                    'ativo': True,
                    'data_cadastro': self.formatar_data()
                },
                {
                    'id': 2,
                    'nome': 'Maria Santos',
                    'data_entrada': '2021-07-22',
                    'cargo': 'Vendedor',
                    'salario': 2800.00,
                    'telefone': '(11) 88888-8888',
                    'email': 'maria@empresa.com',
                    'ativo': True,
                    'data_cadastro': self.formatar_data()
                }
            ])
        
        lojas_db = self.get_table('lojas')
        if len(lojas_db) == 0:
            lojas_db.insert_multiple([
                {
                    'id': 1,
                    'nome': 'Papelaria Central',
                    'telefone': '(11) 99999-9999',
                    'responsavel': 'Carlos Silva',
                    'endereco': 'Rua Principal, 123 - Centro',
                    'limite_credito': 5000.00,
                    'data_cadastro': self.formatar_data()
                },
                {
                    'id': 2,
                    'nome': 'Gráfica Express',
                    'telefone': '(11) 88888-8888',
                    'responsavel': 'Ana Costa',
                    'endereco': 'Av. Comercial, 456 - Centro',
                    'limite_credito': 3000.00,
                    'data_cadastro': self.formatar_data()
                }
            ])
        
        produtos_db = self.get_table('produtos')
        if len(produtos_db) == 0:
            produtos_db.insert_multiple([
                {
                    'id': 1,
                    'nome': 'Sulfite A4',
                    'subcategoria': 'Colorido',
                    'valor': 2.00,
                    'ativo': True,
                    'data_cadastro': self.formatar_data()
                },
                {
                    'id': 2,
                    'nome': 'Couche A3',
                    'subcategoria': 'Brilhante',
                    'valor': 40.00,
                    'ativo': True,
                    'data_cadastro': self.formatar_data()
                },
                {
                    'id': 3,
                    'nome': 'Sulfite Preto e Branco',
                    'subcategoria': '',
                    'valor': 12.50,
                    'ativo': True,
                    'data_cadastro': self.formatar_data()
                }
            ])
    
    def proximo_id(self, table_name):
        """Retorna o próximo ID disponível para uma tabela"""
        table = self.get_table(table_name)
        if len(table) == 0:
            return 1
        return max([doc['id'] for doc in table.all()]) + 1
    
    def formatar_data(self, data=None):
        if data is None:
            data = datetime.now()
        return data.strftime("%d/%m/%Y")
    
    def parse_data(self, data_str):
        try:
            return datetime.strptime(data_str, "%d/%m/%Y")
        except ValueError:
            try:
                return datetime.strptime(data_str, "%Y-%m-%d")
            except ValueError:
                return None

# Instância do banco de dados
db = Database()

# Rotas para servir arquivos estáticos
@app.route('/static/<path:path>')
def servir_static(path):
    return app.send_static_file(path)

@app.route('/js/<path:filename>')
def servir_js_direct(filename):
    return app.send_static_file(f'js/{filename}')

@app.route('/css/<path:filename>')
def servir_css(filename):
    return app.send_static_file(f'css/{filename}')

@app.route('/static/js/<path:filename>')
def servir_js(filename):
    return app.send_static_file(f'js/{filename}')

@app.route('/static/css/<path:filename>')
def servir_css_static(filename):
    return app.send_static_file(f'css/{filename}')

# Rotas de autenticação
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        usuario = data.get('usuario')
        senha = data.get('senha')
        
        usuarios_db = db.get_table('usuarios')
        User = Query()
        
        usuario_encontrado = usuarios_db.get((User.usuario == usuario) & (User.senha == senha))
        
        if usuario_encontrado:
            return jsonify({
                'success': True,
                'usuario': {
                    'id': usuario_encontrado['id'],
                    'nome': usuario_encontrado['nome'],
                    'nivel': usuario_encontrado['nivel']
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'}), 401
            
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

# Rotas para Funcionários
@app.route('/api/funcionarios', methods=['GET', 'POST'])
def funcionarios():
    if request.method == 'GET':
        ativos = request.args.get('ativos')
        funcionarios_db = db.get_table('funcionarios')
        
        if ativos:
            Funcionario = Query()
            funcionarios = funcionarios_db.search(Funcionario.ativo == True)
        else:
            funcionarios = funcionarios_db.all()
        
        return jsonify(funcionarios)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            logger.info(f"Recebendo dados do funcionário: {data}")
            
            funcionarios_db = db.get_table('funcionarios')
            
            novo_funcionario = {
                'id': db.proximo_id('funcionarios'),
                'nome': data['nome'],
                'data_entrada': data['data_entrada'],
                'cargo': data.get('cargo', 'Vendedor'),
                'salario': float(data.get('salario', 0)),
                'telefone': data.get('telefone', ''),
                'email': data.get('email', ''),
                'ativo': data.get('ativo', True),
                'data_cadastro': db.formatar_data()
            }
            
            logger.info(f"Inserindo funcionário: {novo_funcionario}")
            funcionarios_db.insert(novo_funcionario)
            
            return jsonify({'success': True, 'id': novo_funcionario['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar funcionário: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar funcionário'}), 500

@app.route('/api/funcionarios/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def funcionario(id):
    funcionarios_db = db.get_table('funcionarios')
    Funcionario = Query()
    
    if request.method == 'GET':
        funcionario = funcionarios_db.get(Funcionario.id == id)
        if funcionario:
            return jsonify(funcionario)
        return jsonify({'error': 'Funcionário não encontrado'}), 404
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            logger.info(f"Atualizando funcionário {id}: {data}")
            
            atualizacao = {
                'nome': data['nome'],
                'data_entrada': data['data_entrada'],
                'cargo': data.get('cargo', 'Vendedor'),
                'salario': float(data.get('salario', 0)),
                'telefone': data.get('telefone', ''),
                'email': data.get('email', ''),
                'ativo': data.get('ativo', True)
            }
            
            funcionarios_db.update(atualizacao, Funcionario.id == id)
            
            return jsonify({'success': True})
        
        except Exception as e:
            logger.error(f"Erro ao atualizar funcionário: {e}")
            return jsonify({'success': False, 'message': 'Erro ao atualizar funcionário'}), 500
    
    elif request.method == 'DELETE':
        try:
            funcionarios_db.remove(Funcionario.id == id)
            return jsonify({'success': True})
        except Exception as e:
            logger.error(f"Erro ao excluir funcionário: {e}")
            return jsonify({'success': False, 'message': 'Erro ao excluir funcionário'}), 500

# Rotas para Lojas
@app.route('/api/lojas', methods=['GET', 'POST'])
def lojas():
    if request.method == 'GET':
        lojas_db = db.get_table('lojas')
        lojas = lojas_db.all()
        return jsonify(lojas)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            logger.info(f"Recebendo dados da loja: {data}")
            
            lojas_db = db.get_table('lojas')
            
            nova_loja = {
                'id': db.proximo_id('lojas'),
                'nome': data['nome'],
                'telefone': data.get('telefone', ''),
                'responsavel': data.get('responsavel', ''),
                'endereco': data.get('endereco', ''),
                'limite_credito': float(data.get('limite_credito', 0)),
                'data_cadastro': db.formatar_data()
            }
            
            logger.info(f"Inserindo loja: {nova_loja}")
            lojas_db.insert(nova_loja)
            
            return jsonify({'success': True, 'id': nova_loja['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar loja: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar loja'}), 500

@app.route('/api/lojas/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def loja(id):
    lojas_db = db.get_table('lojas')
    Loja = Query()
    
    if request.method == 'GET':
        loja = lojas_db.get(Loja.id == id)
        if loja:
            return jsonify(loja)
        return jsonify({'error': 'Loja não encontrada'}), 404
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            logger.info(f"Atualizando loja {id}: {data}")
            
            atualizacao = {
                'nome': data['nome'],
                'telefone': data.get('telefone', ''),
                'responsavel': data.get('responsavel', ''),
                'endereco': data.get('endereco', ''),
                'limite_credito': float(data.get('limite_credito', 0))
            }
            
            lojas_db.update(atualizacao, Loja.id == id)
            
            return jsonify({'success': True})
        
        except Exception as e:
            logger.error(f"Erro ao atualizar loja: {e}")
            return jsonify({'success': False, 'message': 'Erro ao atualizar loja'}), 500
    
    elif request.method == 'DELETE':
        try:
            lojas_db.remove(Loja.id == id)
            return jsonify({'success': True})
        except Exception as e:
            logger.error(f"Erro ao excluir loja: {e}")
            return jsonify({'success': False, 'message': 'Erro ao excluir loja'}), 500

# Rotas para Produtos
@app.route('/api/produtos', methods=['GET', 'POST'])
def produtos():
    if request.method == 'GET':
        ativos = request.args.get('ativos')
        produtos_db = db.get_table('produtos')
        
        if ativos:
            Produto = Query()
            produtos = produtos_db.search(Produto.ativo == True)
        else:
            produtos = produtos_db.all()
        
        return jsonify(produtos)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            logger.info(f"Recebendo dados do produto: {data}")
            
            produtos_db = db.get_table('produtos')
            
            novo_produto = {
                'id': db.proximo_id('produtos'),
                'nome': data['nome'],
                'subcategoria': data.get('subcategoria', ''),
                'valor': float(data['valor']),
                'ativo': data.get('ativo', True),
                'data_cadastro': db.formatar_data()
            }
            
            logger.info(f"Inserindo produto: {novo_produto}")
            produtos_db.insert(novo_produto)
            
            return jsonify({'success': True, 'id': novo_produto['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar produto: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar produto'}), 500

@app.route('/api/produtos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def produto(id):
    produtos_db = db.get_table('produtos')
    Produto = Query()
    
    if request.method == 'GET':
        produto = produtos_db.get(Produto.id == id)
        if produto:
            return jsonify(produto)
        return jsonify({'error': 'Produto não encontrado'}), 404
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            logger.info(f"Atualizando produto {id}: {data}")
            
            atualizacao = {
                'nome': data['nome'],
                'subcategoria': data.get('subcategoria', ''),
                'valor': float(data['valor']),
                'ativo': data.get('ativo', True)
            }
            
            produtos_db.update(atualizacao, Produto.id == id)
            
            return jsonify({'success': True})
        
        except Exception as e:
            logger.error(f"Erro ao atualizar produto: {e}")
            return jsonify({'success': False, 'message': 'Erro ao atualizar produto'}), 500
    
    elif request.method == 'DELETE':
        try:
            produtos_db.remove(Produto.id == id)
            return jsonify({'success': True})
        except Exception as e:
            logger.error(f"Erro ao excluir produto: {e}")
            return jsonify({'success': False, 'message': 'Erro ao excluir produto'}), 500

# Rotas para Vendas
VENDAS_FILE = 'data/vendas.json' 

@app.route('/api/vendas/dados_exportacao', methods=['GET'])
def export_vendas_data():
    try:
        with open(VENDAS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return jsonify(data)
    
    except FileNotFoundError:
        return jsonify({'error': 'Arquivo de vendas (vendas.json) não encontrado no servidor.'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Erro ao decodificar o arquivo vendas.json. Verifique a sintaxe.'}), 500

@app.route('/api/vendas', methods=['GET', 'POST'])
def vendas():
    if request.method == 'GET':
        vendas_db = db.get_table('vendas')
        funcionarios_db = db.get_table('funcionarios')
        venda_itens_db = db.get_table('venda_itens')
        vendas = vendas_db.all()
        
        funcionarios_dict = {f['id']: f['nome'] for f in funcionarios_db.all()}
        
        # 1. 💡 NOVO: AGREGAR A CONTAGEM DE PRODUTOS
        contagem_produtos = defaultdict(int)
        todos_itens = venda_itens_db.all()
        
        for item in todos_itens:
            # Assumindo que você quer a soma da quantidade total de produtos por transação
            venda_id = item.get('venda_id')
            quantidade = item.get('quantidade', 0)
            contagem_produtos[venda_id] += quantidade 
            
        # 2. ANEXAR A CONTAGEM E O NOME DO VENDEDOR
        vendas_formatadas = []
        for venda in vendas:
            # NOTA: Precisamos garantir que estamos usando o 'id' correto (TinyDB doc_id ou campo 'id')
            venda_id = venda.get('id', venda.doc_id) 
            
            venda_data = dict(venda)
            venda_data['vendedor_nome'] = funcionarios_dict.get(venda.get('vendedor_id'), 'N/A')
            
            # 💡 NOVO CAMPO PARA O FRONTEND
            venda_data['num_produtos'] = contagem_produtos[venda_id]
            
            vendas_formatadas.append(venda_data)
        
        return jsonify(vendas_formatadas)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            logger.info(f"Recebendo dados da venda: {data}")
            
            vendas_db = db.get_table('vendas')
            venda_itens_db = db.get_table('venda_itens')
            
            nova_venda = {
                'id': db.proximo_id('vendas'),
                'data': data.get('data', db.formatar_data()),
                'vendedor_id': data['vendedor_id'],
                'metodo_pagamento': data['metodo_pagamento'],
                'parcelas': data.get('parcelas', 1),
                'cliente_id': data.get('cliente_id'),
                'total': float(data['total']),
                'data_registro': db.formatar_data()
            }
            
            venda_id = vendas_db.insert(nova_venda)
            
            # Inserir itens da venda
            for item in data['itens']:
                venda_item = {
                    'id': db.proximo_id('venda_itens'),
                    'venda_id': venda_id,
                    'produto_id': item['produto_id'],
                    'quantidade': item['quantidade'],
                    'valor_unitario': float(item['valor_unitario']),
                    'subtotal': float(item['subtotal'])
                }
                venda_itens_db.insert(venda_item)
            
            return jsonify({'success': True, 'id': venda_id})
        
        except Exception as e:
            logger.error(f"Erro ao registrar venda: {e}")
            return jsonify({'success': False, 'message': 'Erro ao registrar venda'}), 500

@app.route('/api/vendas/<int:id>', methods=['GET'])
def venda(id):
    vendas_db = db.get_table('vendas')
    venda_itens_db = db.get_table('venda_itens')
    produtos_db = db.get_table('produtos')
    funcionarios_db = db.get_table('funcionarios')
    
    Venda = Query()
    venda = vendas_db.get(Venda.id == id)
    
    if not venda:
        return jsonify({'error': 'Venda não encontrada'}), 404
    
    # Buscar itens da venda
    VendaItem = Query()
    itens = venda_itens_db.search(VendaItem.venda_id == id)
    
    # Adicionar informações dos produtos aos itens
    produtos_dict = {p['id']: p for p in produtos_db.all()}
    for item in itens:
        produto = produtos_dict.get(item['produto_id'])
        if produto:
            item['produto_nome'] = produto['nome']
            item['produto_subcategoria'] = produto.get('subcategoria', '')
    
    # Adicionar informações do vendedor
    funcionario = funcionarios_db.get(Query().id == venda['vendedor_id'])
    venda['vendedor_nome'] = funcionario['nome'] if funcionario else 'N/A'
    venda['itens'] = itens
    
    return jsonify(venda)


# Rotas para Serviços (Vendas Fiadas)
@app.route('/api/servicos', methods=['GET', 'POST'])
def servicos():
    if request.method == 'GET':
        servicos_db = db.get_table('servicos')
        funcionarios_db = db.get_table('funcionarios')
        lojas_db = db.get_table('lojas')
        
        servicos = servicos_db.all()
        
        # Adicionar nomes às relações
        funcionarios_dict = {f['id']: f['nome'] for f in funcionarios_db.all()}
        lojas_dict = {l['id']: l['nome'] for l in lojas_db.all()}
        
        for servico in servicos:
            servico['funcionario_nome'] = funcionarios_dict.get(servico.get('funcionario_id'), 'N/A')
            servico['loja_nome'] = lojas_dict.get(servico.get('loja_id'), 'N/A')
        
        return jsonify(servicos)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            logger.info(f"Recebendo dados do serviço: {data}")
            
            servicos_db = db.get_table('servicos')
            servico_itens_db = db.get_table('servico_itens')
            
            novo_servico = {
                'id': db.proximo_id('servicos'),
                'data': data.get('data', db.formatar_data()),
                'loja_id': data['loja_id'],
                'funcionario_id': data['funcionario_id'],
                'observacoes': data.get('observacoes', ''),
                'total': float(data['total']),
                'data_registro': db.formatar_data()
            }
            
            servico_id = servicos_db.insert(novo_servico)
            
            # Inserir itens do serviço
            for item in data['itens']:
                servico_item = {
                    'id': db.proximo_id('servico_itens'),
                    'servico_id': servico_id,
                    'produto_id': item['produto_id'],
                    'quantidade': item['quantidade'],
                    'valor_unitario': float(item['valor_unitario']),
                    'subtotal': float(item['subtotal'])
                }
                servico_itens_db.insert(servico_item)
            
            return jsonify({'success': True, 'id': servico_id})
        
        except Exception as e:
            logger.error(f"Erro ao registrar serviço: {e}")
            return jsonify({'success': False, 'message': 'Erro ao registrar serviço'}), 500

# Rotas para dashboard
@app.route('/api/dashboard/resumo')
def dashboard_resumo():
    try:
        vendas_db = db.get_table('vendas')
        servicos_db = db.get_table('servicos')
        
        hoje = datetime.now().date()
        data_hoje = hoje.strftime("%d/%m/%Y")
        
        # Vendas de hoje
        Venda = Query()
        vendas_hoje = vendas_db.search(Venda.data == data_hoje)
        total_vendas_hoje = sum(v['total'] for v in vendas_hoje)
        
        # Serviços de hoje
        Servico = Query()
        servicos_hoje = servicos_db.search(Servico.data == data_hoje)
        total_servicos_hoje = sum(s['total'] for s in servicos_hoje)
        
        return jsonify({
            'vendas_hoje': {
                'quantidade': len(vendas_hoje),
                'total': total_vendas_hoje
            },
            'servicos_hoje': {
                'quantidade': len(servicos_hoje),
                'total': total_servicos_hoje
            },
            'total_geral': total_vendas_hoje + total_servicos_hoje
        })
        
    except Exception as e:
        logger.error(f"Erro ao carregar resumo do dashboard: {e}")
        return jsonify({'error': 'Erro ao carregar resumo'}), 500
    

def calcular_produtos_mais_vendidos(top_n=5):
    """
    Calcula os produtos mais vendidos, utilizando as tabelas TinyDB.
    """
    try:

        venda_itens_db = db.get_table('venda_itens') 
        produtos_db = db.get_table('produtos')       
        
        venda_itens_lista = venda_itens_db.all() 
        produtos_lista = produtos_db.all()

    except Exception as e:
        logger.error(f"Erro ao carregar dados das tabelas TinyDB: {e}")
        return []

    produtos_map = {p.get('id'): p for p in produtos_lista if p.get('id') is not None}
    
    vendas_agregadas = defaultdict(lambda: {'vendas': 0, 'valor_total': 0.0})
    
    for item in venda_itens_lista:
        produto_id = item.get('produto_id')
        quantidade = item.get('quantidade', 0)
        subtotal = item.get('subtotal', item.get('quantidade', 0) * item.get('valor_unitario', 0.0))
        
        if produto_id in produtos_map:
            vendas_agregadas[produto_id]['vendas'] += quantidade
            vendas_agregadas[produto_id]['valor_total'] += subtotal

    resultados_completos = []
    for produto_id, dados_venda in vendas_agregadas.items():
        produto_info = produtos_map.get(produto_id)
        
        if produto_info:
            resultados_completos.append({
                "nome": produto_info.get('nome', f'ID {produto_id}'),
                "subcategoria": produto_info.get('subcategoria', 'N/D'),
                "vendas": dados_venda['vendas'], 
                "valor_total": round(dados_venda['valor_total'], 2)
            })

    resultados_ordenados = sorted(
        resultados_completos,
        key=lambda x: x['vendas'],
        reverse=True
    )
    
    return resultados_ordenados[:top_n]

@app.route('/api/mais-vendidos', methods=['GET'])
def get_mais_vendidos():
    try:
        top_produtos = calcular_produtos_mais_vendidos(top_n=10)
        return jsonify(top_produtos)
    except Exception as e:
        print(f"Erro no endpoint /api/mais-vendidos: {e}")
        return jsonify({"erro": "Não foi possível calcular os produtos mais vendidos."}), 500

# Rotas de debug
@app.route('/api/debug/tables')
def debug_tables():
    try:
        tables_info = {}
        for table_name in db.tables.keys():
            table = db.get_table(table_name)
            tables_info[table_name] = {
                'count': len(table),
                'data': table.all()
            }
        return jsonify(tables_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/test-post', methods=['POST'])
def debug_test_post():
    try:
        data = request.get_json()
        return jsonify({
            'received': True,
            'data': data,
            'content_type': request.content_type
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rota de teste
@app.route('/api/teste')
def teste():
    return jsonify({"message": "API funcionando!", "status": "ok"})

# Rotas para templates
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/clientes')
@app.route('/clientes/<path:subpath>')
def clientes_page(subpath=None):
    return render_template('clientes.html')

@app.route('/funcionarios')
@app.route('/funcionarios/<path:subpath>')
def funcionarios_page(subpath=None):
    return render_template('funcionarios.html')

@app.route('/lojas')
@app.route('/lojas/<path:subpath>')
def lojas_page(subpath=None):
    return render_template('lojas.html')

@app.route('/produtos')
@app.route('/produtos/<path:subpath>')
def produtos_page(subpath=None):
    return render_template('produtos.html')

@app.route('/vendas')
@app.route('/vendas/<path:subpath>')
def vendas_page(subpath=None):
    return render_template('vendas.html')

@app.route('/servicos')
@app.route('/servicos/<path:subpath>')
def servicos_page(subpath=None):
    return render_template('servicos.html')

@app.route('/api/servicos/<int:id>', methods=['GET'])
def servico(id):
    servicos_db = db.get_table('servicos')
    servico_itens_db = db.get_table('servico_itens')
    produtos_db = db.get_table('produtos')
    funcionarios_db = db.get_table('funcionarios')
    lojas_db = db.get_table('lojas')
    
    Servico = Query()
    servico = servicos_db.get(Servico.id == id)
    
    if not servico:
        return jsonify({'error': 'Serviço não encontrado'}), 404
    
    # Buscar itens do serviço
    ServicoItem = Query()
    itens = servico_itens_db.search(ServicoItem.servico_id == id)
    
    # Adicionar informações dos produtos aos itens
    produtos_dict = {p['id']: p for p in produtos_db.all()}
    for item in itens:
        produto = produtos_dict.get(item['produto_id'])
        if produto:
            item['produto_nome'] = produto['nome']
    
    # Adicionar informações do funcionário e loja
    funcionario = funcionarios_db.get(Query().id == servico['funcionario_id'])
    loja = lojas_db.get(Query().id == servico['loja_id'])
    
    servico['funcionario_nome'] = funcionario['nome'] if funcionario else 'N/A'
    servico['loja_nome'] = loja['nome'] if loja else 'N/A'
    servico['itens'] = itens
    
    return jsonify(servico)

if __name__ == '__main__':
    print("=" * 50)
    print("SISTEMA F.O.L.H.A - Iniciando Servidor")
    print("=" * 50)
    print("URL: http://localhost:5000")
    print("Login: admin / admin")
    print("=" * 50)
    
    # Usar waitress para produção ou Flask para desenvolvimento
    try:
        from waitress import serve
        serve(app, host='0.0.0.0', port=5000)
    except ImportError:
        app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)