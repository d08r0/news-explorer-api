require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const router = require('./routes/index');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { Messages } = require('./errors/messages');

const cors = require('cors');

const corsOptions = {
  origin: true,
  methods: ["POST"],
  credentials: true,
  maxAge: 3600
}

// const corsOptions = {
//   origin: ['https://my-news-explorer.tk', 'http://my-news-explorer.tk', 'my-news-explorer.tk'],
//   credentials: true,
//   method: ['GET', 'POST', 'POST', 'OPTIONS'],
// };

// const whitelist = ['http://example1.com', 'http://example2.com']
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

console.log(process.env.NODE_ENV);

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

mongoose.connect('mongodb://localhost:27017/news-explorer-bd', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(cors(corsOptions));

app.use(cors());

app.use('/', router);

app.use(() => {
  throw new NotFoundError('Ресурс не найден');
});

// app.use(errorLogger);

app.use(errors());

app.use(errorLogger);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? Messages.INTERNAL_SERVER_ERROR
        : message,
    });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
