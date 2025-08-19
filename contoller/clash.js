const Router = require('@koa/router');
const router = new Router();
const clash = require('../service/clash');
const query = async ctx => {
  ctx.success(await clash.createConfig());
};

router.get('/query', query);

module.exports = router;
