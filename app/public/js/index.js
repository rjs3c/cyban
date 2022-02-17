// HTML Elements
const alert_banner = document.querySelector('#alert-banner'),
    mob_screen = window.matchMedia('(max-width: 800px)'),
    mob_screen_small = window.matchMedia('(max-width: 575px)'),
    entries_list_todo = document.querySelector('#todo.entries'),
    entries_list_pending = document.querySelector('#pending.entries'),
    entries_list_done = document.querySelector('#done.entries'),
    entries_actions_btns = document.querySelector('.entry-actions'),
    hide_sidebar_btn = document.querySelector('#btn-hide-sidebar'),
    add_form = document.querySelector('#add-entry-form'),
    login_form = document.querySelector('#login-form'),
    register_form = document.querySelector('#register-form'),
    show_login_password_btn = document.querySelector('#show-login-password'),
    show_register_password_btn = document.querySelector('#show-register-password'),
    show_change_password_btn = document.querySelector('#show-change-password'),
    filter_form = document.querySelector('#filter-menu'),
    sidebar = document.querySelector('#sidebar-row'),
    todo_count_text = document.querySelector('#todo-count'),
    pending_count_text = document.querySelector('#pending-count'),
    done_count_text = document.querySelector('#done-count'),
    todo_column = document.querySelector('#todo-column'),
    pending_column = document.querySelector('#pending-column'),
    done_column = document.querySelector('#done-column'),
    columns_row = document.querySelector('.row'),
    category_checkall_check = document.querySelector('#entry_category_select_all'),
    priority_checkall_check = document.querySelector('#entry_priority_select_all'),
    priority_checkboxes = document.querySelectorAll('.filter-priority-check'),
    category_checkboxes = document.querySelectorAll('.filter-category-check'),
    login_option = document.querySelector('#login-option'),
    logout_option = document.querySelector('#logout-option'),
    register_option = document.querySelector('#register-option'),
    account_option = document.querySelector('#account-option'),
    account_submenu = document.querySelector('#accountPageSubmenu'),
    account_form = document.querySelector('#account-form'),
    delete_account_btn = document.querySelector('#delete-account-btn'),
    executive_summary_option = document.querySelector('#exec-option'),
    recent_activity_option = document.querySelector('#activity-option'),
    append_epoch_check = document.querySelector('#append-epoch-option'),
    filename_field = document.querySelector('#filename-field'),
    mob_up_btn = document.querySelector('#mob-mov-up'),
    mob_down_btn = document.querySelector('#mob-mov-down'),
    logs_list = document.querySelector('#logs-list'),
    logs_prev_btn = document.querySelector('#prev-page'),
    logs_next_btn = document.querySelector('#next-page'),
    logs_page_num = document.querySelector('#page-number'),
    view_more_less = document.querySelector('#view-more-less'),
    entry_categories_more = document.querySelector('#entry-categories-more'),
    filter_entries_link = document.querySelector('#filter-entries-link'),
    columns = ['#todo-column', '#pending-column', '#done-column'];

let todo_delete_buttons = [],
    pending_delete_buttons = [],
    done_delete_buttons = [],
    edit_forms = [],
    col_3_prev_state = false,
    params = {},
    mouse_mov_counter = 0,
    mob_scroll_pos = 0,
    page_num = 1,
    idle_interval = undefined,
    logs_length = 0;

// Escape HTML entities.
const escapeOutput = str => new Option(str).innerHTML;

