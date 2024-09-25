const app = require('./app');
const dotenv = require("dotenv");
const connectToDatabase = require("./config/database");
dotenv.config({ path: "./.env" }); // Ensure this line is present and correct

const PORT = process.env.PORT || 3000;

connectToDatabase().then(() => {

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Failed to initialize database:", error);
});