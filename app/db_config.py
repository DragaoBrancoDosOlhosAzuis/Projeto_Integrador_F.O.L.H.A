import json
import os
from datetime import datetime

class Database:
    def __init__(self):
        self.data_dir = "../data"
        self.arquivos = {
            'clientes': 'clientes.json',
            'funcionarios': 'funcionarios.json',
            'lojas': 'lojas.json',
            'produtos': 'produtos.json',
            'vendas': 'vendas.json',
            'servicos': 'servicos.json'
        }
        
        # Criar diretório data se não existir
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        
        # Criar arquivos JSON se não existirem
        for arquivo in self.arquivos.values():
            caminho = os.path.join(self.data_dir, arquivo)
            if not os.path.exists(caminho):
                with open(caminho, 'w') as f:
                    json.dump([], f)
    
    def carregar(self, entidade):
        caminho = os.path.join(self.data_dir, self.arquivos[entidade])
        try:
            with open(caminho, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def salvar(self, entidade, dados):
        caminho = os.path.join(self.data_dir, self.arquivos[entidade])
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
            return None

# Instância global do banco de dados
db = Database()