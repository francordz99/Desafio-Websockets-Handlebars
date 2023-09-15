const ProductManager = require('./ProductManager');

// Lugar donde guarde el JSON
const path = 'C:\\Users\\Franco\\Desktop\\Personal\\Estudiante 2023\\Backend Coderhouse\\Desafio 2\\js\\products.json';

// Llamamos a ProductManager combinado con el JSON
const productManager = new ProductManager(path);

// Creamos el nuevo elemento en este caso un vegetal
const newVegetable = {
    title: 'Pimiento Amarillo',
    description: 'Pimiento amarillo de sabor dulce',
    price: 1.8,
    thumbnail: 'ruta-imagen-pimiento.jpg',
    stock: 30
};

// Agrega el producto al JSON
productManager.addProduct(newVegetable);

// Mostrar la lista de vegetales luego de agregar uno
console.log("Productos después de agregar uno nuevo:");
console.log(productManager.getProducts());

// ID del producto a actualizar
const productIdToUpdate = 3;

// Obtener el producto por su ID
const updatedProduct = productManager.getProductById(productIdToUpdate);

if (updatedProduct) {
    // Actualizar el stock del producto
    updatedProduct.stock = 80;

    // Actualizar el producto en el JSON
    productManager.updateProduct(productIdToUpdate, updatedProduct);

    // Obtener la lista de vegetales actualizada
    const updatedProducts = productManager.getProducts();

    // Escribir la lista de productos actualizada en el JSON
    productManager.writeProductsToFile(updatedProducts);

    console.log("Productos actualizados y escritos en el archivo.");
} else {
    console.log("Producto no encontrado.");
}

// ID del producto a eliminar
const productIdToDelete = 8;

// Eliminar el producto por su ID
productManager.deleteProduct(productIdToDelete);

// Mostrar la lista de productos después de eliminar uno
console.log("Productos después de eliminar uno:");
console.log(productManager.getProducts());

// ID del producto a buscar
const productIdToFind = 2;

// Buscar el producto por su ID
const foundProduct = productManager.getProductById(productIdToFind);

if (foundProduct) {
    console.log('Producto encontrado:', foundProduct);
} else {
    console.log('Producto no encontrado');
}
