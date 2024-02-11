import he from 'he';
import { Course } from '../models/course.js';

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
            const active_courses = await Course.getActiveCourses(user.ldap_id);
            data.active_courses = active_courses;
        }

    }
    await ctx.render('index', {
        data: data
    });
};
