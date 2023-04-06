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
                search = req.query.search.toUpperCase()
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
                search = req.query.search.toUpperCase()
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

            products = products.map(product => {

                return {
                    price: product.price,
                    discount: product.discount,
                    id: product.id,
                    brand: product.Brand.name,
                    model: product.model,
                    description: product.description,
                    category: product.Category.name,
                    images: `/images/products/${product.Images[0].fileName}`,
                    detail: `/productos/detalle/${product.id}`
                };
            })

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
                        url: `/productos${req.url}`,
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

    highlights: async (req, res) => {
        try {
            let data = await db.Product.findAndCountAll({
                    include: [{ model: db.Category, attributes: ['name'] }, { model: db.Brake, attributes: ['type'] }, { model: db.Brand, attributes: ['name'] }, { model: db.Image, attributes: ['fileName'] }, { model: db.WheelSize, attributes: ['number'] }, { model: db.Frame, attributes: ['name'] }, { model: db.Shift, attributes: ['number'] }, { model: db.Suspension, attributes: ['type'] }],
                    attributes: ['description', 'model', 'price', 'discount', 'id'],
                    order: [['discount', 'DESC']],
                    limit: 8
                })

            let products = [...data.rows]
            let total = data.count

            products = products.map(product => {

                return {
                    price: product.price,
                    discount: product.discount,
                    id: product.id,
                    brand: product.Brand.name,
                    model: product.model,
                    description: product.description,
                    category: product.Category.name,
                    images: `/images/products/${product.Images[0].fileName}`,
                    detail: `/productos/detalle/${product.id}`
                };
            })

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

            let respuesta = {
                meta: {
                    status: 200,
                    total: products.length,
                    url: `/productos${req.url}`,
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
            let product = await db.Product.findByPk(id, {
                include: [{ model: db.Category, attributes: ['name'] }, 
                { model: db.Brake, attributes: ['type'] }, 
                { model: db.Brand, attributes: ['name'] }, 
                { model: db.Image, attributes: ['fileName'] }, 
                { model: db.WheelSize, attributes: ['number'] }, 
                { model: db.Frame, attributes: ['name'] }, 
                { model: db.Shift, attributes: ['number'] }, 
                { model: db.Suspension, attributes: ['type'] }, 
                { model: db.Color, attributes: ['name'] }, 
                { model: db.Type, attributes: ['name'] }, 
                { model: db.Size, attributes: ['name'] }],
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
            
            product = {
                price: product.price,
                discount: product.discount,
                id: product.id,
                brand: product.Brand.name,
                model: product.model,
                description: product.description,
                brake: product.Brake ? product.Brake.type : product.Brake,
                wheelSize: product.WheelSize ? product.WheelSize.number : product.WheelSize,
                frame: product.Frame ? product.Frame.name : product.Frame,
                shift: product.Shift ? product.Shift.number : product.Shift,
                suspension: product.Suspension ? product.Suspension.type : product.Suspension,
                color: product.Color ? product.Color.name : product.Color,
                size: product.Size ? product.Size.name : product.Size,
                type: product.Type ? product.Type.name : product.Type,
                category: product.Category.name,
                images: `/images/products/${product.Images[0].fileName}`
            };
            

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

    productDetailInfo: async (req, res) => {
        try {
            const id = +req.params.id;
            let product = await db.Product.findByPk(id, {
                include: [{ model: db.Category, attributes: ['id'] }, 
                { model: db.Brake, attributes: ['id'] }, 
                { model: db.Brand, attributes: ['id'] }, 
                { model: db.Image, attributes: ['fileName'] }, 
                { model: db.WheelSize, attributes: ['id'] }, 
                { model: db.Frame, attributes: ['id'] }, 
                { model: db.Shift, attributes: ['id'] }, 
                { model: db.Suspension, attributes: ['id'] }, 
                { model: db.Color, attributes: ['id'] }, 
                { model: db.Type, attributes: ['id'] }, 
                { model: db.Size, attributes: ['id'] }],
                attributes: ['description', 'model', 'price', 'discount', 'id']
            });

            // the product was not found
            if (!product) {
                let respuesta = {
                    meta: {
                        status: 404,
                        url: `/productos/detalle-info/${id}`
                    },
                    data: 'El producto no existe'
                }
                res.status(404).json(respuesta)
            }
            
            product = {
                price: product.price,
                discount: product.discount,
                id: product.id,
                brandId: product.Brand.id,
                model: product.model,
                description: product.description,
                brakeId: product.Brake ? product.Brake.id : product.Brake,
                wheelSizeId: product.WheelSize ? product.WheelSize.id : product.WheelSize,
                frameId: product.Frame ? product.Frame.id : product.Frame,
                shiftId: product.Shift ? product.Shift.id : product.Shift,
                suspensionId: product.Suspension ? product.Suspension.id : product.Suspension,
                colorId: product.Color ? product.Color.id : product.Color,
                sizeId: product.Size ? product.Size.id : product.Size,
                typeId: product.Type ? product.Type.id : product.Type,
                categoryId: product.Category.id,
                images: `/images/products/${product.Images[0].fileName}`
            };
            

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

    formInfo: async (req, res) => {
        try {
            // traemos las categorias 
            let categories = await db.Category.findAll()
            // Creamos un array 
            let categoriesJson = [];

            categories.forEach( category => {
                categoriesJson.push(category.toJSON())
            });

            // traemos los frenos 
            let brakes = await db.Brake.findAll()
            // Creamos un array 
            let brakesJson = [];

            brakes.forEach( brake => {
                brakesJson.push(brake.toJSON())
            });

            // traemos las marcas 
            let brands = await db.Brand.findAll()
            // Creamos un array 
            let brandsJson = [];

            brands.forEach( brand => {
                brandsJson.push(brand.toJSON())
            });

            // traemos los rodados 
            let wheelSizes = await db.WheelSize.findAll()
            // Creamos un array 
            let wheelSizesJson = [];

            wheelSizes.forEach( wheelSize => {
                wheelSizesJson.push(wheelSize.toJSON())
            });

            // traemos los cuadros 
            let frames = await db.Frame.findAll()
            // Creamos un array 
            let framesJson = [];

            frames.forEach( frame => {
                framesJson.push(frame.toJSON())
            });

            // traemos los cambios 
            let shifts = await db.Shift.findAll()
            // Creamos un array 
            let shiftsJson = [];

            shifts.forEach( shift => {
                shiftsJson.push(shift.toJSON())
            });

            // traemos las suspensiones 
            let suspensions = await db.Suspension.findAll()
            // Creamos un array 
            let suspensionsJson = [];

            suspensions.forEach( suspension => {
                suspensionsJson.push(suspension.toJSON())
            });

            // traemos los tipos 
            let types = await db.Type.findAll()
            // Creamos un array 
            let typesJson = [];

            types.forEach( type => {
                typesJson.push(type.toJSON())
            });

            // traemos los talles
            let sizes = await db.Size.findAll()
            // Creamos un array 
            let sizesJson = [];

            sizes.forEach( size => {
                sizesJson.push(size.toJSON())
            });

            // traemos los colores
            let colors = await db.Color.findAll()
            // Creamos un array 
            let colorsJson = [];

            colors.forEach( color => {
                colorsJson.push(color.toJSON())
            });

            // Creamos un objeto literal con todos los datos traidos

            let data = {
                categories: categoriesJson,
                types:  typesJson,
                sizes: sizesJson,
                colors: colorsJson,
                brakes: brakesJson,
                brands: brandsJson,
                wheelSizes: wheelSizesJson,
                frames: framesJson,
                shifts: shiftsJson,
                suspensions: suspensionsJson
            }

            // creamos la respuesta

            let respuesta = {
                meta: {
                    status: 200,
                    url: '/api/productos/info-formulario'
                },
                data: data
            }

            res.status(200).json(respuesta)
        } catch (error) {
            res.json(error.message);
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
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        imagenes.push({
                            fileName: req.files[i].filename,
                            productId: product.id
                        })
                    }
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
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        imagenes.push({
                            fileName: req.files[i].filename,
                            productId: idToUpdate
                        })
                    }
                }
                
                if (imagenes.length > 0) {
                    // const oldImages = await db.Image.findAll({ where: { productId: idToUpdate } })
                    // console.log("---------oldImages--------", oldImages)
                    // oldImages.forEach(image => {
                    //     fs.unlinkSync(path.resolve(__dirname, '../../public/images/' + image.fileName))
                    // })
                    await db.Image.destroy({ where: { productId: idToUpdate } })
                    let result = await db.Image.bulkCreate(imagenes)
                    console.log("--------resultado--------- ",result)
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
            let data = await db.Product.findByPk(id);
            const product = await data?.toJSON();

            // let imagenes = await db.Image.findAll({
            //     where: { productId: id }
            // });
            // if (imagenes) {
            //     let files = imagenes.filter(image => image.fileName != 'default-product-image.png');
            //     for (let i = 0; i < files.length; i++) {
            //         fs.unlinkSync(path.resolve(__dirname, '../../public/images/products/' + files[i].fileName))
            //     }
            // };

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

            let respuesta = {
                meta: {
                    status: 200,
                    url: `/productos/eliminar/${id}`
                },
                data: product
            }

            res.status(200).json(respuesta)
        } catch (error) {
            res.json(error.message)
        }
    }
}

module.exports = controlador;