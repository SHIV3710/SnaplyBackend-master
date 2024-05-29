const app = require("./app");
const { connectDatabase } = require("./config/database");
const cloudinary = require("cloudinary");

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDAPISECRET,
});
app.listen(process.env.PORT, (req, res) => {
  console.log(`Server is runnning`);
});
