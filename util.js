export class Util {
    static checkRole(ctx, ...roles) {
        if (!roles.some(role => ctx.state.user.role == role )) {
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

    static localDateDbFriendly(datetime) {
        return `${datetime.getFullYear()}-${String(datetime.getMonth() + 1).padStart(2, '0')}-${String(datetime.getDate()).padStart(2, '0')}`;
    }
}
