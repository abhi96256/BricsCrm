import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout, activeTab, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editingMachine, setEditingMachine] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
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
    priority: 'Medium',
    status: 'Pending',
    progress: 0
  });
  const [newMachine, setNewMachine] = useState({
    name: '',
    location: '',
    status: 'Operational',
    description: '',
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceNotes: ''
  });
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    { id: 1, machineId: 1, date: '2024-01-15', type: 'Routine', description: 'Regular maintenance check', technician: 'John Tech', cost: 150 },
    { id: 2, machineId: 1, date: '2024-01-10', type: 'Repair', description: 'Fixed conveyor belt issue', technician: 'Mike Engineer', cost: 300 },
    { id: 3, machineId: 2, date: '2024-01-12', type: 'Routine', description: 'Calibration and testing', technician: 'Sarah QC', cost: 100 }
  ]);
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
        priority: 'Medium',
        status: 'Pending',
        progress: 0
      });
      setFormErrors({});
    }
    
    // Reset form when opening add machine modal
    if (type === 'addMachine') {
      setNewMachine({
        name: '',
        location: '',
        status: 'Operational',
        description: '',
        lastMaintenance: '',
        nextMaintenance: '',
        maintenanceNotes: ''
      });
      setFormErrors({});
    }
    
    // Reset form when opening edit user modal
    if (type === 'editUser') {
      setEditingUser({
        id: '',
        name: '',
        email: '',
        role: 'Employee',
        status: 'Active',
        password: '',
        confirmPassword: ''
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
    
    if (modalType === 'editUser') {
      setEditingUser(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: newRole
        })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const handleUserNameChange = async (userId, newName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newName
        })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, name: newName } : user
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user name:', error);
      alert('Error updating user name. Please try again.');
    }
  };

  const handleUserEmailChange = async (userId, newEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newEmail
        })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, email: newEmail } : user
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user email:', error);
      alert('Error updating user email. Please try again.');
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
          priority: newTask.priority,
          status: newTask.status,
          progress: newTask.progress
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

  const handleEditTask = (task) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo ? (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name) : '',
      machine: task.machine ? (typeof task.machine === 'string' ? task.machine : task.machine.name) : '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      progress: task.progress || 0
    });
    setModalType('editTask');
    setShowModal(true);
    setFormErrors({});
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
    setModalType('viewTask');
    setShowModal(true);
  };

  const handleUpdateTask = async () => {
    const errors = validateTaskForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          assignedTo: editingTask.assignedTo,
          machine: editingTask.machine,
          deadline: editingTask.deadline,
          priority: editingTask.priority,
          status: editingTask.status,
          progress: editingTask.progress
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? { ...task, ...editingTask } : task
        ));
        closeModal();
        alert(`Task "${editingTask.title}" updated successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setTasks(prev => prev.filter(task => task.id !== taskId));
          alert('Task deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status. Please try again.');
    }
  };

  const handleProgressChange = async (taskId, newProgress) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          progress: parseInt(newProgress)
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, progress: parseInt(newProgress) } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      alert('Error updating task progress. Please try again.');
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priority: newPriority
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, priority: newPriority } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task priority:', error);
      alert('Error updating task priority. Please try again.');
    }
  };

  const handleDeadlineChange = async (taskId, newDeadline) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deadline: newDeadline
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, deadline: newDeadline } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task deadline:', error);
      alert('Error updating task deadline. Please try again.');
    }
  };

  const handleMachineChange = async (taskId, newMachine) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          machine: newMachine
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, machine: newMachine } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task machine:', error);
      alert('Error updating task machine. Please try again.');
    }
  };

  const handleAssignedToChange = async (taskId, newAssignedTo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignedTo: newAssignedTo
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, assignedTo: newAssignedTo } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task assignment:', error);
      alert('Error updating task assignment. Please try again.');
    }
  };

  const handleEmployeeToggle = async (taskId, employeeName) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentEmployees = task.employees || [];
    let newEmployees;

    if (currentEmployees.includes(employeeName)) {
      // Remove employee
      newEmployees = currentEmployees.filter(emp => emp !== employeeName);
    } else {
      // Add employee
      newEmployees = [...currentEmployees, employeeName];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employees: newEmployees
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, employees: newEmployees } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task employees:', error);
      alert('Error updating task employees. Please try again.');
    }
  };

  const handleDescriptionChange = async (taskId, newDescription) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: newDescription
        })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, description: newDescription } : task
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating task description:', error);
      alert('Error updating task description. Please try again.');
    }
  };

  const handleEditMachine = (machine) => {
    setEditingMachine({
      id: machine.id,
      name: machine.name,
      location: machine.location,
      status: machine.status,
      description: machine.description || '',
      lastMaintenance: machine.lastMaintenance || '',
      nextMaintenance: machine.nextMaintenance || '',
      maintenanceNotes: machine.maintenanceNotes || ''
    });
    setModalType('editMachine');
    setShowModal(true);
    setFormErrors({});
  };

  const handleViewMachineDetails = (machine) => {
    setSelectedMachine(machine);
    setModalType('viewMachine');
    setShowModal(true);
  };

  const handleViewMaintenanceLog = (machine) => {
    setSelectedMachine(machine);
    setModalType('maintenanceLog');
    setShowModal(true);
  };

  const handleUpdateMachine = async () => {
    const errors = {};
    
    if (!editingMachine.name.trim()) {
      errors.name = 'Machine name is required';
    }
    
    if (!editingMachine.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${editingMachine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingMachine.name,
          location: editingMachine.location,
          status: editingMachine.status,
          description: editingMachine.description,
          lastMaintenance: editingMachine.lastMaintenance,
          nextMaintenance: editingMachine.nextMaintenance,
          maintenanceNotes: editingMachine.maintenanceNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(prev => prev.map(machine => 
          machine.id === editingMachine.id ? { ...machine, ...editingMachine } : machine
        ));
        closeModal();
        alert(`Machine "${editingMachine.name}" updated successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      alert('Error updating machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    const errors = {};
    
    if (!newMachine.name.trim()) {
      errors.name = 'Machine name is required';
    }
    
    if (!newMachine.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/machines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMachine.name,
          location: newMachine.location,
          status: newMachine.status,
          description: newMachine.description,
          lastMaintenance: newMachine.lastMaintenance,
          nextMaintenance: newMachine.nextMaintenance,
          maintenanceNotes: newMachine.maintenanceNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(prev => [...prev, data.data]);
        closeModal();
        alert(`Machine "${newMachine.name}" created successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating machine:', error);
      alert('Error creating machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (machineId) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setMachines(prev => prev.filter(machine => machine.id !== machineId));
          alert('Machine deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting machine:', error);
        alert('Error deleting machine. Please try again.');
      }
    }
  };

  const handleMachineInputChange = (e) => {
    const { name, value } = e.target;
    
    if (modalType === 'editMachine') {
      setEditingMachine(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewMachine(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMachineStatusChange = async (machineId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        setMachines(prev => prev.map(machine => 
          machine.id === machineId ? { ...machine, status: newStatus } : machine
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating machine status:', error);
      alert('Error updating machine status. Please try again.');
    }
  };

  const handleMachineLocationChange = async (machineId, newLocation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: newLocation
        })
      });

      if (response.ok) {
        setMachines(prev => prev.map(machine => 
          machine.id === machineId ? { ...machine, location: newLocation } : machine
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating machine location:', error);
      alert('Error updating machine location. Please try again.');
    }
  };

  const handleMaintenanceDateChange = async (machineId, field, newDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [field]: newDate
        })
      });

      if (response.ok) {
        setMachines(prev => prev.map(machine => 
          machine.id === machineId ? { ...machine, [field]: newDate } : machine
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating maintenance date:', error);
      alert('Error updating maintenance date. Please try again.');
    }
  };

  const handleAddMaintenanceLog = async (machineId, logData) => {
    try {
      const newLog = {
        id: Date.now(), // Simple ID generation
        machineId: machineId,
        date: logData.date,
        type: logData.type,
        description: logData.description,
        technician: logData.technician,
        cost: parseFloat(logData.cost)
      };

      // In a real app, you would send this to the backend
      setMaintenanceLogs(prev => [...prev, newLog]);
      
      // Update the machine's last maintenance date
      await handleMaintenanceDateChange(machineId, 'lastMaintenance', logData.date);
      
      alert('Maintenance log added successfully!');
    } catch (error) {
      console.error('Error adding maintenance log:', error);
      alert('Error adding maintenance log. Please try again.');
    }
  };

  const handleDeleteMaintenanceLog = (logId) => {
    if (window.confirm('Are you sure you want to delete this maintenance log?')) {
      setMaintenanceLogs(prev => prev.filter(log => log.id !== logId));
      alert('Maintenance log deleted successfully!');
    }
  };

  const handleMachineDescriptionChange = async (machineId, newDescription) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: newDescription
        })
      });

      if (response.ok) {
        setMachines(prev => prev.map(machine => 
          machine.id === machineId ? { ...machine, description: newDescription } : machine
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating machine description:', error);
      alert('Error updating machine description. Please try again.');
    }
  };

  const handleMaintenanceNotesChange = async (machineId, newNotes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maintenanceNotes: newNotes
        })
      });

      if (response.ok) {
        setMachines(prev => prev.map(machine => 
          machine.id === machineId ? { ...machine, maintenanceNotes: newNotes } : machine
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating maintenance notes:', error);
      alert('Error updating maintenance notes. Please try again.');
    }
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    
    if (modalType === 'editTask') {
      setEditingTask(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewTask(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };



  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: ''
    });
    setModalType('editUser');
    setShowModal(true);
    setFormErrors({});
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setModalType('viewUser');
    setShowModal(true);
  };

  const handleUpdateUser = async () => {
    const errors = {};
    
    if (!editingUser.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!editingUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editingUser.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (editingUser.password && editingUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (editingUser.password !== editingUser.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!editingUser.role) {
      errors.role = 'Role is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const updateData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      };

      // Only include password if it's being changed
      if (editingUser.password) {
        updateData.password = editingUser.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? { ...user, ...editingUser } : user
        ));
        closeModal();
        alert(`User "${editingUser.name}" updated successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(`Are you sure you want to reset the password for ${user.name}?`)) {
      try {
        const newPassword = Math.random().toString(36).slice(-8); // Generate random password
        
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: newPassword
          })
        });

        if (response.ok) {
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, password: newPassword } : u
          ));
          alert(`Password reset for ${user.name}. New password: ${newPassword}`);
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Error resetting password. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setUsers(prev => prev.filter(user => user.id !== userId));
          alert(`User ${user.name} deleted successfully!`);
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
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
            <div className="table-cell">
              <input 
                type="text"
                className="user-name-input"
                value={user.name}
                onChange={(e) => handleUserNameChange(user.id, e.target.value)}
                onBlur={(e) => {
                  if (!e.target.value.trim()) {
                    // Reset to original value if empty
                    e.target.value = user.name;
                  }
                }}
                title="Click to edit name"
              />
            </div>
            <div className="table-cell">
              <select 
                className={`role-badge role-select ${user.role.toLowerCase().replace(' ', '-')}`}
                value={user.role}
                onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Sub Admin">Sub Admin</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="table-cell">
              <input 
                type="email"
                className="user-email-input"
                value={user.email}
                onChange={(e) => handleUserEmailChange(user.id, e.target.value)}
                onBlur={(e) => {
                  if (!e.target.value.trim() || !/\S+@\S+\.\S+/.test(e.target.value)) {
                    // Reset to original value if empty or invalid email
                    e.target.value = user.email;
                  }
                }}
                title="Click to edit email"
              />
            </div>
            <div className="table-cell">
              <select 
                className={`status-badge status-select ${user.status.toLowerCase()}`}
                value={user.status}
                onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="table-cell">
              <button className="action-btn small" onClick={() => handleEditUser(user)}>Edit</button>
              <button className="action-btn small" onClick={() => handleViewUserDetails(user)}>View Details</button>
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
              <div className="task-header-right">
                <select 
                  className={`priority-badge priority-select ${task.priority.toLowerCase()}`}
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <select 
                  className="status-select"
                  value={task.status || 'Pending'}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>
                          <div className="task-details">
                <div className="task-info">
                  <span><strong>Description:</strong> 
                    <textarea 
                      className="description-input"
                      value={task.description || ''}
                      onChange={(e) => handleDescriptionChange(task.id, e.target.value)}
                      placeholder="Add task description..."
                      rows="2"
                      title="Update task description"
                    />
                  </span>
                  <span><strong>Assigned to:</strong> 
                    <select 
                      className="assigned-to-select"
                      value={task.assignedTo ? (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name) : ''}
                      onChange={(e) => handleAssignedToChange(task.id, e.target.value)}
                      title="Update assigned employee"
                    >
                      <option value="">Not assigned</option>
                      {users.filter(u => u.role === 'Employee').map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  </span>
                  <span><strong>Machine:</strong> 
                    <select 
                      className="machine-select"
                      value={task.machine ? (typeof task.machine === 'string' ? task.machine : task.machine.name) : ''}
                      onChange={(e) => handleMachineChange(task.id, e.target.value)}
                      title="Update machine assignment"
                    >
                      <option value="">Not assigned</option>
                      {machines.map(machine => (
                        <option key={machine.id} value={machine.name}>{machine.name}</option>
                      ))}
                    </select>
                  </span>
                  <span><strong>Deadline:</strong> 
                    <input 
                      type="date"
                      className="deadline-input"
                      value={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                      title="Update deadline"
                    />
                  </span>
                </div>
              <div className="task-employees">
                <strong>Employees:</strong>
                <div className="employee-tags">
                  {task.employees && task.employees.map(emp => (
                    <span 
                      key={emp} 
                      className="employee-tag clickable"
                      onClick={() => handleEmployeeToggle(task.id, emp)}
                      title="Click to remove employee"
                    >
                      {emp} ×
                    </span>
                  ))}
                </div>
                <div className="add-employee-section">
                  <select 
                    className="add-employee-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleEmployeeToggle(task.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    title="Add employee to task"
                  >
                    <option value="">+ Add Employee</option>
                    {users.filter(u => u.role === 'Employee' && !task.employees?.includes(u.name)).map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="task-progress">
                <div className="progress-header">
                  <span>Progress: {task.progress}%</span>
                  <input 
                    type="number"
                    className="progress-input"
                    value={task.progress || 0}
                    onChange={(e) => handleProgressChange(task.id, e.target.value)}
                    min="0"
                    max="100"
                    title="Update progress"
                  />
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${task.progress}%`}}></div>
                </div>
              </div>
            </div>
            <div className="task-actions">
              <button className="action-btn small" onClick={() => handleEditTask(task)}>Edit</button>
              <button className="action-btn small" onClick={() => handleViewTaskDetails(task)}>View Details</button>
              <button className="action-btn small danger" onClick={() => handleDeleteTask(task.id)}>Delete</button>
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
              <div className="machine-header-right">
                <select 
                  className={`status-badge status-select ${machine.status.toLowerCase()}`}
                  value={machine.status}
                  onChange={(e) => handleMachineStatusChange(machine.id, e.target.value)}
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
            <div className="machine-details">
              <span><strong>Location:</strong> 
                <input 
                  type="text"
                  className="location-input"
                  value={machine.location}
                  onChange={(e) => handleMachineLocationChange(machine.id, e.target.value)}
                  title="Update location"
                />
              </span>
              <span><strong>Description:</strong> 
                <textarea 
                  className="description-input"
                  value={machine.description || ''}
                  onChange={(e) => handleMachineDescriptionChange(machine.id, e.target.value)}
                  placeholder="Add machine description..."
                  rows="2"
                  title="Update machine description"
                />
              </span>
              <span><strong>Last Maintenance:</strong> 
                <input 
                  type="date"
                  className="maintenance-date-input"
                  value={machine.lastMaintenance || ''}
                  onChange={(e) => handleMaintenanceDateChange(machine.id, 'lastMaintenance', e.target.value)}
                  title="Update last maintenance date"
                />
              </span>
              <span><strong>Next Maintenance:</strong> 
                <input 
                  type="date"
                  className="maintenance-date-input"
                  value={machine.nextMaintenance || ''}
                  onChange={(e) => handleMaintenanceDateChange(machine.id, 'nextMaintenance', e.target.value)}
                  title="Update next maintenance date"
                />
              </span>
              <span><strong>Maintenance Notes:</strong> 
                <textarea 
                  className="maintenance-notes-input"
                  value={machine.maintenanceNotes || ''}
                  onChange={(e) => handleMaintenanceNotesChange(machine.id, e.target.value)}
                  placeholder="Enter maintenance notes"
                  rows="2"
                  title="Update maintenance notes"
                />
              </span>
            </div>
                          <div className="machine-actions">
                <button className="action-btn small" onClick={() => handleEditMachine(machine)}>Edit</button>
                <button className="action-btn small" onClick={() => handleViewMachineDetails(machine)}>View Details</button>
                <button className="action-btn small" onClick={() => handleViewMaintenanceLog(machine)}>Maintenance Log</button>
                <button className="action-btn small danger" onClick={() => handleDeleteMachine(machine.id)}>Delete</button>
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
                
                <label>Status</label>
                <select 
                  name="status"
                  value={newTask.status || 'Pending'}
                  onChange={handleTaskInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
                
                <label>Progress (%)</label>
                <input 
                  type="number"
                  name="progress"
                  value={newTask.progress || 0}
                  onChange={handleTaskInputChange}
                  min="0"
                  max="100"
                  placeholder="Enter progress percentage"
                />
                
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
            {modalType === 'editTask' && (
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={editingTask.title}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task title" 
                />
                {formErrors.title && <p className="error-message">{formErrors.title}</p>}
                
                <label>Task Description</label>
                <textarea 
                  name="description"
                  value={editingTask.description}
                  onChange={handleTaskInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
                {formErrors.description && <p className="error-message">{formErrors.description}</p>}
                
                <label>Assign to Employee</label>
                <select 
                  name="assignedTo"
                  value={editingTask.assignedTo}
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
                  value={editingTask.machine}
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
                   value={editingTask.deadline}
                   onChange={handleTaskInputChange}
                 />
                {formErrors.deadline && <p className="error-message">{formErrors.deadline}</p>}
                
                                 <label>Priority</label>
                 <select 
                   name="priority"
                   value={editingTask.priority}
                   onChange={handleTaskInputChange}
                 >
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                   <option value="Urgent">Urgent</option>
                 </select>
                 
                 <label>Status</label>
                 <select 
                   name="status"
                   value={editingTask.status}
                   onChange={handleTaskInputChange}
                 >
                   <option value="Pending">Pending</option>
                   <option value="In Progress">In Progress</option>
                   <option value="Completed">Completed</option>
                   <option value="On Hold">On Hold</option>
                 </select>
                 
                 <label>Progress (%)</label>
                 <input 
                   type="number"
                   name="progress"
                   value={editingTask.progress}
                   onChange={handleTaskInputChange}
                   min="0"
                   max="100"
                   placeholder="Enter progress percentage"
                 />
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleUpdateTask}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Task'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'viewTask' && selectedTask && (
              <div className="task-details-modal">
                <h2>Task Details</h2>
                <div className="task-detail-item">
                  <strong>Title:</strong> {selectedTask.title}
                </div>
                <div className="task-detail-item">
                  <strong>Description:</strong> {selectedTask.description}
                </div>
                <div className="task-detail-item">
                  <strong>Assigned to:</strong> {selectedTask.assignedTo ? (typeof selectedTask.assignedTo === 'string' ? selectedTask.assignedTo : selectedTask.assignedTo.name) : 'Not assigned'}
                </div>
                <div className="task-detail-item">
                  <strong>Machine:</strong> {selectedTask.machine ? (typeof selectedTask.machine === 'string' ? selectedTask.machine : selectedTask.machine.name) : 'Not assigned'}
                </div>
                <div className="task-detail-item">
                  <strong>Deadline:</strong> {selectedTask.deadline}
                </div>
                <div className="task-detail-item">
                  <strong>Priority:</strong> {selectedTask.priority}
                </div>
                <div className="task-detail-item">
                  <strong>Status:</strong> {selectedTask.status}
                </div>
                <div className="task-detail-item">
                  <strong>Progress:</strong> {selectedTask.progress}%
                </div>
                <div className="task-detail-item">
                  <strong>Employees:</strong>
                  {selectedTask.employees.map(emp => (
                    <span key={emp} className="employee-tag">{emp}</span>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
            {modalType === 'addMachine' && (
              <div className="form-group">
                <label>Machine Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={newMachine.name}
                  onChange={handleMachineInputChange}
                  placeholder="Enter machine name" 
                />
                {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                
                <label>Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={newMachine.location}
                  onChange={handleMachineInputChange}
                  placeholder="Enter location" 
                />
                {formErrors.location && <p className="error-message">{formErrors.location}</p>}
                
                <label>Status</label>
                <select 
                  name="status"
                  value={newMachine.status}
                  onChange={handleMachineInputChange}
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                
                <label>Description</label>
                <textarea 
                  name="description"
                  value={newMachine.description}
                  onChange={handleMachineInputChange}
                  placeholder="Enter description" 
                  rows="2"
                />
                
                <label>Last Maintenance</label>
                <input 
                  type="date" 
                  name="lastMaintenance"
                  value={newMachine.lastMaintenance}
                  onChange={handleMachineInputChange}
                />
                
                <label>Next Maintenance</label>
                <input 
                  type="date" 
                  name="nextMaintenance"
                  value={newMachine.nextMaintenance}
                  onChange={handleMachineInputChange}
                />
                
                <label>Maintenance Notes</label>
                <textarea 
                  name="maintenanceNotes"
                  value={newMachine.maintenanceNotes}
                  onChange={handleMachineInputChange}
                  placeholder="Enter maintenance notes" 
                  rows="2"
                />
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleAddMachine}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Machine'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'editMachine' && (
              <div className="form-group">
                <label>Machine Name</label>
                <input type="text" name="name" value={editingMachine.name} onChange={handleMachineInputChange} placeholder="Enter machine name" />
                {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                <label>Location</label>
                <input type="text" name="location" value={editingMachine.location} onChange={handleMachineInputChange} placeholder="Enter location" />
                {formErrors.location && <p className="error-message">{formErrors.location}</p>}
                <label>Status</label>
                <select name="status" value={editingMachine.status} onChange={handleMachineInputChange}>
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
                <label>Description</label>
                <textarea name="description" value={editingMachine.description} onChange={handleMachineInputChange} placeholder="Enter description" rows="2" />
                <label>Last Maintenance</label>
                <input type="date" name="lastMaintenance" value={editingMachine.lastMaintenance} onChange={handleMachineInputChange} />
                <label>Next Maintenance</label>
                <input type="date" name="nextMaintenance" value={editingMachine.nextMaintenance} onChange={handleMachineInputChange} />
                <label>Maintenance Notes</label>
                <textarea name="maintenanceNotes" value={editingMachine.maintenanceNotes} onChange={handleMachineInputChange} placeholder="Enter maintenance notes" rows="2" />
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleUpdateMachine}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Machine'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'viewMachine' && selectedMachine && (
              <div className="machine-details-modal">
                <h2>Machine Details</h2>
                <div className="machine-detail-item">
                  <strong>Name:</strong> {selectedMachine.name}
                </div>
                <div className="machine-detail-item">
                  <strong>Location:</strong> {selectedMachine.location}
                </div>
                <div className="machine-detail-item">
                  <strong>Status:</strong> {selectedMachine.status}
                </div>
                <div className="machine-detail-item">
                  <strong>Description:</strong> {selectedMachine.description}
                </div>
                <div className="machine-detail-item">
                  <strong>Last Maintenance:</strong> {selectedMachine.lastMaintenance}
                </div>
                <div className="machine-detail-item">
                  <strong>Next Maintenance:</strong> {selectedMachine.nextMaintenance}
                </div>
                <div className="machine-detail-item">
                  <strong>Maintenance Notes:</strong> {selectedMachine.maintenanceNotes}
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
            {modalType === 'maintenanceLog' && selectedMachine && (
              <div className="maintenance-log-modal">
                <h2>Maintenance Log for {selectedMachine.name}</h2>
                <div className="log-header">
                  <div className="log-cell">Date</div>
                  <div className="log-cell">Type</div>
                  <div className="log-cell">Description</div>
                  <div className="log-cell">Technician</div>
                  <div className="log-cell">Cost</div>
                  <div className="log-cell">Actions</div>
                </div>
                {maintenanceLogs.filter(log => log.machineId === selectedMachine.id).map(log => (
                  <div key={log.id} className="log-row">
                    <div className="log-cell">{log.date}</div>
                    <div className="log-cell">{log.type}</div>
                    <div className="log-cell">{log.description}</div>
                    <div className="log-cell">{log.technician}</div>
                    <div className="log-cell">{log.cost}</div>
                    <div className="log-cell">
                      <button className="action-btn small danger" onClick={() => handleDeleteMaintenanceLog(log.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                                 <div className="add-log-section">
                   <h3>Add New Maintenance Log</h3>
                   <div className="form-group">
                     <label>Date</label>
                     <input 
                       type="date" 
                       id="logDate"
                       defaultValue={new Date().toISOString().split('T')[0]}
                     />
                     <label>Type</label>
                     <select id="logType">
                       <option value="Routine">Routine</option>
                       <option value="Repair">Repair</option>
                       <option value="Calibration">Calibration</option>
                       <option value="Inspection">Inspection</option>
                     </select>
                     <label>Description</label>
                     <textarea 
                       id="logDescription"
                       placeholder="Enter maintenance description" 
                       rows="2" 
                     />
                     <label>Technician</label>
                     <input 
                       type="text" 
                       id="logTechnician"
                       placeholder="Enter technician name" 
                     />
                     <label>Cost</label>
                     <input 
                       type="number" 
                       id="logCost"
                       placeholder="Enter cost" 
                       min="0"
                       step="0.01"
                     />
                     <button 
                       className="action-btn primary"
                       onClick={() => {
                         const logData = {
                           date: document.getElementById('logDate').value,
                           type: document.getElementById('logType').value,
                           description: document.getElementById('logDescription').value,
                           technician: document.getElementById('logTechnician').value,
                           cost: document.getElementById('logCost').value
                         };
                         
                         if (!logData.date || !logData.description || !logData.technician) {
                           alert('Please fill in all required fields');
                           return;
                         }
                         
                         handleAddMaintenanceLog(selectedMachine.id, logData);
                         
                         // Clear form
                         document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
                         document.getElementById('logType').value = 'Routine';
                         document.getElementById('logDescription').value = '';
                         document.getElementById('logTechnician').value = '';
                         document.getElementById('logCost').value = '';
                       }}
                     >
                       Add Log
                     </button>
                   </div>
                 </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
                </div>
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
            {modalType === 'editUser' && (
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editingUser.name} 
                  onChange={handleUserInputChange}
                  placeholder="Enter full name"
                />
                {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={editingUser.email} 
                  onChange={handleUserInputChange}
                  placeholder="Enter email address"
                />
                {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                
                <label>User Role</label>
                <select name="role" value={editingUser.role} onChange={handleUserInputChange}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Sub Admin">Sub Admin</option>
                  <option value="Admin">Admin</option>
                </select>
                {formErrors.role && <p className="error-message">{formErrors.role}</p>}
                
                <label>Status</label>
                <select name="status" value={editingUser.status} onChange={handleUserInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formErrors.status && <p className="error-message">{formErrors.status}</p>}
                
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={editingUser.password} 
                  onChange={handleUserInputChange}
                  placeholder="Enter password (min 6 characters)"
                />
                {formErrors.password && <p className="error-message">{formErrors.password}</p>}
                
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={editingUser.confirmPassword} 
                  onChange={handleUserInputChange}
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && <p className="error-message">{formErrors.confirmPassword}</p>}
                
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary" 
                    onClick={handleUpdateUser}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </div>
            )}
            {modalType === 'viewUser' && selectedUser && (
              <div className="user-details-modal">
                <h2>User Details</h2>
                <div className="user-detail-item">
                  <strong>Name:</strong> {selectedUser.name}
                </div>
                <div className="user-detail-item">
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div className="user-detail-item">
                  <strong>Role:</strong> {selectedUser.role}
                </div>
                <div className="user-detail-item">
                  <strong>Status:</strong> {selectedUser.status}
                </div>
                <div className="modal-actions">
                  <button className="action-btn secondary" onClick={closeModal}>Close</button>
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
