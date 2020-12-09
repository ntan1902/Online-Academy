require('./utils/mongoose');
const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')

const app = express()
const port= process.env.PORT || 3000

app.use(morgan('dev'))
app.use(express.urlencoded({
    extended: true
}))
app.use('/public', express.static('public'))

require('./middlewares/views.mdw')(app);
require('./middlewares/routes.mdw')(app);

app.listen(port, () => {
    console.log(`Web server is listening on http://localhost:${port}`)
})
