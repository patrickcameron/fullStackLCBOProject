const express = require('express');
const app = express();
const path = require('path');
const savedProduct = require('./model');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lcboSearch');

app.use(bodyParser.json());

// This serves all files placed in the /public
// directory (where gulp will build all React code)
app.use(express.static('public'));

// Also serve everything from our assets directory (static
// assets that you want to manually include)
app.use(express.static('assets'));

// Include your own logic here (so it has precedence over the wildcard
// route below)
app.get('/api/savedproducts', function(req, res) {
    savedProduct.find( ( err, docs ) => {
        if ( err ) {
            res.status(400).send(err);
        } else {
            res.status(200).send(docs);
        }
    });
} );

app.post('/api/savedproducts', function(req, res) {
    console.log( 'body = ', req.body );
    const savedProductModel = new savedProduct();
    // console.log( 'savedProductModel: ', savedProductModel );
    const newSavedProduct = Object.assign(savedProductModel, req.body );
    console.log( 'newSavedProduct id: ', newSavedProduct.id );

    savedProduct.find({ id: newSavedProduct.id }, function( err, docs ) {
        if ( docs.length ) {
            console.log( 'already exists in database' );
        } else {
            newSavedProduct.save( ( err, doc ) => {
                if ( err ) {
                    res.status(500).send(err);
                    console.log( 'error', err );
                } else {
                    res.status(200).send(doc);
                    console.log( 'success' );
                }
            });
        }
    } );

} );

app.delete('/api/savedproducts/:productid', function(req, res) {
    const productId = req.params.productid;
    savedProduct.remove({ id: productId }, (err, doc ) => {
        if ( err ) {
            res.status(500).send(err);
        } else {
            res.status(200).json({ message: 'Product successfully deleted.' } );
        }
    });
} );

// This route serves your index.html file (which
// initializes React)
app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname,'index.html'));
});

// Start your server, and listen on port 8080.
app.listen(8080, function() {
  console.log("LCBO Search running on port 8080");
})
