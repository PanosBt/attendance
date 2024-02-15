import { Attendance } from "../models/attendance.js";
import { AttendanceRegistry } from "../models/attendance_registry.js";
import { Course } from "../models/course.js";
import { Room } from "../models/room.js";
import { Util } from "../util.js";

export const getDeclare = async (ctx) => {
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
    let attendanceRegistryRecord = await AttendanceRegistry.getByCourseRoomDate(course.id, course.room_id);
    if (!attendanceRegistryRecord) {
        attendanceRegistryRecord = await AttendanceRegistry.create(course.id, course.room_id);
    }
    if (!attendanceRegistryRecord) {
        return ctx.redirect('/');
    }
    const room = await Room.get(course.room_id);
    const studentTodayAttendance = await Attendance.getCourseAttendance(room.id, course.id, user.ldap_id);
    const occupiedSeats = await Attendance.getOccupiedSeats(room.id, course.id);

    await ctx.render('declare_attendance', {
        course: course,
        room: room,
        user: user,
        attendance_registry_record: attendanceRegistryRecord,
        occupied_seats: occupiedSeats,
        already_declared_seat: studentTodayAttendance.length && studentTodayAttendance[0] ? studentTodayAttendance[0].seat_index : null
    });
};

export const postDeclare = async (ctx) => {
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
    if (!course || !course?.room_id || course?.attendances_finalized) {
        ctx.response.status = 400;
        return;
    }

    let attendanceRegistryRecord = await AttendanceRegistry.getByCourseRoomDate(course.id, course.room_id);
    if (!attendanceRegistryRecord || !attendanceRegistryRecord?.open) {
        ctx.response.status = 400;
        return;
    }

    const room = await Room.get(course.room_id);

    const todayAttendance = await Attendance.getCourseAttendance(room.id, course.id, user.ldap_id);
    if (todayAttendance.length && todayAttendance[0]) { // already declared attendance
        ctx.response.status = 400;
        return;
    }
    const occupiedSeats = await Attendance.getOccupiedSeats(room.id, course.id);
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

export const getView = async (ctx) => {
    Util.checkRole(ctx, 'professor');
    if (!ctx.query.cid) {
        return ctx.redirect('/');
    }
    const user = ctx.state.user;
    const courses = await Course.getActiveCourses(user.ldap_id, ctx.query.cid, 'professor');
    if (!courses.length) {
        return ctx.redirect('/')
    }
    const course = courses[0];
    if (!course || !course.room_id || !course.professor_ldap_id == user.ldap_id) {
        return ctx.redirect('/')
    }
    let attendanceRegistryRecord = await AttendanceRegistry.getByCourseRoomDate(course.id, course.room_id);
    if (!attendanceRegistryRecord) {
        attendanceRegistryRecord = await AttendanceRegistry.create(course.id, course.room_id);
    }
    if (!attendanceRegistryRecord) {
        return ctx.redirect('/');
    }
    const room = await Room.get(attendanceRegistryRecord.room_id);
    const occupiedSeats = await Attendance.getOccupiedSeats(
        attendanceRegistryRecord.room_id,
        attendanceRegistryRecord.course_id,
        attendanceRegistryRecord.date
    );

    await ctx.render('view_attendance', {
        course: course,
        room: room,
        attendance_registry_record: attendanceRegistryRecord,
        occupied_seats: occupiedSeats
    });
};

export const getViewPast = async (ctx) => {
    Util.checkRole(ctx, 'professor', 'secretary');
    const user = ctx.state.user;
    const arid = ctx.query.arid;
    if (!arid) {
        return ctx.redirect('/');
    }
    const attendanceRegistryRecord = await AttendanceRegistry.get(arid);
    if (!attendanceRegistryRecord ||
        (user.role == 'professor' && attendanceRegistryRecord?.professor_ldap_id != user.ldap_id)
    ) {
        return ctx.redirect('/');
    }
    const attendanceRecords = await Attendance.getByAttendanceRegistry(attendanceRegistryRecord.id);

    await ctx.render('view_past_attendance', {
        attendance_registry_record: attendanceRegistryRecord,
        attendance_records: attendanceRecords,
        user_role: user.role
    });
};

export const postToggleOpen = async (ctx) => {
    Util.checkRole(ctx, 'professor');
    const arid = ctx.request.body.arid;
    if (!arid) {
        ctx.response.status = 400;
        return;
    }
    const attendanceRegistryRecord = await AttendanceRegistry.get(arid);
    if (!attendanceRegistryRecord || attendanceRegistryRecord?.professor_ldap_id != ctx.state.user.ldap_id) {
        ctx.response.status = 400;
        return;
    }

    attendanceRegistryRecord.open = !attendanceRegistryRecord.open;
    await attendanceRegistryRecord.update();
    ctx.response.body = {
        open: attendanceRegistryRecord.open
    };
    ctx.response.status = 200;
};

export const postDelete = async (ctx) => {
    Util.checkRole(ctx, 'professor', 'secretary');
    const aid = ctx.request.body.aid;
    if (!aid) {
        ctx.response.status = 400;
        return;
    }
    const attendanceRecord = await Attendance.get(aid);
    if (!attendanceRecord) {
        ctx.response.status = 400;
        return;
    }
    const user = ctx.state.user;
    if (user.role == 'professor') {
        const courses = await Course.getByProfessorLdapId(user.ldap_id, attendanceRecord.course_id);
        if (!courses.length) {
            ctx.response.status = 400;
            return;
        }
        const course = courses[0];
        if (!course) {
            ctx.response.status = 400;
            return;
        }
    }

    const attendanceRegistryRecord = await AttendanceRegistry.getByCourseRoomDate(
        attendanceRecord.course_id,
        attendanceRecord.room_id,
        attendanceRecord.datetime.toISOString().substring(0, 10)
    );
    if (user.role == 'professor' && attendanceRegistryRecord?.finalized) {
        ctx.response.status = 400;
        return;
    }

    await attendanceRecord.delete();

    ctx.response.body = {
    };
    ctx.response.status = 200;
}

export const postFinalize = async (ctx) => {
    Util.checkRole(ctx, 'professor');
    const arid = ctx.request.body.arid;
    if (!arid) {
        ctx.response.status = 400;
        return;
    }
    const attendanceRegistryRecord = await AttendanceRegistry.get(arid);
    if (!attendanceRegistryRecord ||
        attendanceRegistryRecord?.professor_ldap_id != ctx.state.user.ldap_id ||
        attendanceRegistryRecord?.open
    ) {
        ctx.response.status = 400;
        return;
    }
    attendanceRegistryRecord.finalized = true;
    await attendanceRegistryRecord.update();
    ctx.response.body = {};
    ctx.response.status = 200;
};

export const getRegistries = async (ctx) => {
    Util.checkRole(ctx, 'professor', 'secretary');
    const cid = ctx.query.cid;
    if (!cid) {
        return ctx.redirect('/');
    }
    const user = ctx.state.user;
    let course;
    if (user.role == 'professor') {
        const courses = await Course.getByProfessorLdapId(user.ldap_id, cid);
        if (!courses.length) {
            return ctx.redirect('/');
        }
        course = courses[0];
    } else {
        course = await Course.get(cid);
    }
    if (!course) {
        return ctx.redirect('/');
    }
    const attendanceRegistryRecords = await AttendanceRegistry.getByCourse(course.id);
    await ctx.render('attendance_registries', {
        course: course,
        attendance_registry_records: attendanceRegistryRecords
    });
}