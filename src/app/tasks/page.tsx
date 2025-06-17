'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { formatDate, formatDateTime, getPriorityColor } from '@/lib/utils'
import { Plus, Search, Filter, Clock, CheckSquare, Square, User, FolderOpen } from 'lucide-react'
import type { Task, Case, Client } from '@/lib/supabase'

interface TaskWithCase extends Task {
  case: Case & { client: Client }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [supabase] = useState(() => getSupabaseClient())

  useEffect(() => {
    fetchTasks()
  }, [supabase])

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases(
            id,
            title,
            client:clients(id, name, email)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as 'pending' | 'in_progress' | 'completed' }
          : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.case?.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const groupedTasks = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage and track all your legal tasks and deadlines</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, or cases..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Total: <strong className="text-gray-900">{filteredTasks.length}</strong></span>
            <span>Pending: <strong className="text-yellow-600">{groupedTasks.pending.length}</strong></span>
            <span>In Progress: <strong className="text-blue-600">{groupedTasks.in_progress.length}</strong></span>
            <span>Completed: <strong className="text-green-600">{groupedTasks.completed.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Tasks Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Pending</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {groupedTasks.pending.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {groupedTasks.pending.map((task) => (
              <TaskCard key={task.id} task={task} onToggleStatus={toggleTaskStatus} />
            ))}
            {groupedTasks.pending.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Square className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">In Progress</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {groupedTasks.in_progress.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {groupedTasks.in_progress.map((task) => (
              <TaskCard key={task.id} task={task} onToggleStatus={toggleTaskStatus} />
            ))}
            {groupedTasks.in_progress.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No tasks in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Completed</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {groupedTasks.completed.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {groupedTasks.completed.map((task) => (
              <TaskCard key={task.id} task={task} onToggleStatus={toggleTaskStatus} />
            ))}
            {groupedTasks.completed.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No completed tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ 
  task, 
  onToggleStatus 
}: { 
  task: TaskWithCase
  onToggleStatus: (taskId: string, currentStatus: string) => void
}) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <button
          onClick={() => onToggleStatus(task.id, task.status)}
          className="text-gray-400 hover:text-gray-600"
        >
          {task.status === 'completed' ? (
            <CheckSquare className="h-4 w-4 text-green-600" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="space-y-2">
        {/* Priority */}
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        {/* Case */}
        {task.case && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <FolderOpen className="h-3 w-3" />
            <span className="truncate">{task.case.title}</span>
          </div>
        )}
        
        {/* Client */}
        {task.case?.client && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{task.case.client.name}</span>
          </div>
        )}
        
        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="h-3 w-3" />
            <span>Due: {formatDate(task.due_date)}</span>
          </div>
        )}
        
        {/* Created Date */}
        <div className="text-xs text-gray-500">
          Created: {formatDate(task.created_at)}
        </div>
      </div>
    </div>
  )
} 