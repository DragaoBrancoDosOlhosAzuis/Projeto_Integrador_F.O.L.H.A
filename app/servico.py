from .db_config import db
from datetime import datetime

class Servico:
    def __init__(self, id=None, data=None, loja_id=None, itens=None, 
                 funcionario_id=None, observacoes=None, total=0.0):
        self.id = id
        self.data = data or db.formatar_data()
        self.loja_id = loja_id
        self.itens = itens or []
        self.funcionario_id = funcionario_id
        self.observacoes = observacoes
        self.total = total
    
    def adicionar_item(self, produto_id, quantidade, preco_unitario):
        self.itens.append({
            'produto_id': produto_id,
            'quantidade': quantidade,
            'preco_unitario': preco_unitario,
            'subtotal': quantidade * preco_unitario
        })
        self.calcular_total()
    
    def calcular_total(self):
        self.total = sum(item['subtotal'] for item in self.itens)
        return self.total
    
    def salvar(self):
        servicos = db.carregar('servicos')
        
        if self.id is None:
            self.id = db.proximo_id('servicos')
            novo_servico = {
                'id': self.id,
                'data': self.data,
                'loja_id': self.loja_id,
                'itens': self.itens,
                'funcionario_id': self.funcionario_id,
                'observacoes': self.observacoes,
                'total': self.total
            }
            servicos.append(novo_servico)
        else:
            for servico in servicos:
                if servico['id'] == self.id:
                    servico.update({
                        'data': self.data,
                        'loja_id': self.loja_id,
                        'itens': self.itens,
                        'funcionario_id': self.funcionario_id,
                        'observacoes': self.observacoes,
                        'total': self.total
                    })
                    break
        
        db.salvar('servicos', servicos)
        return self.id
    
    @staticmethod
    def buscar_todos():
        return db.carregar('servicos')
    
    @staticmethod
    def buscar_por_id(id):
        servicos = db.carregar('servicos')
        for servico in servicos:
            if servico['id'] == id:
                return servico
        return None
    
    @staticmethod
    def buscar_por_loja(loja_id):
        servicos = db.carregar('servicos')
        return [servico for servico in servicos if servico['loja_id'] == loja_id]
    
    @staticmethod
    def buscar_por_data(data_inicio, data_fim=None):
        servicos = db.carregar('servicos')
        data_inicio_dt = db.parse_data(data_inicio)
        
        if data_fim:
            data_fim_dt = db.parse_data(data_fim)
        else:
            data_fim_dt = data_inicio_dt
        
        resultados = []
        for servico in servicos:
            servico_data = db.parse_data(servico['data'])
            if servico_data and data_inicio_dt <= servico_data <= data_fim_dt:
                resultados.append(servico)
        
        return resultados
    
    @staticmethod
    def calcular_total_devendo_loja(loja_id):
        servicos = db.carregar('servicos')
        total = 0.0
        for servico in servicos:
            if servico['loja_id'] == loja_id:
                total += servico['total']
        return total
    
    @staticmethod
    def excluir(id):
        servicos = db.carregar('servicos')
        servicos = [servico for servico in servicos if servico['id'] != id]
        db.salvar('servicos', servicos)