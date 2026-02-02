const dotenv = require("dotenv");
dotenv.config();

const connectMongo = require("./databases/mongo.js");
const app = require("./app.js");


const port = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    try {
      app.on("error", (error) => {
        console.log("ERROR:", error);
        throw error;
      });
      app.listen(port, () => {
        console.log(`Server is running in: ${port}`);
      });
    } catch (error) {
      console.log("ERROR:", error);
      throw error;
    }
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
