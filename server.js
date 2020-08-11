'use strict';
require('dotenv').config();

const express = require('express');
const app = express()
const superagent = require('superagent')
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const fs = require('fs');
const methodOverride = require('method-override');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static('./public'));
app.set('view engine', 'ejs');

//database
const client = new pg.Client(process.env.DATABASE_URL);

app.use(methodOverride((request, response) => {
  if(request.body && typeof request.body === 'object' && '_method' in request.body) {
    console.log(request.body['_method']);
    let method = request.body['_method'];
    delete request.body['_method'];
    return method; //returns PUT, PATCH, POST, GET, or DELETE.
  }
}));

app.get('/', home);

app.post('/searches', searchForBook);
app.get('/books/:id', bookDetails);
app.post('/books', saveBookToDataBase);
app.get('/search/new', searchPage);

app.get('/read-json', readJSON);

app.delete('/books/:id', deleteBook);
app.get('/books/edit/:id', visitBookUpdate);
app.put('/books/:id', updateBook);

app.get('/authors/add', visitNewAuthor);
app.post('/authors', addNeweAuthor);

app.get('/hello', (req, res) => {
  res.render('./pages/index.ejs');
});

app.get('/*', handleError);


function home(req, res) {
  let SQL = 'SELECT * FROM booklist; SELECT * FROM authors';
  return client.query(SQL)
    .then(result => {
      res.render('pages/index', {

        books: result[0].rows,
        authors: result[1].rows
      });
      console.log({
        books: result[0].rows,
        authors: result[1].rows
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

function searchForBook(req, res) {
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
}

function saveBookToDataBase(req, res) {
  let newSQL = `INSERT INTO booklist (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, 'Fantasy') RETURNING id;`;
  console.log('newSQL', newSQL);
  let newValues = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description];

  return client.query(newSQL, newValues)
    .then(result => {
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch(console.error);
}

function handleError (err, response) {
  console.error(err);
  response.render('pages/error', err);
}

function searchPage(req, res) {
  res.render('./pages/searches/new.ejs');
}

function deleteBook(request, response) {
  console.log (`deleting the booklist ${request.params.id}`);
  client.query(`DELETE FROM booklist WHERE id=$1`, [request.params.id])
    .then(result => {
      console.log(result);
      response.redirect('/');
    })
    .catch( err => {
      console.log('delete book error')
      return handleError(err, response);
    });
}

function visitBookUpdate(request, response){
  console.log('Error Adnan');
  let SQL = 'SELECT * FROM booklist where id=$1';
  let SQL1 = 'select DISTINCT bookshelf from booklist';
  let values = [request.params.id];
  return client.query(SQL, values)
    .then(result => {
      client.query(SQL1, []).then( bookShelf => {
        console.log(bookShelf);
        response.render('./pages/books/edit', { selected_book: result.rows[0], bookshelf: bookShelf.rows});
      });
    })
    .catch(err => {
      console.log('database request error');
      return handleError(err, response);
    });
}

function updateBook(request, response) {
  console.log (`updating book ${request.params.id}`);
  const values = [request.body.title, request.body.isbn, request.body.image_url, request.body.description, request.body.bookshelf, request.body.author, request.params.id];

  client.query(`UPDATE booklist SET title=$1, isbn=$2, image_url=$3, description=$4, bookshelf=$5, author=$6  WHERE id=$7`, values)
    .then(result => {
      console.log(result);
      response.redirect(`/books/${request.params.id}`);
    })
    .catch( err => {
      console.log('update book error')
      return handleError(err, response);
    })
}

function visitNewAuthor(req, res) {
  res.render('./pages/author/add.ejs');
}

function addNeweAuthor(req, res) {
  let newSQL = `INSERT INTO authors (author_name, book_id) VALUES ($1, $2) RETURNING id;`;
  let newValues = [req.body.author_name, req.body.book_id];
  return client.query(newSQL, newValues)
    .then(result => {
      res.send(result.rows);
    // res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch(console.error);

}

function readJSON(req, res) {
  var obj;
  fs.readFile('book.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    console.log(obj);

    obj.map( item => {
      let newSQL = `INSERT INTO booklist (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
      let newValues = [item.author, item.title, item.isbn, item.image_url, item.description, item.bookshelf];
      return client.query(newSQL, newValues)
        .then(result => {
          console.log(result);
        // res.redirect(`/books/${result.rows[0].id}`);
        })
        .catch(console.error);
    });
  });
}

function Book(book) {
  this.author = book && book.volumeInfo && book.volumeInfo.authors || 'Author Unknown';
  this.title = book && book.volumeInfo && book.volumeInfo.title || 'Title Missing';
  this.isbn = book && book.volumeInfo && book.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers[0] && book.volumeInfo.industryIdentifiers[0].type + book.volumeInfo.industryIdentifiers[0].identifier || 'ISBN Missing';
  this.image_url = book && book.volumeInfo && book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.description = book && book.volumeInfo && book.volumeInfo.description || 'Description Missing';
}

function Author(obj) {
  this.author_name = obj.author_name;
  this.book_id = obj.book_id;
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening to port : ${PORT}`);
  });
});
