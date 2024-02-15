import he from 'he';
import { Course } from '../models/course.js';
import { Attendance } from '../models/attendance.js';

export const get = async (ctx) => {
    let data = {
        loggedin: false
    }
    if (ctx.isAuthenticated()) {
        const user = ctx.state.user;
        data = {
            loggedin: true,
            username: he.encode(ctx.state.user.username),
            role: user.role
        };
        if (user.role == 'student') {
            const activeCourses = await Course.getActiveCourses(user.ldap_id);
            console.log(activeCourses);
            const pastAttendanceRecords = await Attendance.getByStudentLdapId(user.ldap_id);
            const activeCoursesMap = {};
            for (const activeCourse of activeCourses) {
                let key = `${activeCourse.id}_${activeCourse.room_id}`;
                activeCoursesMap[key] = activeCourse;
            }
            const todayStr = (new Date()).toDateString();
            for (const attendanceRecord of pastAttendanceRecords) {
                let dateStr = (new Date(attendanceRecord.datetime)).toDateString();
                if (dateStr != todayStr) {
                    break; // ordered by date, so we are now in the past
                }
                let key = `${attendanceRecord.course_id}_${attendanceRecord.room_id}`
                if (activeCoursesMap[key]) {
                    attendanceRecord.current = true;
                    delete activeCoursesMap[key];
                }

            }
            data.active_courses = Object.values(activeCoursesMap);
            data.past_attendance_records = pastAttendanceRecords;
        } else if (user.role == 'professor') {
            data.active_courses = await Course.getActiveCourses(user.ldap_id, null, 'professor');
            data.all_courses = await Course.getByProfessorLdapId(user.ldap_id);
        }

    }
    await ctx.render('index', {
        data: data
    });
};
