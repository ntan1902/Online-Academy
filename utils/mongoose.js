const mongoose = require('mongoose')
const {URL} = require('../config/default')

mongoose.connect(URL, {
        useNewUrlParser: true,
        useCreateIndex: true, //work together
        useFindAndModify: false, // turn off warning
        useUnifiedTopology: true
})
    .then(() => console.log("Mongodb connected"))
    .catch(err => console.log(err))

