import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { taskService,notificationService } from './api/api';
import { 
  Plus, MoreHorizontal, Trash2, Edit2, Calendar, 
  Search, Bell, Settings, User, X, CheckCircle2,
  Clock, Tag, UserCircle, LogOut, Filter, ChevronDown,
  Moon, Sun, Globe, Mail, Lock
} from 'lucide-react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Auth Context (inline version - you can move to separate file later)
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }
      
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setToken(data.accessToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, prePassword) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, prePassword }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Registration failed' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component (inline - you can move to separate file later)
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [prePassword, setPrePassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = isRegister 
      ? await register(username, password, prePassword)
      : await login(username, password);
    
    if (result.success) {
      if (isRegister) {
        const loginResult = await login(username, password);
        if (loginResult.success) navigate('/');
        else setError(loginResult.error || 'Registration successful. Please log in.');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '48px', maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
            <User size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {isRegister ? 'Sign up to start managing your tasks' : 'Sign in to continue'}
          </p>
        </div>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#dc2626', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '10px' }} 
              placeholder="Enter your username" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Password</label>
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '10px' }} 
              placeholder="Enter your password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
              <input type="password" required value={prePassword} onChange={(e) => setPrePassword(e.target.value)} 
                style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid #e5e7eb', borderRadius: '10px' }} 
                placeholder="Confirm your password" />
            </div>
          )}
          <button type="submit" 
            style={{ width: '100%', padding: '14px 24px', fontSize: '16px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '8px' }}>
            {isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} 
            style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};


const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await notificationService.getNotifications();
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Xatolik:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="notification-dropdown"
    >
      <div className="notification-header">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          <span>Bildirishnomalar</span>
        </div>
        <button onClick={onClose} className="close-btn">
          <X size={16} />
        </button>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Yuklanmoqda...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={40} className="text-gray-300" />
            <p>Hozircha xabarlar yo'q</p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <div key={idx} className="notification-item">
              <div className="item-dot"></div>
              <div className="item-content">
                <p className="msg">{n.message}</p>
                <div className="item-footer">
                  <Tag size={12} />
                  <span>Vazifa #{n.taskId}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="notification-footer">
        <button onClick={onClose}>Hammasini ko'rildi deb belgilash</button>
      </div>
    </motion.div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Settings Component
const SettingsPage = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(true);
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <X size={24} onClick={onClose} className="settings-close" />
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="settings-item">
            <label>Theme</label>
            <div className="theme-selector">
              <button 
                className={theme === 'light' ? 'active' : ''}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={20} /> Light
              </button>
              <button 
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={20} /> Dark
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-item">
            <label>
              <Bell size={20} />
              Enable notifications
            </label>
            <input 
              type="checkbox" 
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          <div className="settings-item">
            <label>
              <Mail size={20} />
              Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          <div className="settings-item">
            <label>
              <Globe size={20} />
              Language
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security</h3>
          <div className="settings-item">
            <button className="settings-button">
              <Lock size={20} />
              Change Password
            </button>
          </div>
        </div>

        <div className="settings-section">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate && !task.date) return false;
      const taskDate = new Date(task.dueDate || task.date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav">
          <ChevronDown size={24} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth} className="calendar-nav">
          <ChevronDown size={24} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {days.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {calendarDays.map((date, index) => {
            const dayTasks = date ? getTasksForDate(date) : [];
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();
            
            return (
              <div 
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <div className="calendar-day-number">{date.getDate()}</div>
                    {dayTasks.length > 0 && (
                      <div className="calendar-day-tasks">
                        {dayTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id} 
                            className="calendar-task-dot"
                            style={{ backgroundColor: getTaskColor(task.status) }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick(task);
                            }}
                            title={task.title}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="calendar-task-more">+{dayTasks.length - 3}</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="calendar-selected-tasks">
          <h3>Tasks for {selectedDate.toLocaleDateString()}</h3>
          {getTasksForDate(selectedDate).map(task => (
            <div key={task.id} className="calendar-task-item" onClick={() => onTaskClick(task)}>
              <div className="calendar-task-title">{task.title}</div>
              <div className="calendar-task-status">{task.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getTaskColor = (status) => {
  const colors = {
    'To Do': '#3b82f6',
    'In Progress': '#eab308',
    'Done': '#22c55e'
  };
  return colors[status] || '#3b82f6';
};

// Task Manager Component (your existing App content)
const TaskManager = () => {
  
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentView, setCurrentView] = useState('kanban'); // kanban, table, calendar
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    overdue: null,
    assignee: null
  });
  const [currentTask, setCurrentTask] = useState({ 
    title: '', 
    status: 'To Do', 
    priority: 'MEDIUM',
    projectName: '',
    dueDate: '',
    assignee: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNotificationClick = () => {
    setShowNotifications(true);
  
    setTimeout(() => {
      setShowNotifications(false);
    }, 4000);
  };
  
  
  useEffect(() => { 
    fetchTasks(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map backend status to frontend status
  const mapBackendStatusToFrontend = (backendStatus) => {
    const statusMap = {
      'TO_DO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'DONE': 'Done'
    };
    return statusMap[backendStatus] || 'To Do';
  };

  // Map frontend status to backend status
  const mapFrontendStatusToBackend = (frontendStatus) => {
    if (!frontendStatus) {
      console.warn('No status provided, defaulting to TO_DO');
      return 'TO_DO';
    }
    
    // Trim whitespace and normalize
    const normalizedStatus = String(frontendStatus).trim();
    
    const statusMap = {
      'To Do': 'TO_DO',
      'In Progress': 'IN_PROGRESS',
      'Done': 'DONE',
      // Handle case variations
      'to do': 'TO_DO',
      'TO_DO': 'TO_DO',
      'in progress': 'IN_PROGRESS',
      'IN_PROGRESS': 'IN_PROGRESS',
      'done': 'DONE',
      'DONE': 'DONE'
    };
    
    const mappedStatus = statusMap[normalizedStatus];
    
    if (!mappedStatus) {
      console.warn(`Unknown status: "${normalizedStatus}", defaulting to TO_DO`);
      return 'TO_DO';
    }
    
    console.log(`Status mapping: "${normalizedStatus}" -> "${mappedStatus}"`);
    return mappedStatus;
  };

  // Transform backend task to frontend format
  const transformBackendTask = (backendTask) => {
    return {
      id: backendTask.id,
      title: backendTask.title || '',
      description: backendTask.description || '',
      status: mapBackendStatusToFrontend(backendTask.status),
      projectName: backendTask.projectName || '',
      dueDate: backendTask.deadline || backendTask.dueDate || '',
      date: backendTask.deadline || backendTask.dueDate || backendTask.date || '',
      assignee: backendTask.assignee || '',
      priority: backendTask.priority || 'MEDIUM',
      progress: backendTask.progress || 0
    };
  };

  // Transform frontend task to backend format
  const transformFrontendTask = (frontendTask) => {
    return {
      title: frontendTask.title,
      description: frontendTask.description || null,
      status: mapFrontendStatusToBackend(frontendTask.status),
      deadline: frontendTask.dueDate || null,
      projectName: frontendTask.projectName || null,
      assignee: frontendTask.assignee || null,
      priority: frontendTask.priority || 'MEDIUM',
      progress: frontendTask.progress || 0
    };
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
    const res = await taskService.getTasks();
      console.log('Raw API Response:', res);
      console.log('API Response Data:', res.data);
      console.log('Response Data Type:', Array.isArray(res.data) ? 'Array' : typeof res.data);
      
      // Handle different response formats
      let tasksData = res.data;
      
      // If data is not an array, try to extract it
      if (!Array.isArray(tasksData)) {
        if (tasksData && Array.isArray(tasksData.data)) {
          tasksData = tasksData.data;
        } else if (tasksData && tasksData.tasks) {
          tasksData = tasksData.tasks;
        } else {
          console.warn('Unexpected response format:', tasksData);
          tasksData = [];
        }
      }
      
      // Transform backend tasks to frontend format
      const transformedTasks = (tasksData || []).map(transformBackendTask);
      console.log('Transformed Tasks:', transformedTasks);
      console.log('Number of tasks:', transformedTasks.length);
      
      setTasks(transformedTasks);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch tasks. Please check your API connection.';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
      console.error('Error response:', err.response);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Debug: Log the current task before transformation
      console.log('Current task before transformation:', currentTask);
      console.log('Current task status:', currentTask.status, 'Type:', typeof currentTask.status);
      
      // Transform frontend task to backend format
      const backendTask = transformFrontendTask(currentTask);
      console.log('Saving task (backend format):', backendTask);
      console.log('Backend task status:', backendTask.status);
      
    if (currentTask.id) {
        await taskService.updateTask(currentTask.id, backendTask);
    } else {
        await taskService.createTask(backendTask);
    }
      
      setIsModalOpen(false);
      setCurrentTask({ title: '', status: 'To Do', priority: 'MEDIUM', projectName: '', dueDate: '', assignee: '', description: '' });
      fetchTasks();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save task. Please try again.';
      setError(errorMessage);
      console.error('Error saving task:', err);
      console.error('Error response:', err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        setError(null);
      await taskService.deleteTask(id);
      fetchTasks();
      } catch (err) {
        setError('Failed to delete task. Please try again.');
        console.error('Error deleting task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (task) => {
    setCurrentTask({
      ...task,
      dueDate: task.dueDate || task.date || ''
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Done': 'bg-green-100 text-green-700'
    };
    return colors[status] || colors['To Do'];
  };

  const getProjectColor = (projectName) => {
    if (!projectName) return 'bg-gray-100 text-gray-600';
    const colors = ['bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600', 
                    'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600',
                    'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600'];
    const index = projectName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchQuery || 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = !filters.status || task.status === filters.status;
    
    // Priority filter
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    
    // Overdue filter
    const matchesOverdue = filters.overdue === null || 
      (filters.overdue === true && isOverdue(task.dueDate || task.date)) ||
      (filters.overdue === false && !isOverdue(task.dueDate || task.date));
    
    // Assignee filter
    const matchesAssignee = !filters.assignee || task.assignee === filters.assignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesOverdue && matchesAssignee;
  });

  const clearFilters = () => {
    setFilters({
      status: null,
      priority: null,
      overdue: null,
      assignee: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const columns = ['To Do', 'In Progress', 'Done'];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return date < new Date() && date.toDateString() !== new Date().toDateString();
    } catch {
      return false;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}

      <AnimatePresence>
  {showNotifications && (
    <motion.div
      className="toast-notification"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.3 }}
    >
      <strong>Yangi bildirishnoma</strong>
      <p>Yangi task qo‘shildi</p>
    </motion.div>
  )}
</AnimatePresence>

      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">My Tasks</h1>
          <p className="app-subtitle">Monitor all of your tasks here</p>
        </div>
        <div className="header-right">
          <div className="search-container">
            <Search className="search-icon" size={22} />
            <input
              type="text"
              placeholder="Search anything"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X 
                className="search-clear" 
                size={16} 
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          <div className="header-icons">
          <div style={{ position: 'relative' }}>
          <button className="icon-button" onClick={handleNotificationClick}>
  <Bell size={24} />
  <span className="notification-badge" />
</button>

{showNotifications && (
  <div className="toast-notification">
    <strong>Yangi bildirishnoma</strong>
    <p>Yangi buyurtma qabul qilindi</p>
  </div>
)}

        </div>
              <Settings className="icon-button" size={24} onClick={() => setIsSettingsOpen(true)} title="Settings" />
            <User className="icon-button" size={24} title="Profile" />
            <LogOut className="icon-button" size={24} onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }} style={{ cursor: 'pointer' }} title="Logout" />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <div className="tabs-group">
          <div 
            className={`tab ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => setCurrentView('kanban')}
          >
            Kanban
          </div>
          <div 
            className={`tab ${currentView === 'table' ? 'active' : ''}`}
            onClick={() => setCurrentView('table')}
          >
            Table
          </div>
          <div 
            className={`tab ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar
          </div>
        </div>
        <div className="nav-actions">
          <button 
            className={`nav-button ${hasActiveFilters ? 'active-filter' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={20} />
            <span>Filter</span>
            {hasActiveFilters && <span className="filter-badge">•</span>}
          </button>
        <button 
            className="new-button"
            onClick={() => { 
              setCurrentTask({ title: '', status: 'To Do', priority: 'MEDIUM', projectName: '', dueDate: '', assignee: '', description: '' }); 
              setIsModalOpen(true); 
            }}
          >
            <Plus size={20} /> New
        </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter Tasks</h3>
            <X size={20} onClick={() => setIsFilterOpen(false)} />
          </div>
          <div className="filter-content">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status || ''} 
                onChange={(e) => setFilters({...filters, status: e.target.value || null})}
              >
                <option value="">All Statuses</option>
        {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Priority</label>
              <select 
                value={filters.priority || ''} 
                onChange={(e) => setFilters({...filters, priority: e.target.value || null})}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Overdue</label>
              <select 
                value={filters.overdue === null ? '' : filters.overdue ? 'true' : 'false'} 
                onChange={(e) => setFilters({...filters, overdue: e.target.value === '' ? null : e.target.value === 'true'})}
              >
                <option value="">All Tasks</option>
                <option value="true">Overdue Only</option>
                <option value="false">Not Overdue</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Assignee</label>
              <input 
                type="text"
                value={filters.assignee || ''}
                onChange={(e) => setFilters({...filters, assignee: e.target.value || null})}
                placeholder="Filter by assignee"
              />
            </div>
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <X size={20} onClick={() => setError(null)} className="cursor-pointer" />
        </div>
      )}

      {/* Content Area - Switch between views */}
      {currentView === 'kanban' && (
        <div className="kanban-board">
        {columns.map(col => {
          const columnTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div key={col} className="kanban-column">
              <div className="column-header">
                <h3 className="column-title">
                  {col === 'Done' && <CheckCircle2 size={16} className="inline mr-1" />}
                  {col}
                  <span className="task-count">{columnTasks.length}</span>
                </h3>
                <MoreHorizontal size={18} className="column-menu" />
            </div>

              <div className="task-list">
                {loading && columnTasks.length === 0 ? (
                  <div className="loading-placeholder">Loading...</div>
                ) : columnTasks.length === 0 ? (
                  <div className="empty-placeholder">No tasks</div>
                ) : (
                  columnTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-actions">
                          <Edit2 
                            size={14} 
                            className="action-icon edit-icon" 
                            onClick={() => handleEdit(task)} 
                          />
                          <Trash2 
                            size={14} 
                            className="action-icon delete-icon" 
                            onClick={() => handleDelete(task.id)} 
                          />
                    </div>
                  </div>
                  
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}

                      {task.projectName && (
                        <div className="task-tag">
                          <Tag size={12} />
                          <span className={getProjectColor(task.projectName)}>
                            {task.projectName}
                          </span>
                        </div>
                      )}

                      <div className="task-footer">
                        {task.dueDate || task.date ? (
                          <div className={`task-date ${isOverdue(task.dueDate || task.date) ? 'overdue' : ''}`}>
                            <Calendar size={12} />
                            <span>{formatDate(task.dueDate || task.date)}</span>
                            {isOverdue(task.dueDate || task.date) && (
                              <Clock size={12} className="ml-1" />
                            )}
                          </div>
                        ) : null}
                        {task.assignee && (
                          <div className="task-assignee">
                            <UserCircle size={14} />
                            <span>{task.assignee}</span>
                    </div>
                        )}
                  </div>
                    </div>
                  ))
                )}
                  </div>

              <button 
                className="add-task-button"
                onClick={() => { 
                  setCurrentTask({ title: '', status: col, priority: 'MEDIUM', projectName: '', dueDate: '', assignee: '', description: '' }); 
                  setIsModalOpen(true); 
                }}
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          );
        })}

        {/* Add Column
        <div className="kanban-column add-column">
          <button className="add-column-button">
            <Plus size={20} />
            <span>Add Column</span>
          </button>
        </div> */}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentTask.id ? 'Edit Task' : 'New Task'}
              </h2>
              <X 
                className="modal-close" 
                size={20} 
                onClick={() => setIsModalOpen(false)} 
              />
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
            <input 
                  className="form-input" 
                  placeholder="Enter task title..."
              value={currentTask.title}
              onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
            />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Enter task description..."
                  rows="3"
                  value={currentTask.description || ''}
                  onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={currentTask.status}
                    onChange={e => setCurrentTask({...currentTask, status: e.target.value})}
                  >
                    {columns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <div className="priority-buttons">
                    <button
                      type="button"
                      className={`priority-btn ${currentTask.priority === 'LOW' ? 'active low' : ''}`}
                      onClick={() => setCurrentTask({...currentTask, priority: 'LOW'})}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      className={`priority-btn ${currentTask.priority === 'MEDIUM' ? 'active medium' : ''}`}
                      onClick={() => setCurrentTask({...currentTask, priority: 'MEDIUM'})}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className={`priority-btn ${currentTask.priority === 'HIGH' ? 'active high' : ''}`}
                      onClick={() => setCurrentTask({...currentTask, priority: 'HIGH'})}
                    >
                      High
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date"
                    className="form-input" 
                    value={currentTask.dueDate || ''}
                    onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter project name..."
                    value={currentTask.projectName || ''}
                    onChange={e => setCurrentTask({...currentTask, projectName: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter assignee name..."
                    value={currentTask.assignee || ''}
                    onChange={e => setCurrentTask({...currentTask, assignee: e.target.value})}
                  />
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Task'}
              </button>
            </div>
        </div>
      </div>
      )}

      {/* Table View */}
      {currentView === 'table' && (
        <div className="table-view">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">No tasks found</td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="table-task-title">{task.title}</div>
                      {task.description && (
                        <div className="table-task-desc">{task.description}</div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{task.priority || 'MEDIUM'}</td>
                    <td>
                      {task.dueDate || task.date ? (
                        <span className={isOverdue(task.dueDate || task.date) ? 'overdue' : ''}>
                          {formatDate(task.dueDate || task.date)}
                        </span>
                      ) : (
                        <span className="no-date">No date</span>
                      )}
                    </td>
                    <td>{task.assignee || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <Edit2 size={18} onClick={() => handleEdit(task)} className="action-icon edit-icon" />
                        <Trash2 size={18} onClick={() => handleDelete(task.id)} className="action-icon delete-icon" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <CalendarView 
          tasks={filteredTasks} 
          onTaskClick={(task) => handleEdit(task)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <SettingsPage onClose={() => setIsSettingsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component with Routing
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TaskManager />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;