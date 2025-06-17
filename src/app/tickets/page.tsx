'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Circle,
  ArrowRight,
  Calendar,
  Tag,
  FileText,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { ticketManager, Ticket, TicketFilter } from '@/lib/tickets/ticket-manager'

interface TicketStats {
  total: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  sla_breached: number
  avg_resolution_time: number
  unassigned: number
}

const PRIORITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
}

const STATUS_COLORS = {
  open: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  pending: 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
  cancelled: 'bg-red-500'
}

const PRIORITY_ICONS = {
  critical: AlertTriangle,
  high: ArrowRight,
  medium: Circle,
  low: CheckCircle
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<TicketFilter>({})
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadTickets()
    loadStats()
  }, [filter, search, sortField, sortDirection, page])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const result = await ticketManager.getTickets({
        filter: { ...filter, search },
        sort: { field: sortField, direction: sortDirection },
        page,
        limit: 25,
        firm_id: 'default_firm' // This would come from auth context
      })
      
      setTickets(result.tickets)
      setTotalPages(result.total_pages)
    } catch (error) {
      setError('Failed to load tickets')
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const ticketStats = await ticketManager.getTicketStats('default_firm')
      setStats(ticketStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleFilterChange = (key: keyof TicketFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page
  }

  const handleBulkAction = async (action: string) => {
    if (selectedTickets.length === 0) return

    try {
      let updates: Partial<Ticket> = {}
      
      switch (action) {
        case 'mark_in_progress':
          updates = { status: 'in_progress' }
          break
        case 'mark_resolved':
          updates = { status: 'resolved', resolved_at: new Date().toISOString() }
          break
        case 'mark_closed':
          updates = { status: 'closed', closed_at: new Date().toISOString() }
          break
        default:
          return
      }

      await ticketManager.bulkUpdateTickets(selectedTickets, updates)
      setSelectedTickets([])
      loadTickets()
      loadStats()
    } catch (error) {
      setError('Failed to update tickets')
      console.error('Error updating tickets:', error)
    }
  }

  const handleTicketUpdate = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      await ticketManager.updateTicket(ticketId, updates)
      loadTickets()
      loadStats()
    } catch (error) {
      setError('Failed to update ticket')
      console.error('Error updating ticket:', error)
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const Icon = PRIORITY_ICONS[priority as keyof typeof PRIORITY_ICONS] || Circle
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}`} />
        <span className="capitalize">{priority}</span>
      </Badge>
    )
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge 
      variant="outline" 
      className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} text-white border-none`}
    >
      {status.replace('_', ' ')}
    </Badge>
  )

  const TicketRow = ({ ticket }: { ticket: Ticket }) => (
    <TableRow key={ticket.id} className="hover:bg-gray-50">
      <TableCell>
        <input
          type="checkbox"
          checked={selectedTickets.includes(ticket.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTickets(prev => [...prev, ticket.id])
            } else {
              setSelectedTickets(prev => prev.filter(id => id !== ticket.id))
            }
          }}
          className="rounded"
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="text-blue-600 hover:underline cursor-pointer">
            {ticket.ticket_number}
          </span>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(ticket.created_at)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{ticket.title}</span>
          {ticket.short_description && (
            <span className="text-sm text-gray-600 truncate max-w-xs">
              {ticket.short_description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <PriorityBadge priority={ticket.priority} />
      </TableCell>
      <TableCell>
        <StatusBadge status={ticket.status} />
      </TableCell>
      <TableCell>
        {ticket.assigned_user ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm">{ticket.assigned_user.email}</span>
          </div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        {ticket.category?.name && (
          <Badge variant="secondary">{ticket.category.name}</Badge>
        )}
      </TableCell>
      <TableCell>
        {ticket.sla_due_date && new Date(ticket.sla_due_date) < new Date() ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Overdue
          </Badge>
        ) : ticket.sla_due_date ? (
          <span className="text-sm text-gray-600">
            Due {formatRelativeTime(ticket.sla_due_date)}
          </span>
        ) : null}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {/* Open ticket details */}}>
              <FileText className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTicketUpdate(ticket.id, { status: 'in_progress' })}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTicketUpdate(ticket.id, { status: 'resolved' })}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Resolved
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {/* Edit ticket */}}>
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  const KanbanColumn = ({ status, tickets: columnTickets }: { status: string; tickets: Ticket[] }) => (
    <div className="flex-1 min-w-80">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium capitalize">{status.replace('_', ' ')}</h3>
          <Badge variant="secondary">{columnTickets.length}</Badge>
        </div>
        <div className="space-y-3">
          {columnTickets.map(ticket => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">{ticket.ticket_number}</span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <h4 className="font-medium mb-2 line-clamp-2">{ticket.title}</h4>
                {ticket.short_description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.short_description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ticket.assigned_user ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                    {ticket.category?.name && (
                      <Badge variant="outline" className="text-xs">{ticket.category.name}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(ticket.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  if (loading && !tickets.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ticket Management</h1>
          <p className="text-muted-foreground mt-2">
            ServiceNow-style ticket management with AI automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-2">
                <Circle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.by_status?.open || 0}</p>
                  <p className="text-xs text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.by_status?.in_progress || 0}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.sla_breached}</p>
                  <p className="text-xs text-muted-foreground">SLA Breached</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.unassigned}</p>
                  <p className="text-xs text-muted-foreground">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(stats.avg_resolution_time)}h</p>
                  <p className="text-xs text-muted-foreground">Avg Resolution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filter.status?.[0] || ''} onValueChange={(value) => 
              handleFilterChange('status', value ? [value] : undefined)
            }>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.priority?.[0] || ''} onValueChange={(value) =>
              handleFilterChange('priority', value ? [value] : undefined)
            }>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setFilter({})
              setSearch('')
            }}>
              Clear Filters
            </Button>
          </div>

          {selectedTickets.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">{selectedTickets.length} tickets selected</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" onClick={() => handleBulkAction('mark_in_progress')}>
                  Start Progress
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('mark_resolved')}>
                  Mark Resolved
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('mark_closed')}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'kanban')}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === tickets.length && tickets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTickets(tickets.map(t => t.id))
                        } else {
                          setSelectedTickets([])
                        }
                      }}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </TableBody>
            </Table>

            {tickets.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No tickets found matching your filters
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {['open', 'in_progress', 'pending', 'resolved'].map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={tickets.filter(t => t.status === status)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 