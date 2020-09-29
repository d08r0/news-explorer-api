const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');

module.exports.getArticles = (req, res, next) => {
  const myId = req.user._id;

  Article.find({ owner: myId })
    .then((articles) => res.status(200).contentType('JSON').send(articles))
    .catch(() => {
      throw new BadRequestError('Произошла ошибка');
    })
    .catch(next);
};

module.exports.createArticles = (req, res, next) => {
  const owner = req.user._id;
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then(() => res.status(200).contentType('JSON').send({
      keyword, title, text, date, source, link, image,
    }))
    .catch(() => {
      throw new BadRequestError('Произошла ошибка');
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  const myId = req.user._id;
  const { articleId } = req.params;

  Article.findById(articleId).select('owner')
    .orFail(() => new NotFoundError('Нет такой карточки'))
    .then((article) => {
      const owner = article.owner._id.toString();

      if (owner !== myId) {
        throw new ForbiddenError('У вас недостаточно прав');
      } else {
        Article.findByIdAndDelete(articleId)
          .then((deletedArticle) => res.status(200).contentType('JSON').send({ data: deletedArticle }));
      }
    })
    .catch(next);
};