// Retrieve All Stored Entries
const getAllEntries = async params => {
    // Performs a GET request to /api/entries using Axios.
    const { data } = await axios
    .get('/api/entries', { params });

    let todo_entries = [],
        pending_entries = [],
        done_entries = [];

    // Each individual entry is parsed into an individual element of class .entry.
    data.map(entry => {
        const {
            _id,
            entry_title,
            entry_category,
            entry_status,
            entry_priority,
            entry_depends_on,
            createdAt
        } = entry;

        let today_date = new Date(),
            created_date = new Date(createdAt),
            day_diff = Math.trunc((today_date.getTime() - created_date.getTime()) / (1000 * 60 * 60 * 24)),
            // Indicates the duration since the entry was created, using MongoDB's auto-generated createdAt field.
            createdAtParsed = `${day_diff}d`,
            priority_msg = '';
    
        // Depending on the priority of the entry (Low, Medium, High), a specific UI component will be shown.
        switch (entry_priority) {
            case 'low':
                priority_msg = `<div class="entry-priority low text-center text-uppercase bg-secondary"><p class="entry-priority-text fw-bold text-white">${escapeOutput(entry_priority)}</p></div>`;
                break;
            case 'medium':
                priority_msg = `<div class="entry-priority medium text-center text-uppercase bg-secondary"><p class="entry-priority-text fw-bold text-white">${escapeOutput(entry_priority)}</p></div>`;
                break;
            case 'high':
                priority_msg = `<div class="entry-priority high text-center text-uppercase bg-secondary"><p class="entry-priority-text fw-bold text-white">${escapeOutput(entry_priority)}</p></div>`;
                break;
            default:
                break;
        }

        let child_class_icon = '',
            child_class_hide_btn = '';

        // If an entry is a child (i.e., Depends on another entry), this is illustrated using a UI icon.
        if (entry_depends_on) {
            child_class_hide_btn = 'hide';
            child_class_icon = '<i class="child-icon fw-bold text-white-50 fas fa-child"></i>';
        }

        // Overall HTML entities for each entry. Depending on the status (i.e., Todo, Pending, Done), this will be appended to the relevant column.
        switch (entry_status) {
            case 'todo':
                todo_entries.push(`<div class="col todo entry" translate="off"><div class="row"><div class="col-6"><div class="entry-category text-center text-uppercase bg-secondary"><p class="entry-category-text fw-bold text-white">${escapeOutput(entry_category)}</p></div></div><div class="col-6">${priority_msg}</div></div><div class="entry-header text-sm-start text-wrap"><p class="entry-header-text fs-5 text-black">${escapeOutput(entry_title)}</p></div><div class="entry-actions text-end"><div class="row"><div class="col-4 created-at text-start"><p class="date-created-text text-sm-start fw-bold text-white-50">&nbsp;&nbsp;${createdAtParsed}</p>${child_class_icon}</div><div class="col-8"><button type="button" class="btn btn-todo-create-child btn-sm refresh ${child_class_hide_btn}" data-id="${_id}" data-entry-category="${escapeOutput(entry_category)}" data-entry-status="${escapeOutput(entry_status)}" data-entry-priority="${escapeOutput(entry_priority)}" title="Create Child Entry"><i class="btn-create-child-text fas fa-level-down-alt"></i></button><button type="button" class="btn btn-edit btn-sm refresh" data-bs-toggle="modal" data-bs-target="#modal-todo-${_id}" title="Edit Entry"><i class="btn-edit-text fas fa-edit"></i></button><button type="button" class="btn btn-todo-delete btn-sm refresh" data-id="${_id}" title="Delete Entry"><i class="btn-delete-text fas fa-trash-alt"></i></button></div></div></div></div><div class="modal fade modal-edit" id="modal-todo-${_id}" tabindex="-1" aria-labelled-by="modal-todo-${_id}-label" aria-hidden="true"><div class="modal-dialog modal-dialog-centered" translate="yes"><div class="modal-content fw-bold"><div class="modal-header"><h5 class="modal-title" id="modal-todo-${_id}-label">Edit Entry</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><form class="edit-form" data-id="${_id}"><div class="mb-3 text-start"><label for="entry_title" class="form-label">Entry Title</label><input type="text" class="form-control" id="entry_title" value="${escapeOutput(entry_title)}" required tabindex="0" maxlength="60" placeholder="e.g. Entry Title"></div><div class="mb-3 text-start"><label for="entry_category" class="form-label">Entry Category</label><select class="form-select" id="entry_category" required><option value="control">control</option><option value="dp">data protection</option><option value="dr">disaster recovery</option><option value="event">event</option><option value="grc">governance/risk/compliance</option><option value="ir">incident response</option><option value="patch">patch</option><option value="privacy">privacy</option><option value="risk">risk</option><option value="test">test</option><option value="ta">training/awareness</option><option value="vulnerability">vulnerability</option></select></div><div class="mb-3 text-start"><label for="entry_priority" class="form-label">Entry Priority</label><select class="form-select" id="entry_priority" required><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></div><div class="mb-3 text-start"><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="todo" tabindex="3" checked><label class="form-check-label" for="todo-radio">Todo</label></div><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="pending" tabindex="4"><label class="form-check-label" for="pending-radio">Pending</label></div><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="done" tabindex="5"><label class="form-check-label" for="done-radio">Done</label></div></div><div class="modal-footer"><button type="submit" class="btn btn-dark" data-bs-dismiss="modal" tabindex="6">Submit</button></div></form></div></div></div></div>`.replace(/\\"/g, '"'));
                break;
            case 'pending':
                pending_entries.push(`<div class="col pending entry" translate="off"><div class="row"><div class="col-6"><div class="entry-category text-center text-uppercase bg-secondary"><p class="entry-category-text fw-bold text-white">${escapeOutput(entry_category)}</p></div></div><div class="col-6">${priority_msg}</div></div><div class="entry-header text-sm-start text-wrap"><p class="entry-header-text fs-5 text-black">${escapeOutput(entry_title)}</p></div><div class="entry-actions text-end"><div class="row"><div class="col-4 created-at text-start"><p class="date-created-text text-sm-start fw-bold text-white-50">&nbsp;&nbsp;${createdAtParsed}</p>${child_class_icon}</div><div class="col-8"><button type="button" class="btn btn-pending-create-child btn-sm refresh ${child_class_hide_btn}" data-id="${_id}" data-entry-category="${escapeOutput(entry_category)}" data-entry-status="${escapeOutput(entry_status)}" data-entry-priority="${escapeOutput(entry_priority)}" title="Create Child Entry"><i class="btn-create-child-text fas fa-level-down-alt"></i></button><button type="button" class="btn btn-edit btn-sm refresh" data-bs-toggle="modal" data-bs-target="#modal-pending-${_id}" title="Edit Entry"><i class="btn-edit-text fas fa-edit"></i></button><button type="button" class="btn btn-pending-delete btn-sm refresh" data-id="${_id}" title="Delete Entry"><i class="btn-delete-text fas fa-trash-alt"></i></button></div></div></div></div><div class="modal fade modal-edit" id="modal-pending-${_id}" tabindex="-1" aria-labelled-by="modal-pending-${_id}-label" aria-hidden="true"><div class="modal-dialog modal-dialog-centered" translate="yes"><div class="modal-content fw-bold"><div class="modal-header"><h5 class="modal-title" id="modal-pending-${_id}-label">Edit Entry</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><form class="edit-form" data-id="${_id}"><div class="mb-3 text-start"><label for="entry_title" class="form-label">Entry Title</label><input type="text" class="form-control" id="entry_title" value="${escapeOutput(entry_title)}" required tabindex="0" maxlength="60" placeholder="e.g. Entry Title"></div><div class="mb-3 text-start"><label for="entry_category" class="form-label">Entry Category</label><select class="form-select" id="entry_category" required><option value="control">control</option><option value="dp">data protection</option><option value="dr">disaster recovery</option><option value="event">event</option><option value="grc">governance/risk/compliance</option><option value="ir">incident response</option><option value="patch">patch</option><option value="privacy">privacy</option><option value="risk">risk</option><option value="test">test</option><option value="ta">training/awareness</option><option value="vulnerability">vulnerability</option></select></div><div class="mb-3 text-start"><label for="entry_priority" class="form-label">Entry Priority</label><select class="form-select" id="entry_priority" required><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></div><div class="mb-3 text-start"><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="todo" tabindex="3" checked><label class="form-check-label" for="todo-radio">Todo</label></div><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="pending" tabindex="4"><label class="form-check-label" for="pending-radio">Pending</label></div><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="done" tabindex="5"><label class="form-check-label" for="done-radio">Done</label></div></div><div class="modal-footer"><button type="submit" class="btn btn-dark" data-bs-dismiss="modal" tabindex="6">Submit</button></div></form></div></div></div></div>`.replace(/\\"/g, '"'));
                break;
            case 'done':
                done_entries.push(`<div class="col done entry" translate="off"><div class="row"><div class="col-6"><div class="entry-category text-center text-uppercase bg-secondary"><p class="entry-category-text fw-bold text-white">${escapeOutput(entry_category)}</p></div></div><div class="col-6">${priority_msg}</div></div><div class="entry-header text-sm-start text-wrap"><p class="entry-header-text fs-5 text-black">${escapeOutput(entry_title)}</p></div><div class="entry-actions text-end"><div class="row"><div class="col-4 created-at text-start"><p class="date-created-text text-sm-start fw-bold text-white-50">&nbsp;&nbsp;${createdAtParsed}</p>${child_class_icon}</div><div class="col-8"><button type="button" class="btn btn-done-create-child btn-sm refresh ${child_class_hide_btn}" data-id="${_id}" data-entry-category="${escapeOutput(entry_category)}" data-entry-status="${escapeOutput(entry_status)}" data-entry-priority="${escapeOutput(entry_priority)}" title="Create Child Entry"><i class="btn-create-child-text fas fa-level-down-alt"></i></button><button type="button" class="btn btn-edit btn-sm refresh" data-bs-toggle="modal" data-bs-target="#modal-done-${_id}" title="Edit Entry"><i class="btn-edit-text fas fa-edit"></i></button><button type="button" class="btn btn-done-delete btn-sm refresh" data-id="${_id}" title="Delete Entry"><i class="btn-delete-text fas fa-trash-alt"></i></button></div></div></div></div><div class="modal fade modal-edit" id="modal-done-${_id}" tabindex="-1" aria-labelled-by="modal-done-${_id}-label" aria-hidden="true"><div class="modal-dialog modal-dialog-centered" translate="yes""><div class="modal-content fw-bold"><div class="modal-header"><h5 class="modal-title" id="modal-done-${_id}-label">Edit Entry</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><form class="edit-form" data-id="${_id}"><div class="mb-3 text-start"><label for="entry_title" class="form-label">Entry Title</label><input type="text" class="form-control" id="entry_title" value="${escapeOutput(entry_title)}" required tabindex="0" maxlength="60" placeholder="e.g. Entry Title"></div><div class="mb-3 text-start"><label for="entry_category" class="form-label">Entry Category</label><select class="form-select" id="entry_category" required><option value="control">control</option><option value="dp">data protection</option><option value="dr">disaster recovery</option><option value="event">event</option><option value="grc">governance/risk/compliance</option><option value="ir">incident response</option><option value="patch">patch</option><option value="privacy">privacy</option><option value="risk">risk</option><option value="test">test</option><option value="ta">training/awareness</option><option value="vulnerability">vulnerability</option></select></div><div class="mb-3 text-start"><label for="entry_priority" class="form-label">Entry Priority</label><select class="form-select" id="entry_priority" required><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></div><div class="mb-3 text-start"><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="todo" tabindex="3" checked><label class="form-check-label" for="todo-radio">Todo</label></div><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="pending" tabindex="4"><label class="form-check-label" for="pending-radio">Pending</label></div><div class="form-check form-check-inline"><input type="radio" class="form-check-input" name="entry_status" value="done" tabindex="5"><label class="form-check-label" for="done-radio">Done</label></div></div><div class="modal-footer"><button type="submit" class="btn btn-dark" data-bs-dismiss="modal" tabindex="6">Submit</button></div></form></div></div></div></div>`.replace(/\\"/g, '"'));
                break;
            default:
                break;
        }
    });

    total_count = todo_entries.length + pending_entries.length + done_entries.length;

    todo_count_text.textContent = `(${todo_entries.length}/${total_count})`;
    pending_count_text.textContent = `(${pending_entries.length}/${total_count})`;
    done_count_text.textContent = `(${done_entries.length}/${total_count})`;
    
    // Indicative that no entries of the status Todo exist.
    if (todo_entries.length === 0) todo_entries
    .push(`<div class="alert alert-danger fade show" role="alert"><strong>List is empty.</strong></div>`
    .replace(/\\"/g, '"'));

    // Indicative that no entries of the status Pending exist.
    if (pending_entries.length === 0) pending_entries
    .push(`<div class="alert alert-danger fade show" role="alert"><strong>List is empty.</strong></div>`
    .replace(/\\"/g, '"'));

    // Indicative that no entries of the status Done exist.
    if (done_entries.length === 0) done_entries
    .push(`<div class="alert alert-danger fade show" role="alert"><strong>List is empty.</strong></div>`
    .replace(/\\"/g, '"'));

    entries_list_todo.innerHTML = todo_entries.join(' ');
    entries_list_pending.innerHTML = pending_entries.join(' ');
    entries_list_done.innerHTML = done_entries.join(' ');

    todo_delete_buttons = Array.prototype.slice.call(document.querySelectorAll('.btn-todo-delete'));
    pending_delete_buttons = Array.prototype.slice.call(document.querySelectorAll('.btn-pending-delete'));
    done_delete_buttons = Array.prototype.slice.call(document.querySelectorAll('.btn-done-delete'));

    todo_create_child_buttons = Array.prototype.slice.call(document.querySelectorAll('.btn-todo-create-child'));
    pending_create_child_buttons = Array.prototype.slice.call(document.querySelectorAll('.btn-pending-create-child'));
    done_create_child_buttons = Array.prototype.slice.call(document.querySelectorAll('.btn-done-create-child'));

    edit_forms = document.querySelectorAll('.edit-form');

    // Each entry comes with an accompanying, specific form to edit this.
    Array.prototype.slice.call(edit_forms).forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();

            let params = {};

            Array.prototype.slice.call(form.elements).forEach(element => {
                switch (element.id) {
                    case 'entry_title':
                        params.entry_title = element.value;
                        break;
                    case 'entry_category':
                        params.entry_category = element.value;
                        break;
                    case 'entry_priority':
                        params.entry_priority = element.value;
                        break;
                    default:
                        break;
                }
                        
                switch (element.name) {
                    case 'entry_status':
                        if (element.checked) params.entry_status = element.value;
                        break;
                    default:
                        break;
                }
            });

            editEntry(form.dataset.id, params);
        });
    });

    // Button to create a child/dependency for entries of Todo status.
    todo_create_child_buttons.forEach(button => {
        button.addEventListener('click', () => {
            createChild(
                button.dataset.id,
                button.dataset.entryCategory,
                button.dataset.entryStatus,
                button.dataset.entryPriority
            );
        });
    });

    pending_create_child_buttons.forEach(button => {
        button.addEventListener('click', () => {
            createChild(
                button.dataset.id,
                button.dataset.entryCategory,
                button.dataset.entryStatus,
                button.dataset.entryPriority
            );
        });
    });

    done_create_child_buttons.forEach(button => {
        button.addEventListener('click', () => {
            createChild(
                button.dataset.id,
                button.dataset.entryCategory,
                button.dataset.entryStatus,
                button.dataset.entryPriority
            );
        });
    });
    
    todo_delete_buttons.forEach(button => {
        button.addEventListener('click', () => deleteEntry(button.dataset.id));
    });

    pending_delete_buttons.forEach(button => {
        button.addEventListener('click', () => deleteEntry(button.dataset.id));
    });

    done_delete_buttons.forEach(button => {
        button.addEventListener('click', () => deleteEntry(button.dataset.id));
    });
};

// Edit a Specific Entry
const editEntry = async (id, params) => {
    await axios
    .patch(`/api/entries/${id}`, params)
    .then(res => {
        showAlertSuccess(res.data.msg);
        getAllEntries();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
};

// Delete a Specific Entry
const deleteEntry = async id => {
    await axios
    .delete(`/api/entries/${id}`)
    .then(res => {
        showAlertSuccess(res.data.msg);
        getAllEntries();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
};

// Creates a Child Entry.
const createChild = async (id, entry_category, entry_status, entry_priority) => {
    let params = {
        'entry_title' : 'Child',
        'entry_category' : entry_category,
        'entry_status' : entry_status,
        'entry_priority' : entry_priority,
        'entry_depends_on' : id
    };

    await axios
    .post('/api/entries', params)
    .then(res => {
        showAlertSuccess(res.data.msg);
        getAllEntries();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
}

// Checks if a user is authenticated.
const checkAuthenticated = async () => {
    await axios
    .get('/api/auth/')
    .then()
    .catch(err => {
        if (err.response.status !== 403) {
            register_option.classList.remove('show');
            register_option.classList.add('hide');

            login_option.classList.remove('show');
            login_option.classList.add('hide');

            logout_option.classList.remove('hide');
            logout_option.classList.add('show');

            account_option.classList.remove('hide');
            account_option.classList.add('show');

            executive_summary_option.classList.remove('hide');
            executive_summary_option.classList.add('show');

            recent_activity_option.classList.remove('hide');
            recent_activity_option.classList.add('show');

            idleTimer();

            // Checks for mouse movement. If the mouse is idle for a period of time, then the user session is destroyed.
            window.addEventListener('mousemove', () => mouse_mov_counter = 0);
        } else {
            register_option.classList.remove('hide');
            register_option.classList.add('show');

            login_option.classList.remove('hide');
            login_option.classList.add('show');

            logout_option.classList.remove('show');
            logout_option.classList.add('hide');

            account_option.classList.remove('show');
            account_option.classList.add('hide');

            executive_summary_option.classList.remove('show');
            executive_summary_option.classList.add('hide');

            recent_activity_option.classList.remove('show');
            recent_activity_option.classList.add('hide');

            if (idleTimer !== undefined) clearInterval(idle_interval);
        }
    })
};

// Routinely checks if a user is idle.
const idleTimer = () => {
    idle_interval = setInterval(() => {
        mouse_mov_counter++;
            
        if (mouse_mov_counter === 10) {
            showAlertFailure('Warning: Because you are idle, you will be deauthenticated in 5 minutes. Please move your mouse to stay logged in.')
        } else if (mouse_mov_counter > 15)  {
            clearInterval(idle_interval);
            logout_option.click();
        }
    }, 60000);
}

window.addEventListener('mousemove', () => mouse_mov_counter = 0);

// Add Entry Form
add_form.addEventListener('submit', async e => {
    e.preventDefault();

    let params = {};

    Array.prototype.slice.call(add_form.elements).forEach(element => {
        switch (element.id) {
            case 'entry_title':
                params.entry_title = element.value;
                break;
            case 'entry_category':
                params.entry_category = element.value;
                break;
            case 'entry_priority':
                params.entry_priority = element.value;
                break;
            default:
                break;
        }

        switch (element.name) {
            case 'entry_status':
                if (element.checked) params.entry_status = element.value;
                break;
            default:
                break;
        }
    });

    add_form.reset();

    await axios
    .post('/api/entries', params)
    .then(res => {
        showAlertSuccess(res.data.msg);
        getAllEntries();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
});

// Filter Entries Form
filter_form.addEventListener('submit', async e => {
    e.preventDefault();

    params.entry_category = [];
    params.entry_priority = [];

    Array.prototype.slice.call(filter_form.elements).forEach(element => {
        switch (element.name) {
            case 'entry_category_filter':
                if (element.checked) {
                    switch (element.value) {
                        case 'control':
                        case 'dp':
                        case 'dr':
                        case 'event':
                        case 'grc':
                        case 'ir':
                        case 'patch':
                        case 'privacy':
                        case 'risk':
                        case 'test':
                        case 'ta':
                        case 'vulnerability':
                            params.entry_category.push(element.value);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'entry_priority_filter':
                if (element.checked) {
                    switch (element.value) {
                        case 'low':
                        case 'medium':
                        case 'high':
                            params.entry_priority.push(element.value);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'entry_search_expr':
                params.entry_search = element.value;
                break;
            default:
                break;
        }
    });

    if (params.entry_category.length === 0) params.entry_category
    .push('notapplicable');

    if (params.entry_priority.length === 0) params.entry_priority
    .push('notapplicable');

    getAllEntries(params);
});

// Login Form
login_form.addEventListener('submit', async e => {
    e.preventDefault();

    let params = {};

    Array.prototype.slice.call(login_form.elements).forEach(element => {
        switch (element.id) {
            case 'login-username':
                params.username = element.value;
                break;
            case 'login-password':
                params.password = element.value;
                break;
            default:
                break;
        }
    });

    login_form.reset();

    await axios
    .post('/api/auth/login', params)
    .then(res => {
        showAlertSuccess(res.data.msg);
        checkAuthenticated();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
});

// Register Form
register_form.addEventListener('submit', async e => {
    e.preventDefault();

    let params = {};

    Array.prototype.slice.call(register_form.elements).forEach(element => {
        switch (element.id) {
            case 'register-username':
                params.username = element.value;
                break;
            case 'register-password':
                params.password = element.value;
                break;
            default:
                break;
        }
    });

    register_form.reset();

    await axios
    .post('/api/auth/register', params)
    .then(res => showAlertSuccess(res.data.msg))
    .catch(err => showAlertFailure(err.response.data.msg));
});

// Change Password Form
account_form.addEventListener('submit', async e => {
    e.preventDefault();

    let params = {};

    Array.prototype.slice.call(account_form.elements).forEach(element => {
        switch (element.id) {
            case 'change-password':
                params.password = element.value;
                break;
            default:
                break;
        }
    });

    account_form.reset();

    await axios
    .patch('/api/users/changepassword', params)
    .then(res => showAlertSuccess(res.data.msg))
    .catch(err => showAlertFailure(err.response.data.msg));
});

// Logout functionality
logout_option.addEventListener('click', async () => {
    await axios
    .get('/api/auth/logout')
    .then(res => {
        showAlertSuccess(res.data.msg);
        account_submenu.classList.remove('show');
        checkAuthenticated();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
});

// Account deletion
delete_account_btn.addEventListener('click', async () => {
    await axios
    .delete('/api/users/delete')
    .then(res => {
        showAlertSuccess(res.data.msg);
        logout_option.click();
    })
    .catch(err => showAlertFailure(err.response.data.msg));
});

// Shows a notification of success
const showAlertSuccess = msg => {    
    let message = `<div class="alert alert-success alert-dismissible fade show" role="alert"><strong>${escapeOutput(msg)}</strong></div>`;
    alert_banner.innerHTML = message;

    setTimeout(() => alert_banner.innerHTML = '', 4000);
};

// Shows a notification of failure
const showAlertFailure = msg => {
    let message = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><strong>${escapeOutput(msg)}</strong></div>`;
    alert_banner.innerHTML = message;

    setTimeout(() => alert_banner.innerHTML = '', 4000);
};

// Toggle Show/Hide Password Field in Login Form
show_login_password_btn.addEventListener('click', () => {
    let password = document.querySelector('#login-password');

    if (password.type === 'password') {
        show_login_password_btn.innerHTML = '<i class="fas fa-eye"></i>';
        password.type = 'text';
    } else {
        show_login_password_btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        password.type = 'password';
    }
});

// Toggle Show/Hide Password Field in Login Form
show_register_password_btn.addEventListener('click', () => {
    let password = document.querySelector('#register-password');

    if (password.type === 'password') {
        show_register_password_btn.innerHTML = '<i class="fas fa-eye"></i>';
        password.type = 'text';
    } else {
        show_register_password_btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        password.type = 'password';
    }
});

// Toggle Show/Hide Password Field in Change Password
show_change_password_btn.addEventListener('click', () => {
    let password = document.querySelector('#change-password');

    if (password.type === 'password') {
        show_change_password_btn.innerHTML = '<i class="fas fa-eye"></i>';
        password.type = 'text';
    } else {
        show_change_password_btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        password.type = 'password';
    }
});

// Retrieves Recent Activities
const getRecentActivity = async () => {
    let params = { page_num : page_num ?? 1 },
        logs = [];

    const { data } = await axios
    .get('/api/logs', { params });

    logs_length = data.logs_count;

    data.logs_list.map(log => {
        const {
            user,
            action,
            createdAt
        } = log;

        let today_date = new Date(),
            created_date = new Date(createdAt),
            day_diff = Math.trunc((today_date.getTime() - created_date.getTime()) / (1000 * 60 * 60 * 24)),
            createdAtParsed = `${day_diff}d`;

        switch (action) {
            case 'created':
                logs.push(`<tr class="align-middle"><td class="table-success"><i class="icon-text text-black fw-bold fas fa-plus"></i></td><td><p class="activity-text text-black fw-bold">${escapeOutput(user)} ${escapeOutput(action)} an entry</p></td></td><td><p class="log-date-text fw-bold text-secondary">${createdAtParsed}</p></td></tr>`.replace(/\\"/g, '"'));
                break;
            case 'modified':
                logs.push(`<tr class="align-middle"><td class="table-warning"><i class="icon-text align-middle text-black fw-bold fas fa-tools"></i></td><td><p class="activity-text text-black fw-bold">${escapeOutput(user)} ${escapeOutput(action)} an entry</p></td><td><p class="log-date-text fw-bold text-secondary">${createdAtParsed}</p></td></tr>`.replace(/\\"/g, '"'));
                break;
            case 'deleted':
                logs.push(`<tr class="align-middle"><td class="table-danger"><i class="icon-text align-middle text-black fw-bold fas fa-times"></i></td><td><p class="activity-text text-black fw-bold">${escapeOutput(user)} ${escapeOutput(action)} an entry</p></td><td><p class="log-date-text fw-bold text-secondary">${createdAtParsed}</p></td></tr>`.replace(/\\"/g, '"'));
                break;
            default:
                break;
        }
    });

    if (logs.length === 0) logs
    .push(`<tr class="align-middle"><td><div class="alert alert-danger fade show" role="alert"><strong>No recent activity.</strong></div></td></tr>`
    .replace(/\\"/g, '"'));

    logs_list.innerHTML = logs.join(' ');
}

// Recent Activity Link
recent_activity_option.addEventListener('click', () => {   
    page_num = 1;
    
    logs_page_num.textContent = `Page ${escapeOutput(page_num)}`;

    getRecentActivity();
});

// Recent Activity Buttons - Previous
logs_prev_btn.addEventListener('click', () => {
    if (page_num <= Math.ceil(logs_length / 5) + 1
    && page_num > 1) page_num--;

    logs_page_num.textContent = `Page ${escapeOutput(page_num)}`;

    getRecentActivity();
});

// Recent Activity Buttons - Next
logs_next_btn.addEventListener('click', () => {
    if (page_num <= Math.floor(logs_length / 5)) page_num++;

    logs_page_num.textContent = `Page ${escapeOutput(page_num)}`;

    getRecentActivity();
});

// Hide Sidebar
hide_sidebar_btn.addEventListener('click', () => {
    if (sidebar.classList.contains('hide')) {
        sidebar.classList.remove('hide');
        sidebar.classList.add('show');

        columns_row.classList.remove('justify-content-center');
        columns_row.classList.add('justify-content-start');

        if (!mob_screen.matches) {
            todo_column.classList.remove('col-sm-4');
            pending_column.classList.remove('col-sm-4');
            done_column.classList.remove('col-sm-4');
    
            todo_column.classList.add('col-sm-3');
            pending_column.classList.add('col-sm-3');
            done_column.classList.add('col-sm-3');
        }

        hide_sidebar_btn.innerHTML = '<i class="fas fa-chevron-left">';
    } else {
        sidebar.classList.remove('show');
        sidebar.classList.add('hide');

        columns_row.classList.remove('justify-content-start');
        columns_row.classList.add('justify-content-center');

        todo_column.classList.remove('col-sm-3');
        pending_column.classList.remove('col-sm-3');
        done_column.classList.remove('col-sm-3');

        todo_column.classList.add('col-sm-4');
        pending_column.classList.add('col-sm-4');
        done_column.classList.add('col-sm-4');

        hide_sidebar_btn.innerHTML = '<i class="fas fa-chevron-right">';
    }
});

// 'Check All' Entry Category Checkbox
category_checkall_check.addEventListener('change', () => {
    if (category_checkall_check.checked) category_checkboxes.forEach(checkbox => checkbox.checked = true);
    else category_checkboxes.forEach(checkbox => checkbox.checked = false);
});

// 'Check All' Entry Priority Checkbox
priority_checkall_check.addEventListener('change', () => {
    if (priority_checkall_check.checked) priority_checkboxes.forEach(checkbox => checkbox.checked = true);
    else priority_checkboxes.forEach(checkbox => checkbox.checked = false);
});

// Entry Category Checkboxes
category_checkboxes.forEach(checkbox => checkbox.addEventListener('change', () => !checkbox.checked ? category_checkall_check.checked = false : null));

// Entry Priority Checkboxes
priority_checkboxes.forEach(checkbox => checkbox.addEventListener('change', () => !checkbox.checked ? priority_checkall_check.checked = false : null));

// 'Append Epoch' Checkbox
append_epoch_check.addEventListener('change', () => {
    if (append_epoch_check.checked === true) {
        filename_field.value += `-${parseInt(new Date().getTime() / 1000)}`;
        append_epoch_check.disabled = true;
    }
});

filter_entries_link.addEventListener('click', () => {
    view_more_less.classList.remove('hide');
    view_more_less.classList.add('add');
    entry_categories_more.classList.remove('show');
    entry_categories_more.classList.add('hide');
});

view_more_less.addEventListener('click', () => {
    view_more_less.classList.remove('add');
    view_more_less.classList.add('hide');
    entry_categories_more.classList.remove('hide');
    entry_categories_more.classList.add('show');
});

// Returns the scroll to the top of the page when the screen is changed from mobile to tablet view.
mob_screen_small.addEventListener('change', () => {
    if (!mob_screen_small.matches) window
    .scrollTo({ top: 0, behavior: 'smooth' });
})

// Checks to identify the width of the screen.
mob_screen.addEventListener('change', () => {
    if (mob_screen.matches) {
        document.querySelectorAll('.btn-close').forEach(button => button.click());

        if (todo_column.classList[0] === 'col-sm-3'
        && pending_column.classList[0] === 'col-sm-3'
        && done_column.classList[0] === 'col-sm-3') {
            col_3_prev_state = true;

            if (sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                sidebar.classList.add('hide');
            }

            todo_column.classList.remove('col-sm-3');
            pending_column.classList.remove('col-sm-3');
            done_column.classList.remove('col-sm-3');
    
            todo_column.classList.add('col-sm-4');
            pending_column.classList.add('col-sm-4');
            done_column.classList.add('col-sm-4');
            
        } else {
            col_3_prev_state = false;

            if (sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                sidebar.classList.add('hide');
            }

            todo_column.classList.remove('col-sm-4');
            pending_column.classList.remove('col-sm-4');
            done_column.classList.remove('col-sm-4');
    
            todo_column.classList.add('col-sm-4');
            pending_column.classList.add('col-sm-4');
            done_column.classList.add('col-sm-4');
        }
    } else {       
        if (col_3_prev_state === true) {
            if (sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                sidebar.classList.add('hide');
            } else {
                sidebar.classList.remove('hide');
                sidebar.classList.add('show');
            }

            todo_column.classList.remove('col-sm-4');
            pending_column.classList.remove('col-sm-4');
            done_column.classList.remove('col-sm-4');
        
            todo_column.classList.add('col-sm-3');
            pending_column.classList.add('col-sm-3');
            done_column.classList.add('col-sm-3');
        } else {
            sidebar.classList.remove('show');
            sidebar.classList.add('hide');
        }
    }
});

if (window.innerWidth <= 800) {
    col_3_prev_state = false;

    todo_column.classList.remove('col-sm-3');
    pending_column.classList.remove('col-sm-3');
    done_column.classList.remove('col-sm-3');

    todo_column.classList.add('col-sm-4');
    pending_column.classList.add('col-sm-4');
    done_column.classList.add('col-sm-4');
}

mob_up_btn.addEventListener('click', () => {
    switch (mob_scroll_pos) {
        case 0:
            var anchor = document.querySelector(columns[mob_scroll_pos]),
            anchor_offset = 200,
            anchor_position = anchor.getBoundingClientRect().top,
            offset_position = anchor_position + window.pageYOffset - anchor_offset;
            
            window.scrollTo({ top: offset_position, behavior: 'smooth' });

            break;
        case 1:
            mob_scroll_pos--;

            var anchor = document.querySelector(columns[mob_scroll_pos]),
            anchor_offset = 200,
            anchor_position = anchor.getBoundingClientRect().top,
            offset_position = anchor_position + window.pageYOffset - anchor_offset;
            
            window.scrollTo({ top: offset_position, behavior: 'smooth' });
  
            break;
        case 2:
            mob_scroll_pos--;

            var anchor = document.querySelector(columns[mob_scroll_pos]),
            anchor_offset = 200,
            anchor_position = anchor.getBoundingClientRect().top,
            offset_position = anchor_position + window.pageYOffset - anchor_offset;
            
            window.scrollTo({ top: offset_position, behavior: 'smooth' });

            break;
        default:
            break;
    }
});

mob_down_btn.addEventListener('click', () => {
    switch (mob_scroll_pos) {
        case 0:
            mob_scroll_pos++;

            var anchor = document.querySelector(columns[mob_scroll_pos]),
            anchor_offset = 200,
            anchor_position = anchor.getBoundingClientRect().top,
            offset_position = anchor_position + window.pageYOffset - anchor_offset;
            
            window.scrollTo({ top: offset_position, behavior: 'smooth' });
            
            break;
        case 1:
            mob_scroll_pos++;

            var anchor = document.querySelector(columns[mob_scroll_pos]),
            anchor_offset = 200,
            anchor_position = anchor.getBoundingClientRect().top,
            offset_position = anchor_position + window.pageYOffset - anchor_offset;
            
            window.scrollTo({ top: offset_position, behavior: 'smooth' });

            break;
        case 2:
            var anchor = document.querySelector(columns[mob_scroll_pos]),
            anchor_offset = 200,
            anchor_position = anchor.getBoundingClientRect().top,
            offset_position = anchor_position + window.pageYOffset - anchor_offset;
            
            window.scrollTo({ top: offset_position, behavior: 'smooth' });
            
            break;
        default:
            break;
    }
});

// Routinely Refresh Entries - if across numerous devices
setInterval(() => {
    let modal_not_open = true;

    document.querySelectorAll('.modal-edit').forEach(modal => modal.classList.contains('show') ? modal_not_open = false : null);
    if (modal_not_open === true) getAllEntries(params);
}, 1500);

// Refresh entries on first load
window.onload = () => {
    getAllEntries(params);
    checkAuthenticated();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.focus();
    append_epoch_check.checked = false;
}

// Logout / Remove cookies on exit
window.onunload = async () => await axios
.get('/api/auth/logout');