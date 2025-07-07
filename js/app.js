// js/app.js

// --- APPLICATION STATE MANAGEMENT ---
const state = {
    currentUser: null,
    currentPage: 'dashboard',
    sortKey: 'id',
    sortOrder: 'asc',
    calendarDate: new Date(),
};

// --- MAIN RENDER FUNCTIONS ---
/**
 * The main render function. Toggles between login screen and main app.
 */
function render() {
    updateOverdueWorkOrders();
    if (!state.currentUser) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').classList.add('hidden');
    } else {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        renderSidebar();
        renderMainContent();
    }
}

/**
 * Renders the sidebar with user info and navigation links based on role.
 */
function renderSidebar() {
    const { fullName, role } = state.currentUser;
    document.getElementById('userFullName').textContent = fullName;
    document.getElementById('userRole').textContent = role;
    
    const userDeptEl = document.getElementById('userDepartment');
    if (role !== 'Admin') {
        userDeptEl.textContent = `Dept: ${getUserDepartment(state.currentUser)}`;
        userDeptEl.classList.remove('hidden');
    } else {
        userDeptEl.classList.add('hidden');
    }

    const navLinks = [
        { id: 'dashboard', name: 'Dashboard', icon: 'fa-chart-line' },
        { id: 'assets', name: 'Asset Management', icon: 'fa-box' },
        { id: 'parts', name: 'Spare Parts', icon: 'fa-cogs' },
        { id: 'partsRequest', name: 'Parts Request', icon: 'fa-shopping-cart' },
        { id: 'workOrders', name: 'Work Orders', icon: 'fa-clipboard-list' },
        { id: 'workOrderCalendar', name: 'WO Calendar', icon: 'fa-calendar-alt' },
        { id: 'locations', name: 'Locations', icon: 'fa-map-marker-alt' },
        { id: 'userManagement', name: 'User Management', icon: 'fa-users', adminOnly: true },
        { id: 'activityLog', name: 'Activity Log', icon: 'fa-history', adminOnly: true },
    ];

    const navMenu = document.getElementById('navMenu');
    navMenu.innerHTML = navLinks
        .filter(link => can.viewPage(link.id))
        .map(link => `
            <a href="#" data-page="${link.id}" class="nav-link flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors ${state.currentPage === link.id ? 'bg-gray-900' : ''}">
                <i class="fas ${link.icon} w-6"></i>
                <span>${link.name}</span>
            </a>
        `).join('');
}

/**
 * Renders the content for the currently selected page.
 */
function renderMainContent() {
    const mainContent = document.getElementById('mainContent');
    if (!can.viewPage(state.currentPage)) {
        state.currentPage = 'dashboard';
    }
    
    switch (state.currentPage) {
        case 'dashboard':
            mainContent.innerHTML = renderDashboard();
            break;
        case 'assets':
            mainContent.innerHTML = renderAssetsPage();
            attachAssetPageEventListeners();
            break;
        case 'parts':
            mainContent.innerHTML = renderPartsPage();
            attachPartsPageEventListeners();
            break;
        case 'partsRequest':
            mainContent.innerHTML = renderPartsRequestPage();
            attachPartsRequestPageEventListeners();
            break;
        case 'workOrders':
            mainContent.innerHTML = renderWorkOrdersPage();
            attachWorkOrdersPageEventListeners();
            break;
        case 'workOrderCalendar':
            mainContent.innerHTML = renderWorkOrderCalendar();
            attachCalendarEventListeners();
            break;
        case 'locations':
            mainContent.innerHTML = renderLocationsPage();
            attachLocationsPageEventListeners();
            break;
        case 'userManagement':
            mainContent.innerHTML = renderUserManagementPage();
            attachUserManagementEventListeners();
            break;
        case 'activityLog':
            mainContent.innerHTML = renderActivityLogPage();
            break;
        default:
            mainContent.innerHTML = `<h1 class="text-2xl font-bold">Page Not Found</h1>`;
    }
}


// --- APPLICATION INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    db.init();
    attachGlobalEventListeners();
    render();
});
