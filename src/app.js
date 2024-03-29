const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const publicPath = path.join(__dirname, '../public');
const app = express();
const cookies = require('cookie-parser')
const port = 3000;
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const session = require('express-session');
const loggedUserMW = require('./middleware/loggedUserMW');

/*SETTING*/

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({
    secret: 'shhh',
    resave: false,
    saveUninitialized: false
}));
app.use(cookies());
app.use(loggedUserMW);

/*RUTAS*/

app.use('/productos', productRoutes);
app.use('/usuarios', userRoutes);
app.use('/carrito', cartRoutes);
app.listen(process.env.PORT || port, () => console.log(`servidor funcionando en el puerto ${port}`));





