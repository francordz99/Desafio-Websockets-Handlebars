const express = require('express');
const { engine } = require('express-handlebars');
const ProductManager = require('./js/ProductManager.js');
const bodyParser = require('body-parser');
const cartFunctions = require('./js/cartFunctions');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 8080;
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path');
const cartRouter = express.Router();
const { generateUniqueCartId, addCartToStorage, getCartById, addProductToCart } = require('./js/cartFunctions');

app.use(express.json());
app.use(express.static('public'));
app.use('/api/carts', cartRouter);
app.use(bodyParser.json());

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

// Socket IO

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('addProduct', (product) => {
        try {
            const productManager = new ProductManager('./js/products.json');
            productManager.addProduct(product);

            io.emit('updateProducts');
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('deleteProduct', (productId) => {
        try {
            const productManager = new ProductManager('./js/products.json');
            productManager.deleteProduct(productId);

            io.emit('updateProducts');
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});


// Rutas Handlebars

app.get("/", async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const products = await productManager.getProducts();

        res.render("home", { products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

app.get("/realtime", async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const products = await productManager.getProducts();

        res.render("realtime", { products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos en tiempo real.' });
    }
});

// Rutas de products :

app.get('/products', async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const { limit } = req.query;
        const products = await productManager.getProducts();

        if (limit) {
            const limitedProducts = products.slice(0, parseInt(limit));
            res.json(limitedProducts);
        } else {
            res.json(products);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

app.get('/products/:pid', async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const { pid } = req.params;
        const product = await productManager.getProductById(parseInt(pid));

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado o inexistente.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});

app.post('/', async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        const newProduct = {
            title,
            description,
            code,
            price: Number(price),
            status: true,
            stock: Number(stock),
            category,
            thumbnails: thumbnails || [],
        };

        productManager.addProduct(newProduct);

        io.emit('updateProducts');

        res.status(201).json({ message: 'Producto agregado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto.' });
    }
});

app.put('/:pid', async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const { pid } = req.params;
        const updatedFields = req.body;

        const product = await productManager.getProductById(parseInt(pid));

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado o inexistente.' });
        }

        delete updatedFields.id;

        productManager.updateProduct(parseInt(pid), updatedFields);
        io.emit('updateProducts');
        res.json({ message: 'Producto actualizado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
});

app.delete('/:pid', async (req, res) => {
    try {
        const productManager = new ProductManager('./js/products.json');
        const { pid } = req.params;

        const product = await productManager.getProductById(parseInt(pid));

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado o inexistente.' });
        }

        productManager.deleteProduct(parseInt(pid));

        io.emit('updateProducts');
        res.json({ message: 'Producto eliminado con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
});

// Rutas del carrito : 

cartRouter.post('/', (req, res) => {
    try {
        const cartId = generateUniqueCartId();

        const newCart = {
            id: cartId,
            products: []
        };

        addCartToStorage(newCart);

        io.emit('updateCarts');

        res.status(201).json({ message: 'Carrito creado con éxito.', cart: newCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el carrito.' });
    }
});

cartRouter.get('/:cid', (req, res) => {
    try {
        const { cid } = req.params;
        const cart = cartFunctions.getCartById(cid);

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado o inexistente.' });
        }

        res.json(cart.products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos del carrito.' });
    }
});

cartRouter.post('/:cid/product/:pid', (req, res) => {
    try {
        const { cid, pid } = req.params;

        cartFunctions.addProductToCart(cid, pid);
        io.emit('updateCarts');

        res.json({ message: 'Producto agregado al carrito con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
    }
});

// Arrancar el server
server.listen(port, () => {
    console.log(`Servidor Express escuchando en el puerto ${port}`);
});
