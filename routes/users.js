const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsersMe,
} = require('../controllers/users');

usersRouter.get('/users/me', getUsersMe);

module.exports = usersRouter;
