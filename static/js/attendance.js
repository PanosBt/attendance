const ajaxPost = async (url, dataJson, successCb, failCb = () => {}) => {
    const resRaw = await fetch(
        url,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dataJson)
        }
    );
    if (resRaw.status != 200) {
        failCb(resRaw);
    } else {
        const resJson = await resRaw.json();
        successCb(resJson);
    }
}

const generateSeatHtml = (n, include_del_btn = true) => {
    let html = '';
    for (let ix = 0; ix < n; ix++) {
        let seatId = `seat_${Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1))}`;
        html += `
            <div class="seat_container ii__room_seat" id="${seatId}">
                ${
                    include_del_btn ?
                    `
                    <div class="action_btn delete_btn delete_btn__seat ii__delete_seat_btn" data-sid="${seatId}">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                    `
                    :
                    ''
                }
                <div class="seat_square"></div>
            </div>
        `;
    }
    return html;
}

const addSeatsToRoomRow = (roomRowContainer, roomRow, addSeatBtn, n = 1) => {
    roomRow.insertAdjacentHTML('beforeend', generateSeatHtml(n));
    roomRow.appendChild(addSeatBtn); // move to end of parent
    const newSeatsCount = parseInt(roomRowContainer.dataset.seats_count) + n;
    roomRowContainer.dataset.seats_count = newSeatsCount;
    roomRowContainer.querySelector('.ii__seats_count').innerHTML = `Αριθμός Θέσεων: ${newSeatsCount}`;
};

const addRowsHtmlToRoom = (room, addRowsContainer, rowsHtml, newRowsCount) => {
    room.insertAdjacentHTML('beforeend', rowsHtml);
    room.dataset.rows_count = newRowsCount;
    document.getElementById('rows_count').innerHTML = `Αριθμός Σειρών: ${newRowsCount}`;
    room.appendChild(addRowsContainer); // move to end of parent
}

