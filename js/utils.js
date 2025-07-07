// js/utils.js

/**
 * Gets the next available ID for a given data set.
 * @param {string} key - The key for the data in localStorage.
 * @returns {number} The next sequential ID.
 */
function getNextId(key) {
    const data = db.get(key);
    return data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
}

/**
 * Logs an activity to the activity log.
 * @param {string} action - The action performed (e.g., 'User Login').
 * @param {string} details - Optional details about the action.
 */
function logActivity(action, details = '') {
    const logs = db.get('logs');
    const newLog = {
        id: getNextId('logs'),
        user: state.currentUser ? state.currentUser.fullName : 'System',
        action,
        details,
        timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    db.set('logs', logs);
}

/**
 * Calculates a future or past date.
 * @param {number} days - The number of days to add (can be negative).
 * @returns {string} The date in 'YYYY-MM-DD' format.
 */
function getNextDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Gets the full hierarchical name of a location from its composite ID.
 * @param {string} locationId - The composite ID (e.g., 'pl-1', 'box-3').
 * @returns {string} The full location string.
 */
function getFullLocationName(locationId) {
    if (typeof locationId !== 'string' || !locationId.includes('-')) return 'N/A';
    
    const { divisions = [], departments = [], productionLines = [], cabinets = [], shelves = [], boxes = [] } = db.get('locations') || {};
    
    const [type, id] = locationId.split('-');
    const numId = parseInt(id);

    if (type === 'pl') {
        const pLine = productionLines.find(l => l.id === numId);
        if (!pLine) return 'N/A';
        const dept = departments.find(d => d.id === pLine.departmentId);
        const div = dept ? divisions.find(d => d.id === dept.divisionId) : null;
        return `${div ? div.name + ' > ' : ''}${dept ? dept.name + ' > ' : ''}${pLine.name}`;
    } else if (type === 'box') {
        const box = boxes.find(b => b.id === numId);
        if (!box) return 'N/A';
        const shelf = shelves.find(s => s.id === box.shelfId);
        if (!shelf) return box.name;
        const cabinet = cabinets.find(c => c.id === shelf.cabinetId);
        if (!cabinet) return `${shelf.name} > ${box.name}`;
        const dept = departments.find(d => d.id === cabinet.departmentId);
        const div = dept ? divisions.find(d => d.id === dept.divisionId) : null;
        return `${div ? div.name + ' > ' : ''}${dept ? dept.name + ' > ' : ''}${cabinet.name} > ${shelf.name} > ${box.name}`;
    } else if (type === 'sh') {
        const shelf = shelves.find(s => s.id === numId);
        if (!shelf) return 'N/A';
        const cabinet = cabinets.find(c => c.id === shelf.cabinetId);
        if (!cabinet) return shelf.name;
        const dept = departments.find(d => d.id === cabinet.departmentId);
        const div = dept ? divisions.find(d => d.id === dept.divisionId) : null;
        return `${div ? div.name + ' > ' : ''}${dept ? dept.name + ' > ' : ''}${cabinet.name} > ${shelf.name}`;
    } else if (type === 'cab') {
        const cabinet = cabinets.find(c => c.id === numId);
        if (!cabinet) return 'N/A';
        const dept = departments.find(d => d.id === cabinet.departmentId);
        const div = dept ? divisions.find(d => d.id === dept.divisionId) : null;
        return `${div ? div.name + ' > ' : ''}${dept ? dept.name + ' > ' : ''}${cabinet.name}`;
    }
    return 'N/A';
}

/**
 * Gets the department name for a given user.
 * @param {object} user - The user object.
 * @returns {string} The name of the user's department.
 */
function getUserDepartment(user) {
    const { departments = [] } = db.get('locations') || {};
    const dept = departments.find(d => d.id === user.departmentId);
    return dept ? dept.name : 'N/A';
}

/**
 * Gets the next available ID for a location sub-array.
 * @param {string} locationKey - The key for the location array (e.g., 'divisions').
 * @returns {number} The next sequential ID.
 */
function getNextIdForLocation(locationKey) {
    const locations = db.get('locations');
    const data = locations[locationKey] || [];
    return data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
}

/**
 * Displays a temporary message at the bottom of the screen.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - If true, displays the message with an error style.
 */
function showTemporaryMessage(message, isError = false) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.style.position = 'fixed';
    messageBox.style.bottom = '20px';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translateX(-50%)';
    messageBox.style.padding = '10px 20px';
    messageBox.style.borderRadius = '8px';
    messageBox.style.color = 'white';
    messageBox.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)';
    messageBox.style.zIndex = '2000';
    messageBox.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(messageBox);
    
    setTimeout(() => {
        messageBox.style.opacity = '0';
        setTimeout(() => {
            if(document.body.contains(messageBox)) {
                document.body.removeChild(messageBox);
            }
        }, 500);
    }, 3000);
}
