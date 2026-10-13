import express, { type Express, type Request, type Response } from 'express';
import users from "./routers/users.ts"
import logger from './middlewares/logger.ts';

const app: Express = express();

const PORT = 3000;

app.use(express.json())

app.use(express.static('static'));

app.use(logger)

app.use('/users', users)

app.get("/about", (req, res)=>{
  res.sendFile("about.html", {root: "static"})
})

app.get("/index", (req, res)=>{
  res.sendFile("index.html", {root: "static"})
})

app.listen(PORT, ()=>{
  console.log(`App listening on ${PORT}`)
});