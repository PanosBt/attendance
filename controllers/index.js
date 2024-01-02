import { User } from '../models/user.js'

export const get = async (ctx) => {
    const users = await User.getAll();
    ctx.render('index', {
        users: users
    });
};
