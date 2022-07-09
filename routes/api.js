/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
const Book = require('../models');

const URL = process.env.DB
function handleError(err){
  console.log(err);
}

const connectDb = async() => {
try {
  await mongoose.connect(URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log('connected to database');
} catch (error) {
  handleError(error);
}
}
connectDb();

module.exports = function (app) {
  
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({})
          .then(data => {
              if(data){
                const formatData = data.map((book) => {
                  return {
                     _id: book._id,
                     title: book.title,
                     comments: book.comments,
                     commentcount: book.comments.length
                  }
                }); 
                                 
                res.statusCode = 200;
                res.setHeader('content-Type', 'application/json');
                res.json(formatData);
              }
              else{
                res.send("cannot send data");
              }
          })
          .catch(err => console.log(err))
      
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title){
        res.send("missing required field title");
        return;
      }
      const newBook = new Book({title, comments: []});
      newBook.save()
             .then( (data) => {
              res.json({
                title: data.title,
                _id: data._id 
              });
             })
             .catch(err => console.log(err))
      /*newBook.save((err, data)=> {
        if (err || !data){
          res.send("There was an Error saving");
          
        }else{
          res.json({
            title: data.title,
            _id: data._id 
          });
        }
      })*/

    })
      
          
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, data)=> {
        if(err|| !data){
          res.send("error");
          return;
        }else{
          res.send("complete delete successful");
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (err, data) => {
        if(!data){
          res.send("no book exists");
          return;
        }else{
          res.json({
            _id: data._id,
            title: data.title,
            comments: data.comments
          });
        }
      })
          
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if(!comment){
          res.send("missing required field comment");
          return;
      }
      Book.findById(bookid, (err, book)=> {
        if(!book){
          res.send("no book exists");
        
        }
        else{
          book.comments.push(comment);
          book.save((err, saveData) => {
            res.json({
              comments: saveData.comments,
              _id: saveData._id,
              title: saveData.title,
              commentcount: saveData.comments.length
            })
          });


        }
      })
      
    })
    
    .delete(function(req, res){
      let _id = req.params.id;
      //if successful response will be 'delete successful'
      /*Book.findByIdAndRemove({_id})
          .then((data)=> {
             if(!data){
              res.send("no book exists");
              return;
             }
             else{
              res.send("delete successful");
            }
          })
          .catch(err=> console.log(err))*/

      Book.findByIdAndRemove(_id, (err, data)=> {
        if(err || !data){
          res.send("no book exists");
          return;
        }
        else{
          res.statusCode = 200;
          res.send("delete successful");
        }
      })
    });
  
};
