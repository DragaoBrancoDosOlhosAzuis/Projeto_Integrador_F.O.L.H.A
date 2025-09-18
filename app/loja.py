from .db_config import db

class Loja:
    def __init__(self, id=None, nome=None, telefone=None, responsavel=None, endereco=None):
        self.id = id
        self.nome = nome
        self.telefone = telefone
        self.responsavel = responsavel
        self.endereco = endereco
    
    def salvar(self):
        lojas = db.carregar('lojas')
        
        if self.id is None:
            self.id = db.proximo_id('lojas')
            nova_loja = {
                'id': self.id,
                'nome': self.nome,
                'telefone': self.telefone,
                'responsavel': self.responsavel,
                'endereco': self.endereco
            }
            lojas.append(nova_loja)
        else:
            for loja in lojas:
                if loja['id'] == self.id:
                    loja.update({
                        'nome': self.nome,
                        'telefone': self.telefone,
                        'responsavel': self.responsavel,
                        'endereco': self.endereco
                    })
                    break
        
        db.salvar('lojas', lojas)
        return self.id
    
    @staticmethod
    def buscar_todos():
        return db.carregar('lojas')
    
    @staticmethod
    def buscar_por_id(id):
        lojas = db.carregar('lojas')
        for loja in lojas:
            if loja['id'] == id:
                return loja
        return None
    
    @staticmethod
    def buscar_por_nome(nome):
        lojas = db.carregar('lojas')
        return [loja for loja in lojas if nome.lower() in loja['nome'].lower()]
    
    @staticmethod
    def excluir(id):
        lojas = db.carregar('lojas')
        lojas = [loja for loja in lojas if loja['id'] != id]
        db.salvar('lojas', lojas)