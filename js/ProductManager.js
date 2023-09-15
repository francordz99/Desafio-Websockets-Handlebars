const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    readProductsFromFile() {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo:", error);
            return [];
        }
    }

    writeProductsToFile(products) {
        try {
            fs.writeFileSync(this.path, JSON.stringify(products, null, 2), 'utf-8');
        } catch (error) {
            console.error("Error al escribir en el archivo:", error);
        }
    }

    addProduct(product) {
        const products = this.readProductsFromFile();
        const lastProductId = products.length > 0 ? products[products.length - 1].id : 0;
        product.id = lastProductId + 1;
        product.code = `CODE${product.id.toString().padStart(3, '0')}`;
        products.push(product);
        this.writeProductsToFile(products);
    }


    getProducts() {
        return this.readProductsFromFile();
    }

    getProductById(id) {
        const products = this.readProductsFromFile();
        return products.find(product => product.id === id);
    }

    updateProduct(id, updatedFields) {
        const products = this.readProductsFromFile();
        const index = products.findIndex(product => product.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedFields };
            this.writeProductsToFile(products);
        }
    }

    deleteProduct(id) {
        const products = this.readProductsFromFile();
        const filteredProducts = products.filter(product => product.id !== id);
        this.writeProductsToFile(filteredProducts);
    }
}

module.exports = ProductManager;
