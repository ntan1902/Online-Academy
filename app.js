const express = require("express");
const morgan = require("morgan");
require("express-async-errors");

const app = express();
const port = process.env.PORT || 4000;

// app.usehẻ(morgan("dev"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/public", express.static("public"));

require("./middlewares/session.mdw")(app);
require("./middlewares/views.mdw")(app);
require("./middlewares/locals.mdw")(app);
require("./middlewares/controllers.mdw")(app);

app.listen(port, () => {
  console.log(`Web server is listening on http://localhost:${port}`);
});
