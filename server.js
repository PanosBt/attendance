import Koa from 'koa';
import render from '@koa/ejs';
import path from 'path';
import bodyparser from 'koa-bodyparser';
import json from "koa-json";
import router from './routes.js';
import url from 'url';
import session from 'koa-session';
import passport from 'koa-passport';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = new Koa();

render(app, {
    root: path.join(__dirname, 'views'),
    viewExt: 'ejs',
    layout: false
});

app.use(bodyparser());
app.use(json());

app.keys = ['40bR%00siIbl'];
app.use(session({}, app));

import './auth.js';
app.use(passport.initialize());
app.use(passport.session());

app.use(router.routes()).use(router.allowedMethods());

const port = 5000;

app.listen(port, ()=>{
    console.log(`App is Started on port: ${port}`);
});
