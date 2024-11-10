const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

let products = [];

app.get('/', (req, res) => {
    res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products });
});

app.post('/add-product', (req, res) => {
    const { name, price } = req.body;
    const newProduct = { id: Date.now(), name, price };
    products.push(newProduct);
    io.emit('new-product', newProduct);
    res.redirect('/');
});

app.post('/delete-product/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(product => product.id != id);
    io.emit('delete-product', id);
    res.redirect('/realtimeproducts');
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.emit('all-products', products);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});