const express = require("express");
require("dotenv").config();

const connect = require("./data/connect.database");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const mainRoutes = require("./routes/main.routes");

const { resourceNotFound, defaultErrorHandler } = require("./middlewares/errorHandlers.middlewares");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use(mainRoutes);

app.use(resourceNotFound);
app.use(defaultErrorHandler);

connect().then(() => {
    console.log("Server started!");
    app.listen(process.env.PORT || 3000);
}).catch(console.log);
