export const logout = async (ctx) => {
    await ctx.logout();
    ctx.session = null;
    ctx.redirect('/');
}
