import { Course } from "../models/course.js";

export const get = async (ctx) => {
    if (!ctx.isAuthenticated() ||
        ctx?.state?.user.role != 'student' ||
        ctx.query.cid
    ) {
        ctx.redirect('/');
    }
    const user = ctx.state.user;
    // TODO Validate input with Joi. check koa-joi-router !

    const course = await Course.get(ctx.query.cid);

    ctx.render('declare_attendance', {
        // data: data
    });
};
