const mysql_opts = {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "123456",
        database: "online_academy",
        waitForConnections: true,
        connectionLimit: 50,
        queueLimit: 0
}

module.exports = {
    mysql_opts
}