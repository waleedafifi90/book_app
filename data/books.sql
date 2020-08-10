DROP TABLE IF EXISTS booklist;

CREATE TABLE booklist(
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(500),
  description TEXT,
  bookshelf VARCHAR(255)
);

INSERT INTO booklist (author, title, isbn, image_url, description, bookshelf) VALUES (
  'J. R. R. Tolkien',
  'The Hobbit',
  'ISBN_13 9786050465112',
  'http://books.google.com/books/content?id=j2uGDAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  'Read the definitive edition of Bilbo Baggins’ adventures in middle-earth in this classic bestseller behind this year’s biggest movie. The Hobbit is a tale of high adventure, undertaken by a company of dwarves in search of dragon-guarded gold. A reluctant partner in this perilous quest is Bilbo Baggins, a comfort-loving unambitious hobbit, who surprises even himself by his resourcefulness and skill as a burglar. Encounters with trolls, goblins, dwarves, elves and giant spiders, conversations with the dragon, Smaug, and a rather unwilling presence at the Battle of Five Armies are just some of the adventures that befall Bilbo. Bilbo Baggins has taken his place among the ranks of the immortals of children’s fiction. Written by Professor Tolkien for his own children, The Hobbit met with instant critical acclaim when published.',
  'Drama'
);

INSERT INTO booklist (author, title, isbn, image_url, description, bookshelf) VALUES (
  'J.K. Rowling',
  'Harry Potter and the Sorcerer''s Stone',
  'ISBN_13 9781781100486',
  'http://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  'Read the definitive edition of Bilbo Baggins’ adventures in middle-earth in this classic bestseller behind this year’s biggest movie. The Hobbit is a tale of high adventure, undertaken by a company of dwarves in search of dragon-guarded gold. A reluctant partner in this perilous quest is Bilbo Baggins, a comfort-loving unambitious hobbit, who surprises even himself by his resourcefulness and skill as a burglar. Encounters with trolls, goblins, dwarves, elves and giant spiders, conversations with the dragon, Smaug, and a rather unwilling presence at the Battle of Five Armies are just some of the adventures that befall Bilbo. Bilbo Baggins has taken his place among the ranks of the immortals of children’s fiction. Written by Professor Tolkien for his own children, The Hobbit met with instant critical acclaim when published.',
  'Romance'
);
