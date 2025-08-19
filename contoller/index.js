const Router = require('@koa/router');
const clash = require('./clash');
const router = new Router();
router.use('/sub', clash.routes(), clash.allowedMethods());
module.exports = router;