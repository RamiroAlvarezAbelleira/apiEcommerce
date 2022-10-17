const { User } = require('../database/models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const controlador = {

    list: async (req, res) => {
        try {
            let data;
            if (req.query.page <= 0) {
                let respuesta = {
                    meta: {
                        status: 400,
                        url: `/usuarios${req.url}`
                    },
                    data: 'el numero de pagina debe ser mayor o igual a 1'
                }
                return res.status(400).json(respuesta)
            } else if (req.query.page > 0) {
                data = await User.findAndCountAll({
                    attributes: ['id', 'firstName', 'lastName', 'email', 'image'],
                    limit: 10,
                    offset: (req.query.page - 1) * 10
                })
            } else {
                data = await User.findAndCountAll({
                    attributes: ['id', 'firstName', 'lastName', 'email', 'image']
                })
            }

            let users = [...data.rows];
            let total = data.count;
            let cantPaginas = Math.ceil(total/10);

            if (req.query.page && req.query.page > cantPaginas) {
                let respuesta = {
                    meta: {
                        status: 400,
                        url: `/usuarios${req.url}`
                    },
                    data: `el numero total de paginas es ${cantPaginas}`
                }
                return res.status(400).json(respuesta)
            }

            users = users.map(user => {
                return {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    detail: `/usuarios/${user.id}`
                }
            })

            let respuesta = {
                meta: {
                    status: 200,
                    total: users.length,
                    next: (req.query.page && req.query.page < total/10) ? `/usuarios?page=${+req.query.page + 1}` : '',
                    previous: +req.query.page > 1 ? `/usuarios?page=${+req.query.page - 1}` : ''
                },
                data: users
            }

            return res.status(200).json(respuesta)

        } catch (error) {
            res.json(error.message)
        }  
    },

    detail: async (req, res) => {
        try {
            let id = +req.params.id;
            let data = await User.findByPk(id);
            let user = await data?.toJSON()

            if (user == null) {
                let respuesta = {
                    meta: {
                        status: 404,
                        url: `/usuarios/${id}`
                    },
                    data: 'El usuario no existe'
                }
                return res.status(404).json(respuesta)
            }

            delete user.password;
            delete user.roleId;
            let userImage = user.image;
            user.image = `/images/users/${userImage}`


            let respuesta = {
                meta: {
                    status: 200,
                    url: `/usuarios/${id}`
                },
                data: user
            }
            return res.status(200).json(respuesta)
            
        } catch (error) {
            res.json(error.message)
        }  
    },

    store: async (req, res) => {
        try {
            let user = req.body;
            let errors = validationResult(req);
            if (errors.isEmpty()) {
                user.password = bcryptjs.hashSync(user.password, 10);
                user.image = req.files?.filename ? req.files.filename : 'default-user.png'

                let newUser = await User.create({...user})
                newUser = await newUser.toJSON()

                delete newUser.password
                delete newUser.roleId

                let respuesta = {
                    meta: {
                        status: 201,
                        url: `/usuarios/${newUser.id}`
                    },
                    data: newUser
                }
                res.status(201).json(respuesta);
            } else {

                let errores = errors.mapped();
                let respuesta = {
                    meta: {
                        status: 400,
                        url: '/usuarios/crear'
                    },
                    data: errores
                }

                res.status(400).json(respuesta);
            }

        } catch (error) {
            res.json(error.message)
        }  
    },

    update: async (req, res) => {
        try {
            
        } catch (error) {
            res.json(error.message)
        }  
    },

    delete: async (req, res) => {
        try {

        } catch (error) {
            res.json(error.message)
        }  
    }
}

module.exports = controlador;