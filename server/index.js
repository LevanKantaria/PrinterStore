import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import itemRoutes from './routes/items.js'
import dotenv from 'dotenv'

const app = express();
dotenv.config();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());



const CONNECTION_URL = "mongodb+srv://lkantaria1999:s0d8d555@cluster0.rl2gfrm.mongodb.net/?retryWrites=true&w=majority"

app.use('/api/products',itemRoutes)

app.get('/api/test', (req,res) =>{
    res.send('hey')
})

app.get('/', (req,res)=>{
  res.send('Hello To Memories API')
})

const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, {  useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log("server running on port" + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
