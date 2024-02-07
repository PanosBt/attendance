import passport from 'koa-passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';

import { User } from '../models/user.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.getById(id);
    return done(null, user);
});

passport.use(new LocalStrategy({}, async (username, password, done) => {
    const user = await User.getByUsername(username);
    if (!user) {
        return done(null, false);
    }
    const success = await bcrypt.compare(password, user.password) ;
    if (success) {
        return done(null, user);
    }
    return done(null, false);
}));
