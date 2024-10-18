import pandas as pd
from flask import Flask, request, jsonify, render_template, send_file, redirect, url_for, session
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta'  # Altere isso para uma chave mais segura

# Nome do arquivo Excel para armazenar 
excel_file_path = 'pedidos.xlsx'

# Função para exigir autenticação
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')  # Página inicial

@app.route('/cart')
def cart():
    return render_template('view/cart.html')  # Página do carrinho

# Rota para gerar pedidos
@app.route('/generate_order', methods=['POST'])
def generate_order():
    cart_data = request.json.get('cart', [])
    total_value = request.json.get('total', 0)

    # Criar um DataFrame com os produtos
    products_list = []
    for item in cart_data:
        products_list.append({
            'Nome': item['name'],
            'Quantidade': item['qtd'],
            'Preço Unitário': item['price'],
            'Total': item['price'] * item['qtd']
        })

    # Criar um DataFrame
    df = pd.DataFrame(products_list)

    # Adicionar uma linha para o total
    total_row = pd.DataFrame({'Nome': ['Total'], 'Quantidade': [''], 'Preço Unitário': [''], 'Total': [total_value]})
    df = pd.concat([df, total_row], ignore_index=True)

    # Verificar se o arquivo já existe
    if os.path.exists(excel_file_path):
        # Se existir, carregar o DataFrame existente
        existing_df = pd.read_excel(excel_file_path)
        # Concatenar com o novo DataFrame
        updated_df = pd.concat([existing_df, df], ignore_index=True)
    else:
        # Se não existir, usar apenas o novo DataFrame
        updated_df = df

    # Salvar o DataFrame atualizado no arquivo Excel
    updated_df.to_excel(excel_file_path, index=False)

    return jsonify({"message": "Pedido gerado com sucesso!", "file": excel_file_path})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        # Altere a senha para a que você deseja
        if password == '12345':  # Altere isso para a senha desejada
            session['logged_in'] = True  # Altere 'teste' para 'logged_in'
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Usuário ou senha incorretos.')  # Mensagem de erro

    return render_template('login.html')  # Página de login

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))

# Rota para download do arquivo Excel
@app.route('/download_excel')
@login_required
def download_excel():
    try:
        return send_file(excel_file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Obtém a porta do ambiente do Render ou usa a porta 5000 por padrão
    port = int(os.environ.get("PORT", 5000))
    # Faz o app rodar no host 0.0.0.0 e na porta especificada
    app.run(host="0.0.0.0", port=port, debug=True)
