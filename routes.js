import koaRouter from 'koa-router';
// import auth from './middleware/auth.js';
// import * as UserController from './controllers/user.js';
import * as IndexController from './controllers/index.js';

// const router = new koaRouter(({ prefix: '/user' }));
const router = new koaRouter();

router.get('/', IndexController.get);

// router.post('/user/addData', UserController.addData);
// router.get('/user/readAllData', UserController.readAllData);
// router.get('/user/getUser', auth, UserController.getUser);

export default router;
