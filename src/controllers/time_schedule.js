import fs from 'fs';
import xlsx from 'node-xlsx';

import { Course } from "../models/course.js";
import { TimeSchedule } from "../models/time_schedule.js";
import { Util } from "../util.js";

export const get = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    const time_schedules = await TimeSchedule.getAll();
    await ctx.render('time_schedule', {
        time_schedules: time_schedules
    });
}

export const upload = async (ctx) => {
    Util.checkRole(ctx, 'secretary');
    if (!(ctx.request.files && ctx.request.files.time_schedules)) {
        ctx.response.status = 400;
        return;
    }
    try {
        const timeSchedulesFile = xlsx.parse(
            fs.readFileSync(ctx.request.files.time_schedules.path),
            {cellDates: true}
        );
        const data = timeSchedulesFile[0].data;
        const headers = data[0];
        const keysMap = {};
        const reqKeys = [
            'course_name',
            'day',
            'time_from',
            'time_to',
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
        for (let ix = 1; ix < Math.min(data.length, 50); ix++) {
            const dataRow = data[ix];
            const entry = {};
            for (const key of reqKeys) {
                let val = dataRow[keysMap[key]];
                if (typeof val === 'string') {
                    val = val.trim();
                }
                if (!val) {
                    break;
                }
                if (key == 'course_name') {
                    const course = await Course.getByName(val);
                    if (!course) {
                        // TODO error
                        ctx.response.status = 400;
                        return;
                    }
                    entry['course_id'] = course.id;
                } else if (key == 'day') {
                    entry['dow'] = val;
                } else if (key == 'time_from' || key == 'time_to') {
                    let date = new Date(val);
                    let timeStr = date.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23'
                    });
                    entry[key] = timeStr
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
        await TimeSchedule.deleteInsertBatch(entries);

    } catch(err) {
        console.log(err);
    } finally {
        fs.unlinkSync(ctx.request.files.time_schedules.path);
    }
    return ctx.redirect('/time_schedule');
}
