import React, { useState, useEffect } from 'react';
import { taskService } from './api/api';
import { 
  Plus, MoreHorizontal, Trash2, Edit2, Calendar, 
  Search, Bell, Settings, User, X, CheckCircle2,
  Clock, Tag, UserCircle
} from 'lucide-react';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTask, setCurrentTask] = useState({ 
    title: '', 
    status: 'Backlog', 
    projectName: '',
    dueDate: '',
    assignee: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { 
    fetchTasks(); 
  }, []);

  // Map backend status to frontend status
  const mapBackendStatusToFrontend = (backendStatus) => {
    const statusMap = {
      'TO_DO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'DONE': 'Done',
      'BACKLOG': 'Backlog'
    };
    return statusMap[backendStatus] || backendStatus || 'Backlog';
  };

  // Map frontend status to backend status
  const mapFrontendStatusToBackend = (frontendStatus) => {
    if (!frontendStatus) {
      console.warn('No status provided, defaulting to BACKLOG');
      return 'BACKLOG';
    }
    
    // Trim whitespace and normalize
    const normalizedStatus = String(frontendStatus).trim();
    
    const statusMap = {
      'To Do': 'TO_DO',
      'In Progress': 'IN_PROGRESS',
      'Done': 'DONE',
      'Backlog': 'BACKLOG',
      // Handle case variations
      'backlog': 'BACKLOG',
      'BACKLOG': 'BACKLOG',
      'to do': 'TO_DO',
      'TO_DO': 'TO_DO',
      'in progress': 'IN_PROGRESS',
      'IN_PROGRESS': 'IN_PROGRESS',
      'done': 'DONE',
      'DONE': 'DONE'
    };
    
    const mappedStatus = statusMap[normalizedStatus];
    
    if (!mappedStatus) {
      console.warn(`Unknown status: "${normalizedStatus}", defaulting to BACKLOG`);
      return 'BACKLOG';
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
      setCurrentTask({ title: '', status: 'Backlog', projectName: '', dueDate: '', assignee: '', description: '' });
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
      'Backlog': 'bg-gray-100 text-gray-700',
      'To Do': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Done': 'bg-green-100 text-green-700'
    };
    return colors[status] || colors['Backlog'];
  };

  const getProjectColor = (projectName) => {
    if (!projectName) return 'bg-gray-100 text-gray-600';
    const colors = ['bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600', 
                    'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600',
                    'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600'];
    const index = projectName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredTasks = tasks.filter(task => 
    task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = ['Backlog', 'To Do', 'In Progress', 'Done'];

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
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">My Tasks</h1>
          <p className="app-subtitle">Monitor all of your tasks here</p>
        </div>
        <div className="header-right">
          <div className="search-container">
            <Search className="search-icon" size={18} />
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
            <Bell className="icon-button" size={20} />
            <Settings className="icon-button" size={20} />
            <User className="icon-button" size={20} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <div className="tab active">Kanban</div>
        <div className="tab">Table</div>
        <div className="tab">Calendar</div>
        <div className="nav-actions">
          <button className="nav-button">
            <span>Columns</span>
          </button>
          <button className="nav-button">
            <span>Filter</span>
          </button>
          <button className="nav-button">
            <span>Nearest Due Date</span>
          </button>
          <button 
            className="new-button"
            onClick={() => { 
              setCurrentTask({ title: '', status: 'Backlog', projectName: '', dueDate: '', assignee: '', description: '' }); 
              setIsModalOpen(true); 
            }}
          >
            <Plus size={18} /> New
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <X size={16} onClick={() => setError(null)} className="cursor-pointer" />
        </div>
      )}

      {/* Kanban Board */}
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
                  setCurrentTask({ title: '', status: col, projectName: '', dueDate: '', assignee: '', description: '' }); 
                  setIsModalOpen(true); 
                }}
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          );
        })}

        {/* Add Column */}
        <div className="kanban-column add-column">
          <button className="add-column-button">
            <Plus size={20} />
            <span>Add Column</span>
          </button>
        </div>
      </div>

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
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date"
                    className="form-input" 
                    value={currentTask.dueDate || ''}
                    onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter project name..."
                    value={currentTask.projectName || ''}
                    onChange={e => setCurrentTask({...currentTask, projectName: e.target.value})}
                  />
                </div>

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
    </div>
  );
};

export default App;