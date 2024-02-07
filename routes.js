import koaRouter from 'koa-router';
import * as IndexController from './controllers/index.js';
import * as DeclareAttendanceController from './controllers/declare_attendance.js';
import * as LoginController from './controllers/login.js';
import * as LogoutController from './controllers/logout.js';

const router = new koaRouter();

router.get('/', IndexController.get);
router.get('/declare_attendance', DeclareAttendanceController.get);

router.post('/login', LoginController.login);
router.post('/logout', LogoutController.logout);

export default router;
