const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');
const { Messages } = require('../errors/messages');

module.exports.getArticles = (req, res, next) => {
  const myId = req.user._id;

  Article.find({ owner: myId })
    .then((articles) => res.status(200).contentType('JSON').send(articles))
    .catch(() => {
      throw new BadRequestError(Messages.BAD_REQUEST_ERROR);
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
    // .then(() => res.status(201).contentType('JSON').send({
    //       keyword, title, text, date, source, link, image,
    //     }))
    .then((data) => res.status(201).contentType('JSON').send(data))
    .catch(() => {
      throw new BadRequestError(Messages.BAD_REQUEST_ERROR);
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  const myId = req.user._id;
  const { articleId } = req.params;

  Article.findById(articleId).select('owner')
    .orFail(() => new NotFoundError(Messages.NOT_ARTICLE_ERROR))
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
