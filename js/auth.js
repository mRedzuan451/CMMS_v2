// js/auth.js

// --- PERMISSION & ACCESS CONTROL ---
const can = {
    /**
     * Checks if the current user can view a specific data item.
     * Admins can see everything. Other roles can only see items in their department.
     * @param {object} item - The data item (asset, part, user, work order).
     * @returns {boolean} True if the user has permission to view.
     */
    view: (item) => {
        if (state.currentUser.role === 'Admin') return true;
        
        const { departments = [], productionLines = [], cabinets = [], shelves = [], boxes = [] } = db.get('locations') || {};
        let itemDepartmentId;

        if (item.departmentId) { // For users
            itemDepartmentId = item.departmentId;
        } else if (item.locationId) { // For assets, parts
            if (typeof item.locationId !== 'string' || !item.locationId.includes('-')) return false;
            const [type, id] = item.locationId.split('-');
            const numId = parseInt(id);
            if (type === 'pl') {
                const pLine = productionLines.find(l => l.id === numId);
                if(pLine) itemDepartmentId = pLine.departmentId;
            } else if (type === 'box') {
                const box = boxes.find(b => b.id === numId);
                const shelf = box ? shelves.find(s => s.id === box.shelfId) : null;
                const cabinet = shelf ? cabinets.find(c => c.id === shelf.cabinetId) : null;
                if(cabinet) itemDepartmentId = cabinet.departmentId;
            } else if (type === 'sh') {
                const shelf = shelves.find(s => s.id === numId);
                const cabinet = shelf ? cabinets.find(c => c.id === shelf.cabinetId) : null;
                if(cabinet) itemDepartmentId = cabinet.departmentId;
            } else if (type === 'cab') {
                const cabinet = cabinets.find(c => c.id === numId);
                if(cabinet) itemDepartmentId = cabinet.departmentId;
            }
        } else if (item.assetId) { // For work orders
            const asset = db.get('assets').find(a => a.id === item.assetId);
            if(asset && asset.locationId && typeof asset.locationId === 'string' && asset.locationId.includes('-')) {
                const [type, id] = asset.locationId.split('-');
                const numId = parseInt(id);
                if (type === 'pl') {
                    const pLine = productionLines.find(l => l.id === numId);
                    if(pLine) itemDepartmentId = pLine.departmentId;
                }
            }
        }
        return itemDepartmentId === state.currentUser.departmentId;
    },
    /**
     * Checks if the current user can view a specific page.
     * @param {string} page - The ID of the page.
     * @returns {boolean} True if the user can view the page.
     */
    viewPage: (page) => {
        const adminOnlyPages = ['userManagement', 'activityLog']; // 'locations' removed
        if (adminOnlyPages.includes(page)) {
            return state.currentUser.role === 'Admin';
        }
        const nonClerkPages = ['assets', 'parts', 'workOrders', 'workOrderCalendar'];
        if (state.currentUser.role === 'Clerk' && nonClerkPages.includes(page)) {
            return false;
        }
        return true;
    }
};

// --- AUTHENTICATION HANDLERS ---
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = db.get('users');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        state.currentUser = user;
        document.getElementById('loginError').textContent = '';
        document.getElementById('loginForm').reset();
        logActivity('User Login');
        render();
    } else {
        document.getElementById('loginError').textContent = 'Invalid username or password.';
    }
}

function handleBypassLogin() {
    state.currentUser = db.get('users').find(u => u.username === 'admin');
    logActivity('Admin Bypass Login');
    render();
}

function handleLogout() {
    logActivity('User Logout');
    state.currentUser = null;
    state.currentPage = 'dashboard';
    render();
}

function handleRegistration(e) {
    e.preventDefault();
    const users = db.get('users');
    const username = document.getElementById('regUsername').value;
    
    if (users.some(u => u.username === username)) {
        document.getElementById('regError').textContent = 'Username already exists.';
        return;
    }

    const newUser = {
        id: getNextId('users'),
        fullName: document.getElementById('regFullName').value,
        employeeId: document.getElementById('regEmployeeId').value,
        username: username,
        password: document.getElementById('regPassword').value,
        divisionId: parseInt(document.getElementById('regDivision').value),
        departmentId: parseInt(document.getElementById('regDepartment').value),
        role: 'Clerk' // New users default to Clerk role
    };

    users.push(newUser);
    db.set('users', users);
    logActivity('User Registered', `New user created: ${newUser.fullName}`);
    document.getElementById('registrationModal').style.display = 'none';
    document.getElementById('registrationForm').reset();
    showTemporaryMessage('Account created successfully! You can now log in.');
}
