import passport from 'koa-passport';
import LocalStrategy from 'passport-local';
import passportCustom from 'passport-custom';
import { authenticate } from 'ldap-authentication';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/user.js';
import { SecretaryLDAPUser } from '../models/secretary_user.js';

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    return done(null, user);
});

passport.use(new LocalStrategy({}, async (username, password, done) => {
    const user = await User.getByUsername(username);
    if (!user) {
        return done(null, false);
    }
    user.local_user = true;
    const success = await bcrypt.compare(password, user.password);
    if (success) {
        return done(null, user);
    }
    return done(null, false);
}));

passport.use('ldapcustom', new passportCustom.Strategy(
    async function (ctx, done) {
        try {
            const res = await authenticate({
                ldapOpts: {
                    url: 'ldap://ldap1.ditapps.hua.gr',
                    tlsOptions: { rejectUnauthorized: true }
                },
                adminDn: process.env.LDAP_BIND_DN,
                adminPassword: process.env.LDAP_AUTH_PASS,
                userSearchBase: 'dc=hua,dc=gr',
                usernameAttribute: 'uid',
                starttls: true,
                username: ctx.body.username,
                userPassword: ctx.body.password
            });
            let role = User.ldapTitleToRole(res.title);
            if (!role) {
                const secUser = await SecretaryLDAPUser.getByLdapId(res.uid);
                if (!secUser) {
                    return done(null, false);
                }
                role = 'secretary';
            }
            const user = new User(
                res.uid,
                res.displayName,
                role,
                res.uid,
                false
            );
            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    }
));