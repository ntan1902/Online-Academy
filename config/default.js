const user = "ntan1902"
const pass = "an190200"
const database = "OnlineAcademy"

module.exports = {
    URL: `mongodb+srv://${user}:${pass}@onlineacademycluster.x4dcq.mongodb.net/${database}?retryWrites=true&w=majority`
}