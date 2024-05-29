const mongoose = require("mongoose");
exports.connectDatabase = () => {
    mongoose
        .connect(process.env.MONGO)
        .then((con) => console.log(`Database Connected:`))
        .catch((err) => console.log(err));
}
