import passport from 'koa-passport';

export const login = async (ctx) => {
    return passport.authenticate('local', (err, user) => {
        if (user) {
            console.log('success', user);
            ctx.login(user);
            ctx.redirect('/');
        } else {
            console.log('fail');
            ctx.status = 400;
            ctx.redirect('/');
        }
    })(ctx);
}
