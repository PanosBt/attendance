import { Room } from "../models/room.js";

export const getRooms = async (ctx) => {
    const rooms = await Room.getAll();
    await ctx.render('rooms', {
        rooms: rooms
    });
};

export const editRoomPage = async (ctx) => {
    const roomId = parseInt(ctx.query.rid);
    let room = null;
    if (!isNaN(roomId) && roomId > 0) {
        room = await Room.get(roomId);
        if (!room) {
            return ctx.redirect('/edit_room');
        }
    }
    await ctx.render('edit_room', {
        room_name: room ? room.name : '',
        room_id: room ? room.id : -1,
        room_layout: room && room.layout ? room.layout : [1]
    });
};

export const editRoom = async (ctx) => {
    const roomId = parseInt(ctx.request.body.room_id);
    const roomName = ctx.request.body.room_name;
    const layout = ctx.request.body.layout;
    if (!(!isNaN(roomId) && roomName && layout && Array.isArray(layout))) {
        ctx.response.status = 400;
        return;
    }
    let room;
    if (roomId == -1) {
        room = await Room.create(roomName, layout);
        if (!room) {
            ctx.response.status = 400;
            return;
        }
    } else {
        room = await Room.get(roomId);
        if (!room) {
            ctx.response.status = 400;
            return;
        }
        room.name = roomName;
        room.layout = layout;
        await room.update();
    }
    ctx.body = {
        room_id: room.id
    };
    ctx.response.status = 200;
};

export const deleteRoom = async (ctx) => {
    const roomId = parseInt(ctx.request.body.room_id);
    if (isNaN(roomId) || roomId <= 0) {
        ctx.response.status = 400;
        return;
    }
    const room = await Room.get(roomId);
    if (!room) {
        ctx.response.status = 400;
        return;
    }
    const success = await room.delete();
    ctx.body = {
        success: success
    };
    ctx.response.status = 200;
};
