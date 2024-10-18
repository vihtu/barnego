import pandas as pd
from flask import Flask, request, jsonify, render_template
import os

app = Flask(__name__)

# Nome do arquivo Excel para armazenar 
excel_file_path = 'pedidos.xlsx'

@app.route('/')
def index():
    return render_template('index.html')  # Página ini

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

if __name__ == '__main__':
    app.run(debug=True)
