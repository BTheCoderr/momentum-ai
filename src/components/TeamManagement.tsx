'use client';

import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, Settings, Plus, Search, Filter, MoreVertical, UserPlus, Mail, Calendar, BarChart3, Target, TrendingUp, Award, AlertCircle, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  department: string;
  joinDate: string;
  lastActive: string;
  goals: number;
  completionRate: number;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avgCompletion: number;
  totalGoals: number;
  department: string;
  manager: string;
}

interface TeamManagementProps {
  currentUserRole: 'admin' | 'manager' | 'member';
  organizationId: string;
}

export default function TeamManagement({ currentUserRole, organizationId }: TeamManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'teams' | 'analytics' | 'settings'>('overview');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setMembers([
      {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@company.com',
        role: 'admin',
        department: 'Product',
        joinDate: '2023-01-15',
        lastActive: '2024-01-14',
        goals: 12,
        completionRate: 89,
        status: 'active'
      },
      {
        id: '2',
        name: 'Mike Johnson',
        email: 'mike@company.com',
        role: 'manager',
        department: 'Engineering',
        joinDate: '2023-03-20',
        lastActive: '2024-01-14',
        goals: 8,
        completionRate: 76,
        status: 'active'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily@company.com',
        role: 'member',
        department: 'Marketing',
        joinDate: '2023-06-10',
        lastActive: '2024-01-13',
        goals: 6,
        completionRate: 92,
        status: 'active'
      },
      {
        id: '4',
        name: 'David Kim',
        email: 'david@company.com',
        role: 'member',
        department: 'Sales',
        joinDate: '2023-09-05',
        lastActive: '2024-01-12',
        goals: 10,
        completionRate: 68,
        status: 'active'
      },
      {
        id: '5',
        name: 'Lisa Wang',
        email: 'lisa@company.com',
        role: 'member',
        department: 'Design',
        joinDate: '2023-11-01',
        lastActive: '2024-01-10',
        goals: 4,
        completionRate: 85,
        status: 'pending'
      }
    ]);

    setTeams([
      {
        id: '1',
        name: 'Product Team',
        description: 'Product development and strategy',
        memberCount: 8,
        avgCompletion: 84,
        totalGoals: 32,
        department: 'Product',
        manager: 'Sarah Chen'
      },
      {
        id: '2',
        name: 'Engineering',
        description: 'Software development and infrastructure',
        memberCount: 12,
        avgCompletion: 78,
        totalGoals: 48,
        department: 'Engineering',
        manager: 'Mike Johnson'
      },
      {
        id: '3',
        name: 'Marketing',
        description: 'Brand and growth marketing',
        memberCount: 6,
        avgCompletion: 91,
        totalGoals: 24,
        department: 'Marketing',
        manager: 'Emily Rodriguez'
      }
    ]);
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleInviteMember = (email: string, role: 'admin' | 'manager' | 'member', department: string) => {
    console.log('Inviting member:', { email, role, department });
    // In real app, send invitation email
    alert(`Invitation sent to ${email} as ${role} in ${department} department`);
    setShowInviteModal(false);
  };

  const handleUpdateMemberRole = (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
    alert(`Member role updated to ${newRole}`);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setMembers(prev => prev.filter(member => member.id !== memberId));
      alert('Member removed from organization');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const canManageMembers = currentUserRole === 'admin' || currentUserRole === 'manager';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage your organization's teams and members</p>
        </div>
        
        {canManageMembers && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'teams', label: 'Teams', icon: Target },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Teams</p>
                  <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Completion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(members.reduce((acc, m) => acc + m.completionRate, 0) / members.length)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {members.reduce((acc, m) => acc + m.goals, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { user: 'Emily Rodriguez', action: 'completed goal', target: 'Q1 Marketing Campaign', time: '2 hours ago' },
                { user: 'Mike Johnson', action: 'created team', target: 'Backend Infrastructure', time: '4 hours ago' },
                { user: 'David Kim', action: 'joined team', target: 'Sales Enablement', time: '6 hours ago' },
                { user: 'Lisa Wang', action: 'updated profile', target: '', time: '1 day ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <strong>{activity.user}</strong> {activity.action} {activity.target && <em>{activity.target}</em>}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Member</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Department</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Goals</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Completion</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Last Active</th>
                    {canManageMembers && (
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{member.department}</td>
                      <td className="py-4 px-6 text-gray-900">{member.goals}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${member.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{member.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(member.lastActive).toLocaleDateString()}
                      </td>
                      {canManageMembers && (
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  {canManageMembers && (
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{team.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Members</span>
                    <span className="font-medium">{team.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Completion</span>
                    <span className="font-medium">{team.avgCompletion}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Goals</span>
                    <span className="font-medium">{team.totalGoals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manager</span>
                    <span className="font-medium">{team.manager}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100">
                    View Team Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Team Performance Analytics</h3>
            
            {/* Department Performance */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Performance by Department</h4>
              {['Product', 'Engineering', 'Marketing', 'Sales', 'Design'].map((dept, index) => {
                const completion = [84, 78, 91, 68, 85][index];
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-gray-700">{dept}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12">{completion}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && currentUserRole === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Organization Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="Acme Corporation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Role for New Members
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="autoApprove" className="rounded" />
                <label htmlFor="autoApprove" className="text-sm text-gray-700">
                  Auto-approve new member requests
                </label>
              </div>
              
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleInviteMember(
                formData.get('email') as string,
                formData.get('role') as 'admin' | 'manager' | 'member',
                formData.get('department') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="colleague@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    {currentUserRole === 'admin' && <option value="admin">Admin</option>}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Product">Product</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 