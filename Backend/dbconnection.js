import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error);
db.once("open", () => console.log("🗄️  Database connected"));
export default db;
