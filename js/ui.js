// js/ui.js

// --- PAGE-SPECIFIC RENDERERS ---

function renderDashboard() {
    const assets = db.get('assets').filter(can.view);
    const workOrders = db.get('workOrders').filter(can.view);
    const parts = db.get('parts').filter(can.view);
    const partRequests = db.get('partRequests').filter(can.view);
    
    const openWOs = workOrders.filter(wo => wo.status === 'Open').length;
    const pendingRequests = partRequests.filter(pr => pr.status === 'Requested').length;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const completedThisMonth = workOrders.filter(wo => {
        if (wo.status !== 'Completed') return false;
        const completedDate = new Date(wo.completedDate);
        return completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear;
    }).length;

    const lowStockItems = parts.filter(p => p.quantity <= p.minQuantity).length;
    
    const highPriorityWOs = workOrders.filter(wo => wo.priority === 'High' && wo.status === 'Open');

    return `
        <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-500">Total Assets</h3>
                <p class="text-3xl font-bold">${assets.length}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-500">Open Work Orders</h3>
                <p class="text-3xl font-bold">${openWOs}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-500">Pending Part Requests</h3>
                <p class="text-3xl font-bold">${pendingRequests}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-500">Low Stock Items</h3>
                <p class="text-3xl font-bold">${lowStockItems}</p>
            </div>
        </div>
        <h2 class="text-2xl font-bold mb-4">High Priority Work Orders</h2>
        <div class="bg-white p-4 rounded-lg shadow">
            ${highPriorityWOs.length > 0 ? `
                <table class="w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left p-2">Title</th>
                            <th class="text-left p-2">Asset</th>
                            <th class="text-left p-2">Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${highPriorityWOs.map(wo => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-2">${wo.title}</td>
                                <td class="p-2">${db.get('assets').find(a=>a.id === wo.assetId)?.name || 'N/A'}</td>
                                <td class="p-2">${wo.dueDate}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `<p class="text-gray-500">No high priority work orders.</p>`}
        </div>
    `;
}

function renderAssetsPage() {
    const assets = db.get('assets').filter(can.view);
    return `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Asset Management</h1>
            <div>
                <button id="importAssetsBtn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded mr-2">
                    <i class="fas fa-file-csv mr-2"></i>Import from CSV
                </button>
                <input type="file" id="csvAssetInput" class="hidden" accept=".csv">
                <button id="printAssetsBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">
                    <i class="fas fa-print mr-2"></i>Print List
                </button>
                <button id="addAssetBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-plus mr-2"></i>Add Asset
                </button>
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <input type="text" id="assetSearch" class="w-full mb-4 px-3 py-2 border rounded" placeholder="Search by name, tag, or category...">
            <div class="overflow-x-auto">
                <table class="w-full" id="assetTable">
                    <thead><tr class="border-b">
                        <th class="p-2 text-left cursor-pointer" data-sort="name">Name <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="tag">Tag <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="locationId">Location <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="status">Status <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left">Actions</th>
                    </tr></thead>
                    <tbody id="assetTableBody">
                        ${generateTableRows('assets', assets)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPartsPage() {
    const parts = db.get('parts').filter(can.view);
    return `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Spare Parts Management</h1>
            <div>
                <button id="importPartsBtn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded mr-2">
                    <i class="fas fa-file-csv mr-2"></i>Import from CSV
                </button>
                <input type="file" id="csvFileInput" class="hidden" accept=".csv">
                <button id="printPartsBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">
                    <i class="fas fa-print mr-2"></i>Print List
                </button>
                <button id="addPartBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-plus mr-2"></i>Add Part
                </button>
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <input type="text" id="partSearch" class="w-full mb-4 px-3 py-2 border rounded" placeholder="Search by name, SKU, category, or maker...">
            <div class="overflow-x-auto">
                <table class="w-full" id="partTable">
                    <thead><tr class="border-b">
                        <th class="p-2 text-left cursor-pointer" data-sort="name">Part Name <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="sku">SKU <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="category">Category <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="supplier">Supplier <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="quantity">Quantity <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="price">Price <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left">Actions</th>
                    </tr></thead>
                    <tbody id="partTableBody">
                        ${generateTableRows('parts', parts)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPartsRequestPage() {
    const partRequests = db.get('partRequests').filter(can.view);
    return `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Part Requests</h1>
            <div class="space-x-2">
                 <button id="printPurchaseListBtn" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-file-invoice mr-2"></i>Print Purchase List
                </button>
                 <button id="requestFromStorageBtn" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-warehouse mr-2"></i>Request from Storage
                </button>
                <button id="newPartRequestBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-plus mr-2"></i>New Purchase Request
                </button>
                <button id="receivePartsBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-box-open mr-2"></i>Receive Parts
                </button>
                <button id="restockPartsBtn" class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-dolly-flatbed mr-2"></i>Restock Parts
                </button>
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead><tr class="border-b">
                        <th class="p-2 text-left">Part Name</th>
                        <th class="p-2 text-left">Part Number</th>
                        <th class="p-2 text-left">Maker</th>
                        <th class="p-2 text-left">Quantity</th>
                        <th class="p-2 text-left">Purpose</th>
                        <th class="p-2 text-left">Status</th>
                        <th class="p-2 text-left">Actions</th>
                    </tr></thead>
                    <tbody>
                        ${generateTableRows('partRequests', partRequests)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderWorkOrdersPage() {
    const workOrders = db.get('workOrders').filter(can.view);
    return `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Work Order Management</h1>
            <div>
                <button id="printWorkOrdersBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2">
                    <i class="fas fa-print mr-2"></i>Print List
                </button>
                <button id="addWorkOrderBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-plus mr-2"></i>Create Work Order
                </button>
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <input type="text" id="workOrderSearch" class="w-full mb-4 px-3 py-2 border rounded" placeholder="Search by title or asset name...">
            <div class="overflow-x-auto">
                <table class="w-full" id="workOrderTable">
                    <thead><tr class="border-b">
                        <th class="p-2 text-left cursor-pointer" data-sort="title">Title <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="assetId">Asset <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="dueDate">Due Date <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="priority">Priority <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left cursor-pointer" data-sort="status">Status <i class="fas fa-sort"></i></th>
                        <th class="p-2 text-left">Actions</th>
                    </tr></thead>
                    <tbody id="workOrderTableBody">
                        ${generateTableRows('workOrders', workOrders)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderWorkOrderCalendar() {
    const { calendarDate } = state;
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const workOrders = db.get('workOrders').filter(can.view);

    let calendarHtml = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Work Order Calendar</h1>
            <div class="flex items-center space-x-2">
                <button id="prevMonthBtn" class="px-3 py-1 bg-gray-200 rounded">&lt;</button>
                <h2 class="text-xl font-semibold">${calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button id="nextMonthBtn" class="px-3 py-1 bg-gray-200 rounded">&gt;</button>
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="calendar-grid">
                <div class="text-center font-bold p-2 calendar-day-header">Sun</div>
                <div class="text-center font-bold p-2 calendar-day-header">Mon</div>
                <div class="text-center font-bold p-2 calendar-day-header">Tue</div>
                <div class="text-center font-bold p-2 calendar-day-header">Wed</div>
                <div class="text-center font-bold p-2 calendar-day-header">Thu</div>
                <div class="text-center font-bold p-2 calendar-day-header">Fri</div>
                <div class="text-center font-bold p-2 calendar-day-header">Sat</div>
    `;

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHtml += `<div class="calendar-day other-month"></div>`;
    }

    // Add cells for each day of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isToday = today.toDateString() === currentDate.toDateString();
        const dateStr = currentDate.toISOString().split('T')[0];

        const wosOnThisDay = workOrders.filter(wo => wo.dueDate === dateStr);
        const hasEvents = wosOnThisDay.length > 0;

        calendarHtml += `
            <div class="calendar-day p-2 ${isToday ? 'today' : ''} ${hasEvents ? 'cursor-pointer hover:bg-blue-100' : ''}" ${hasEvents ? `data-date="${dateStr}"` : ''}>
                <div class="font-bold">${day}</div>
                <div class="mt-1 space-y-1 overflow-y-auto max-h-20 pointer-events-none">
                ${wosOnThisDay.map(wo => {
                    const priorityColor = { High: 'bg-red-100', Medium: 'bg-yellow-100', Low: 'bg-blue-100' }[wo.priority];
                    let statusDotColor = 'bg-gray-400'; // Default
                    if (wo.status === 'Completed') {
                        statusDotColor = 'bg-green-500';
                    } else if (wo.status === 'Delay') {
                        statusDotColor = 'bg-red-500';
                    } else if (['Open', 'In Progress', 'On Hold'].includes(wo.status)) {
                        statusDotColor = 'bg-yellow-500'; // Pending
                    }
                    return `<div class="text-xs p-1 rounded ${priorityColor} flex items-center" title="${wo.title} - Status: ${wo.status}">
                                <span class="inline-block w-2 h-2 ${statusDotColor} rounded-full mr-1.5 flex-shrink-0"></span>
                                <span class="truncate">${wo.title}</span>
                            </div>`;
                }).join('')}
                </div>
            </div>
        `;
    }
    
    // Add empty cells for days after the end of the month to fill the grid
    const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();
    for(let i = lastDayOfMonth; i < 6; i++) {
        calendarHtml += `<div class="calendar-day other-month"></div>`;
    }


    calendarHtml += `</div></div>`;
    return calendarHtml;
}

function renderLocationsPage() {
    const { divisions = [], departments = [], productionLines = [], cabinets = [], shelves = [], boxes = [] } = db.get('locations') || {};
    const isAdmin = state.currentUser.role === 'Admin';

    return `
        <h1 class="text-3xl font-bold mb-6">Location Management</h1>
        <div class="grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : ''} gap-6">
            
            ${isAdmin ? `
            <!-- Column 1: Divisions & Departments (Admin Only) -->
            <div class="bg-white p-4 rounded-lg shadow space-y-6">
                <!-- Divisions -->
                <div>
                    <h2 class="text-xl font-bold mb-4">Divisions</h2>
                    <ul id="divisionList" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        ${divisions.map(d => `
                            <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>${d.name}</span>
                                <button class="delete-division-btn text-red-500 hover:text-red-700" data-id="${d.id}"><i class="fas fa-trash"></i></button>
                            </li>`).join('') || '<li class="text-gray-500">No divisions found.</li>'}
                    </ul>
                    <form id="addDivisionForm" class="flex gap-2 border-t pt-4">
                        <input type="text" id="newDivisionName" class="flex-grow px-2 py-1 border rounded" placeholder="New Division Name" required>
                        <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">+</button>
                    </form>
                </div>

                <!-- Departments -->
                <div>
                    <h2 class="text-xl font-bold mb-4">Departments</h2>
                    <ul id="departmentList" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        ${departments.map(d => {
                            const division = divisions.find(div => div.id === d.divisionId);
                            return `
                            <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                    <p>${d.name}</p>
                                    <p class="text-xs text-gray-500">${division ? division.name : 'No Division'}</p>
                                </div>
                                <button class="delete-department-btn text-red-500 hover:text-red-700" data-id="${d.id}"><i class="fas fa-trash"></i></button>
                            </li>`;
                        }).join('') || '<li class="text-gray-500">No departments found.</li>'}
                    </ul>
                    <form id="addDepartmentForm" class="border-t pt-4">
                        <select id="departmentDivisionSelect" class="w-full mb-2 px-2 py-1 border rounded" required>
                            <option value="">Select Division</option>
                            ${divisions.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                        </select>
                        <div class="flex gap-2">
                            <input type="text" id="newDepartmentName" class="flex-grow px-2 py-1 border rounded" placeholder="New Department Name" required>
                            <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">+</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Column 2: Production Lines (Admin Only) -->
            <div class="bg-white p-4 rounded-lg shadow">
                <h2 class="text-xl font-bold mb-4">Production Lines</h2>
                <ul id="productionLineList" class="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    ${productionLines.map(pl => {
                        const department = departments.find(d => d.id === pl.departmentId);
                        return `
                        <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                                <p>${pl.name}</p>
                                <p class="text-xs text-gray-500">${department ? department.name : 'No Department'}</p>
                            </div>
                            <button class="delete-pline-btn text-red-500 hover:text-red-700" data-id="${pl.id}"><i class="fas fa-trash"></i></button>
                        </li>`;
                    }).join('') || '<li class="text-gray-500">No production lines found.</li>'}
                </ul>
                <form id="addProductionLineForm" class="border-t pt-4">
                    <h3 class="font-semibold mb-2">Add New Production Line</h3>
                    <select id="productionLineDepartmentSelect" class="w-full mb-2 px-2 py-1 border rounded" required>
                        <option value="">Select Department</option>
                        ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                    <div class="flex gap-2">
                        <input type="text" id="newProductionLineName" class="flex-grow px-2 py-1 border rounded" placeholder="New Line Name" required>
                        <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">+</button>
                    </div>
                </form>
            </div>
            ` : ''}

            <!-- Column 3: Storage Locations (All Users) -->
            <div class="bg-white p-4 rounded-lg shadow space-y-4">
                <h2 class="text-xl font-bold mb-2">Storage Locations</h2>
                 <!-- Cabinets -->
                <div>
                    <h3 class="font-semibold mb-2">Cabinets</h3>
                     <ul id="cabinetList" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        ${cabinets.map(c => {
                            const department = departments.find(d => d.id === c.departmentId);
                            return `<li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>${c.name} <span class="text-xs text-gray-500">(${department ? department.name : 'N/A'})</span></span>
                                <button class="delete-cabinet-btn text-red-500 hover:text-red-700" data-id="${c.id}"><i class="fas fa-trash"></i></button>
                            </li>`
                        }).join('') || '<li class="text-gray-500">No cabinets found.</li>'}
                    </ul>
                    <form id="addCabinetForm" class="border-t pt-2">
                        <select id="cabinetDepartmentSelect" class="w-full mb-2 px-2 py-1 border rounded" required>
                            <option value="">Select Department</option>
                            ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                        </select>
                        <div class="flex gap-2">
                            <input type="text" id="newCabinetName" class="flex-grow px-2 py-1 border rounded" placeholder="New Cabinet Name" required>
                            <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">+</button>
                        </div>
                    </form>
                </div>
                 <!-- Shelves -->
                <div>
                    <h3 class="font-semibold mb-2">Shelves</h3>
                     <ul id="shelfList" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        ${shelves.map(s => {
                            const cabinet = cabinets.find(c => c.id === s.cabinetId);
                            return `<li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>${s.name} <span class="text-xs text-gray-500">(${cabinet ? cabinet.name : 'N/A'})</span></span>
                                <button class="delete-shelf-btn text-red-500 hover:text-red-700" data-id="${s.id}"><i class="fas fa-trash"></i></button>
                            </li>`
                        }).join('') || '<li class="text-gray-500">No shelves found.</li>'}
                    </ul>
                    <form id="addShelfForm" class="border-t pt-2">
                        <select id="shelfCabinetSelect" class="w-full mb-2 px-2 py-1 border rounded" required>
                            <option value="">Select Cabinet</option>
                            ${cabinets.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <div class="flex gap-2">
                            <input type="text" id="newShelfName" class="flex-grow px-2 py-1 border rounded" placeholder="New Shelf Name" required>
                            <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">+</button>
                        </div>
                    </form>
                </div>
                 <!-- Boxes -->
                 <div>
                    <h3 class="font-semibold mb-2">Boxes</h3>
                     <ul id="boxList" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        ${boxes.map(b => {
                            const shelf = shelves.find(s => s.id === b.shelfId);
                            return `<li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>${b.name} <span class="text-xs text-gray-500">(${shelf ? shelf.name : 'N/A'})</span></span>
                                <button class="delete-box-btn text-red-500 hover:text-red-700" data-id="${b.id}"><i class="fas fa-trash"></i></button>
                            </li>`
                        }).join('') || '<li class="text-gray-500">No boxes found.</li>'}
                    </ul>
                    <form id="addBoxForm" class="border-t pt-2">
                        <select id="boxShelfSelect" class="w-full mb-2 px-2 py-1 border rounded" required>
                            <option value="">Select Shelf</option>
                            ${shelves.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                        <div class="flex gap-2">
                            <input type="text" id="newBoxName" class="flex-grow px-2 py-1 border rounded" placeholder="New Box Name" required>
                            <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">+</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderUserManagementPage() {
    const users = db.get('users');
    return `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">User Management</h1>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="overflow-x-auto">
                <table class="w-full" id="userTable">
                    <thead><tr class="border-b">
                        <th class="p-2 text-left">Full Name</th>
                        <th class="p-2 text-left">Username</th>
                        <th class="p-2 text-left">Role</th>
                        <th class="p-2 text-left">Department</th>
                        <th class="p-2 text-left">Actions</th>
                    </tr></thead>
                    <tbody>
                        ${users.map(user => {
                            const department = getUserDepartment(user);
                            return `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-2">${user.fullName}</td>
                                <td class="p-2">${user.username}</td>
                                <td class="p-2">${user.role}</td>
                                <td class="p-2">${department}</td>
                                <td class="p-2">
                                    ${user.role !== 'Admin' ? `<button class="delete-user-btn text-red-500 hover:text-red-700" data-id="${user.id}"><i class="fas fa-trash"></i></button>` : ''}
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderActivityLogPage() {
    const logs = db.get('logs');
    return `
        <h1 class="text-3xl font-bold mb-6">Activity Log</h1>
        <div class="bg-white p-4 rounded-lg shadow">
            <ul class="space-y-4">
                ${logs.map(log => `
                    <li class="border-b pb-2">
                        <p class="font-semibold">${log.action} <span class="font-normal text-gray-600">by ${log.user}</span></p>
                        <p class="text-sm text-gray-500">${new Date(log.timestamp).toLocaleString()}</p>
                        ${log.details ? `<p class="text-sm mt-1 text-gray-700">${log.details}</p>` : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}
