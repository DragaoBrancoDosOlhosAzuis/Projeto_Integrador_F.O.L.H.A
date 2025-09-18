from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Configurações
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
CORS(app)

DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)

class Database:
    def __init__(self):
        self.arquivos = {
            'clientes': 'clientes.json',
            'funcionarios': 'funcionarios.json',
            'lojas': 'lojas.json',
            'produtos': 'produtos.json',
            'vendas': 'vendas.json',
            'servicos': 'servicos.json',
            'usuarios': 'usuarios.json'
        }
        
        # Criar arquivos JSON se não existirem
        for arquivo in self.arquivos.values():
            caminho = os.path.join(DATA_DIR, arquivo)
            if not os.path.exists(caminho):
                with open(caminho, 'w', encoding='utf-8') as f:
                    json.dump([], f, ensure_ascii=False)
    
    def carregar(self, entidade):
        caminho = os.path.join(DATA_DIR, self.arquivos[entidade])
        try:
            with open(caminho, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def salvar(self, entidade, dados):
        caminho = os.path.join(DATA_DIR, self.arquivos[entidade])
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
    
    def proximo_id(self, entidade):
        dados = self.carregar(entidade)
        if dados:
            return max(item.get('id', 0) for item in dados) + 1
        return 1
    
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
        
        usuarios = db.carregar('usuarios')
        
        # Se não houver usuários, criar usuário admin padrão
        if not usuarios:
            usuario_admin = {
                'id': 1,
                'usuario': 'admin',
                'senha': 'admin',
                'nome': 'Administrador',
                'nivel': 'admin'
            }
            usuarios.append(usuario_admin)
            db.salvar('usuarios', usuarios)
        
        usuario_encontrado = next((u for u in usuarios if u['usuario'] == usuario and u['senha'] == senha), None)
        
        if usuario_encontrado:
            return jsonify({
                'success': True,
                'usuario': {
                    'id': usuario_encontrado['id'],
                    'nome': usuario_encontrado['nome'],
                    'nivel': usuario_encontrado.get('nivel', 'usuario')
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'}), 401
            
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

# Rotas para Clientes
@app.route('/api/clientes', methods=['GET', 'POST'])
def clientes():
    if request.method == 'GET':
        clientes = db.carregar('clientes')
        return jsonify(clientes)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            clientes = db.carregar('clientes')
            
            novo_cliente = {
                'id': db.proximo_id('clientes'),
                'nome': data['nome'],
                'telefone': data.get('telefone', ''),
                'email': data.get('email', ''),
                'endereco': data.get('endereco', ''),
                'data_cadastro': db.formatar_data()
            }
            
            clientes.append(novo_cliente)
            db.salvar('clientes', clientes)
            
            return jsonify({'success': True, 'id': novo_cliente['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar cliente: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar cliente'}), 500

@app.route('/api/clientes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def cliente(id):
    clientes = db.carregar('clientes')
    
    if request.method == 'GET':
        cliente = next((c for c in clientes if c['id'] == id), None)
        if cliente:
            return jsonify(cliente)
        return jsonify({'error': 'Cliente não encontrado'}), 404
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            for cliente in clientes:
                if cliente['id'] == id:
                    cliente.update({
                        'nome': data['nome'],
                        'telefone': data.get('telefone', ''),
                        'email': data.get('email', ''),
                        'endereco': data.get('endereco', '')
                    })
                    break
            
            db.salvar('clientes', clientes)
            return jsonify({'success': True})
        
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente: {e}")
            return jsonify({'success': False, 'message': 'Erro ao atualizar cliente'}), 500
    
    elif request.method == 'DELETE':
        clientes = [c for c in clientes if c['id'] != id]
        db.salvar('clientes', clientes)
        return jsonify({'success': True})

# Rotas para Funcionários
@app.route('/api/funcionarios', methods=['GET', 'POST'])
def funcionarios():
    if request.method == 'GET':
        ativos = request.args.get('ativos')
        funcionarios = db.carregar('funcionarios')
        
        if ativos:
            funcionarios = [f for f in funcionarios if f.get('ativo', True)]
        
        return jsonify(funcionarios)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            funcionarios = db.carregar('funcionarios')
            
            novo_funcionario = {
                'id': db.proximo_id('funcionarios'),
                'nome': data['nome'],
                'data_entrada': data['data_entrada'],
                'cargo': data.get('cargo', 'Vendedor'),
                'ativo': data.get('ativo', True),
                'data_cadastro': db.formatar_data()
            }
            
            funcionarios.append(novo_funcionario)
            db.salvar('funcionarios', funcionarios)
            
            return jsonify({'success': True, 'id': novo_funcionario['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar funcionário: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar funcionário'}), 500

# Rotas para Lojas
@app.route('/api/lojas', methods=['GET', 'POST'])
def lojas():
    if request.method == 'GET':
        lojas = db.carregar('lojas')
        return jsonify(lojas)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            lojas = db.carregar('lojas')
            
            nova_loja = {
                'id': db.proximo_id('lojas'),
                'nome': data['nome'],
                'telefone': data.get('telefone', ''),
                'responsavel': data.get('responsavel', ''),
                'endereco': data.get('endereco', ''),
                'data_cadastro': db.formatar_data()
            }
            
            lojas.append(nova_loja)
            db.salvar('lojas', lojas)
            
            return jsonify({'success': True, 'id': nova_loja['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar loja: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar loja'}), 500

# Rotas para Produtos
@app.route('/api/produtos', methods=['GET', 'POST'])
def produtos():
    if request.method == 'GET':
        ativos = request.args.get('ativos')
        produtos = db.carregar('produtos')
        
        if ativos:
            produtos = [p for p in produtos if p.get('ativo', True)]
        
        return jsonify(produtos)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            produtos = db.carregar('produtos')
            
            novo_produto = {
                'id': db.proximo_id('produtos'),
                'nome': data['nome'],
                'subcategoria': data.get('subcategoria', ''),
                'valor': float(data['valor']),
                'ativo': data.get('ativo', True),
                'data_cadastro': db.formatar_data()
            }
            
            produtos.append(novo_produto)
            db.salvar('produtos', produtos)
            
            return jsonify({'success': True, 'id': novo_produto['id']})
        
        except Exception as e:
            logger.error(f"Erro ao criar produto: {e}")
            return jsonify({'success': False, 'message': 'Erro ao criar produto'}), 500

# Rotas para Vendas
@app.route('/api/vendas', methods=['GET', 'POST'])
def vendas():
    if request.method == 'GET':
        vendas = db.carregar('vendas')
        
        # Adicionar nome do vendedor às vendas
        funcionarios = db.carregar('funcionarios')
        funcionarios_dict = {f['id']: f['nome'] for f in funcionarios}
        
        for venda in vendas:
            venda['vendedor_nome'] = funcionarios_dict.get(venda.get('vendedor_id'), 'N/A')
        
        return jsonify(vendas)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            vendas = db.carregar('vendas')
            
            nova_venda = {
                'id': db.proximo_id('vendas'),
                'data': data.get('data', db.formatar_data()),
                'itens': data['itens'],
                'vendedor_id': data['vendedor_id'],
                'metodo_pagamento': data['metodo_pagamento'],
                'parcelas': data.get('parcelas', 1),
                'cliente_id': data.get('cliente_id'),
                'total': data['total'],
                'data_registro': db.formatar_data()
            }
            
            vendas.append(nova_venda)
            db.salvar('vendas', vendas)
            
            return jsonify({'success': True, 'id': nova_venda['id']})
        
        except Exception as e:
            logger.error(f"Erro ao registrar venda: {e}")
            return jsonify({'success': False, 'message': 'Erro ao registrar venda'}), 500

@app.route('/api/vendas/filtrar', methods=['GET'])
def filtrar_vendas():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        vendedor_id = request.args.get('vendedor_id')
        
        vendas = db.carregar('vendas')
        funcionarios = db.carregar('funcionarios')
        funcionarios_dict = {f['id']: f['nome'] for f in funcionarios}
        
        # Aplicar filtros
        if data_inicio:
            data_inicio_dt = db.parse_data(data_inicio)
            vendas = [v for v in vendas if db.parse_data(v['data']) >= data_inicio_dt]
        
        if data_fim:
            data_fim_dt = db.parse_data(data_fim)
            vendas = [v for v in vendas if db.parse_data(v['data']) <= data_fim_dt]
        
        if vendedor_id:
            vendas = [v for v in vendas if v.get('vendedor_id') == int(vendedor_id)]
        
        # Adicionar nome do vendedor
        for venda in vendas:
            venda['vendedor_nome'] = funcionarios_dict.get(venda.get('vendedor_id'), 'N/A')
        
        return jsonify(vendas)
        
    except Exception as e:
        logger.error(f"Erro ao filtrar vendas: {e}")
        return jsonify({'error': 'Erro ao filtrar vendas'}), 500

# Rotas para Serviços
@app.route('/api/servicos', methods=['GET', 'POST'])
def servicos():
    if request.method == 'GET':
        servicos = db.carregar('servicos')
        
        # Adicionar nomes às relações
        funcionarios = db.carregar('funcionarios')
        lojas = db.carregar('lojas')
        
        funcionarios_dict = {f['id']: f['nome'] for f in funcionarios}
        lojas_dict = {l['id']: l['nome'] for l in lojas}
        
        for servico in servicos:
            servico['funcionario_nome'] = funcionarios_dict.get(servico.get('funcionario_id'), 'N/A')
            servico['loja_nome'] = lojas_dict.get(servico.get('loja_id'), 'N/A')
        
        return jsonify(servicos)
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            servicos = db.carregar('servicos')
            
            novo_servico = {
                'id': db.proximo_id('servicos'),
                'data': data.get('data', db.formatar_data()),
                'itens': data['itens'],
                'loja_id': data['loja_id'],
                'funcionario_id': data['funcionario_id'],
                'observacoes': data.get('observacoes', ''),
                'total': data['total'],
                'data_registro': db.formatar_data()
            }
            
            servicos.append(novo_servico)
            db.salvar('servicos', servicos)
            
            return jsonify({'success': True, 'id': novo_servico['id']})
        
        except Exception as e:
            logger.error(f"Erro ao registrar serviço: {e}")
            return jsonify({'success': False, 'message': 'Erro ao registrar serviço'}), 500

@app.route('/api/servicos/total-por-loja', methods=['GET'])
def total_por_loja():
    try:
        servicos = db.carregar('servicos')
        lojas = db.carregar('lojas')
        
        totais = []
        for loja in lojas:
            total_loja = sum(s['total'] for s in servicos if s.get('loja_id') == loja['id'])
            totais.append({
                'loja_id': loja['id'],
                'loja_nome': loja['nome'],
                'total': total_loja
            })
        
        return jsonify(totais)
        
    except Exception as e:
        logger.error(f"Erro ao calcular totais por loja: {e}")
        return jsonify({'error': 'Erro ao calcular totais'}), 500

# Rotas para dashboard
@app.route('/api/dashboard/resumo')
def dashboard_resumo():
    try:
        vendas = db.carregar('vendas')
        servicos = db.carregar('servicos')
        
        hoje = datetime.now().date()
        
        # Vendas de hoje
        vendas_hoje = [v for v in vendas if db.parse_data(v['data']).date() == hoje]
        total_vendas_hoje = sum(v['total'] for v in vendas_hoje)
        
        # Serviços de hoje
        servicos_hoje = [s for s in servicos if db.parse_data(s['data']).date() == hoje]
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

# Rota para servir templates individualmente
@app.route('/templates/<template_name>')
def servir_template(template_name):
    try:
        return render_template(template_name)
    except Exception as e:
        logger.error(f"Erro ao servir template {template_name}: {e}")
        return f"Erro ao carregar template: {str(e)}", 404

if __name__ == '__main__':
    # Verificar se a pasta data existe
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    # Criar usuário admin padrão se não existir
    usuarios = db.carregar('usuarios')
    if not usuarios:
        usuario_admin = {
            'id': 1,
            'usuario': 'admin',
            'senha': 'admin',
            'nome': 'Administrador',
            'nivel': 'admin',
            'data_cadastro': db.formatar_data()
        }
        usuarios.append(usuario_admin)
        db.salvar('usuarios', usuarios)
        logger.info("Usuário admin criado: admin/admin")
    
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