window.onload = () => {
    document.querySelector('.custom-file-input').addEventListener('change', (ev) => {
        const fileName = ev.currentTarget.files[0].name;
        ev.currentTarget.parentNode.querySelector('.custom-file-label').innerText = fileName;
    });

    document.addEventListener('click', async ev => {
        const target = ev.target;

        if (target.id == 'edit_room_btn') {
            const roomId = parseInt(target.dataset.room_id);
            const roomNameInput = document.getElementById('room_name');
            roomNameInput.classList.remove('invalid');
            if (!roomNameInput.value || roomNameInput.value == '') {
                roomNameInput.classList.add('invalid');
                roomNameInput.parentNode.scrollIntoView();
                return;
            }
            const room = document.getElementById('room');
            let layout = [];
            for (const room_container of room.querySelectorAll('.ii__room_row_container')) {
                layout.push(parseInt(room_container.dataset.seats_count));
            }
            await ajaxPost(
                '/edit_room',
                {
                    room_id: roomId,
                    room_name: roomNameInput.value,
                    layout: layout
                },
                (resJson) => {
                    alert('Οι αλλαγές αποθηκεύτηκαν!');
                    location.replace(`/edit_room?rid=${resJson.room_id}`);
                },
                () => {
                    alert('Η ενημέρωση των στοιχείων απέτυχε.');
                    location.reload();
                }
            );
            return;
        }

        const addSeatBtn = target.closest('.ii__add_seat_btn');
        if (addSeatBtn) {
            const roomRow = addSeatBtn.parentNode;
            const roomRowContainer = roomRow.parentNode;
            addSeatsToRoomRow(roomRowContainer, roomRow, addSeatBtn);
            return;
        }

        const addMultiSeatsBtn = target.closest('.ii__add_multi_seats_btn');
        if (addMultiSeatsBtn) {
            const input = addMultiSeatsBtn.parentNode.getElementsByTagName('input')[0];
            input.classList.remove('invalid');
            const seatsNum = parseInt(input.value);
            if (isNaN(seatsNum) || seatsNum <= 0) {
                input.classList.add('invalid');
                return;
            }
            const roomRowContainer = addMultiSeatsBtn.parentNode.parentNode;
            const roomRow = roomRowContainer.querySelector('.ii__room_row');
            const addSeatBtn = roomRow.querySelector('.ii__add_seat_btn');
            addSeatsToRoomRow(roomRowContainer, roomRow, addSeatBtn, seatsNum);
            input.value = 1;
            return;
        }

        const deleteSeatBtn = target.closest('.ii__delete_seat_btn');
        if (deleteSeatBtn) {
            const seat = document.getElementById(deleteSeatBtn.dataset.sid);
            const roomRowContainer = seat.closest('.ii__room_row_container');
            seat.remove();
            const newSeatsCount = parseInt(roomRowContainer.dataset.seats_count) - 1;
            roomRowContainer.dataset.seats_count = newSeatsCount;
            roomRowContainer.querySelector('.ii__seats_count').innerHTML = `Αριθμός Θέσεων: ${newSeatsCount}`;
            return;
        }

        const addRowsBtn = target.closest('.ii__add_rows_btn');
        if (addRowsBtn) {
            const input = addRowsBtn.parentNode.getElementsByTagName('input')[0];
            input.classList.remove('invalid');
            const rowsNum = parseInt(input.value);
            if (isNaN(rowsNum) || rowsNum <= 0) {
                input.classList.add('invalid');
                return;
            }
            const addRowsContainer = addRowsBtn.parentNode.parentNode;
            const room = addRowsContainer.parentNode;
            const currentRowsCount = parseInt(room.dataset.rows_count);
            let html = '';
            for (let ix = 0; ix < rowsNum; ix++) {
                html += `
                    <div class="room_row_container ii__room_row_container" data-seats_count="1">
                        <div class="room_row ii__room_row">
                            <div class="action_btn delete_btn delete_btn__row ii__delete_row_btn">
                                <i class="fa-solid fa-xmark"></i>
                            </div>
                            ${generateSeatHtml(1, false)}
                            <div class="action_btn add_btn ii__add_seat_btn">
                                <i class="fa-solid fa-circle-plus"></i>
                            </div>
                        </div>
                        <div class="add_multi add_multi__seats">
                            Προσθήκη&nbsp;<input type="text" value="1">&nbsp;θέσης/εων
                            <div class="action_btn add_btn ml-2 ii__add_multi_seats_btn">
                                <i class="fa-solid fa-circle-plus"></i>
                            </div>
                        </div>
                        <small class="ii__seats_count">Αριθμός Θέσεων: 1</small>
                    </div>
                `;
            }
            addRowsHtmlToRoom(room, addRowsContainer, html, currentRowsCount + rowsNum);
            input.value = 1;
            return;
        }

        const addEmptyRowBtn = target.closest('.ii__add_empty_row_btn');
        if (addEmptyRowBtn) {
            const addRowsContainer = addEmptyRowBtn.parentNode.parentNode;
            const room = addRowsContainer.parentNode;
            const currentRowsCount = parseInt(room.dataset.rows_count);
            let html = `
                <div class="room_row_container ii__room_row_container" data-seats_count="0">
                    <div class="room_row ii__room_row">
                        <div class="action_btn delete_btn delete_btn__row ii__delete_row_btn">
                            <i class="fa-solid fa-xmark"></i>
                        </div>
                        <div class="empty_row"></div>
                    </div>
                </div>
            `;
            addRowsHtmlToRoom(room, addRowsContainer, html, currentRowsCount + 1);
            return;
        }

        const deleteRowBtn = target.closest('.ii__delete_row_btn');
        if (deleteRowBtn) {
            const rowContainer = deleteRowBtn.parentNode.parentNode;
            const room = rowContainer.parentNode;
            rowContainer.remove();
            const newRowsCount = parseInt(room.dataset.rows_count) - 1;
            room.dataset.rows_count = newRowsCount;
            document.getElementById('rows_count').innerHTML = `Αριθμός Σειρών: ${newRowsCount}`;
            return;
        }

        const deleteRoomBtn = target.closest('.ii__delete_room_btn');
        if (deleteRoomBtn) {
            const roomId = deleteRoomBtn.dataset.rid;
            const msg = `Είστε σίγουροι ότι επιθυμείτε τη διαγραφή της αίθουσας "${deleteRoomBtn.dataset.room_name}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`;
            if (confirm(msg)) {
                const errMsg = 'Η διαγραφή απέτυχε';
                ajaxPost(
                    '/delete_room',
                    {room_id: parseInt(roomId)},
                    (resJson) => {
                        if (resJson.success) {
                            document.getElementById(`room_${roomId}`).remove();
                        } else {
                            alert(errMsg);
                        }
                    },
                    () => {
                        alert(errMsg);
                    }
                );
            }
            return;
        }

    });
};
