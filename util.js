export class Util {
    static checkRole(ctx, role) {
        if (ctx.state.user.role != role) {
            return ctx.redirect('/');
        }
    };

    static dowToDay(isoDow) {
        const dowMap = [
            'Δευτέρα',
            'Τρίτη',
            'Τετάρτη',
            'Πέμπτη',
            'Παρασκευή',
            'Σάββατο',
            'Κυριακή',
        ]
        return isoDow <= dowMap.length ? dowMap[isoDow - 1] : '';
    }
}
