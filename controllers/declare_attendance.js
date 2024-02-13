import { Attendance } from "../models/attendance.js";
import { Course } from "../models/course.js";
import { Room } from "../models/room.js";
import { Util } from "../util.js";

export const get = async (ctx) => {
    Util.checkRole(ctx, 'student');
    const user = ctx.state.user;
    const courses = await Course.getActiveCourses(user.ldap_id, ctx.query.cid);
    if (!courses.length) {
        return ctx.redirect('/')
    }
    const course = courses[0];
    if (!course || !course.room_id) {
        return ctx.redirect('/')
    }
    const room = await Room.get(course.room_id);
    const studentTodayAttendance = await Attendance.getTodayAttendance(room.id, course.id, user.ldap_id);
    const occupiedSeats = await Attendance.getTodayOccupiedSeats(room.id, course.id);

    await ctx.render('declare_attendance', {
        course: course,
        room: room,
        user: user,
        occupied_seats: occupiedSeats,
        already_declared_seat: studentTodayAttendance.length && studentTodayAttendance[0] ? studentTodayAttendance[0].seat_index : null
    });
};

export const post = async (ctx) => {
    Util.checkRole(ctx, 'student');
    const courseId = ctx.request.body.cid,
        seatIndex = ctx.request.body.seat_index;
    if (!(courseId && seatIndex)) {
        ctx.response.status = 400;
        return;
    }
    const user = ctx.state.user;
    const courses = await Course.getActiveCourses(user.ldap_id, courseId);
    if (!courses.length) {
        ctx.response.status = 400;
        return;
    }
    const course = courses[0];
    if (!course || !course.room_id) {
        ctx.response.status = 400;
        return;
    }
    const room = await Room.get(course.room_id);

    const todayAttendance = await Attendance.getTodayAttendance(room.id, course.id, user.ldap_id);
    if (todayAttendance.length && todayAttendance[0]) { // already declared attendance
        ctx.response.status = 400;
        return;
    }
    const occupiedSeats = await Attendance.getTodayOccupiedSeats(room.id, course.id);
    if (typeof occupiedSeats[seatIndex] !== 'undefined') {
        ctx.response.status = 400;
        return;
    }

    const attendanceRecord = await Attendance.create(
        user.ldap_id,
        course.id,
        course.room_id,
        seatIndex
    );

    if (!attendanceRecord) {
        ctx.response.status = 400;
        return;
    }
    ctx.body = {};
    ctx.response.status = 200;

}
