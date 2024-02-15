import koaRouter from 'koa-router';

import * as IndexController from './controllers/index.js';
import * as AttendanceController from './controllers/attendance.js';
import * as RoomsController from './controllers/rooms.js';
import * as CoursesController from './controllers/courses.js';
import * as TimeScheduleController from './controllers/time_schedule.js';
import * as ParticipationsController from './controllers/participations.js';
import * as LoginController from './controllers/login.js';
import * as LogoutController from './controllers/logout.js';

const router = new koaRouter();

const auth_middleware = async (ctx, next) => {
    if (!ctx.isAuthenticated()) {
        return ctx.redirect('/');
    }
    await next();
};

router.get('/', IndexController.get);

router.get('/declare_attendance', auth_middleware, AttendanceController.getDeclare);
router.post('/declare_attendance', auth_middleware, AttendanceController.postDeclare);
router.get('/view_attendance', auth_middleware, AttendanceController.getView);
router.get('/view_past_attendance', auth_middleware, AttendanceController.getViewPast);
router.post('/toggle_ar_open', auth_middleware, AttendanceController.postToggleOpen);
router.post('/delete_attendance', auth_middleware, AttendanceController.postDelete);
router.post('/finalize_attendance', auth_middleware, AttendanceController.postFinalize);
router.get('/attendance_registries', auth_middleware, AttendanceController.getRegistries);

router.get('/rooms', auth_middleware, RoomsController.getRooms);
router.get('/edit_room', auth_middleware, RoomsController.editRoomPage);
router.post('/edit_room', auth_middleware, RoomsController.editRoom);
router.post('/delete_room', auth_middleware, RoomsController.deleteRoom);

router.get('/courses', auth_middleware, CoursesController.getAll);
router.post('/upload_courses', auth_middleware, CoursesController.upload);

router.get('/participations', auth_middleware, ParticipationsController.get);
router.post('/upload_participations', auth_middleware, ParticipationsController.upload);

router.get('/time_schedule', auth_middleware, TimeScheduleController.get);
router.post('/upload_time_schedules', auth_middleware, TimeScheduleController.upload);

router.post('/login', LoginController.login);
router.post('/logout', LogoutController.logout);

export default router;
