const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');


const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({user: req.user._id})
        .populate('user')
        .populate('campsites')
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite){
                console.log("favorite", favorite);
                req.body.forEach((campsite) => {
                    if (!favorite.campsites.includes(campsite._id)){
                        favorite.campsites.push(campsite._id);
                    }
                });

                favorite.save()
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);      
                })
                .catch(err => next(err));
            }else{
                Favorite.create({user: req.user._id})
                .then(favorite => {
                    req.body.forEach((campsite) => {
                        if (!favorite.campsites.includes(campsite._id)){
                            favorite.campsites.push(campsite._id);
                        }
                    });
                    favorite.save().then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);     
                    });
                })
                .catch(err => next(err));
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({user: req.user._id})
        .then(favorite => {
            if (favorite){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete.');
            }
            
        })
        .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/:campsiteId');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite) {
                console.log('Favorites!');
                console.log(favorite);

                if (!favorite.campsites.includes(req.params.campsiteId)){
                    favorite.campsites.push(req.params.campsiteId);
                     
                    favorite.save().then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);     
                    })
                    .catch(err => next(err)); 
                      
                }else{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'plain/text');
                    res.end(`${req.params.campsiteId} is already in the list of favorites.`);
                }
                
            }else {
                Favorite.create({user: req.user._id})
                .then(favorite => {
                    favorite.campsites.push(req.params.campsiteId);
                     
                    favorite.save().then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);     
                    });
                })
                .catch(err => next(err));    
            }
        });    
        
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/:campsiteId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite) {
                console.log('favorites:');
                console.log(favorite);

                if (favorite.campsites.indexOf(req.params.campsiteId) !== -1) {
                    console.log('index of 60e9cb2ed778963e08c2db2d');
                    console.log(favorite.campsites.indexOf(req.params.campsiteId));
                    
                    favorite.campsites.splice(favorite.campsites.indexOf(req.params.campsiteId), 1);

                    favorite.save()
                    
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);     
                    })
                    .catch(err => next(err));     
                }else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'plain/text');
                    res.end(`${req.params.campsiteId} was not found in your favorites.`);    
                }

            }else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'plain/text');
                res.end(`${req.user._id} does not have any favorites.`);
            }
        })
        .catch(err => next(err));
        


        /*Partner.findByIdAndDelete(req.params.partnerId)
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);    
        })
        .catch(err => next(err));*/
    });



module.exports = favoriteRouter;