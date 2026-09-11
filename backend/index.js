import express from "express"
import db from "./src/config/db.js"
import cors from 'cors'
import potholeRoutes from "./src/routes/potholeRoutes.js"

const app=express();

await db();

app.use(cors())
app.use(express.json());

app.use("/api/potholes", potholeRoutes);
app.get("/",(req,res)=>{
   res.send("API running")
  }); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
