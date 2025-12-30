import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Search,
  Filter,
  Eye,
  X,
  Send,
  AlertCircle,
  Building2,
  RefreshCw,
  ChevronDown
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [remarks, setRemarks] = useState('')

  const departments = [
    { value: 'academic', label: 'Academic Affairs' },
    { value: 'facilities', label: 'Facilities Management' },
    { value: 'finance', label: 'Finance Office' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'security', label: 'Security Office' },
    { value: 'registrar', label: 'Registrar' },
    { value: 'student_affairs', label: 'Student Affairs' },
  ]

  const statusConfig = {
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: FileText },
    verified: { label: 'Verified', color: 'bg-gold-100 text-gold-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: Clock },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  }

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      console.error('Error fetching complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedDepartment) {
      alert('Please select a department')
      return
    }

    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('complaints')
        .update({
          status: 'verified',
          assigned_department: selectedDepartment,
          admin_remarks: remarks,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', selectedComplaint.id)

      if (updateError) throw updateError

      await supabase.from('audit_trail').insert({
        complaint_id: selectedComplaint.id,
        action: 'Complaint Verified',
        performed_by: user.id,
        details: `Assigned to ${departments.find(d => d.value === selectedDepartment)?.label}. ${remarks ? `Remarks: ${remarks}` : ''}`,
      })

      setShowModal(false)
      setSelectedComplaint(null)
      setSelectedDepartment('')
      setRemarks('')
      fetchComplaints()
    } catch (err) {
      console.error('Error approving complaint:', err)
      alert('Failed to approve complaint')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!remarks) {
      alert('Please provide a reason for rejection')
      return
    }

    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('complaints')
        .update({
          status: 'rejected',
          admin_remarks: remarks,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', selectedComplaint.id)

      if (updateError) throw updateError

      await supabase.from('audit_trail').insert({
        complaint_id: selectedComplaint.id,
        action: 'Complaint Rejected',
        performed_by: user.id,
        details: `Reason: ${remarks}`,
      })

      setShowModal(false)
      setSelectedComplaint(null)
      setRemarks('')
      fetchComplaints()
    } catch (err) {
      console.error('Error rejecting complaint:', err)
      alert('Failed to reject complaint')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredComplaints = complaints.filter(complaint => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      complaint.reference_number.toLowerCase().includes(query) ||
      complaint.name.toLowerCase().includes(query) ||
      complaint.category.toLowerCase().includes(query) ||
      complaint.description.toLowerCase().includes(query)
    )
  })

  const stats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.status === 'submitted').length,
    verified: complaints.filter(c => c.status === 'verified').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-maroon-800 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Verify and manage complaints</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
            <p className="text-sm text-blue-600">Pending</p>
            <p className="text-2xl font-bold text-blue-700">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gold-100 shadow-sm">
            <p className="text-sm text-gold-600">Verified</p>
            <p className="text-2xl font-bold text-gold-700">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
            <p className="text-sm text-orange-600">In Progress</p>
            <p className="text-2xl font-bold text-orange-700">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reference, name, category..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending</option>
                <option value="verified">Verified</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={fetchComplaints}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-maroon-800 border-t-transparent mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No complaints found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Complainant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredComplaints.map((complaint) => {
                    const status = statusConfig[complaint.status]
                    const StatusIcon = status?.icon || FileText
                    return (
                      <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-maroon-800">
                            {complaint.reference_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{complaint.name}</p>
                            <p className="text-sm text-gray-500">{complaint.email || 'No email'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-gray-700">{complaint.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                            <StatusIcon size={14} />
                            <span>{status?.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(complaint.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint)
                              setShowModal(true)
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-maroon-800 text-white rounded-lg hover:bg-maroon-700 transition-colors text-sm"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                  <p className="text-sm text-gray-500 font-mono">{selectedComplaint.reference_number}</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedComplaint(null)
                    setSelectedDepartment('')
                    setRemarks('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Status</span>
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[selectedComplaint.status]?.color}`}>
                    {statusConfig[selectedComplaint.status]?.label}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Complainant</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.email || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedComplaint.category}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Student/Employee ID</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.student_id || 'Not provided'}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </div>
                </div>

                {/* Complaint Evidence Image */}
                {selectedComplaint.attachment_url && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Complaint Evidence</p>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <img 
                        src={selectedComplaint.attachment_url} 
                        alt="Complaint Evidence" 
                        className="max-h-64 rounded-lg border border-gray-200 mb-2"
                      />
                      <a
                        href={selectedComplaint.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-maroon-800 hover:text-maroon-600 text-sm"
                      >
                        <Eye size={18} />
                        <span>View Full Image</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Action Section - Only for submitted complaints */}
                {selectedComplaint.status === 'submitted' && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Take Action</h3>
                    
                    {/* Department Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Department
                      </label>
                      <div className="relative">
                        <Building2 size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none appearance-none bg-white"
                        >
                          <option value="">Select a department...</option>
                          {departments.map((dept) => (
                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks <span className="text-gray-400">(optional for approval, required for rejection)</span>
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none resize-none"
                        placeholder="Add any remarks or notes..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading || !selectedDepartment}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            <span>Approve & Assign</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !remarks}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <XCircle size={20} />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Show assigned department for verified complaints */}
                {selectedComplaint.assigned_department && (
                  <div className="border-t border-gray-100 pt-6">
                    <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
                      <p className="text-sm text-gold-700 mb-1">Assigned Department</p>
                      <p className="font-semibold text-gold-900 capitalize">
                        {departments.find(d => d.value === selectedComplaint.assigned_department)?.label || selectedComplaint.assigned_department}
                      </p>
                    </div>
                  </div>
                )}

                {/* Show resolution for resolved complaints */}
                {(selectedComplaint.resolution_details || selectedComplaint.resolution_image_url) && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    {selectedComplaint.resolution_details && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-700 mb-1">Resolution Details</p>
                        <p className="text-green-900">{selectedComplaint.resolution_details}</p>
                      </div>
                    )}
                    {selectedComplaint.resolution_image_url && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Resolution Proof</p>
                        <div className="bg-green-50 rounded-xl p-4">
                          <img 
                            src={selectedComplaint.resolution_image_url} 
                            alt="Resolution Proof" 
                            className="max-h-64 rounded-lg border border-green-200 mb-2"
                          />
                          <a
                            href={selectedComplaint.resolution_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-green-700 hover:text-green-600 text-sm"
                          >
                            <Eye size={18} />
                            <span>View Full Image</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
