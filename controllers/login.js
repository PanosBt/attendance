import passport from 'koa-passport';

export const login = async (ctx) => {
    return passport.authenticate('local', (err, user) => {
        if (user) {
            ctx.login(user);
            ctx.redirect('/');
        } else {
            ctx.status = 400;
            ctx.redirect('/');
        }
    })(ctx);
}
