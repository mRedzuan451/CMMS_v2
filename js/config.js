// js/config.js

// --- DATABASE ABSTRACTION LAYER (using localStorage) ---
const db = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    init: () => {
        // Initialize with seed data only if it hasn't been done before
        if (!localStorage.getItem('cmms_initialized')) {
            console.log('Initializing database with seed data...');
            // Seed Locations: Divisions > Departments > Production Lines
            const divisions = [{ id: 1, name: 'Manufacturing' }, { id: 2, name: 'Logistics' }];
            const departments = [
                { id: 1, divisionId: 1, name: 'Assembly' },
                { id: 2, divisionId: 1, name: 'Fabrication' },
                { id: 3, divisionId: 2, name: 'Warehouse' }
            ];
            const productionLines = [
                { id: 1, departmentId: 1, name: 'Line A' },
                { id: 2, departmentId: 1, name: 'Line B' },
                { id: 3, departmentId: 2, name: 'Welding Area' },
                { id: 4, departmentId: 3, name: 'Receiving Dock' }
            ];
            // New Storage Hierarchy
            const cabinets = [
                { id: 1, departmentId: 3, name: 'WH-CAB-01' },
                { id: 2, departmentId: 1, name: 'AS-CAB-01' }
            ];
            const shelves = [
                { id: 1, cabinetId: 1, name: 'Shelf A' },
                { id: 2, cabinetId: 1, name: 'Shelf B' },
                { id: 3, cabinetId: 2, name: 'Shelf 1' }
            ];
            const boxes = [
                { id: 1, shelfId: 1, name: 'Box 1-A' },
                { id: 2, shelfId: 1, name: 'Box 1-B' },
                { id: 3, shelfId: 2, name: 'Box 2-A' }
            ];
            db.set('locations', { divisions, departments, productionLines, cabinets, shelves, boxes });
            
            // Seed Users with different roles
            const users = [
                { id: 1, fullName: 'Admin User', employeeId: 'A001', username: 'admin', password: 'admin123', role: 'Admin', divisionId: 1, departmentId: 1 },
                { id: 2, fullName: 'John Engineer', employeeId: 'E001', username: 'jengineer', password: 'password', role: 'Engineer', divisionId: 1, departmentId: 1 },
                { id: 3, fullName: 'Jane Clerk', employeeId: 'C001', username: 'jclerk', password: 'password', role: 'Clerk', divisionId: 1, departmentId: 2 },
                { id: 4, fullName: 'Mike Manager', employeeId: 'M001', username: 'mmanager', password: 'password', role: 'Manager', divisionId: 2, departmentId: 3 },
                { id: 5, fullName: 'Susan Supervisor', employeeId: 'S001', username: 'ssupervisor', password: 'password', role: 'Supervisor', divisionId: 1, departmentId: 1 },
                { id: 6, fullName: 'Tom Technician', employeeId: 'T001', username: 'ttechnician', password: 'password', role: 'Technician', divisionId: 1, departmentId: 2 },
            ];
            db.set('users', users);

            // Seed Assets
            const assets = [
                { id: 1, name: 'CNC Machine', tag: 'CNC-001', category: 'Machining', locationId: 'pl-1', status: 'Active', purchaseDate: '2022-01-15', cost: 150000, currency: 'MYR', workOrderHistory: [], transferHistory: [] },
                { id: 2, name: 'Conveyor Belt', tag: 'CV-001', category: 'Material Handling', locationId: 'pl-2', status: 'Active', purchaseDate: '2021-05-20', cost: 25000, currency: 'MYR', workOrderHistory: [], transferHistory: [] },
                { id: 3, name: 'Welding Robot', tag: 'WR-001', category: 'Robotics', locationId: 'pl-3', status: 'Active', purchaseDate: '2023-02-10', cost: 85000, currency: 'MYR', workOrderHistory: [], transferHistory: [] },
                { id: 4, name: 'Forklift', tag: 'FL-001', category: 'Vehicle', locationId: 'pl-4', status: 'Under Maintenance', purchaseDate: '2020-11-01', cost: 30000, currency: 'MYR', workOrderHistory: [], transferHistory: [] }
            ];
            db.set('assets', assets);

            // Seed Spare Parts with new details
            const parts = [
                { id: 1, name: '75A Fuse', sku: 'F-75A', quantity: 50, minQuantity: 10, locationId: 'box-1', category: 'Electrical', maker: 'Siemens', supplier: 'ElecSupplies Inc.', price: 5.99, currency: 'MYR', leadTime: '3 days', attachmentRef: '', relatedAssetIds: [1], transactionHistory: [] },
                { id: 2, name: 'Hydraulic Oil 5L', sku: 'OIL-H5', quantity: 8, minQuantity: 5, locationId: 'box-2', category: 'Hydraulic', maker: 'Mobil', supplier: 'Global Oils', price: 75.50, currency: 'MYR', leadTime: '1 day', attachmentRef: '', relatedAssetIds: [4], transactionHistory: [] },
                { id: 3, name: 'Conveyor Roller', sku: 'CV-RL-01', quantity: 20, minQuantity: 10, locationId: 'box-3', category: 'Mechanical', maker: 'SKF', supplier: 'Bearings Direct', price: 120.00, currency: 'MYR', leadTime: '10 days', attachmentRef: '', relatedAssetIds: [2], transactionHistory: [] },
                { id: 4, name: 'Welding Tip #5', sku: 'WT-05', quantity: 150, minQuantity: 50, locationId: 'box-3', category: 'Consumable', maker: 'Lincoln Electric', supplier: 'Welders Friend', price: 2.25, currency: 'MYR', leadTime: '2 days', attachmentRef: '', relatedAssetIds: [3], transactionHistory: [] },
            ];
            db.set('parts', parts);
            
            // Seed Work Orders
            const workOrders = [
                { id: 1, title: 'Quarterly CNC Lubrication', description: 'Lubricate all moving parts as per manual.', assetId: 1, assignedTo: 2, task: 'Lubrication', dueDate: getNextDate(0), priority: 'Medium', frequency: 'Monthly', status: 'Open', requiredParts: [{partId: 1, quantity: 2}] },
                { id: 2, title: 'Forklift Engine Check', description: 'Inspect engine for leaks and wear.', assetId: 4, assignedTo: 6, task: 'Inspection', dueDate: getNextDate(5), priority: 'High', frequency: 'One-Time', status: 'Open', requiredParts: [] },
                { id: 3, title: 'Daily Conveyor Belt Cleaning', description: 'Clean debris from belt and rollers.', assetId: 2, assignedTo: 5, task: 'Cleaning', dueDate: getNextDate(-2), priority: 'Low', frequency: 'Daily', status: 'Completed', completedDate: getNextDate(-2), requiredParts: [] },
            ];
            db.set('workOrders', workOrders);

            // Seed Activity Log
            db.set('logs', [{ id: 1, user: 'System', action: 'System Initialized', details: 'Default data loaded.', timestamp: new Date().toISOString() }]);
            
            // Seed Part Requests
            db.set('partRequests', []);
            db.set('receivedParts', []); // For parts in staging

            localStorage.setItem('cmms_initialized', 'true');
        }
    }
};
