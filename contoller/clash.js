const Router = require('@koa/router');
const router = new Router();

const query = async ctx => {
  ctx.success()
};

router.get('/query', query);

module.exports = router;
