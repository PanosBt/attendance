import koaRouter from 'koa-router';

import * as IndexController from './controllers/index.js';
import * as DeclareAttendanceController from './controllers/declare_attendance.js';
import * as RoomsController from './controllers/rooms.js';
import * as LoginController from './controllers/login.js';
import * as LogoutController from './controllers/logout.js';

const router = new koaRouter();

const auth_middleware = async (ctx, next) => {
    if (!ctx.isAuthenticated()) {
        ctx.redirect('/');
    }
    await next();
};

router.get('/', IndexController.get);

router.get('/declare_attendance', auth_middleware, DeclareAttendanceController.get);

router.get('/rooms', auth_middleware, RoomsController.getRooms);
router.get('/edit_room', auth_middleware, RoomsController.editRoomPage);
router.post('/edit_room', auth_middleware, RoomsController.editRoom);
router.post('/delete_room', auth_middleware, RoomsController.deleteRoom);

router.post('/login', LoginController.login);
router.post('/logout', LogoutController.logout);

export default router;
