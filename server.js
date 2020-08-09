'use strict';
require('dotenv').config();

const express = require('express');
const app = express()
const superagent = require('superagent')
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
  res.render('./pages/index.ejs');
});

app.get('/hello',(req,res)=>{
  res.render('./pages/index.ejs');
});

app.get('/search/new',(req,res)=>{
  res.render('./pages/searches/new.ejs');
});

app.post('/searches',(req,res)=>{
  var searchKey = req.body.bookSearch;
  var searchType = req.body.searchType;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${searchKey}`;

  superagent.get(encodeURI(url))
    .then(bookData =>{
      let result = bookData.body.items.map(element => {
        return new Book(element);
      });
      res.render('./pages/searches/show',{booksResult: result });

    });
});

app.get('/*',(req,res)=>{
  res.render('pages/error.ejs');
});

function Book(book) {
  this.author = book && book.volumeInfo && book.volumeInfo.authors || 'Author Unknown';
  this.title = book && book.volumeInfo && book.volumeInfo.title || 'Title Missing';
  this.isbn = book && book.volumeInfo && book.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers[0] && book.volumeInfo.industryIdentifiers[0].type + book.volumeInfo.industryIdentifiers[0].identifier || 'ISBN Missing';
  this.image_url = book && book.volumeInfo && book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.description = book && book.volumeInfo && book.volumeInfo.description || 'Description Missing';
}

app.listen(PORT, ()=>{
  console.log(`Listening to Port ${PORT}`);
});
