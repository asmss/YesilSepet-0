const mysql = require("mysql2")
require("dotenv").config()

const connect = mysql.createPool({
    host : process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

if(connect){
    console.log("veri tabanı bağlantısı sağlandı")
}
module.exports = connect.promise()