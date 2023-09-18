const socket = io();

socket.on('connect', () => {
    console.log('Connected to Socket.io server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.io server');
});

socket.on('updateProducts', () => {
    fetchProducts();
});

socket.on('updateCarts', () => {
});

function fetchProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('productList');
            productList.innerHTML = '';

            products.forEach(product => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>Nombre:</strong> ${product.title}, 
                        <strong>Descripción:</strong> ${product.description}, 
                        <strong>Precio:</strong> $${product.price}, 
                        <strong>Stock:</strong> ${product.stock}`;
                productList.appendChild(li);
            });
        })
        .catch(error => console.error('Error al obtener la lista de productos:', error));
}

document.addEventListener('DOMContentLoaded', fetchProducts);
