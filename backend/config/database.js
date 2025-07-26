const fs = require('fs');
const path = require('path');

let db = null;
let dbPath = null;

const connectDB = async () => {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database with JSON file
    dbPath = path.join(dataDir, 'db.json');
    
    // Load existing data or create new
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      db = JSON.parse(data);
    } else {
      db = {
        users: [],
        tasks: [],
        machines: [],
        sessions: []
      };
    }

    // Add some default users if none exist
    if (db.users.length === 0) {
      // Hash for password: "admin123"
      const adminPasswordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
      
      db.users = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@company.com',
          password: adminPasswordHash,
          role: 'Admin',
          status: 'Active',
          avatar: '',
          department: 'IT',
          phone: '',
          address: '',
          lastLogin: null,
          emailVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sub Admin User',
          email: 'subadmin@company.com',
          password: adminPasswordHash,
          role: 'Sub Admin',
          status: 'Active',
          avatar: '',
          department: 'Management',
          phone: '',
          address: '',
          lastLogin: null,
          emailVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'John Manager',
          email: 'john@company.com',
          password: adminPasswordHash,
          role: 'Manager',
          status: 'Active',
          avatar: '',
          department: 'Production',
          phone: '',
          address: '',
          lastLogin: null,
          emailVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Sarah Employee',
          email: 'sarah@company.com',
          password: adminPasswordHash,
          role: 'Employee',
          status: 'Active',
          avatar: '',
          department: 'Production',
          phone: '',
          address: '',
          lastLogin: null,
          emailVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    // Add sample machines if none exist
    if (db.machines.length === 0) {
      db.machines = [
        {
          id: '1',
          name: 'Production Line A',
          model: 'PL-2000',
          serialNumber: 'SN001',
          status: 'Operational',
          location: 'Factory Floor 1',
          department: 'Production',
          efficiency: 95,
          assignedTechnician: '3',
          maintenance: {
            lastMaintenance: new Date().toISOString(),
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            interval: 30
          },
          specifications: {
            capacity: '1000 units/hour',
            power: '50kW',
            manufacturer: 'TechCorp'
          },
          alerts: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Quality Control Machine',
          model: 'QC-500',
          serialNumber: 'SN002',
          status: 'Operational',
          location: 'QC Lab',
          department: 'Quality',
          efficiency: 88,
          assignedTechnician: '3',
          maintenance: {
            lastMaintenance: new Date().toISOString(),
            nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            interval: 15
          },
          specifications: {
            capacity: '500 tests/hour',
            accuracy: '99.9%',
            manufacturer: 'QualityTech'
          },
          alerts: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    // Add sample tasks if none exist
    if (db.tasks.length === 0) {
      db.tasks = [
        {
          id: '1',
          title: 'Production Line Maintenance',
          description: 'Perform routine maintenance on Production Line A',
          assignedTo: '4',
          employees: ['4'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'High',
          status: 'Pending',
          progress: 0,
          machine: '1',
          category: 'Maintenance',
          attachments: [],
          comments: [],
          createdBy: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Quality Check Process',
          description: 'Conduct quality checks on new batch',
          assignedTo: '4',
          employees: ['4'],
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Medium',
          status: 'In Progress',
          progress: 30,
          machine: '2',
          category: 'Quality Control',
          attachments: [],
          comments: [
            {
              id: '1',
              user: '4',
              userName: 'Sarah Employee',
              comment: 'Started quality checks on batch #1234',
              createdAt: new Date().toISOString()
            }
          ],
          createdBy: '3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    saveDB();
    console.log(`✅ NoSQL Database Connected: ${dbPath}`);
  } catch (error) {
    console.error(`❌ Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

const saveDB = () => {
  if (db && dbPath) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return { data: db, write: saveDB };
};

module.exports = { connectDB, getDB }; 