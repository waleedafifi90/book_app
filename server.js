'use strict';
require('dotenv').config();

const express = require('express');
const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static('./public'));
app.set('view engine', 'ejs');


app.get('/hello',(req,res)=>{
  res.render('./pages/index.ejs');
});

app.get('/search/new',(req,res)=>{
  res.render('./pages/searches/new.ejs');
});

app.listen(PORT, ()=>{
  console.log(`Listening to Port ${PORT}`);
});
