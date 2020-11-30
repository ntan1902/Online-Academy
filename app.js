const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')


const app = express()
const PORT = 3000

app.use(morgan('dev'))

app.engine('hbs', exphbs({
    defaultLayout: "main.hbs"
}))
app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(PORT, () => {
    console.log(`Web server is listening on http://localhost:${PORT}`)
})
