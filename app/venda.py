from .db_config import db
from datetime import datetime

class Venda:
    def __init__(self, id=None, data=None, itens=None, vendedor_id=None, 
                 metodo_pagamento=None, parcelas=1, cliente_id=None, total=0.0):
        self.id = id
        self.data = data or db.formatar_data()
        self.itens = itens or []
        self.vendedor_id = vendedor_id
        self.metodo_pagamento = metodo_pagamento
        self.parcelas = parcelas
        self.cliente_id = cliente_id
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
        vendas = db.carregar('vendas')
        
        if self.id is None:
            self.id = db.proximo_id('vendas')
            nova_venda = {
                'id': self.id,
                'data': self.data,
                'itens': self.itens,
                'vendedor_id': self.vendedor_id,
                'metodo_pagamento': self.metodo_pagamento,
                'parcelas': self.parcelas,
                'cliente_id': self.cliente_id,
                'total': self.total
            }
            vendas.append(nova_venda)
        else:
            for venda in vendas:
                if venda['id'] == self.id:
                    venda.update({
                        'data': self.data,
                        'itens': self.itens,
                        'vendedor_id': self.vendedor_id,
                        'metodo_pagamento': self.metodo_pagamento,
                        'parcelas': self.parcelas,
                        'cliente_id': self.cliente_id,
                        'total': self.total
                    })
                    break
        
        db.salvar('vendas', vendas)
        return self.id
    
    @staticmethod
    def buscar_todos():
        return db.carregar('vendas')
    
    @staticmethod
    def buscar_por_id(id):
        vendas = db.carregar('vendas')
        for venda in vendas:
            if venda['id'] == id:
                return venda
        return None
    
    @staticmethod
    def buscar_por_data(data_inicio, data_fim=None):
        vendas = db.carregar('vendas')
        data_inicio_dt = db.parse_data(data_inicio)
        
        if data_fim:
            data_fim_dt = db.parse_data(data_fim)
        else:
            data_fim_dt = data_inicio_dt
        
        resultados = []
        for venda in vendas:
            venda_data = db.parse_data(venda['data'])
            if venda_data and data_inicio_dt <= venda_data <= data_fim_dt:
                resultados.append(venda)
        
        return resultados
    
    @staticmethod
    def buscar_por_vendedor(vendedor_id):
        vendas = db.carregar('vendas')
        return [venda for venda in vendas if venda['vendedor_id'] == vendedor_id]
    
    @staticmethod
    def excluir(id):
        vendas = db.carregar('vendas')
        vendas = [venda for venda in vendas if venda['id'] != id]
        db.salvar('vendas', vendas)