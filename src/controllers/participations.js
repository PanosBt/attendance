import fs from 'fs';
import xlsx from 'node-xlsx';

import { Course } from "../models/course.js";
import { Participation } from "../models/participation.js";
import { Util } from "../util.js";

export const get = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    const participations = await Participation.getAll();
    await ctx.render('participations', {
        participations: participations
    });
}

export const upload = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    if (!(ctx.request.files && ctx.request.files.courses_students)) {
        ctx.response.status = 400;
        return;
    }
    try {
        const coursesFile = xlsx.parse(fs.readFileSync(ctx.request.files.courses_students.path));
        const data = coursesFile[0].data;
        const headers = data[0];
        const keysMap = {};
        const reqKeys = [
            'course_name',
            'student_ldap_id'
        ];
        const entries = [];
        for (let key of reqKeys) {
            let keyIndex = headers.indexOf(key);
            if (keyIndex == -1) {
                console.log('key not found', key);
                // TODO error
                ctx.response.status = 400;
                return;
            }
            keysMap[key] = keyIndex;
        }
        if (Object.keys(keysMap).length != reqKeys.length) {
                // TODO error
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
                if (key == 'course_name') {
                    const course = await Course.getByName(val);
                    if (!course) {
                        // TODO error
                        ctx.response.status = 400;
                        return;
                    }
                    entry['course_id'] = course.id;
                } else {
                    entry[key] = val;
                }
            }
            entries.push(entry);
        }
        if(entries.length != data.length - 1) {
            // TODO error
            ctx.response.status = 400;
            return;
        }
        await Participation.insertBatch(entries);

    } catch(err) {
        console.log(err);
    } finally {
        fs.unlinkSync(ctx.request.files.courses_students.path);
    }
    return ctx.redirect('/participations');
}
