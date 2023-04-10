const db = require('../database/models');
const { Op } = require('sequelize');


const controlador = {
    add: async (req, res) => {
        try {
            let newCartItem = req.body;

            let cartItem = await db.Cart.create(newCartItem);

            let respuesta = {
                meta: {
                    status: 201,
                    url: 'carrito/agregar'
                },
                data: cartItem
            }

            res.status(201).json(respuesta)
        } catch (error) {
            res.json({ error: error.message });
        }
    },

    show: async (req, res) => {
        try {
            let userId = req.params.id
            let data = await db.Cart.findAndCountAll({
                include: [{model: db.Product, attributes: ['description', 'price', 'discount']}],
                attributes: ['quantity', 'productId', 'id'],
                where: { userId: {[Op.like]: userId}}
            })

            let cartItems = [...data.rows]
            let cartTotal = data.count

            cartItems = cartItems.map((item) => {
                // let images = await db.Image.findAll({
                //     attributes: ['fileName'],
                //     where: { productId: {[Op.like]: item.productId}}
                // })

                return {
                    product: {
                        description: item.Product.description,
                        price: item.Product.price,
                        discount: item.Product.discount,
                        // image: `/images/products/${images[0].fileName}`
                    },
                    quantity: item.quantity,
                    id: item.id
                }
            })
            
            let respuesta = {
                meta: {
                    status: 200,
                    url: `/carrito/${userId}`
                },
                data: cartItems,
                total: cartTotal
            }

            res.status(200).json(respuesta)
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = controlador;