// js/handlers.js

// --- EVENT HANDLER ATTACHMENT ---

function attachGlobalEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('bypassLoginBtn').addEventListener('click', handleBypassLogin);
    document.getElementById('createAccountBtn').addEventListener('click', () => {
        populateLocationDropdowns(document.getElementById('regDivision'), document.getElementById('regDepartment'));
        document.getElementById('registrationModal').style.display = 'flex';
    });
    document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    document.getElementById('sidebar').addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            e.preventDefault();
            state.currentPage = navLink.dataset.page;
            render();
        }
    });

    // Master event listener for modal buttons
    document.body.addEventListener('click', (e) => {
        // Checklist Item Add Button
        if (e.target.id === 'addChecklistItemBtn') {
            const input = document.getElementById('newChecklistItem');
            if (input.value.trim()) {
                addChecklistItem(input.value.trim());
                input.value = '';
            }
        }
        // Checklist Item Remove Button
        if (e.target.closest('.remove-checklist-item-btn')) {
            e.target.closest('.checklist-item').remove();
        }
    });
    
    // Centralized event listener for main content area
    document.getElementById('mainContent').addEventListener('click', (e) => {
        handleMainContentClicks(e);
    });
}

function attachAssetPageEventListeners() {
    document.getElementById('addAssetBtn').addEventListener('click', () => showAssetModal());
    document.getElementById('importAssetsBtn').addEventListener('click', () => document.getElementById('csvAssetInput').click());
    document.getElementById('csvAssetInput').addEventListener('change', handleAssetImport);
    document.getElementById('assetForm').addEventListener('submit', handleAssetFormSubmit);
    document.getElementById('assetSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allAssets = db.get('assets').filter(can.view);
        const filtered = allAssets.filter(a => 
            a.name.toLowerCase().includes(searchTerm) ||
            a.tag.toLowerCase().includes(searchTerm) ||
            a.category.toLowerCase().includes(searchTerm)
        );
        document.getElementById('assetTableBody').innerHTML = generateTableRows('assets', filtered);
    });
    document.getElementById('printAssetsBtn').addEventListener('click', handlePrintAssets);
}

function attachPartsPageEventListeners() {
    document.getElementById('addPartBtn').addEventListener('click', () => showPartModal());
    document.getElementById('printPartsBtn').addEventListener('click', handlePrintParts);
    document.getElementById('importPartsBtn').addEventListener('click', () => document.getElementById('csvFileInput').click());
    document.getElementById('csvFileInput').addEventListener('change', handlePartImport);
    document.getElementById('partForm').addEventListener('submit', handlePartFormSubmit);
    document.getElementById('partSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allParts = db.get('parts').filter(can.view);
        const filtered = allParts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm) ||
            (p.category && p.category.toLowerCase().includes(searchTerm)) ||
            (p.maker && p.maker.toLowerCase().includes(searchTerm))
        );
        document.getElementById('partTableBody').innerHTML = generateTableRows('parts', filtered);
    });
}

function attachPartsRequestPageEventListeners() {
    document.getElementById('newPartRequestBtn').addEventListener('click', showPartRequestModal);
    document.getElementById('requestFromStorageBtn').addEventListener('click', showStorageRequestModal);
    document.getElementById('receivePartsBtn').addEventListener('click', showReceivePartsModal);
    document.getElementById('restockPartsBtn').addEventListener('click', showRestockPartsModal);
    document.getElementById('printPurchaseListBtn').addEventListener('click', handlePrintPurchaseList);
    document.getElementById('partRequestForm').addEventListener('submit', handlePartRequestFormSubmit);
    document.getElementById('storageRequestForm').addEventListener('submit', handleStorageRequestFormSubmit);
    document.getElementById('receivePartsForm').addEventListener('submit', handleReceivePartsFormSubmit);
    document.getElementById('restockPartsForm').addEventListener('submit', handleRestockPartsFormSubmit);
}

