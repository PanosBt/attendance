import fs from 'fs';
import xlsx from 'node-xlsx';

import { Util } from "../util.js";
import { Course } from '../models/course.js';
import { Room } from '../models/room.js';

export const getAll = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    const courses = await Course.getAll();
    const rooms = await Room.getAll();
    await ctx.render('courses', {
        courses: courses,
        rooms: rooms
    });
}

export const post = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    const courseΝame = ctx.request.body.course_name.trim(),
        professorLdapId = ctx.request.body.professor_ldap_id.trim(),
        roomId = parseInt(ctx.request.body.room_id),
        semester = ctx.request.body.semester.trim(),
        yearSeason = ctx.request.body.year_season.trim()
    ;
    if (!(courseΝame && professorLdapId && roomId && semester && yearSeason)) {
        return ctx.redirect('/courses');
    }
    let semesterNum = parseInt(semester);
    if (isNaN(semesterNum)) {
        semesterNum = parseInt(semester.replace('ο', '').replace('Ο', ''));
    }
    if (!semesterNum) {
        return ctx.redirect('/courses');
    }
    const room = Room.get(roomId);
    if (!room) {
        return ctx.redirect('/courses');
    }

    await Course.create(professorLdapId, yearSeason, semesterNum, roomId, courseΝame);
    return ctx.redirect('/courses');
}

export const upload = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    if (!(ctx.request.files && ctx.request.files.courses)) {
        ctx.response.status = 400;
        return;
    }
    const deletePast = ctx.request.body.delete_past == 'on';
    try {
        const coursesFile = xlsx.parse(fs.readFileSync(ctx.request.files.courses.path));
        const data = coursesFile[0].data;
        const headers = data[0];
        const keysMap = {};
        const reqKeys = [
            'professor_ldap_id',
            'year_season',
            'semester',
            'room_name',
            'name'
        ];
        const entries = [];
        for (let key of reqKeys) {
            let keyIndex = headers.indexOf(key);
            if (keyIndex == -1) {
                console.log('key not found', key);
                ctx.response.status = 400;
                return;
            }
            keysMap[key] = keyIndex;
        }
        if (Object.keys(keysMap).length != reqKeys.length) {
                ctx.response.status = 400;
                return;
        }
        for (let ix = 1; ix < data.length; ix++) {
            const dataRow = data[ix];
            const entry = {};
            for (const key of reqKeys) {
                let val = dataRow[keysMap[key]];
                if (typeof val === 'string') {
                    val = val.trim();
                }
                if (key == 'room_name') {
                    const room = await Room.getByName(val);
                    if (!room) {
                        ctx.response.status = 400;
                        return;
                    }
                    entry['room_id'] = room.id;
                } else {
                    entry[key] = val;
                }
            }
            entries.push(entry);
        }
        if(entries.length != data.length - 1) {
            ctx.response.status = 400;
            return;
        }
        await Course.deleteInsertBatch(entries, deletePast);

    } catch(err) {
    } finally {
        fs.unlinkSync(ctx.request.files.courses.path);
    }
    return ctx.redirect('/courses');
}

export const postDelete = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    const cid = ctx.request.body.cid;
    if (!cid) {
        ctx.response.status = 400;
        return;
    }
    const course = await Course.get(cid);
    if (!course) {
        ctx.response.status = 400;
        return;
    }

    await course.delete();

    ctx.response.body = {
    };
    ctx.response.status = 200;
}
