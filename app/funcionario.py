from .db_config import db

class Funcionario:
    def __init__(self, id=None, nome=None, data_entrada=None, cargo="Vendedor", ativo=True):
        self.id = id
        self.nome = nome
        self.data_entrada = data_entrada
        self.cargo = cargo
        self.ativo = ativo
    
    def salvar(self):
        funcionarios = db.carregar('funcionarios')
        
        if self.id is None:
            self.id = db.proximo_id('funcionarios')
            novo_funcionario = {
                'id': self.id,
                'nome': self.nome,
                'data_entrada': self.data_entrada,
                'cargo': self.cargo,
                'ativo': self.ativo
            }
            funcionarios.append(novo_funcionario)
        else:
            for funcionario in funcionarios:
                if funcionario['id'] == self.id:
                    funcionario.update({
                        'nome': self.nome,
                        'data_entrada': self.data_entrada,
                        'cargo': self.cargo,
                        'ativo': self.ativo
                    })
                    break
        
        db.salvar('funcionarios', funcionarios)
        return self.id
    
    @staticmethod
    def buscar_todos():
        return db.carregar('funcionarios')
    
    @staticmethod
    def buscar_ativos():
        funcionarios = db.carregar('funcionarios')
        return [func for func in funcionarios if func.get('ativo', True)]
    
    @staticmethod
    def buscar_por_id(id):
        funcionarios = db.carregar('funcionarios')
        for funcionario in funcionarios:
            if funcionario['id'] == id:
                return funcionario
        return None
    
    @staticmethod
    def buscar_por_nome(nome):
        funcionarios = db.carregar('funcionarios')
        return [func for func in funcionarios if nome.lower() in func['nome'].lower()]
    
    @staticmethod
    def excluir(id):
        funcionarios = db.carregar('funcionarios')
        funcionarios = [func for func in funcionarios if func['id'] != id]
        db.salvar('funcionarios', funcionarios)