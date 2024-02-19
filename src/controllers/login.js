import passport from 'koa-passport';

export const login = async (ctx) => {
    return passport.authenticate(['local', 'ldapcustom'], async (err, user) => {
        if (user) {
            ctx.login(user);
            return ctx.redirect('/');
        } else {
            ctx.status = 400;
            return ctx.redirect('/');
        }
    })(ctx);
}
