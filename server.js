'use strict';
require('dotenv').config();

const express = require('express');
const app = express()
const superagent = require('superagent')
const PORT = process.env.PORT || 3000;
const pg = require('pg');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static('./public'));
app.set('view engine', 'ejs');

//database
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/', home);

app.get('/books/:id', bookDetails);

app.get('/hello', (req, res) => {
  res.render('./pages/index.ejs');
});

app.get('/search/new', (req, res) => {
  res.render('./pages/searches/new.ejs');
});

app.post('/searches', (req, res) => {
  var searchKey = req.body.bookSearch;
  var searchType = req.body.searchType;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${searchKey}`;

  superagent.get(encodeURI(url))
    .then(bookData => {
      let result = bookData.body.items.map(element => {
        return new Book(element);
      });
      res.render('./pages/searches/show', {
        booksResult: result
      });

    });
});

app.post('/books', (req, res) => {
  let newSQL = `INSERT INTO booklist (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, 'Fantasy') RETURNING id;`;
  console.log('newSQL', newSQL);
  let newValues = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description];

  return client.query(newSQL, newValues)
    .then(result => {
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch(console.error);
});

app.get('/*', (req, res) => {
  res.render('pages/error.ejs');
});

function home(req, res) {
  let SQL = 'SELECT * FROM booklist';
  return client.query(SQL)
    .then(result => {
      res.render('pages/index', {

        books: result.rows
      });
      console.log({
        books: result.rows
      });
    })
    .catch(err => {
      console.log('database request error', err);
    });
}

function bookDetails(req, res) {
  let SQL = 'SELECT * FROM booklist where id=$1';
  let values = [req.params.id];

  return client.query(SQL, values)
    .then(result => {
      res.render('pages/books/details', {
        books: result.rows[0]
      });
    })
    .catch(err => {
      console.log('database request error', err);
    });
}


function Book(book) {
  this.author = book && book.volumeInfo && book.volumeInfo.authors || 'Author Unknown';
  this.title = book && book.volumeInfo && book.volumeInfo.title || 'Title Missing';
  this.isbn = book && book.volumeInfo && book.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers[0] && book.volumeInfo.industryIdentifiers[0].type + book.volumeInfo.industryIdentifiers[0].identifier || 'ISBN Missing';
  this.image_url = book && book.volumeInfo && book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.description = book && book.volumeInfo && book.volumeInfo.description || 'Description Missing';
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening to port : ${PORT}`);
  });
});
