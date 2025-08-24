import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [newTaskData, setNewTaskData] = useState({ title: '', description: '', priority: 'medium', deadline: '', assignedTo: '', machine: '' });
  const [newMachineData, setNewMachineData] = useState({ name: '', model: '', serialNumber: '', location: '', manufacturer: '', department: '' });


    useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        switch (activeTab) {
          case 'dashboard':
            response = await api.get(`/analytics/dashboard?period=${activeFilter}`);
            setDashboardStats(response.data.data);
            break;
          case 'users':
            response = await api.get('/users');
            setUsers(response.data.data);
            break;
          case 'tasks':
            response = await api.get('/tasks');
            setTasks(response.data.data);
            break;
          case 'machines':
            response = await api.get('/machines');
            setMachines(response.data.data);
            break;
          default:
            break;
        }
      } catch (err) {
        setError(`Failed to fetch ${activeTab} data.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, activeFilter]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersResponse, machinesResponse] = await Promise.all([
          api.get('/users'),
          api.get('/machines')
        ]);
        setUsers(usersResponse.data.data);
        setMachines(machinesResponse.data.data);
      } catch (err) {
        setError('Failed to fetch initial data.');
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setShowModal(true);
    if (item) {
      if (type === 'task') setSelectedTask(item);
      else if (type === 'machine') setSelectedMachine(item);
      else if (type === 'user') setSelectedUser(item);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setSelectedMachine(null);
    setSelectedUser(null);
    setError('');
  };

  const handleCreateTask = async () => {
    try {
      const response = await api.post('/tasks', { ...newTaskData, createdBy: currentUser.id });
      setTasks([...tasks, response.data.data]);
      closeModal();
    } catch (err) {
      setError('Failed to create task.');
      console.error(err);
    }
  };

  const handleCreateMachine = async () => {
    try {
      const response = await api.post('/machines', newMachineData);
      setMachines([...machines, response.data.data]);
      closeModal();
    } catch (err) {
      setError('Failed to create machine.');
      console.error(err);
    }
  };

  const renderDashboardContent = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <div className="user-info">
          <h1>Welcome back, {currentUser?.name || 'Admin'}! 👋</h1>
        </div>
        <div className="header-actions">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
              onClick={() => handleFilterChange('week')}
            >
              This Week
            </button>
            <button
              className={`filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
              onClick={() => handleFilterChange('month')}
            >
              This Month
            </button>
            <button
              className={`filter-btn ${activeFilter === 'year' ? 'active' : ''}`}
              onClick={() => handleFilterChange('year')}
            >
              This Year
            </button>
          </div>
          <button className="setup-button" onClick={() => openModal('setup')}>
            <svg className="setup-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.286c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.286-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.286c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Quick Setup
          </button>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Total Tasks</h3>
          <div className="widget-content">
                        <div className="main-number">{dashboardStats?.totalTasks || 0}</div>
            <div className="period">Tasks in {activeFilter}</div>
            <div className="sub-categories">
              <div className="sub-category">High Priority: 23</div>
              <div className="sub-category">Medium Priority: 67</div>
              <div className="sub-category">Low Priority: 66</div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>Completed Tasks</h3>
          <div className="widget-content">
                        <div className="main-number">{dashboardStats?.completedTasks || 0}</div>
            <div className="period">Completed in {activeFilter}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                                style={{ width: `${(dashboardStats?.completedTasks / dashboardStats?.totalTasks) * 100 || 0}%` }}
              ></div>
            </div>
            <div className="sub-categories">
              <div className="sub-category">On Time: 89%</div>
              <div className="sub-category">Delayed: 11%</div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>Active Users</h3>
          <div className="widget-content">
                        <div className="main-number">{dashboardStats?.activeUsers || 0}</div>
            <div className="period">Currently Online</div>
            <div className="sub-categories">
              <div className="sub-category">Managers: 12</div>
              <div className="sub-category">Employees: 77</div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>Machine Uptime</h3>
          <div className="widget-content">
                        <div className="main-number">{dashboardStats?.machineUptime || 0}%</div>
            <div className="period">Average Uptime</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                                style={{ width: `${dashboardStats?.machineUptime || 0}%` }}
              ></div>
            </div>
            <div className="sub-categories">
              <div className="sub-category">Operational: 18</div>
              <div className="sub-category">Maintenance: 2</div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Employee Performance</h3>
            <div className="employee-progress">
              <div className="employee-item">
                <div className="employee-info">
                  <span className="employee-name">John Smith</span>
                  <span className="task-count">15 tasks</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div className="employee-item">
                <div className="employee-info">
                  <span className="employee-name">Sarah Johnson</span>
                  <span className="task-count">12 tasks</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="employee-item">
                <div className="employee-info">
                  <span className="employee-name">Mike Davis</span>
                  <span className="task-count">18 tasks</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Timeline Statistics</h3>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Tasks Started Today</span>
                <span className="stat-value">23</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tasks Due Today</span>
                <span className="stat-value">18</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Overdue Tasks</span>
                <span className="stat-value">5</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed Today</span>
                <span className="stat-value">31</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Machine Status</h3>
            <div className="machine-stats">
              <div className="machine-item">
                <span className="machine-name">Production Line A</span>
                <span className="machine-status operational">Operational</span>
              </div>
              <div className="machine-item">
                <span className="machine-name">Assembly Unit B</span>
                <span className="machine-status operational">Operational</span>
              </div>
              <div className="machine-item">
                <span className="machine-name">Packaging Station</span>
                <span className="machine-status maintenance">Maintenance</span>
              </div>
              <div className="machine-item">
                <span className="machine-name">Quality Control</span>
                <span className="machine-status operational">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagementContent = () => (
    <div className="user-management-content">
      <div className="content-header">
        <div className="user-info">
          <h1>User Management 👥</h1>
        </div>
        <div className="header-actions">
          <button className="setup-button" onClick={() => openModal('newUser')}>
            <svg className="setup-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div>Name</div>
          <div>Role</div>
          <div>Email</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {loading ? <div>Loading users...</div> : users.map(user => (
          <div className="table-row" key={user.id}>
            <div className="table-cell">{user.name}</div>
            <div className="table-cell">{user.role}</div>
            <div className="table-cell">{user.email}</div>
            <div className="table-cell">
              <span className={`status-badge ${user.status === 'active' ? 'active' : ''}`}>{user.status}</span>
            </div>
            <div className="table-cell">
              <div className="action-buttons">
                <button className="action-btn primary small" onClick={() => openModal('user', user)}>
                  View
                </button>
                <button className="action-btn secondary small">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskManagementContent = () => (
    <div className="task-management-content">
      <div className="content-header">
        <div className="user-info">
          <h1>Task Management 📋</h1>
        </div>
        <div className="header-actions">
          <button className="setup-button" onClick={() => openModal('newTask')}>
            <svg className="setup-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Task
          </button>
        </div>
      </div>

      <div className="tasks-grid">
        {loading ? <div>Loading tasks...</div> : tasks.map(task => (
          <div className="task-card" key={task.id}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <div className="task-header-right">
                <select className="status-select" defaultValue={task.status}>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
                <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority}</span>
              </div>
            </div>
            <div className="task-details">
              <div className="task-info">
                <div><strong>Assigned to:</strong> {task.assignedUser?.name || 'N/A'}</div>
                <div><strong>Machine:</strong> {task.machineDetails?.name || 'N/A'}</div>
                <div><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</div>
              </div>
              <div className="task-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
                </div>
              </div>
            </div>
            <div className="task-actions">
              <button className="action-btn primary" onClick={() => openModal('task', task)}>
                View Details
              </button>
              <button className="action-btn secondary">
                Edit Task
              </button>
              <button className="action-btn danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMachineManagementContent = () => (
    <div className="machine-management-content">
      <div className="content-header">
        <div className="user-info">
          <h1>Machine Management ⚙️</h1>
        </div>
        <div className="header-actions">
          <button className="setup-button" onClick={() => openModal('newMachine')}>
            <svg className="setup-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Machine
          </button>
        </div>
      </div>

      <div className="machines-grid">
        {loading ? <div>Loading machines...</div> : machines.map(machine => (
          <div className="machine-card" key={machine.id}>
            <div className="machine-header">
              <h3>{machine.name}</h3>
              <div className="machine-header-right">
                <select className="status-select" defaultValue={machine.status}>
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div className="machine-details">
              <div><strong>Location:</strong> {machine.location}</div>
              <div><strong>Last Maintenance:</strong> {new Date(machine.lastMaintenance).toLocaleDateString()}</div>
              <div><strong>Next Maintenance:</strong> {new Date(machine.nextMaintenance).toLocaleDateString()}</div>
              <div><strong>Uptime:</strong> {machine.uptime}%</div>
            </div>
            <div className="machine-actions">
              <button className="action-btn primary" onClick={() => openModal('machine', machine)}>
                View Details
              </button>
              <button className="action-btn secondary">
                Edit Machine
              </button>
              <button className="action-btn warning">
                Schedule Maintenance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'task':
          return (
            <div className="task-details-modal">
              <h2>Task Details: {selectedTask?.name}</h2>
              <div className="task-detail-item">
                <strong>Status:</strong> In Progress
              </div>
              <div className="task-detail-item">
                <strong>Priority:</strong> <span className="priority-badge urgent">Urgent</span>
              </div>
              <div className="task-detail-item">
                <strong>Assigned Employees:</strong>
                <span className="employee-tag">John Smith</span>
                <span className="employee-tag">Mike Davis</span>
              </div>
              <div className="task-detail-item">
                <strong>Machine:</strong> Production Line A
              </div>
              <div className="task-detail-item">
                <strong>Deadline:</strong> 2024-01-15
              </div>
              <div className="task-detail-item">
                <strong>Progress:</strong> 75%
              </div>
              <div className="task-detail-item">
                <strong>Description:</strong> Perform routine maintenance on production line A to ensure optimal performance and prevent breakdowns.
              </div>
            </div>
          );

        case 'machine':
          return (
            <div className="machine-details-modal">
              <h2>Machine Details: {selectedMachine?.name}</h2>
              <div className="machine-detail-item">
                <strong>Status:</strong> Operational
              </div>
              <div className="machine-detail-item">
                <strong>Location:</strong> Building A, Floor 1
              </div>
              <div className="machine-detail-item">
                <strong>Last Maintenance:</strong> 2024-01-05
              </div>
              <div className="machine-detail-item">
                <strong>Next Maintenance:</strong> 2024-02-05
              </div>
              <div className="machine-detail-item">
                <strong>Uptime:</strong> 96.8%
              </div>
              <div className="machine-detail-item">
                <strong>Maintenance History:</strong>
                <button className="action-btn secondary small" onClick={() => openModal('maintenanceLog')}>
                  View Logs
                </button>
              </div>
            </div>
          );

        case 'user':
          return (
            <div className="user-details-modal">
              <h2>User Details: {selectedUser?.name}</h2>
              <div className="user-detail-item">
                <strong>Role:</strong> Manager
              </div>
              <div className="user-detail-item">
                <strong>Email:</strong> john.smith@company.com
              </div>
              <div className="user-detail-item">
                <strong>Status:</strong> Active
              </div>
              <div className="user-detail-item">
                <strong>Last Login:</strong> 2024-01-12 14:30
              </div>
              <div className="user-detail-item">
                <strong>Tasks Completed:</strong> 156
              </div>
            </div>
          );

        case 'newMachine':
          return (
            <div className="new-machine-modal">
              <h2>Add New Machine</h2>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={newMachineData.name} onChange={(e) => setNewMachineData({ ...newMachineData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" value={newMachineData.model} onChange={(e) => setNewMachineData({ ...newMachineData, model: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Serial Number</label>
                <input type="text" value={newMachineData.serialNumber} onChange={(e) => setNewMachineData({ ...newMachineData, serialNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={newMachineData.location} onChange={(e) => setNewMachineData({ ...newMachineData, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input type="text" value={newMachineData.manufacturer} onChange={(e) => setNewMachineData({ ...newMachineData, manufacturer: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={newMachineData.department} onChange={(e) => setNewMachineData({ ...newMachineData, department: e.target.value })} />
              </div>
            </div>
          );

        case 'newTask':
          return (
            <div className="new-task-modal">
              <h2>Create New Task</h2>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={newTaskData.title} onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newTaskData.description} onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}></textarea>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={newTaskData.priority} onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={newTaskData.deadline} onChange={(e) => setNewTaskData({ ...newTaskData, deadline: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={newTaskData.assignedTo} onChange={(e) => setNewTaskData({ ...newTaskData, assignedTo: e.target.value })}>
                  <option value="">Select User</option>
                  {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Machine</label>
                <select value={newTaskData.machine} onChange={(e) => setNewTaskData({ ...newTaskData, machine: e.target.value })}>
                  <option value="">Select Machine</option>
                  {machines.map(machine => <option key={machine.id} value={machine.id}>{machine.name}</option>)}
                </select>
              </div>
            </div>
          );

        case 'maintenanceLog':
          return (
            <div className="maintenance-log-modal">
              <h2>Maintenance Log</h2>
              <h3>Production Line A</h3>
              
              <div className="log-header">
                <div>Date</div>
                <div>Type</div>
                <div>Description</div>
                <div>Technician</div>
                <div>Duration</div>
                <div>Cost</div>
              </div>
              
              <div className="log-row">
                <div className="log-cell">2024-01-05</div>
                <div className="log-cell">Routine</div>
                <div className="log-cell">Regular maintenance check</div>
                <div className="log-cell">Mike Davis</div>
                <div className="log-cell">2 hours</div>
                <div className="log-cell">$150</div>
              </div>
              
              <div className="log-row">
                <div className="log-cell">2023-12-20</div>
                <div className="log-cell">Repair</div>
                <div className="log-cell">Belt replacement</div>
                <div className="log-cell">John Smith</div>
                <div className="log-cell">4 hours</div>
                <div className="log-cell">$300</div>
              </div>
              
              <div className="add-log-section">
                <h4>Add New Log Entry</h4>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select>
                    <option>Routine</option>
                    <option>Repair</option>
                    <option>Inspection</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Describe the maintenance work..."></textarea>
                </div>
                <div className="form-group">
                  <label>Technician</label>
                  <select>
                    <option>John Smith</option>
                    <option>Mike Davis</option>
                    <option>Sarah Johnson</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (hours)</label>
                  <input type="number" min="0" step="0.5" />
                </div>
                <div className="form-group">
                  <label>Cost ($)</label>
                  <input type="number" min="0" step="0.01" />
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div>
              <h2>Quick Setup</h2>
              <p>Configure your dashboard settings here.</p>
            </div>
          );
      }
    };

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{modalType === 'task' ? 'Task Details' : 
                 modalType === 'machine' ? 'Machine Details' : 
                 modalType === 'user' ? 'User Details' : 
                 modalType === 'maintenanceLog' ? 'Maintenance Log' : 'Quick Setup'}</h2>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {renderModalContent()}
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button className="action-btn secondary" onClick={closeModal}>
                Cancel
              </button>
              {(modalType === 'newTask' || modalType === 'newMachine' || (modalType !== 'task' && modalType !== 'machine' && modalType !== 'user' && modalType !== 'maintenanceLog')) && (
                <button className="action-btn primary" onClick={modalType === 'newTask' ? handleCreateTask : modalType === 'newMachine' ? handleCreateMachine : () => closeModal()}>
                  Save
                </button>
              )}
              {modalType !== 'task' && modalType !== 'machine' && modalType !== 'user' && modalType !== 'maintenanceLog' && modalType !== 'newTask' && modalType !== 'newMachine' && (
                <button className="action-btn primary" onClick={() => closeModal()}>
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'users':
        return renderUserManagementContent();
      case 'tasks':
        return renderTaskManagementContent();
      case 'machines':
        return renderMachineManagementContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="admin-dashboard">
      {renderContent()}
      {renderModal()}
    </div>
  );
};

export default AdminDashboard;
