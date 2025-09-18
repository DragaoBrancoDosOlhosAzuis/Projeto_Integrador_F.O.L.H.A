from .db_config import db

class Produto:
    def __init__(self, id=None, nome=None, subcategoria=None, valor=0.0, ativo=True):
        self.id = id
        self.nome = nome
        self.subcategoria = subcategoria
        self.valor = valor
        self.ativo = ativo
    
    def salvar(self):
        produtos = db.carregar('produtos')
        
        if self.id is None:
            self.id = db.proximo_id('produtos')
            novo_produto = {
                'id': self.id,
                'nome': self.nome,
                'subcategoria': self.subcategoria,
                'valor': self.valor,
                'ativo': self.ativo
            }
            produtos.append(novo_produto)
        else:
            for produto in produtos:
                if produto['id'] == self.id:
                    produto.update({
                        'nome': self.nome,
                        'subcategoria': self.subcategoria,
                        'valor': self.valor,
                        'ativo': self.ativo
                    })
                    break
        
        db.salvar('produtos', produtos)
        return self.id
    
    @staticmethod
    def buscar_todos():
        return db.carregar('produtos')
    
    @staticmethod
    def buscar_ativos():
        produtos = db.carregar('produtos')
        return [prod for prod in produtos if prod.get('ativo', True)]
    
    @staticmethod
    def buscar_por_id(id):
        produtos = db.carregar('produtos')
        for produto in produtos:
            if produto['id'] == id:
                return produto
        return None
    
    @staticmethod
    def buscar_por_nome(nome):
        produtos = db.carregar('produtos')
        return [prod for prod in produtos if nome.lower() in prod['nome'].lower()]
    
    @staticmethod
    def buscar_por_subcategoria(subcategoria):
        produtos = db.carregar('produtos')
        return [prod for prod in produtos if subcategoria.lower() in prod.get('subcategoria', '').lower()]
    
    @staticmethod
    def excluir(id):
        produtos = db.carregar('produtos')
        produtos = [prod for prod in produtos if prod['id'] != id]
        db.salvar('produtos', produtos)