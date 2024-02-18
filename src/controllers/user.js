import bcrypt from 'bcrypt';

import { Util } from '../util.js';
import { User } from "../models/user.js";

export const postCreate = async (ctx) => {
    Util.checkRole(ctx, 'admin');
    const username = String(ctx.request.body.username).trim(),
        pass = String(ctx.request.body.pass).trim(),
        ldap_id = String(ctx.request.body.ldap_id).trim(),
        name = String(ctx.request.body.name).trim(),
        role = String(ctx.request.body.role).trim()
    ;
    if (!(username && pass && ldap_id && name && role)) {
        return ctx.redirect('/');
    }

    const existingUser = await User.getByUsername(username);
    if (existingUser) {
        return ctx.redirect('/');
    }
    const passHash = await bcrypt.hash(pass, 10);
    await User.create(username, passHash, ldap_id, name, role);
    return ctx.redirect('/');
};

export const postDelete = async (ctx) => {
    Util.checkRole(ctx, 'admin');
    const uid = ctx.request.body.uid;
    if (!uid) {
        return ctx.redirect('/');
    }
    const user = await User.getById(uid);
    if (!user) {
        return ctx.redirect('/');
    }
    await user.delete();
    ctx.response.body = {};
    ctx.response.status = 200;
};

export const getChangePass = async (ctx) => {
    if (!ctx.isAuthenticated()) {
        return redirect('/');
    }
    await ctx.render('change_pass');
};

export const postChangePass = async (ctx) => {
    if (!ctx.isAuthenticated() || !ctx.request.body.pass) {
        ctx.response.status = 400;
        return;
    }
    ctx.state.user.password = await bcrypt.hash(ctx.request.body.pass, 10);
    const success = await ctx.state.user.updatePass();
    ctx.body = { success: success };
    ctx.response.status = 200;
}