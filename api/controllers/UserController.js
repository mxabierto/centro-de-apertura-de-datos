/**
 * UserController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  login: function (req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      var bcrypt = require('bcrypt');

      User.findOneByEmail(req.body.email).exec(function (err, user) {
        if (err) res.json({ error: 'DB error' }, 500);

        if (user) {
          bcrypt.compare(req.body.password, user.password, function (err, match) {
            if (err) res.json({ error: 'Server error' }, 500);
  
            if (match) {
              // password match
              req.session.user = user.id;
              req.flash('success', 'Usuario autenticado exitosamente');
              res.redirect('/');
            } else {
              // invalid password
              if (req.session.user) req.session.user = null;
              res.json({ error: 'Invalid password' }, 400);
            }
          });
        } else {
          res.json({ error: 'User not found' }, 404);
        }
      });
    } else if (req.method == 'GET' || req.method == 'get') {
      return res.view();
    }
  },

  logout: function(req, res) {
    req.session.user = null;
    return res.redirect('/');
  },

  signup: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.create({
        email: req.param('email'),
        password: req.param('password')
      }, function(err, user) {
        if (err) return res.send(500, err);
        req.flash('success', 'Usuario creado exitosamente');
        return res.redirect('/user/login');
      });
    } else {
      return res.view();
    }
  },

  giveVote: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user}).exec(function(err, user) {
        if (err) return res.send(500, err);
        Request.findOne({id: req.param('id')})
        .populate('voted')
        .exec(function(err, request) {
          if (err) return res.send(500, err);
          user.votes.add(request.id);
          user.save(function(err, user) {
            if (err) return res.send(500, err);
            res.send(200, {votes: request.voted});
            return res.redirect('/');
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

  removeVote: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user}).exec(function(err, user) {
        if (err) return res.send(500, err);
        Request.findOne({id: req.param('id')})
        .populate('voted')
        .exec(function(err, request) {
          if (err) return res.send(500, err);
          user.votes.remove(request.id);
          user.save(function(err, user) {
            if (err) return res.send(500, err);
            res.send(200, {votes: request.voted});
            return res.redirect('/');
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

};