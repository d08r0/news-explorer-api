const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth.js');
const { createUser, login } = require('../controllers/users');

const articlesRouter = require('./articles');
const usersRouter = require('./users');

router.post('/signin', login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().regex(/[0-9a-zA-Z!@#$%^&*]{8,}/),
    name: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), createUser);

router.use('/', auth, usersRouter);
router.use('/', auth, articlesRouter);

module.exports = router;
