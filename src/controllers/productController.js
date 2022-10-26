const fs = require('fs');
const { validationResult } = require('express-validator');
const path = require('path');
const db = require('../database/models');
const { Op } = require('sequelize');
const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controlador = {

    list: async (req, res) => {
        try {
            let data;
            let search;

            // the page numbre is < or = to 0

            if (req.query.page <= 0) {
                let respuesta = {
                    meta: {
                        status: 400,
                        url: `/productos${req.url}`
                    },
                    data: 'El numero de pagina no puede ser menor o igual a 0'
                }
                res.status(400).json(respuesta)
            }

            // search query si empty

            if (req.query.search == "") {

                let respuesta = {
                    meta: {
                        status: 400,
                        url: `/productos${req.url}`,
                    },
                    data: 'Debe ingresar una condición de busqueda'
                }
                return res.status(400).json(respuesta);
            }

            if (req.query.page && req.query.search) {
                search = req.query.search
                data = await db.Product.findAndCountAll({
                    include: [{ model: db.Category, attributes: ['name'] }, { model: db.Brake, attributes: ['type'] }, { model: db.Brand, attributes: ['name'] }, { model: db.Image, attributes: ['fileName'] }, { model: db.WheelSize, attributes: ['number'] }, { model: db.Frame, attributes: ['name'] }, { model: db.Shift, attributes: ['number'] }, { model: db.Suspension, attributes: ['type'] }],
                    attributes: ['description', 'model', 'price', 'discount', 'id'],
                    where: { description: { [Op.like]: '%' + search + '%' } },
                    limit: 10,
                    offset: (req.query.page - 1) * 10
                })
            } else if (req.query.page) {
                data = await db.Product.findAndCountAll({
                    include: [{ model: db.Category, attributes: ['name'] }, { model: db.Brake, attributes: ['type'] }, { model: db.Brand, attributes: ['name'] }, { model: db.Image, attributes: ['fileName'] }, { model: db.WheelSize, attributes: ['number'] }, { model: db.Frame, attributes: ['name'] }, { model: db.Shift, attributes: ['number'] }, { model: db.Suspension, attributes: ['type'] }],
                    attributes: ['description', 'model', 'price', 'discount', 'id'],
                    limit: 10,
                    offset: (req.query.page - 1) * 10
                })
            } else if (req.query.search) {
                search = req.query.search
                data = await db.Product.findAndCountAll({
                    include: [{ model: db.Category, attributes: ['name'] }, { model: db.Brake, attributes: ['type'] }, { model: db.Brand, attributes: ['name'] }, { model: db.Image, attributes: ['fileName'] }, { model: db.WheelSize, attributes: ['number'] }, { model: db.Frame, attributes: ['name'] }, { model: db.Shift, attributes: ['number'] }, { model: db.Suspension, attributes: ['type'] }],
                    attributes: ['description', 'model', 'price', 'discount', 'id'],
                    where: { description: { [Op.like]: '%' + search + '%' } }
                })
            } else {
                data = await db.Product.findAndCountAll({
                    include: [{ model: db.Category, attributes: ['name'] }, { model: db.Brake, attributes: ['type'] }, { model: db.Brand, attributes: ['name'] }, { model: db.Image, attributes: ['fileName'] }, { model: db.WheelSize, attributes: ['number'] }, { model: db.Frame, attributes: ['name'] }, { model: db.Shift, attributes: ['number'] }, { model: db.Suspension, attributes: ['type'] }],
                    attributes: ['description', 'model', 'price', 'discount', 'id']
                })
            }

            let products = [...data.rows]
            let total = data.count

            // nothing was found
            if (total == 0) {

                let respuesta = {
                    meta: {
                        status: 404,
                        url: `/productos${req.url}`,
                    },
                    data: 'No se encontraron productos que cumplan con la condición'
                }
                res.status(404).json(respuesta);
            };

            // page number is greater than the total amount on the database
            if (req.query.page && req.query.page > Math.ceil(total / 10)) {

                let respuesta = {
                    meta: {
                        status: 400,
                        url: `/api/productos${req.url}`,
                    },
                    data: 'El número de páginas disponibles es: ' + Math.ceil(total / 10)
                }
                res.status(400).json(respuesta);
            };

            let respuesta = {
                meta: {
                    status: 200,
                    total: products.length,
                    url: `/productos${req.url}`,
                    next: (req.query.page && req.query.page * 10 < total) ? `/productos/?page=${+req.query.page + 1}${req.query.search ? '&search=' + req.query.search : ''}` : '',
                    previous: +req.query.page > 1 ? `/productos/?page=${+req.query.page - 1}${req.query.search ? '&search=' + req.query.search : ''}` : ''
                },
                data: products
            }

            res.status(200).json(respuesta);
        } catch (error) {
            res.json(error.message)
        }

    },

    productDetail: async (req, res) => {
        try {
            const id = +req.params.id;
            const product = await db.Product.findByPk(id, {
                include: [{ model: db.Category, attributes: ['name'] }, { model: db.Brake, attributes: ['type'] }, { model: db.Brand, attributes: ['name'] }, { model: db.Image, attributes: ['fileName'] }, { model: db.WheelSize, attributes: ['number'] }, { model: db.Frame, attributes: ['name'] }, { model: db.Shift, attributes: ['number'] }, { model: db.Suspension, attributes: ['type'] }],
                attributes: ['description', 'model', 'price', 'discount', 'id']
            });

            // the product was not found
            if (!product) {
                let respuesta = {
                    meta: {
                        status: 404,
                        url: `/productos/detalle/${id}`
                    },
                    data: 'El producto no existe'
                }
                res.status(404).json(respuesta)
            }

            let respuesta = {
                meta: {
                    status: 200,
                    url: `/productos/detalle/${id}`
                },
                data: product
            }
            res.status(200).json(respuesta)
        } catch (error) {
            res.json({ error: error.message });
        }

    },

    create: async (req, res) => {

        try {
            let data = req.body;

            // Validaciones de productos

            let errors = validationResult(req);
            if (errors.isEmpty()) {
                let imagenes = []
                let product = await db.Product.create(data);
                for (let i = 0; i < req.files.length; i++) {
                    imagenes.push({
                        fileName: req.files[i].filename,
                        productId: product.id
                    })
                }

                let respuesta = {
                    meta: {
                        status: 201,
                        url: '/productos/crear'
                    },
                    data: product
                }

                if (imagenes.length > 0) {
                    await db.Image.bulkCreate(imagenes)
                } else {
                    await db.Image.create([{
                        fileName: 'default-product-image.png',
                        productId: product.id,
                    }])
                }
                res.status(201).json(respuesta)

            } else {
                //if (req.files) {
                //    let {files} = req;
                //for (let i = 0 ; i< files.length; i++) {
                //    fs.unlinkSync(path.resolve(__dirname, '../../public/images/'+files[i].filename))
                //}
                //};

                let respuesta = {
                    meta: {
                        status: 400,
                        url: '/productos/crear'
                    },
                    data: errors.mapped()
                }

                res.status(400).json(respuesta)
            }
        } catch (error) {
            res.json({ error: error.message });
        }
    },

    edit: async (req, res) => {
        try {
            // Validaciones de productos

            let idToUpdate = req.params.id;
            let errors = validationResult(req);
            if (errors.isEmpty()) {

                let dataUpdate = req.body;
                let imagenes = []
                let product = await db.Product.update({
                    ...dataUpdate,
                }, {
                    where: {
                        id: idToUpdate
                    }
                });
                for (let i = 0; i < req.files.length; i++) {
                    imagenes.push({
                        fileName: req.files[i].filename,
                        productId: idToUpdate
                    })
                }
                if (imagenes.length > 0) {
                    const oldImages = await db.Image.findAll({ where: { productId: idToUpdate } })
                    oldImages.forEach(image => {
                        fs.unlinkSync(path.resolve(__dirname, '../../public/images/' + image.fileName))
                    })
                    await db.Image.destroy({ where: { productId: idToUpdate } })
                    await db.Image.bulkCreate(imagenes)
                }

                let respuesta = {
                    meta: {
                        status: 200,
                        url: `/productos/editar/${idToUpdate}`
                    },
                    data: product
                }
                res.status(200).json(respuesta)
            } else {
                if (req.files) {
                    let { files } = req;
                    for (let i = 0; i < files.length; i++) {
                        fs.unlinkSync(path.resolve(__dirname, '../../public/images/' + files[i].filename))
                    }
                };

                let respuesta = {
                    meta: {
                        status: 400,
                        url: `/productos/editar/${idToUpdate}`
                    },
                    data: errors.mapped()
                }
                res.status(400).json(respuesta)

            }
        } catch (error) {
            res.json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            let imagenes = await db.Image.findAll({
                where: { productId: id }
            });
            if (imagenes) {
                let files = imagenes.filter(image => image.fileName != 'default-product-image.png');
                for (let i = 0; i < files.length; i++) {
                    fs.unlinkSync(path.resolve(__dirname, '../../public/images/products/' + files[i].fileName))
                }
            };
            await db.Image.destroy({
                where: {
                    productId: id
                }
            }, {
                force: true
            });
            await db.Product.destroy({
                where: {
                    id
                }
            }, {
                force: true
            });
            res.redirect("/productos")
        } catch (error) {
            res.json(error.message)
        }
    },

    search: async (req, res) => {
        try {
            let search = req.query.search;
            let products = await db.Product.findAll({
                where: {
                    description: { [Op.like]: `%${search}%` }
                },
                include: [db.Image]
            });
            res.render('products/products', { products, toThousand });
        } catch (error) {
            res.json(error.message)
        }
    }

}

module.exports = controlador;