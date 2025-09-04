import subprocess
import sys

def install_packages():
    """Instala os pacotes necessários individualmente"""
    packages = [
        "openpyxl",
        "pandas", 
        "numpy",
        "pillow"
    ]
    
    for package in packages:
        try:
            print(f"Instalando {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} instalado com sucesso!")
        except subprocess.CalledProcessError:
            print(f"⚠️  Não foi possível instalar {package}")
            print("Tentando instalar sem dependências...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--no-deps"])
                print(f"✅ {package} instalado sem dependências!")
            except:
                print(f"❌ Falha crítica ao instalar {package}")

if __name__ == "__main__":
    install_packages()