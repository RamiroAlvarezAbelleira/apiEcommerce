require('dotenv').config()
module.exports = {
  
  "development": {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'HIOUNYMGOERdxfMrgJmA',
  database: process.env.DB_DATABASE || 'railway',
  host: process.env.DB_HOST || 'containers-us-west-26.railway.app',
  port: process.env.DB_PORT || '5832',
  dialect: process.env.DB_DIALECT || 'mysql'
  }

}