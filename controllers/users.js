const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;

  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then(() => res.status(200).contentType('JSON').send({
      email, name,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        throw new ConflictError('Пароль занят');
      }

      throw new BadRequestError('Произошла ошибка');
    })
    .catch(next);
};

module.exports.getUsersMe = (req, res, next) => {
  const myId = req.user._id;

  User.findById(myId)
    .then((user) => {
      const {
        name, email,
      } = user;

      res.status(200);
      res.contentType('JSON');
      res.send({email, name});
    })
    .catch(next);
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
