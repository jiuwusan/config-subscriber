const Router = require('@koa/router');
const router = new Router();
const clash = require('../service/clash');
const query = async ctx => {
  const { type = 'Clash' } = ctx.query;
  ctx.set('Content-disposition', `attachment; filename=${type}_${Date.now()}.yaml`);
  ctx.set('Content-type', 'application/x-yaml');
  ctx.body = await clash.createConfig(type);
};

router.get('/query', query);

module.exports = router;
