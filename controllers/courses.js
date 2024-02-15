import fs from 'fs';
import xlsx from 'node-xlsx';

import { Util } from "../util.js";
import { Course } from '../models/course.js';
import { Room } from '../models/room.js';

export const getAll = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    const courses = await Course.getAll();
    await ctx.render('courses', {
        courses: courses
    });
}

export const upload = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    if (!(ctx.request.files && ctx.request.files.courses)) {
        ctx.response.status = 400;
        return;
    }
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
        await Course.deleteInsertBatch(entries);

    } catch(err) {
    } finally {
        fs.unlinkSync(ctx.request.files.courses.path);
    }
    return ctx.redirect('/courses');
}
