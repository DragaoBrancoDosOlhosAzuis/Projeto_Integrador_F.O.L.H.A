import os

class Config:
    # Configurações do banco de dados
    DATABASE_PATH = os.path.join('data', 'database.db')
    
    # Configurações de paths
    ASSETS_DIR = 'assets'
    ICONS_DIR = os.path.join(ASSETS_DIR, 'icons')
    STYLES_DIR = os.path.join(ASSETS_DIR, 'styles')
    DATA_DIR = 'data'
    TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates')
    
    # Configurações da interface
    WINDOW_WIDTH = 1200
    WINDOW_HEIGHT = 800
    FONT_FAMILY = "Arial"
    FONT_SIZE = 10
    
    # Cores
    PRIMARY_COLOR = "#2c3e50"
    SECONDARY_COLOR = "#3498db"
    SUCCESS_COLOR = "#27ae60"
    WARNING_COLOR = "#f39c12"
    DANGER_COLOR = "#e74c3c"
    
    @classmethod
    def create_directories(cls):
        """Cria os diretórios necessários"""
        directories = [
            cls.ASSETS_DIR,
            cls.ICONS_DIR,
            cls.STYLES_DIR,
            cls.DATA_DIR,
            cls.TEMPLATES_DIR
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)