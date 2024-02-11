import koaRouter from 'koa-router';
import * as IndexController from './controllers/index.js';
import * as DeclareAttendanceController from './controllers/declare_attendance.js';
import * as RoomsController from './controllers/rooms.js';
import * as LoginController from './controllers/login.js';
import * as LogoutController from './controllers/logout.js';

const router = new koaRouter();

router.get('/', IndexController.get);
// TODO Check DRY if authenticated + on the right role as middleware
router.get('/declare_attendance', DeclareAttendanceController.get);
router.get('/rooms', RoomsController.getRooms);

router.get('/edit_room', RoomsController.editRoomPage);
router.post('/edit_room', RoomsController.editRoom);
router.post('/delete_room', RoomsController.deleteRoom);

router.post('/login', LoginController.login);
router.post('/logout', LogoutController.logout);

export default router;
