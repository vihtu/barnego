// Getting from HTML
const showItems = document.querySelector('#showItems') // Left
// Right
const showAllItemsValue = document.querySelector('#showAllItemsValue')
const showDelivery = document.querySelector('#showDelivery')
const showDiscount = document.querySelector('#showDiscount')
const showTotal = document.querySelector('#showTotal')
const inputPromotionCode = document.querySelector('#promotionCode')
const btnAddPromotionCode = document.querySelector('#addPromotionCode')
const btnWantDelivery = document.querySelector('#wantDelivery')
const btnDontWantDelivery = document.querySelector('#dontWantDelivery')
const btnGenerateOrder = document.querySelector('#generateOrder')
const qrCodeContainer = document.querySelector('#qrCodeContainer')


// Get
const getCart = () => JSON.parse(localStorage.getItem('cart')) || []

// Set
const setCart = cartData => localStorage.setItem('cart', JSON.stringify(cartData))




// Items
let cart
let itemsToShow
let allItemsValue
let deliveryValue = 0
let discountValue = 0
const promotionCode = 'easteregg'

// Functions
const generateCart = () => {
    const cartItems = getCart()

    cart = []
    allItemsValue = 0

    cartItems.forEach(prod => {
        const item = products.find(element => element.id === prod.id)
        item.qtd = prod.qtd

        allItemsValue += item.price * item.qtd
        cart.push(item)
    })

    return cart
}

const addItemToItemsToShow = prod => {
    const price = (prod.price * prod.qtd).toFixed(2).toString().replace('.', ',');
    
    // Usa diretamente a URL completa do produto
    itemsToShow += `
    <div class="item">
        <img src="${prod.img}" alt="Imagem de um(a) ${prod.name}">
        <div>
            <p class="title">${prod.name}</p>
            <p>${prod.description}</p>
            <div class="bottom">
                <div class="counter">
                    <button onclick="remItem(${prod.id})">-</button>
                    <input type="text" value="${prod.qtd}" disabled>
                    <button onclick="addItem(${prod.id})">+</button>
                </div>
                <p class="price">R$ <span>${price}</span></p>
            </div>
        </div>
    </div>
    <hr>`;
};


const addItem = id => {
    const cartItems = getCart()
    const newCartItems = []

    cartItems.forEach(item => {
        if (item.id === id)
            newCartItems.push({ id: item.id, qtd: item.qtd + 1 })
        else
            newCartItems.push({ id: item.id, qtd: item.qtd })
    })

    setCart(newCartItems)
    init()
}

const remItem = id => {
    const cartItems = getCart()
    const newCartItems = []

    cartItems.forEach(item => {
        if (item.id === id && item.qtd > 1)
            newCartItems.push({ id: item.id, qtd: item.qtd - 1 })
        else if (item.id === id && item.qtd <= 1)
            itemRemovedNotification.showToast()
        else
            newCartItems.push({ id: item.id, qtd: item.qtd })
    })

    setCart(newCartItems)
    init()
}

const chooseDelivery = option => {
    if (option) {
        btnWantDelivery.classList.add('active')
        btnDontWantDelivery.classList.remove('active')

        deliveryValue = 3
    } else {
        btnWantDelivery.classList.remove('active')
        btnDontWantDelivery.classList.add('active')

        deliveryValue = 0
    }

    init()
}

const addDiscount = () => {
    const code = inputPromotionCode.value.trim().toLowerCase()

    if (code === promotionCode) {
        discountValue = 15
        appliedCode.showToast()

        init()
    } else codeNotFound.showToast()
}


const init = () => {
    const generatedCart = generateCart()
    generatedCart.length > 0 && generatedCart.sort((a, b) => a.type < b.type ? -1 : a.type > b.type ? 1 : 0 )

    itemsToShow = ''
    showItems.innerHTML = ''

    if (generatedCart.length > 0)
        generatedCart.forEach(data => addItemToItemsToShow(data));
    else
        itemsToShow = '<p>Você ainda não adicionou itens no carrinho.</p>'

    showOnPage()
}

const showOnPage = () => {
    showItems.innerHTML = itemsToShow

    const totalValue = allItemsValue + deliveryValue
    showAllItemsValue.innerHTML = 'R$ ' + allItemsValue.toFixed(2).toString().replace('.', ',')
    showDelivery.innerHTML = '+ R$ ' + deliveryValue.toFixed(2).toString().replace('.', ',')
    showDiscount.innerHTML = '- R$ ' + ((totalValue * discountValue)/100).toFixed(2).toString().replace('.', ',')
    showTotal.innerHTML = 'R$ ' + (totalValue - ((totalValue * discountValue)/100)).toFixed(2).toString().replace('.', ',')
}

const generateOrder = () => {
    const generatedCart = generateCart()
    const totalValue = allItemsValue + deliveryValue
    const finalTotal = totalValue - ((totalValue * discountValue) / 100)



    

    if (generatedCart.length === 0) {
        return noItemsInCart.showToast()
    }
    

    let cartMessage = 'Boa noite! Gostaria de encomendar: \n'

    generatedCart.forEach(item => {
        cartMessage += `- ${item.qtd}x ${item.name}\n`
    })

    if (discountValue > 0) cartMessage += `\nEstou utilizando o cupom: ${promotionCode}.`
    if (deliveryValue > 0) {
        cartMessage += '\nDesejo delivery.'
    } else {
        cartMessage += '\nVou retirar no local.'
    }

    cartMessage += `\n\nTotal: R$ ${finalTotal.toFixed(2).toString().replace('.', ',')}`

    // Número do WhatsApp da loja (adicione o número aqui)
    const whatsappNumber = '5592985214323'; // Exemplo de número com o código do país

    // Cria o link para o WhatsApp
    const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(cartMessage)}`;

    // Redireciona o usuário para o WhatsApp
    window.open(whatsappLink, '_blank');
   
   // Enviar dados do carrinho para o backend
   if (generatedCart.length === 0) {
    return noItemsInCart.showToast();
}

// Monta a requisição
fetch('/generate_order', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        cart: generatedCart,
        total: finalTotal.toFixed(2),
    }),
})
.then(response => response.json())
.then(data => {
    console.log(data.message);  // Mensagem de sucesso
    // Aqui você pode adicionar lógica para lidar com a resposta
})
.catch(error => {
    console.error('Erro:', error);
});
};






    


// Notifications
const itemRemovedNotification = Toastify({
    text: "Produto removido do carrinho de compras.",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
        background: "#FF7F0A",
        boxShadow: "0 0 160px 0 #0008"
    }
})

const appliedCode = Toastify({
    text: "Cupom aplicado com sucesso!",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
        background: "#FF7F0A",
        boxShadow: "0 0 160px 0 #0008"
    }
})

const codeNotFound = Toastify({
    text: "Cupom não encontrado!",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
        background: "#FF7F0A",
        boxShadow: "0 0 160px 0 #0008"
    }
})

const noItemsInCart = Toastify({
    text: "Não é possível gerar pedido sem ter item no carrinho.",
    duration: 5000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
        background: "#FF7F0A",
        boxShadow: "0 0 160px 0 #0008"
    }
})

btnAddPromotionCode.addEventListener('click', addDiscount)
btnWantDelivery.addEventListener('click', function () { chooseDelivery(true) })
btnDontWantDelivery.addEventListener('click', function () { chooseDelivery(false) })
btnGenerateOrder.addEventListener('click', generateOrder)

init()

// Easter Egg
console.log('Você achou o Easter Egg do site =D\nUse o cupom EASTEREGG e ganhe 15% de desconto!')
