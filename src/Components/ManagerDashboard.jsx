import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ManagerDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const ManagerDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reassignData, setReassignData] = useState({
    newEmployee: '',
    notes: ''
  });
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    employee: '',
    machine: '',
    deadline: '',
    priority: 'Medium',
    description: ''
  });
  const [editMachineData, setEditMachineData] = useState({
    name: '',
    location: '',
    status: 'Operational'
  });
  const [maintenanceLogData, setMaintenanceLogData] = useState({
    type: 'Routine',
    description: '',
    technician: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newMachineData, setNewMachineData] = useState({
    name: '',
    location: '',
    status: 'Operational'
  });
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [stats, setStats] = useState({ tasks: 0, employees: 0, machines: 0, pending: 0 });
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState({
    stats: false,
    tasks: false,
    employees: false,
    machines: false,
    action: false
  });
  const [error, setError] = useState({
    stats: null,
    tasks: null,
    employees: null,
    machines: null
  });

  const fetchStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setError(prev => ({ ...prev, stats: null }));
    try {
      const response = await api.get(`/analytics/stats?period=${activeFilter}`);
      setStats(response.data.data);
    } catch (err) {
      setError(prev => ({ ...prev, stats: 'Failed to fetch stats.' }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [activeFilter]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
    if (activeTab === 'taskManagement') {
      fetchTasks();
    }
    if (activeTab === 'teamCoordination') {
      fetchEmployees();
    }
    if (activeTab === 'machineManagement') {
      fetchMachines();
    }
  }, [activeTab, activeFilter, fetchStats]);

  const fetchTasks = async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    setError(prev => ({ ...prev, tasks: null }));
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (err) {
      setError(prev => ({ ...prev, tasks: 'Failed to fetch tasks.' }));
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const fetchEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    setError(prev => ({ ...prev, employees: null }));
    try {
      const response = await api.get('/users'); // Assuming this fetches all users
      setEmployees(response.data.data.filter(user => user.role === 'Employee'));
    } catch (err) {
      setError(prev => ({ ...prev, employees: 'Failed to fetch employees.' }));
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const fetchMachines = async () => {
    setLoading(prev => ({ ...prev, machines: true }));
    setError(prev => ({ ...prev, machines: null }));
    try {
      const response = await api.get('/machines');
      setMachines(response.data.data);
    } catch (err) {
      setError(prev => ({ ...prev, machines: 'Failed to fetch machines.' }));
    } finally {
      setLoading(prev => ({ ...prev, machines: false }));
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = (type, task = null, employee = null, machine = null) => {
    setModalType(type);
    setShowModal(true);
    if (task) {
      setSelectedTask(task);
    }
    if (employee) {
      setSelectedEmployee(employee);
    }
    if (machine) {
      setSelectedMachine(machine);
      if (type === 'editMachine') {
        setEditMachineData({
          name: machine.name,
          location: machine.location,
          status: machine.status
        });
      }
      if (type === 'maintenanceLog') {
        fetchMaintenanceLogs(machine._id);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTask(null);
    setSelectedEmployee(null);
    setSelectedMachine(null);
    setReassignData({ newEmployee: '', notes: '' });
    setNewTaskData({
      title: '',
      employee: '',
      machine: '',
      deadline: '',
      priority: 'Medium',
      description: ''
    });
    setEditMachineData({
      name: '',
      location: '',
      status: 'Operational'
    });
    setMaintenanceLogData({
      type: 'Routine',
      description: '',
      technician: '',
      date: new Date().toISOString().split('T')[0]
    });
    setNewMachineData({
      name: '',
      location: '',
      status: 'Operational'
    });
  };

  const handleApproveTask = async (taskId) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.put(`/tasks/${taskId}`, { status: 'Completed' });
      fetchTasks();
    } catch (error) {
      alert('Error approving task.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleReassignTask = async () => {
    if (!selectedTask || !reassignData.newEmployee) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.put(`/tasks/${selectedTask._id}`, {
        assignedTo: reassignData.newEmployee,
        notes: reassignData.notes
      });
      fetchTasks();
      closeModal();
    } catch (error) {
      alert('Error reassigning task.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleReassignInputChange = (e) => {
    const { name, value } = e.target;
    setReassignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignTask = async () => {
    if (!newTaskData.title || !newTaskData.employee) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.post('/tasks', {
        title: newTaskData.title,
        description: newTaskData.description,
        assignedTo: newTaskData.employee,
        machine: newTaskData.machine,
        deadline: newTaskData.deadline,
        priority: newTaskData.priority
      });
      fetchTasks();
      closeModal();
    } catch (error) {
      alert('Error creating task.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleUpdateMachine = async () => {
    if (!selectedMachine || !editMachineData.name || !editMachineData.location) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.put(`/machines/${selectedMachine._id}`, editMachineData);
      fetchMachines();
      closeModal();
      alert('Machine updated successfully!');
    } catch (error) {
      alert('Error updating machine.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleAddMaintenanceLog = async () => {
    if (!selectedMachine || !maintenanceLogData.description || !maintenanceLogData.technician) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.post(`/machines/${selectedMachine._id}/maintenance`, maintenanceLogData);
      closeModal();
      alert('Maintenance log added successfully!');
    } catch (error) {
      alert('Error adding maintenance log.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const fetchMaintenanceLogs = async (machineId) => {
    try {
      const response = await api.get(`/machines/${machineId}/maintenance`);
      setMaintenanceLogs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
    }
  };

  const handleAddMachine = async () => {
    if (!newMachineData.name || !newMachineData.location) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.post('/machines', newMachineData);
      fetchMachines();
      closeModal();
      alert('Machine added successfully!');
    } catch (error) {
      alert('Error adding machine.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleNewTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderDashboard = () => {
    // Prepare data for the bar chart
    const employeeNames = employees.map(e => e.name);
    const totalTasks = employees.map(e => e.totalTasks);
    const completedTasks = employees.map(e => e.tasksCompleted);

    const data = {
      labels: employeeNames,
      datasets: [
        {
          label: 'Total Tasks',
          data: totalTasks,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Completed Tasks',
          data: completedTasks,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#fff',
            font: { size: 14 }
          }
        },
        title: {
          display: true,
          text: 'Employee Task Distribution',
          color: '#fff',
          font: { size: 18 }
        },
      },
      scales: {
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      }
    };

    return (
      <div className="dashboard-content">
        <div className="content-header">
          <div className="user-info">
            <h1>{currentUser?.name || 'Manager'}</h1>
            <p className="role-indicator">Manager Dashboard</p>
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
              onClick={() => handleFilterChange('today')}
            >
              Today
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
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="dashboard-widgets">
          <div className="widget">
            <h3>ASSIGNED TASKS</h3>
            <div className="widget-content">
              {loading.stats ? <div className="loading-spinner"></div> : error.stats ? <div className="error-message">{error.stats}</div> : <>
                <div className="main-number">{stats.tasks}</div>
                <div className="period">total tasks</div>
              </>
              }
            </div>
          </div>

          <div className="widget">
            <h3>TEAM MEMBERS</h3>
            <div className="widget-content">
              {loading.stats ? <div className="loading-spinner"></div> : error.stats ? <div className="error-message">{error.stats}</div> : <>
                <div className="main-number">{stats.employees}</div>
                <div className="period">active employees</div>
              </>
              }
            </div>
          </div>

          <div className="widget">
            <h3>MACHINES</h3>
            <div className="widget-content">
              {loading.stats ? <div className="loading-spinner"></div> : error.stats ? <div className="error-message">{error.stats}</div> : <>
                <div className="main-number">{stats.machines}</div>
                <div className="period">operational</div>
              </>
              }
            </div>
          </div>

          <div className="widget">
            <h3>APPROVAL PENDING</h3>
            <div className="widget-content">
              {loading.stats ? <div className="loading-spinner"></div> : error.stats ? <div className="error-message">{error.stats}</div> : <>
                <div className="main-number">{stats.pending}</div>
                <div className="period">tasks need approval</div>
              </>
              }
            </div>
          </div>
        </div>

        {/* Employee Performance Bar Chart */}
        <div style={{ marginTop: '2rem', background: 'rgba(15,52,96,0.8)', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

  const renderTaskManagement = () => (
    <div className="task-management-content">
      <div className="content-header">
        <h1>Task Management</h1>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => openModal('addTask')}>
            Add New Task
          </button>
        </div>
      </div>

      <div className="tasks-grid">
        {loading.tasks ? <div className="loading-spinner"></div> : error.tasks ? <div className="error-message">{error.tasks}</div> : tasks.map(task => (
          <div key={task._id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
            <div className="task-details">
              <div className="task-info">
                <span><strong>Assigned to:</strong> {task.assignedTo ? (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name) : 'Not assigned'}</span>
                <span><strong>Assigned by:</strong> {task.assignedBy}</span>
                <span><strong>Machine:</strong> {task.machine ? (typeof task.machine === 'string' ? task.machine : task.machine.name) : 'Not assigned'}</span>
                <span><strong>Deadline:</strong> {task.deadline}</span>
                <span><strong>Status:</strong> {task.status}</span>
              </div>
              <div className="task-progress">
                <span>Progress: {task.progress}%</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${task.progress}%`}}></div>
                </div>
              </div>
              {task.notes && (
                <div className="task-notes">
                  <strong>Notes:</strong> {task.notes}
                </div>
              )}
            </div>
            <div className="task-actions">
              <button 
                className="action-btn small"
                onClick={() => openModal('viewTaskDetails', task)}
              >
                View Details
              </button>
              {task.status === 'Pending Approval' && (
                <button 
                  className="action-btn small success" 
                  onClick={() => handleApproveTask(task._id)}
                  disabled={loading.action}
                >
                  Approve
                </button>
              )}
              <button 
                className="action-btn small warning" 
                onClick={() => openModal('reassign', task)}
              >
                Reassign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeamCoordination = () => (
    <div className="team-coordination-content">
      <div className="content-header">
        <h1>Team Coordination</h1>
      </div>

      <div className="team-grid">
        {loading.employees ? <div className="loading-spinner"></div> : error.employees ? <div className="error-message">{error.employees}</div> : employees.map(employee => (
          <div key={employee._id} className="employee-card">
            <div className="employee-header">
              <h3>{employee.name}</h3>
              <span className={`status-badge ${employee.status.toLowerCase()}`}>
                {employee.status}
              </span>
            </div>
            <div className="employee-details">
              <div className="current-task">
                <strong>Current Task:</strong>
                {employee.currentTask ? (
                  <span className="task-name">{employee.currentTask}</span>
                ) : (
                  <span className="available">Available for new task</span>
                )}
              </div>
              <div className="employee-stats">
                <span>Tasks Completed: {employee.tasksCompleted}</span>
                <span>Efficiency: {employee.efficiency}%</span>
              </div>
            </div>
            <div className="employee-actions">
              <button 
                className="action-btn small" 
                onClick={() => openModal('viewProfile', null, employee)}
              >
                View Profile
              </button>
              <button 
                className="action-btn small primary" 
                onClick={() => openModal('assignTask', null, employee)}
              >
                Assign Task
              </button>
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
        {loading.machines ? <div className="loading-spinner"></div> : error.machines ? <div className="error-message">{error.machines}</div> : machines.map(machine => (
          <div key={machine._id} className="machine-card">
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
              <button className="action-btn small" onClick={() => openModal('editMachine', null, null, machine)}>Edit</button>
              <button className="action-btn small" onClick={() => openModal('maintenanceLog', null, null, machine)}>Maintenance Log</button>
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
              {modalType === 'addTask' && 'Add New Task'}
              {modalType === 'addMachine' && 'Add New Machine'}
              {modalType === 'reassign' && 'Reassign Task'}
              {modalType === 'viewProfile' && 'Employee Profile'}
              {modalType === 'assignTask' && 'Assign New Task'}
              {modalType === 'viewTaskDetails' && 'Task Details'}
              {modalType === 'editMachine' && 'Edit Machine'}
              {modalType === 'maintenanceLog' && 'Maintenance Log'}
            </h2>
            <button className="close-btn" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            {modalType === 'addTask' && (
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" placeholder="Enter task title" />
                <label>Assign to Employee</label>
                <select>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <label>Machine</label>
                <select>
                  {machines.map(machine => (
                    <option key={machine._id} value={machine._id}>{machine.name}</option>
                  ))}
                </select>
                <label>Deadline</label>
                <input type="date" />
                <label>Priority</label>
                <select>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary">Create Task</button>
                </div>
              </div>
            )}
            {modalType === 'addMachine' && (
              <div className="form-group">
                <label>Machine Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={newMachineData.name}
                  onChange={e => setNewMachineData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter machine name" 
                />
                <label>Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={newMachineData.location}
                  onChange={e => setNewMachineData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location" 
                />
                <label>Status</label>
                <select 
                  name="status"
                  value={newMachineData.status}
                  onChange={e => setNewMachineData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary" onClick={handleAddMachine} disabled={loading.action}>
                    {loading.action ? 'Adding...' : 'Add Machine'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'reassign' && selectedTask && (
              <div className="form-group">
                <label>Current Assignment</label>
                <input type="text" value={selectedTask.assignedTo ? (typeof selectedTask.assignedTo === 'string' ? selectedTask.assignedTo : selectedTask.assignedTo.name) : ''} disabled />
                <label>Reassign to</label>
                <select 
                  name="newEmployee" 
                  value={reassignData.newEmployee} 
                  onChange={handleReassignInputChange}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <label>Notes</label>
                <textarea 
                  name="notes" 
                  value={reassignData.notes} 
                  onChange={handleReassignInputChange}
                  placeholder="Add notes for reassignment"
                  rows="3"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary" onClick={handleReassignTask} disabled={loading.action}>{loading.action ? 'Reassigning...' : 'Reassign'}</button>
                </div>
              </div>
            )}
            {modalType === 'viewProfile' && selectedEmployee && (
              <div className="form-group">
                <label>Employee Name</label>
                <input type="text" value={selectedEmployee.name} disabled />
                <label>Status</label>
                <input type="text" value={selectedEmployee.status} disabled />
                <label>Current Task</label>
                <input type="text" value={selectedEmployee.currentTask || 'Available'} disabled />
                <label>Tasks Completed</label>
                <input type="text" value={`${selectedEmployee.tasksCompleted}/${selectedEmployee.totalTasks}`} disabled />
                <label>Efficiency</label>
                <input type="text" value={`${selectedEmployee.efficiency}%`} disabled />
                <label>Average Completion Time</label>
                <input type="text" value={selectedEmployee.averageCompletionTime} disabled />
                <label>Current Tasks</label>
                <input type="text" value={selectedEmployee.currentTasks} disabled />
                <label>Pending Tasks</label>
                <input type="text" value={selectedEmployee.pendingTasks} disabled />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
            {modalType === 'assignTask' && selectedEmployee && (
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={newTaskData.title}
                  onChange={handleNewTaskInputChange}
                  placeholder="Enter task title" 
                />
                <label>Assign to Employee</label>
                <select 
                  name="employee"
                  value={newTaskData.employee}
                  onChange={handleNewTaskInputChange}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <label>Machine</label>
                <select 
                  name="machine"
                  value={newTaskData.machine}
                  onChange={handleNewTaskInputChange}
                >
                  <option value="">Select machine</option>
                  {machines.map(machine => (
                    <option key={machine._id} value={machine._id}>{machine.name}</option>
                  ))}
                </select>
                <label>Deadline</label>
                <input 
                  type="date" 
                  name="deadline"
                  value={newTaskData.deadline}
                  onChange={handleNewTaskInputChange}
                />
                <label>Priority</label>
                <select 
                  name="priority"
                  value={newTaskData.priority}
                  onChange={handleNewTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <label>Description</label>
                <textarea 
                  name="description"
                  value={newTaskData.description}
                  onChange={handleNewTaskInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                  <button className="action-btn primary" onClick={handleAssignTask} disabled={loading.action}>{loading.action ? 'Assigning...' : 'Assign Task'}</button>
                </div>
              </div>
            )}
            {modalType === 'viewTaskDetails' && selectedTask && (
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" value={selectedTask.title} disabled />
                <label>Assigned To</label>
                <input type="text" value={selectedTask.assignedTo ? (typeof selectedTask.assignedTo === 'string' ? selectedTask.assignedTo : selectedTask.assignedTo.name) : ''} disabled />
                <label>Assigned By</label>
                <input type="text" value={selectedTask.assignedBy} disabled />
                <label>Machine</label>
                <input type="text" value={selectedTask.machine ? (typeof selectedTask.machine === 'string' ? selectedTask.machine : selectedTask.machine.name) : ''} disabled />
                <label>Deadline</label>
                <input type="text" value={selectedTask.deadline} disabled />
                <label>Priority</label>
                <input type="text" value={selectedTask.priority} disabled />
                <label>Status</label>
                <input type="text" value={selectedTask.status} disabled />
                <label>Progress</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="text" value={`${selectedTask.progress}%`} disabled style={{ flex: 1 }} />
                  <div className="progress-bar" style={{ width: '100px', height: '8px' }}>
                    <div className="progress-fill" style={{width: `${selectedTask.progress}%`}}></div>
                  </div>
                </div>
                <label>Notes</label>
                <textarea 
                  value={selectedTask.notes || 'No notes available'} 
                  disabled 
                  rows="4"
                  style={{ resize: 'none' }}
                />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                  {selectedTask.status === 'Pending Approval' && (
                    <button 
                      className="action-btn primary" 
                      onClick={() => {
                        handleApproveTask(selectedTask.id);
                        closeModal();
                      }}
                    >
                      Approve Task
                    </button>
                  )}
                </div>
              </div>
            )}
            {modalType === 'editMachine' && selectedMachine && (
              <div className="form-group">
                <label>Machine Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={editMachineData.name}
                  onChange={e => setEditMachineData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter machine name" 
                />
                <label>Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={editMachineData.location}
                  onChange={e => setEditMachineData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location" 
                />
                <label>Status</label>
                <select 
                  name="status"
                  value={editMachineData.status}
                  onChange={e => setEditMachineData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                                 <div className="modal-actions">
                   <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                   <button className="action-btn primary" onClick={handleUpdateMachine} disabled={loading}>
                     {loading ? 'Saving...' : 'Save Changes'}
                   </button>
                 </div>
              </div>
            )}
                         {modalType === 'maintenanceLog' && selectedMachine && (
               <div className="form-group">
                 <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Machine: {selectedMachine.name}</h3>
                 
                 {/* Existing Maintenance Logs */}
                 <div className="maintenance-history">
                   <h4>Maintenance History</h4>
                   {maintenanceLogs.length > 0 ? (
                     <div className="maintenance-logs-container">
                       {maintenanceLogs.map((log, index) => (
                         <div key={index} className="maintenance-log-item">
                           <div className="maintenance-log-header">
                             <span className="maintenance-log-type">{log.type}</span>
                             <span className="maintenance-log-date">{log.date}</span>
                           </div>
                           <div className="maintenance-log-description">{log.description}</div>
                           <div className="maintenance-log-technician">Technician: {log.technician}</div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="no-logs-message">
                       No maintenance logs found
                     </div>
                   )}
                 </div>

                 {/* Add New Maintenance Log */}
                 <div className="add-maintenance-section">
                   <h4>Add New Maintenance Log</h4>
                 <label>Type</label>
                 <select 
                   name="type"
                   value={maintenanceLogData.type}
                   onChange={e => setMaintenanceLogData(prev => ({ ...prev, type: e.target.value }))}
                 >
                   <option value="Routine">Routine</option>
                   <option value="Emergency">Emergency</option>
                   <option value="Preventive">Preventive</option>
                 </select>
                 <label>Description</label>
                 <textarea 
                   name="description"
                   value={maintenanceLogData.description}
                   onChange={e => setMaintenanceLogData(prev => ({ ...prev, description: e.target.value }))}
                   placeholder="Enter maintenance description"
                   rows="3"
                 />
                 <label>Technician</label>
                 <input 
                   type="text" 
                   name="technician"
                   value={maintenanceLogData.technician}
                   onChange={e => setMaintenanceLogData(prev => ({ ...prev, technician: e.target.value }))}
                   placeholder="Enter technician name" 
                 />
                 <label>Date</label>
                 <input 
                   type="date" 
                   name="date"
                   value={maintenanceLogData.date}
                   onChange={e => setMaintenanceLogData(prev => ({ ...prev, date: e.target.value }))}
                 />
                 <div className="modal-actions">
                   <button className="action-btn secondary" onClick={closeModal}>Cancel</button>
                   <button className="action-btn primary" onClick={handleAddMaintenanceLog} disabled={loading}>
                     {loading ? 'Adding...' : 'Add Log'}
                   </button>
                 </div>
               </div>
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
        {activeTab === 'tasks' && renderTaskManagement()}
        {activeTab === 'team' && renderTeamCoordination()}
        {activeTab === 'machines' && renderMachineManagement()}
      </div>
      {renderModal()}
    </>
  );
};

export default ManagerDashboard;
