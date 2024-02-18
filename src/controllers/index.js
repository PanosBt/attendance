import he from 'he';
import { Course } from '../models/course.js';
import { Attendance } from '../models/attendance.js';
import { User } from '../models/user.js';

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
        switch (user.role) {
            case 'student':
                const activeCourses = await Course.getActiveCourses(user.ldap_id);
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
                break;
            case 'professor':
                data.active_courses = await Course.getActiveCourses(user.ldap_id, null, 'professor');
                data.all_courses = await Course.getByProfessorLdapId(user.ldap_id);
                break;
            case 'admin':
                data.all_users = await User.getAll();
                break;
            default:
                break;
        }
    }
    await ctx.render('index', {
        data: data
    });
};
