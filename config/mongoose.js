const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://ntan1902:an190200@onlineacademycluster.x4dcq.mongodb.net/OnlineAcademy?retryWrites=true&w=majority"
, {
    useNewUrlParser: true,
    useCreateIndex:true, //work together
    useFindAndModify:false, // turn off warning
    useUnifiedTopology: true
})

