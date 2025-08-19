const Koa = require('koa');
const koaJson = require('koa-json');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const serve = require('koa-static');
const contollers = require('./contoller/index');

const app = new Koa();
const staticMiddleware = serve(path.join(__dirname, 'public'));

// 静态资源
app.use(staticMiddleware);

// 请求体解析 & JSON 美化
app.use(bodyParser());
app.use(koaJson());

// 挂载全局方法
app.use(async (ctx, next) => {
  console.log('挂载全局方法');
  ctx.success = (data, msg = '成功') => {
    ctx.body = { code: 200, msg, data };
  };

  ctx.fail = (code = -99, msg = '失败', data) => {
    ctx.body = { code, msg, data };
  };

  await next();
});

// 错误捕获
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.fail(error.code, error.message || '服务器错误', error.data);
  }
});

// 路由
app.use(contollers.routes());
app.use(contollers.allowedMethods());

// 打印所有路由
contollers.stack.forEach(r => {
  const methods = r.methods.filter(m => m !== 'HEAD');
  console.log(`Route: ${methods.join(', ')} ${r.path}`);
});

// 启动服务
app.listen(7090, () => {
  console.log('Server running on 0.0.0.0:7090');
});
