const Router = require('@koa/router');
const router = new Router();
const clash = require('../service/clash');
const query = async ctx => {
  const { type = 'Clash' } = ctx.query;
  ctx.set('Content-disposition', `attachment; filename=${type}_${Date.now()}.yaml`);
  ctx.set('Content-type', 'application/x-yaml');
  ctx.set('Subscription-Userinfo', 'upload=5209967462; download=801157997; total=161293008896; expire=1777375476');
  ctx.body = await clash.createConfig(type);
};

router.get('/config', query);

module.exports = router;