function attachWorkOrdersPageEventListeners() {
    document.getElementById('addWorkOrderBtn').addEventListener('click', () => showWorkOrderModal());
    document.getElementById('printWorkOrdersBtn').addEventListener('click', handlePrintWorkOrders);
    document.getElementById('workOrderForm').addEventListener('submit', handleWorkOrderFormSubmit);
    document.getElementById('completeWorkOrderForm').addEventListener('submit', handleCompleteWorkOrderFormSubmit);
    document.getElementById('workOrderSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allWos = db.get('workOrders').filter(can.view);
        const assets = db.get('assets');
        const filtered = allWos.filter(wo => {
            const assetName = assets.find(a => a.id === wo.assetId)?.name || '';
            return wo.title.toLowerCase().includes(searchTerm) || assetName.toLowerCase().includes(searchTerm)
        });
        document.getElementById('workOrderTableBody').innerHTML = generateTableRows('workOrders', filtered);
    });
}

function attachCalendarEventListeners() {
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
        renderMainContent();
    });
    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
        renderMainContent();
    });
    document.querySelector('#mainContent').addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day');
        if (dayEl && dayEl.dataset.date) {
            const date = dayEl.dataset.date;
            const workOrders = db.get('workOrders').filter(wo => wo.dueDate === date);
            showCalendarDetailModal(date, workOrders);
        }
    });
}

function attachLocationsPageEventListeners() {
    const isAdmin = state.currentUser.role === 'Admin';

    if (isAdmin) {
        document.getElementById('addDivisionForm').addEventListener('submit', handleAddDivision);
        document.getElementById('addDepartmentForm').addEventListener('submit', handleAddDepartment);
        document.getElementById('addProductionLineForm').addEventListener('submit', handleAddProductionLine);
        
        document.getElementById('divisionList').addEventListener('click', e => {
            const btn = e.target.closest('.delete-division-btn');
            if(btn) handleDeleteLocation('division', parseInt(btn.dataset.id));
        });
        document.getElementById('departmentList').addEventListener('click', e => {
            const btn = e.target.closest('.delete-department-btn');
            if(btn) handleDeleteLocation('department', parseInt(btn.dataset.id));
        });
        document.getElementById('productionLineList').addEventListener('click', e => {
            const btn = e.target.closest('.delete-pline-btn');
            if(btn) handleDeleteLocation('productionLine', parseInt(btn.dataset.id));
        });
    }

    // These are for storage locations, which everyone can access
    document.getElementById('addCabinetForm').addEventListener('submit', handleAddCabinet);
    document.getElementById('addShelfForm').addEventListener('submit', handleAddShelf);
    document.getElementById('addBoxForm').addEventListener('submit', handleAddBox);
    
    document.getElementById('cabinetList').addEventListener('click', e => {
        const btn = e.target.closest('.delete-cabinet-btn');
        if(btn) handleDeleteLocation('cabinet', parseInt(btn.dataset.id));
    });
    document.getElementById('shelfList').addEventListener('click', e => {
        const btn = e.target.closest('.delete-shelf-btn');
        if(btn) handleDeleteLocation('shelf', parseInt(btn.dataset.id));
    });
    document.getElementById('boxList').addEventListener('click', e => {
        const btn = e.target.closest('.delete-box-btn');
        if(btn) handleDeleteLocation('box', parseInt(btn.dataset.id));
    });
}

function attachUserManagementEventListeners() {
    document.getElementById('userTable').addEventListener('click', e => {
        const btn = e.target.closest('.delete-user-btn');
        if (btn) {
            const userId = parseInt(btn.dataset.id);
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                let users = db.get('users');
                const userToDelete = users.find(u => u.id === userId);
                users = users.filter(u => u.id !== userId);
                db.set('users', users);
                logActivity('User Deleted', `Deleted user: ${userToDelete.fullName} (${userToDelete.username})`);
                render();
            }
        }
    });
}
