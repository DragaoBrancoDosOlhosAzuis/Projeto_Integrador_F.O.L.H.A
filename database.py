import sqlite3
import os
from config import Config

class Database:
    def __init__(self):
        Config.create_directories()
        self.conn = sqlite3.connect(Config.DATABASE_PATH)
        self.cursor = self.conn.cursor()
        self.create_tables()
        
    def create_tables(self):
        """Cria todas as tabelas do banco de dados"""
        tables = [
            """
            CREATE TABLE IF NOT EXISTS funcionarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                ativo INTEGER DEFAULT 1,
                data_cadastro DATE DEFAULT CURRENT_DATE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS lojas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                endereco TEXT,
                telefone TEXT,
                ativo INTEGER DEFAULT 1,
                data_cadastro DATE DEFAULT CURRENT_DATE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS subcategorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria_id INTEGER,
                nome TEXT NOT NULL,
                descricao TEXT,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                categoria_id INTEGER,
                subcategoria_id INTEGER,
                preco REAL NOT NULL,
                ativo INTEGER DEFAULT 1,
                data_cadastro DATE DEFAULT CURRENT_DATE,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id),
                FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS metodos_pagamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS vendas_clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data_venda DATE DEFAULT CURRENT_DATE,
                hora_venda TIME DEFAULT CURRENT_TIME,
                funcionario_id INTEGER,
                metodo_pagamento_id INTEGER,
                quantidade_parcelas INTEGER DEFAULT 1,
                valor_total REAL NOT NULL,
                FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
                FOREIGN KEY (metodo_pagamento_id) REFERENCES metodos_pagamento(id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS itens_venda_clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                venda_id INTEGER,
                produto_id INTEGER,
                quantidade INTEGER NOT NULL,
                preco_unitario REAL NOT NULL,
                subtotal REAL NOT NULL,
                produto_personalizado TEXT,
                FOREIGN KEY (venda_id) REFERENCES vendas_clientes(id),
                FOREIGN KEY (produto_id) REFERENCES produtos(id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS servicos_lojas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                loja_id INTEGER,
                data_servico DATE DEFAULT CURRENT_DATE,
                funcionario_id INTEGER,
                valor_total REAL NOT NULL,
                pago INTEGER DEFAULT 0,
                data_pagamento DATE,
                FOREIGN KEY (loja_id) REFERENCES lojas(id),
                FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS itens_servico_lojas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                servico_id INTEGER,
                produto_id INTEGER,
                quantidade INTEGER NOT NULL,
                preco_unitario REAL NOT NULL,
                subtotal REAL NOT NULL,
                produto_personalizado TEXT,
                FOREIGN KEY (servico_id) REFERENCES servicos_lojas(id),
                FOREIGN KEY (produto_id) REFERENCES produtos(id)
            )
            """
        ]
        
        for table in tables:
            self.cursor.execute(table)
        
        self.conn.commit()
    
    def close(self):
        """Fecha a conexão com o banco de dados"""
        self.conn.close()