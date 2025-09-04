import tkinter as tk
from tkinter import ttk
import sqlite3
from views.main_window import MainWindow
from models.database import Database

class FOLLHAApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Sistema F.O.L.H.A")
        self.root.geometry("1200x800")
        
        # Configurar ícone
        try:
            self.root.iconbitmap("assets/icons/app_icon.ico")
        except:
            pass
        
        # Inicializar banco de dados
        self.db = Database()
        self.setup_database()
        
        # Criar interface principal
        self.main_window = MainWindow(self.root, self.db)
        
    def setup_database(self):
        """Configura o banco de dados com dados iniciais"""
        # Inserir métodos de pagamento padrão
        metodos_pagamento = [
            ("Dinheiro", "Pagamento em espécie"),
            ("Cartão Débito", "Pagamento com cartão de débito"),
            ("Cartão Crédito", "Pagamento com cartão de crédito"),
            ("PIX", "Pagamento via PIX"),
            ("Transferência", "Transferência bancária")
        ]
        
        self.db.cursor.executemany(
            "INSERT OR IGNORE INTO metodos_pagamento (nome, descricao) VALUES (?, ?)",
            metodos_pagamento
        )
        self.db.conn.commit()
        
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = FOLLHAApp()
    app.run()