import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee'
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    machine: '',
    deadline: '',
    priority: 'Medium'
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Sample data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Manager', role: 'Manager', email: 'john@company.com', status: 'Active', password: 'hashedpassword123' },
    { id: 2, name: 'Sarah Employee', role: 'Employee', email: 'sarah@company.com', status: 'Active', password: 'hashedpassword456' },
    { id: 3, name: 'Mike Worker', role: 'Employee', email: 'mike@company.com', status: 'Active', password: 'hashedpassword789' },
    { id: 4, name: 'Admin User', role: 'Admin', email: 'admin@company.com', status: 'Active', password: 'hashedpasswordadmin' },
    { id: 5, name: 'Sub Admin User', role: 'Sub Admin', email: 'subadmin@company.com', status: 'Active', password: 'hashedpasswordsub' }
  ]);

  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Production Line Setup', 
      assignedTo: 'John Manager', 
      employees: ['Sarah Employee', 'Mike Worker'],
      deadline: '2024-02-15',
      priority: 'High',
      machine: 'Machine A',
      status: 'In Progress',
      progress: 75
    },
    { 
      id: 2, 
      title: 'Quality Check', 
      assignedTo: 'John Manager', 
      employees: ['Sarah Employee'],
      deadline: '2024-02-10',
      priority: 'Medium',
      machine: 'Machine B',
      status: 'Completed',
      progress: 100
    }
  ]);

  const [machines, setMachines] = useState([
    { id: 1, name: 'Machine A', status: 'Operational', location: 'Production Floor 1' },
    { id: 2, name: 'Machine B', status: 'Maintenance', location: 'Production Floor 2' },
    { id: 3, name: 'Machine C', status: 'Operational', location: 'Production Floor 1' }
  ]);

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch data from backend
  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchMachines();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Admin sees all tasks
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMachines(data.data);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    // Reset form when opening add user modal
    if (type === 'addUser') {
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Employee'
      });
      setFormErrors({});
    }
    // Reset form when opening add task modal
    if (type === 'addTask') {
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        machine: '',
        deadline: '',
        priority: 'Medium'
      });
      setFormErrors({});
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormErrors({});
  };

  const validateUserForm = () => {
    const errors = {};
    
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!newUser.role) {
      errors.role = 'Role is required';
    }
    
    return errors;
  };

  const validateTaskForm = () => {
    const errors = {};
    
    if (!newTask.title.trim()) {
      errors.title = 'Task title is required';
    }
    
    if (!newTask.description.trim()) {
      errors.description = 'Task description is required';
    }
    
    if (!newTask.assignedTo) {
      errors.assignedTo = 'Please assign to an employee';
    }
    
    if (!newTask.deadline) {
      errors.deadline = 'Deadline is required';
    }
    
    return errors;
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddUser = async () => {
    const errors = validateUserForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => [...prev, data.data]);
        closeModal();
        alert(`User ${newUser.name} created successfully as ${newUser.role}!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    const errors = validateTaskForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          assignedTo: newTask.assignedTo,
          machine: newTask.machine,
          deadline: newTask.deadline,
          priority: newTask.priority
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => [...prev, data.data]);
        closeModal();
        alert(`Task "${newTask.title}" created successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleResetPassword = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newPassword = Math.random().toString(36).slice(-8); // Generate random password
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, password: newPassword } : u
      ));
      alert(`Password reset for ${user.name}. New password: ${newPassword}`);
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <div className="user-info">
          <h1>{currentUser?.name || 'User'}</h1>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => handleFilterChange('today')}
          >
            Today
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'yesterday' ? 'active' : ''}`}
            onClick={() => handleFilterChange('yesterday')}
          >
            Yesterday
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
            onClick={() => handleFilterChange('week')}
          >
            Week
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
            onClick={() => handleFilterChange('month')}
          >
            Month
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'time' ? 'active' : ''}`}
            onClick={() => handleFilterChange('time')}
          >
            Time
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'select-user' ? 'active' : ''}`}
            onClick={() => handleFilterChange('select-user')}
          >
            Select user
          </button>
        </div>
        
        <div className="setup-button">
          <svg className="setup-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
          Setup
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>ACTIVE TASKS</h3>
          <div className="widget-content">
            <div className="main-number">{tasks.filter(t => t.status !== 'Completed').length}</div>
            <div className="period">this week</div>
            <div className="sub-categories">
              <div className="sub-category">
                <span>In Progress ({tasks.filter(t => t.status === 'In Progress').length})</span>
              </div>
              <div className="sub-category">
                <span>Pending ({tasks.filter(t => t.status === 'Pending').length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>TASK COMPLETION RATE</h3>
          <div className="widget-content">
            <div className="main-number">85%</div>
            <div className="period">this month</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '85%'}}></div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>ACTIVE USERS</h3>
          <div className="widget-content">
            <div className="main-number">{users.length}</div>
            <div className="period">total users</div>
            <div className="sub-categories">
              <div className="sub-category">
                <span>Managers ({users.filter(u => u.role === 'Manager').length})</span>
              </div>
              <div className="sub-category">
                <span>Employees ({users.filter(u => u.role === 'Employee').length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>MACHINE UTILIZATION</h3>
          <div className="widget-content">
            <div className="main-number">{machines.filter(m => m.status === 'Operational').length}</div>
            <div className="period">operational machines</div>
            <div className="sub-categories">
              <div className="sub-category">
                <span>Total Machines ({machines.length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <h3>AVERAGE TASK DURATION</h3>
          <div className="widget-content">
            <div className="main-number">3.2</div>
            <div className="period">days average</div>
          </div>
        </div>

        <div className="widget">
          <h3>HIGH PRIORITY TASKS</h3>
          <div className="widget-content">
            <div className="main-number">{tasks.filter(t => t.priority === 'High').length}</div>
            <div className="period">pending high priority</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-content">
      <div className="content-header">
        <h1>Analytics & Reporting</h1>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => openModal('report')}>
            Generate Report
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Task Progress by Employee</h3>
          <div className="employee-progress">
            {users.filter(u => u.role === 'Employee').map(user => (
              <div key={user.id} className="employee-item">
                <div className="employee-info">
                  <span className="employee-name">{user.name}</span>
                  <span className="task-count">
                    {tasks.filter(t => t.employees.includes(user.name)).length} tasks
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '70%'}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Task Timeline Analysis</h3>
          <div className="timeline-stats">
            <div className="stat-item">
              <span className="stat-label">On Time</span>
              <span className="stat-value">75%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Delayed</span>
              <span className="stat-value">15%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Early</span>
              <span className="stat-value">10%</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Machine Performance</h3>
          <div className="machine-stats">
            {machines.map(machine => (
              <div key={machine.id} className="machine-item">
                <span className="machine-name">{machine.name}</span>
                <span className={`machine-status ${machine.status.toLowerCase()}`}>
                  {machine.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="user-management-content">
      <div className="content-header">
        <h1>User Management</h1>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => openModal('addUser')}>
            Add New User
          </button>
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="table-cell">Name</div>
          <div className="table-cell">Role</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>
        {users.map(user => (
          <div key={user.id} className="table-row">
            <div className="table-cell">{user.name}</div>
            <div className="table-cell">
              <span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>
                {user.role}
              </span>
            </div>
            <div className="table-cell">{user.email}</div>
            <div className="table-cell">
              <span className={`status-badge ${user.status.toLowerCase()}`}>
                {user.status}
              </span>
            </div>
            <div className="table-cell">
              <button className="action-btn small">Edit</button>
              <button 
                className="action-btn small warning" 
                onClick={() => handleResetPassword(user.id)}
              >
                Reset Password
              </button>
              <button 
                className="action-btn small danger" 
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskManagement = () => (
    <div className="task-management-content">
      <div className="content-header">
        <h1>Task Management</h1>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => openModal('addTask')}>
            Create New Task
          </button>
        </div>
      </div>

      <div className="tasks-grid">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
            <div className="task-details">
              <div className="task-info">
                <span><strong>Assigned to:</strong> {task.assignedTo ? (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name) : 'Not assigned'}</span>
                <span><strong>Machine:</strong> {task.machine ? (typeof task.machine === 'string' ? task.machine : task.machine.name) : 'Not assigned'}</span>
                <span><strong>Deadline:</strong> {task.deadline}</span>
              </div>
              <div className="task-employees">
                <strong>Employees:</strong>
                {task.employees.map(emp => (
                  <span key={emp} className="employee-tag">{emp}</span>
                ))}
              </div>
              <div className="task-progress">
                <span>Progress: {task.progress}%</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${task.progress}%`}}></div>
                </div>
              </div>
            </div>
            <div className="task-actions">
              <button className="action-btn small">Edit</button>
              <button className="action-btn small">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMachineManagement = () => (
    <div className="machine-management-content">
      <div className="content-header">
        <h1>Machine Management</h1>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => openModal('addMachine')}>
            Add New Machine
          </button>
        </div>
      </div>

      <div className="machines-grid">
        {machines.map(machine => (
          <div key={machine.id} className="machine-card">
            <div className="machine-header">
              <h3>{machine.name}</h3>
              <span className={`status-badge ${machine.status.toLowerCase()}`}>
                {machine.status}
              </span>
            </div>
            <div className="machine-details">
              <span><strong>Location:</strong> {machine.location}</span>
              <span><strong>Last Maintenance:</strong> 2024-01-15</span>
              <span><strong>Next Maintenance:</strong> 2024-02-15</span>
            </div>
            <div className="machine-actions">
              <button className="action-btn small">Edit</button>
              <button className="action-btn small">Maintenance Log</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {modalType === 'addUser' && 'Add New User'}
              {modalType === 'addTask' && 'Create New Task'}
              {modalType === 'addMachine' && 'Add New Machine'}
              {modalType === 'report' && 'Generate Report'}
            </h2>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {modalType === 'addUser' && (
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newUser.name} 
                  onChange={handleUserInputChange}
                  placeholder="Enter full name"
                />
                {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={newUser.email} 
                  onChange={handleUserInputChange}
                  placeholder="Enter email address"
                />
                {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={newUser.password} 
                  onChange={handleUserInputChange}
                  placeholder="Enter password (min 6 characters)"
                />
                {formErrors.password && <p className="error-message">{formErrors.password}</p>}
                
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={newUser.confirmPassword} 
                  onChange={handleUserInputChange}
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && <p className="error-message">{formErrors.confirmPassword}</p>}
                
                <label>User Role</label>
                <select name="role" value={newUser.role} onChange={handleUserInputChange}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Sub Admin">Sub Admin</option>
                  <option value="Admin">Admin</option>
                </select>
                {formErrors.role && <p className="error-message">{formErrors.role}</p>}
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleAddUser}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'addTask' && (
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={newTask.title}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task title" 
                />
                {formErrors.title && <p className="error-message">{formErrors.title}</p>}
                
                <label>Task Description</label>
                <textarea 
                  name="description"
                  value={newTask.description}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
                {formErrors.description && <p className="error-message">{formErrors.description}</p>}
                
                <label>Assign to Employee</label>
                <select 
                  name="assignedTo"
                  value={newTask.assignedTo}
                  onChange={handleTaskInputChange}
                >
                  <option value="">Select an employee</option>
                  {users.filter(u => u.role === 'Employee').map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
                {formErrors.assignedTo && <p className="error-message">{formErrors.assignedTo}</p>}
                
                <label>Machine</label>
                <select 
                  name="machine"
                  value={newTask.machine}
                  onChange={handleTaskInputChange}
                >
                  <option value="">Select a machine (optional)</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.name}>{machine.name}</option>
                  ))}
                </select>
                
                <label>Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  value={newTask.deadline}
                  onChange={handleTaskInputChange}
                />
                {formErrors.deadline && <p className="error-message">{formErrors.deadline}</p>}
                
                <label>Priority</label>
                <select 
                  name="priority"
                  value={newTask.priority}
                  onChange={handleTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleAddTask}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'addMachine' && (
              <div className="form-group">
                <label>Machine Name</label>
                <input type="text" placeholder="Enter machine name" />
                <label>Location</label>
                <input type="text" placeholder="Enter location" />
                <label>Status</label>
                <select>
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                <button className="action-btn primary">Add Machine</button>
              </div>
            )}
            {modalType === 'report' && (
              <div className="form-group">
                <label>Report Type</label>
                <select>
                  <option value="task">Task Progress Report</option>
                  <option value="user">User Performance Report</option>
                  <option value="machine">Machine Utilization Report</option>
                </select>
                <label>Date Range</label>
                <select>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <button className="action-btn primary">Generate Report</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'tasks' && renderTaskManagement()}
        {activeTab === 'machines' && renderMachineManagement()}
      </div>
      {renderModal()}
    </>
  );
};

export default AdminDashboard;
