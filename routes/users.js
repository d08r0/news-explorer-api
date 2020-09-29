const usersRouter = require('express').Router();

const {
  getUsersMe,
} = require('../controllers/users');

usersRouter.get('/users/me', getUsersMe);

module.exports = usersRouter;
