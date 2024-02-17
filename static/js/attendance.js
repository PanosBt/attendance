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

const generateSeatsHtml = (n) => {
    let html = '';
    for (let ix = 0; ix < n; ix++) {
        let seatId = `seat_${Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1))}`;
        html += `
            <div class="seat_container ii__room_seat" id="${seatId}">
                <div class="seat_square"></div>
            </div>
        `;
    }
    return html;
}

const addRowsHtmlToRoom = (room, addRowsContainer, rowsHtml, newRowsCount) => {
    room.insertAdjacentHTML('beforeend', rowsHtml);
    room.dataset.rows_count = newRowsCount;
    document.getElementById('rows_count').innerHTML = `Αριθμός Σειρών: ${newRowsCount}`;
    room.appendChild(addRowsContainer); // move to end of parent
}

window.onload = () => {

    // on click listeners
    document.addEventListener('click', async ev => {
        const target = ev.target;

        if (target.id == 'declare_attendance_btn') {
            const room = document.getElementById('declare_attendance_room');
            ajaxPost(
                '/declare_attendance',
                {
                    cid: room.dataset.cid,
                    seat_index: room.dataset.selected_seat_index
                },
                () => {
                    alert('Η παρουσία καταγράφηκε με επιτυχία!');
                    location.reload();
                },
                () => {
                    alert('Η καταγραφή της παρουσίας απέτυχε!');
                    location.reload();
                }
            )
        }

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

        if (target.id == 'finalize_attendance_btn') {
            const arid = parseInt(target.dataset.arid);
            await ajaxPost(
                '/finalize_attendance',
                {arid: arid},
                () => {
                    location.reload();
                },
                () => {
                    alert('Η οριστικοποίηση απέτυχε');
                    location.reload();
                }
            );
            return;
        }

        if (target.id == 'unfinalize_attendance_btn') {
            const arid = parseInt(target.dataset.arid);
            await ajaxPost(
                '/unfinalize_attendance',
                {arid: arid},
                () => {
                    location.reload();
                },
                () => {
                    alert('Η επαναφορά απέτυχε');
                    location.reload();
                }
            );
            return;
        }

        if (target.id == 'change_pass_btn') {
            const passInput = document.getElementById('pass'),
                pass2Input = document.getElementById('pass2'),
                pass = passInput.value.trim(),
                pass2 = pass2Input.value.trim()
            ;

            passInput.classList.remove('invalid');
            pass2Input.classList.remove('invalid');
            if (!(pass && pass2) || pass != pass2) {
                passInput.classList.add('invalid');
                pass2Input.classList.add('invalid');
                return;
            }

            await ajaxPost(
                '/change_pass',
                {pass: pass},
                () => {
                    alert('Ο κωδικός άλλαξε!');
                    location.reload();
                },
                () => {
                    alert('Η αλλαγή κωδικού απέτυχε');
                    location.reload();
                }
            );
            return;
        }

        if (target.id == 'delete_all_courses_btn') {
            const res = confirm('Είστε σίγουροι ότι επιθυμείτε τη διαγραφή όλων των μαθημάτων;');
            if (res) {
                await ajaxPost(
                    '/delete_all_courses',
                    {},
                    () => {
                        location.reload();
                    },
                    () => {
                        alert('Η διαγραφή απέτυχε');
                        location.reload();
                    }
                );
            }
            return;
        }

        const selectableSeat = target.closest('.ii__selectable_room_seat');
        if (selectableSeat) {
            document.querySelectorAll('.ii__selectable_room_seat').forEach(seatElem => {
                seatElem.classList.remove('selected');
            });
            selectableSeat.classList.add('selected')
            const index = selectableSeat.dataset.index;
            document.getElementById('declare_attendance_room').dataset.selected_seat_index = index;
            document.getElementById('declare_attendance_btn').disabled = false;
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
                            ${generateSeatsHtml(1)}
                        </div>
                        <div class="my-3">
                            <small>Αριθμός Θέσεων: &nbsp;<input class="seats_cnt_input ii__seats_count" type="number" value="1"></small>
                        </div>
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

        const toggleAttendanceRegistryOpenBtn = target.closest('.ii__toggle_ar_open_btn');
        if (toggleAttendanceRegistryOpenBtn) {
            toggleAttendanceRegistryOpenBtn.disabled = true;
            const arid = toggleAttendanceRegistryOpenBtn.dataset.arid;
            ajaxPost(
                '/toggle_ar_open',
                {arid: parseInt(arid)},
                (resJson) => {
                    location.reload();
                },
                () => {
                    alert('Η αλλαγή απέτυχε');
                    location.reload();
                }
            );
            return;
        }

        const deleteAttendanceBtn = target.closest('.ii__delete_attendance');
        if (deleteAttendanceBtn) {
            const aid = deleteAttendanceBtn.dataset.aid;
            const msg = `
                Είστε σίγουροι ότι επιθυμείτε τη διαγραφή της παρουσίας με τα παρακάτω στοιχεία;\n
                Φοιτητής: ${deleteAttendanceBtn.dataset.student_name}\n
                Ημ/νία-Ώρα: ${deleteAttendanceBtn.dataset.datetime}\n
                Θέση: ${deleteAttendanceBtn.dataset.seat_desc}\n
            `;
            if (confirm(msg)) {
                ajaxPost(
                    '/delete_attendance',
                    {aid: parseInt(aid)},
                    (resJson) => {
                        location.reload();
                    },
                    () => {
                        alert('Η διαγραφή απέτυχε');
                        location.reload();
                    }
                );
            }
            return;
        }

        const deleteCourseBtn = target.closest('.ii__delete_course_btn');
        if (deleteCourseBtn) {
            const cid = deleteCourseBtn.dataset.cid;
            const msg = `
                Είστε σίγουροι ότι επιθυμείτε τη διαγραφή του μαθήματος ${deleteCourseBtn.dataset.course_name};
                Προσοχή! Αυτή η ενέργεια θα διαγράψει και τις αντίστοιχες παρουσίες των φοιτητών και δεν μπορεί να αναιρεθεί.\n
            `;
            if (confirm(msg)) {
                ajaxPost(
                    '/delete_course',
                    {cid: parseInt(cid)},
                    (resJson) => {
                        location.reload();
                    },
                    () => {
                        alert('Η διαγραφή απέτυχε');
                        location.reload();
                    }
                );
            }
            return;
        }

        const deleteUserBtn = target.closest('.ii__delete_user_btn');
        if (deleteUserBtn) {
            const uid = deleteUserBtn.dataset.uid;
            const msg = `
                Είστε σίγουροι ότι επιθυμείτε τη διαγραφή του χρήστη ${deleteUserBtn.dataset.username} (user id: ${uid});\n
                Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
            `;
            if (confirm(msg)) {
                ajaxPost(
                    '/delete_user',
                    {uid: parseInt(uid)},
                    (resJson) => {
                        location.reload();
                    },
                    () => {
                        alert('Η διαγραφή απέτυχε');
                        location.reload();
                    }
                );
            }
            return;
        }
    });

    ['change', 'input'].forEach(evType => {
        document.addEventListener(evType, async ev => {
            const seatsCountInput = ev.target.closest('.ii__seats_count');
            if (seatsCountInput) {
                seatsCountInput.classList.remove('invalid');
                const seatsCnt = parseInt(seatsCountInput.value);
                if (!seatsCnt || seatsCnt < 1) {
                    seatsCountInput.classList.add('invalid');
                    return;
                }
                const rowContainer = seatsCountInput.closest('.ii__room_row_container'),
                    row = rowContainer.querySelector('.ii__room_row'),
                    delBtn = row.querySelector('.ii__delete_row_btn'),
                    seatsHtml = generateSeatsHtml(seatsCnt)
                ;
                row.innerHTML = seatsHtml;
                row.insertAdjacentElement('afterbegin', delBtn);
                rowContainer.dataset.seats_count = seatsCnt;
                }
        });
    });

    const customFileInput = document.querySelector('.custom-file-input');
    if (customFileInput) {
        customFileInput.addEventListener('change', (ev) => {
            const fileName = ev.currentTarget.files[0].name;
            ev.currentTarget.parentNode.querySelector('.custom-file-label').innerText = fileName;
        });
    }

    $('[data-toggle="tooltip"]').tooltip();
};
