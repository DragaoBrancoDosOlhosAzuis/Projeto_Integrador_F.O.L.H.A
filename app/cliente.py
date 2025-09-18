from .db_config import db

class Cliente:
    def __init__(self, id=None, nome=None, telefone=None, email=None, endereco=None):
        self.id = id
        self.nome = nome
        self.telefone = telefone
        self.email = email
        self.endereco = endereco
    
    def salvar(self):
        clientes = db.carregar('clientes')
        
        if self.id is None:
            self.id = db.proximo_id('clientes')
            novo_cliente = {
                'id': self.id,
                'nome': self.nome,
                'telefone': self.telefone,
                'email': self.email,
                'endereco': self.endereco
            }
            clientes.append(novo_cliente)
        else:
            for cliente in clientes:
                if cliente['id'] == self.id:
                    cliente.update({
                        'nome': self.nome,
                        'telefone': self.telefone,
                        'email': self.email,
                        'endereco': self.endereco
                    })
                    break
        
        db.salvar('clientes', clientes)
        return self.id
    
    @staticmethod
    def buscar_todos():
        return db.carregar('clientes')
    
    @staticmethod
    def buscar_por_id(id):
        clientes = db.carregar('clientes')
        for cliente in clientes:
            if cliente['id'] == id:
                return cliente
        return None
    
    @staticmethod
    def buscar_por_nome(nome):
        clientes = db.carregar('clientes')
        return [cliente for cliente in clientes if nome.lower() in cliente['nome'].lower()]
    
    @staticmethod
    def excluir(id):
        clientes = db.carregar('clientes')
        clientes = [cliente for cliente in clientes if cliente['id'] != id]
        db.salvar('clientes', clientes)