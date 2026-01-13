<template>
    <div class="page-container">
        <header class="page-header">
            <div class="header-content">
                <button class="back-btn" @click="$router.go(-1)">← Back</button>
                <div class="header-text">
                    <h1>User Management</h1>
                    <p>Manage all participants and accounts</p>
                </div>
            </div>
            <button class="add-user-btn" @click="showAddUserModal = true">
                + Add User
            </button>
        </header>

        <!-- Search and Filters -->
        <div class="controls-section">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search by name, email, or contact..." v-model="searchQuery"
                    class="search-input" />
            </div>

            <div class="filters">
                <button v-for="role in roles" :key="role.value"
                    :class="['filter-btn', { active: selectedRole === role.value }]" @click="selectedRole = role.value">
                    <span class="filter-icon">{{ role.icon }}</span>
                    {{ role.label }}
                    <span class="filter-count">{{ role.count }}</span>
                </button>
            </div>

            <div class="secondary-filters">
                <select v-model="membershipFilter" class="select-filter">
                    <option value="all">All Memberships</option>
                    <option value="basic">Basic</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                </select>

                <select v-model="statusFilter" class="select-filter">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>

                <button class="export-btn" @click="exportUsers">
                    📊 Export to Excel
                </button>
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="stats-bar">
            <div class="stat-item">
                <span class="stat-label">Total Users</span>
                <strong class="stat-value">{{ totalUsers }}</strong>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <span class="stat-label">Active This Week</span>
                <strong class="stat-value active">{{ activeThisWeek }}</strong>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <span class="stat-label">Pending Approval</span>
                <strong class="stat-value pending">{{ pendingApproval }}</strong>
            </div>
        </div>

        <!-- Users Table -->
        <div class="table-container">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
                        </th>
                        <th @click="sortBy('name')">
                            Name
                            <span class="sort-icon">{{ getSortIcon('name') }}</span>
                        </th>
                        <th @click="sortBy('role')">
                            Role
                            <span class="sort-icon">{{ getSortIcon('role') }}</span>
                        </th>
                        <th>Contact</th>
                        <th>Membership</th>
                        <th @click="sortBy('createdAt')">
                            Joined
                            <span class="sort-icon">{{ getSortIcon('createdAt') }}</span>
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id"
                        :class="['user-row', { selected: selectedUsers.includes(user.id) }]">
                        <td>
                            <input type="checkbox" :value="user.id" v-model="selectedUsers" />
                        </td>
                        <td>
                            <div class="user-info">
                                <div class="user-avatar" :style="{ background: user.avatarColor }">
                                    {{ user.initials }}
                                </div>
                                <div class="user-details">
                                    <strong class="user-name">{{ user.name }}</strong>
                                    <span class="user-email">{{ user.email }}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span :class="['role-badge', user.role]">
                                {{ getRoleIcon(user.role) }} {{ formatRole(user.role) }}
                            </span>
                        </td>
                        <td class="contact-cell">
                            <div class="contact-info">
                                <span>📞 {{ user.contactNo }}</span>
                                <span v-if="user.emergencyContact" class="emergency-contact">
                                    🚨 {{ user.emergencyContact }}
                                </span>
                            </div>
                        </td>
                        <td>
                            <span :class="['membership-badge', user.membership]">
                                {{ getMembershipIcon(user.membership) }} {{ user.membership }}
                            </span>
                        </td>
                        <td class="date-cell">
                            {{ formatDate(user.createdAt) }}
                        </td>
                        <td>
                            <span :class="['status-badge', user.status]">
                                {{ user.status }}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view" @click="viewUser(user)">
                                    👁️
                                </button>
                                <button class="action-btn edit" @click="editUser(user)">
                                    ✏️
                                </button>
                                <button class="action-btn more" @click="showUserMenu(user)">
                                    ⋯
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="filteredUsers.length === 0" class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No users found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        </div>

        <!-- Bulk Actions Bar (shown when users are selected) -->
        <transition name="slide-up">
            <div v-if="selectedUsers.length > 0" class="bulk-actions-bar">
                <div class="bulk-info">
                    <span class="bulk-count">{{ selectedUsers.length }} selected</span>
                    <button class="bulk-clear" @click="selectedUsers = []">Clear</button>
                </div>
                <div class="bulk-buttons">
                    <button class="bulk-btn" @click="bulkExport">📊 Export</button>
                    <button class="bulk-btn" @click="bulkEmail">✉️ Send Email</button>
                    <button class="bulk-btn danger" @click="bulkDeactivate">🚫 Deactivate</button>
                </div>
            </div>
        </transition>

        <!-- Pagination -->
        <div class="pagination">
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
                ← Previous
            </button>
            <div class="page-numbers">
                <button v-for="page in totalPages" :key="page"
                    :class="['page-number', { active: currentPage === page }]" @click="currentPage = page">
                    {{ page }}
                </button>
            </div>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                Next →
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// State
const searchQuery = ref('');
const selectedRole = ref('all');
const membershipFilter = ref('all');
const statusFilter = ref('all');
const sortField = ref('name');
const sortDirection = ref('asc');
const selectAll = ref(false);
const selectedUsers = ref([]);
const currentPage = ref(1);
const itemsPerPage = 20;
const showAddUserModal = ref(false);

// Mock data - replace with API calls
const users = ref([
    {
        id: '1',
        name: 'Sarah Tan',
        email: 'sarah.tan@email.com',
        contactNo: '+65 9123 4567',
        emergencyContact: '+65 9876 5432',
        role: 'beneficiary',
        membership: 'gold',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        initials: 'ST',
        avatarColor: '#3b82f6'
    },
    {
        id: '2',
        name: 'John Lee',
        email: 'john.lee@email.com',
        contactNo: '+65 8234 5678',
        role: 'volunteer',
        membership: 'platinum',
        status: 'active',
        createdAt: new Date('2023-11-20'),
        initials: 'JL',
        avatarColor: '#8b5cf6'
    },
    {
        id: '3',
        name: 'Mary Wong',
        email: 'mary.wong@email.com',
        contactNo: '+65 9345 6789',
        emergencyContact: '+65 8765 4321',
        role: 'caregiver',
        membership: 'silver',
        status: 'active',
        createdAt: new Date('2024-02-10'),
        initials: 'MW',
        avatarColor: '#f59e0b'
    },
    {
        id: '4',
        name: 'David Lim',
        email: 'david.lim@email.com',
        contactNo: '+65 9456 7890',
        role: 'beneficiary',
        membership: 'basic',
        status: 'pending',
        createdAt: new Date('2025-01-12'),
        initials: 'DL',
        avatarColor: '#10b981'
    },
    {
        id: '5',
        name: 'Emily Chen',
        email: 'emily.chen@email.com',
        contactNo: '+65 8567 8901',
        role: 'volunteer',
        membership: 'gold',
        status: 'active',
        createdAt: new Date('2024-03-05'),
        initials: 'EC',
        avatarColor: '#ec4899'
    },
]);

const roles = computed(() => [
    { value: 'all', label: 'All Users', icon: '👥', count: users.value.length },
    { value: 'beneficiary', label: 'Beneficiaries', icon: '👤', count: users.value.filter(u => u.role === 'beneficiary').length },
    { value: 'caregiver', label: 'Caregivers', icon: '👨‍👩‍👧', count: users.value.filter(u => u.role === 'caregiver').length },
    { value: 'volunteer', label: 'Volunteers', icon: '🌟', count: users.value.filter(u => u.role === 'volunteer').length },
    { value: 'staff', label: 'Staff', icon: '⚙️', count: users.value.filter(u => u.role === 'staff').length },
]);

// Computed
const filteredUsers = computed(() => {
    let result = users.value;

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.contactNo.includes(query)
        );
    }

    // Role filter
    if (selectedRole.value !== 'all') {
        result = result.filter(user => user.role === selectedRole.value);
    }

    // Membership filter
    if (membershipFilter.value !== 'all') {
        result = result.filter(user => user.membership === membershipFilter.value);
    }

    // Status filter
    if (statusFilter.value !== 'all') {
        result = result.filter(user => user.status === statusFilter.value);
    }

    // Sort
    result.sort((a, b) => {
        let comparison = 0;
        if (sortField.value === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (sortField.value === 'role') {
            comparison = a.role.localeCompare(b.role);
        } else if (sortField.value === 'createdAt') {
            comparison = a.createdAt - b.createdAt;
        }
        return sortDirection.value === 'asc' ? comparison : -comparison;
    });

    return result;
});

const totalUsers = computed(() => users.value.length);
const activeThisWeek = computed(() => users.value.filter(u => u.status === 'active').length);
const pendingApproval = computed(() => users.value.filter(u => u.status === 'pending').length);
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));

// Methods
const sortBy = (field) => {
    if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortField.value = field;
        sortDirection.value = 'asc';
    }
};

const getSortIcon = (field) => {
    if (sortField.value !== field) return '⇅';
    return sortDirection.value === 'asc' ? '↑' : '↓';
};

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedUsers.value = filteredUsers.value.map(u => u.id);
    } else {
        selectedUsers.value = [];
    }
};

const getRoleIcon = (role) => {
    const icons = {
        beneficiary: '👤',
        caregiver: '👨‍👩‍👧',
        volunteer: '🌟',
        staff: '⚙️'
    };
    return icons[role] || '👤';
};

const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const getMembershipIcon = (membership) => {
    const icons = {
        basic: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💎'
    };
    return icons[membership] || '🥉';
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const viewUser = (user) => {
    console.log('View user:', user);
    // Navigate to user detail page
};

const editUser = (user) => {
    console.log('Edit user:', user);
    // Open edit modal
};

const showUserMenu = (user) => {
    console.log('Show menu for:', user);
    // Show context menu
};

const exportUsers = () => {
    console.log('Exporting users...');
    // Export to Excel logic
};

const bulkExport = () => {
    console.log('Bulk export:', selectedUsers.value);
};

const bulkEmail = () => {
    console.log('Send bulk email:', selectedUsers.value);
};

const bulkDeactivate = () => {
    if (confirm(`Are you sure you want to deactivate ${selectedUsers.value.length} users?`)) {
        console.log('Bulk deactivate:', selectedUsers.value);
        selectedUsers.value = [];
    }
};
</script>

<style scoped>
.page-container {
    padding: 24px 20px;
    max-width: 1400px;
    margin: 0 auto;
    background: #f8fafc;
    min-height: 100vh;
}

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 20px;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.back-btn {
    background: none;
    border: none;
    color: #64748b;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    transition: color 0.2s;
}

.back-btn:hover {
    color: #1e293b;
}

.header-text h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
}

.header-text p {
    font-size: 15px;
    color: #64748b;
    margin: 4px 0 0 0;
}

.add-user-btn {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(30, 41, 59, 0.2);
    white-space: nowrap;
}

.add-user-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(30, 41, 59, 0.3);
}

/* Controls Section */
.controls-section {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 20px;
    transition: all 0.2s;
}

.search-box:focus-within {
    border-color: #1e293b;
    background: white;
}

.search-icon {
    font-size: 20px;
}

.search-input {
    flex: 1;
    border: none;
    background: none;
    font-size: 15px;
    outline: none;
    color: #0f172a;
}

.search-input::placeholder {
    color: #94a3b8;
}

.filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.filter-btn {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-btn:hover {
    border-color: #cbd5e1;
    background: white;
}

.filter-btn.active {
    background: #1e293b;
    border-color: #1e293b;
    color: white;
}

.filter-icon {
    font-size: 16px;
}

.filter-count {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
}

.filter-btn.active .filter-count {
    background: rgba(255, 255, 255, 0.2);
}

.secondary-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.select-filter {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.select-filter:hover {
    border-color: #cbd5e1;
    background: white;
}

.export-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.export-btn:hover {
    background: #059669;
    transform: translateY(-1px);
}

/* Stats Bar */
.stats-bar {
    background: white;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}

.stat-value {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
}

.stat-value.active {
    color: #10b981;
}

.stat-value.pending {
    color: #f59e0b;
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: #e2e8f0;
}

/* Table */
.table-container {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 20px;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
}

.users-table thead {
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
}

.users-table th {
    padding: 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    user-select: none;
}

.users-table th:hover {
    background: #f1f5f9;
}

.sort-icon {
    margin-left: 6px;
    font-size: 12px;
    opacity: 0.5;
}

.users-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s;
}

.users-table tbody tr:hover {
    background: #f8fafc;
}

.users-table tbody tr.selected {
    background: #eff6ff;
}

.users-table td {
    padding: 16px;
    font-size: 14px;
    color: #1e293b;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-weight: 700;
    color: #0f172a;
}

.user-email {
    font-size: 13px;
    color: #64748b;
}

.role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
}

.role-badge.beneficiary {
    background: #dbeafe;
    color: #1e40af;
}

.role-badge.caregiver {
    background: #fef3c7;
    color: #b45309;
}

.role-badge.volunteer {
    background: #f3e8ff;
    color: #7c3aed;
}

.role-badge.staff {
    background: #f1f5f9;
    color: #475569;
}

.contact-cell {
    min-width: 160px;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
}

.emergency-contact {
    color: #dc2626;
    font-weight: 600;
}

.membership-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-transform: capitalize;
}

.membership-badge.basic {
    background: #f1f5f9;
    color: #64748b;
}

.membership-badge.silver {
    background: #e2e8f0;
    color: #475569;
}

.membership-badge.gold {
    background: #fef3c7;
    color: #b45309;
}

.membership-badge.platinum {
    background: #ddd6fe;
    color: #6d28d9;
}

.date-cell {
    color: #64748b;
    font-size: 13px;
}

.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
}

.status-badge.active {
    background: #d1fae5;
    color: #059669;
}

.status-badge.inactive {
    background: #f1f5f9;
    color: #64748b;
}

.status-badge.pending {
    background: #fef3c7;
    color: #d97706;
}

.action-buttons {
    display: flex;
    gap: 6px;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.action-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
}

/* Empty State */
.empty-state {
    padding: 60px 20px;
    text-align: center;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-state h3 {
    font-size: 20px;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.empty-state p {
    color: #64748b;
    margin: 0;
}

/* Bulk Actions Bar */
.bulk-actions-bar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    border-radius: 16px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.bulk-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bulk-count {
    font-weight: 700;
}

.bulk-clear {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.bulk-clear:hover {
    background: rgba(255, 255, 255, 0.15);
}

.bulk-buttons {
    display: flex;
    gap: 10px;
}

.bulk-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.bulk-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
}

.bulk-btn.danger {
    background: #dc2626;
    border-color: #dc2626;
}

.bulk-btn.danger:hover {
    background: #b91c1c;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 20px 0;
}

.page-btn {
    background: white;
    border: 1px solid #e2e8f0;
    color: #64748b;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    border-color: #1e293b;
    color: #1e293b;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    gap: 6px;
}

.page-number {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.page-number:hover {
    border-color: #1e293b;
    color: #1e293b;
}

.page-number.active {
    background: #1e293b;
    border-color: #1e293b;
    color: white;
}

/* Responsive */
@media (max-width: 1200px) {
    .users-table {
        font-size: 13px;
    }

    .users-table th,
    .users-table td {
        padding: 12px;
    }
}

@media (max-width: 768px) {
    .page-container {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
    }

    .add-user-btn {
        width: 100%;
    }

    .stats-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .stat-divider {
        display: none;
    }

    .table-container {
        overflow-x: auto;
    }

    .users-table {
        min-width: 900px;
    }

    .bulk-actions-bar {
        flex-direction: column;
        gap: 16px;
        width: calc(100% - 40px);
        left: 20px;
        transform: none;
    }

    .bulk-buttons {
        width: 100%;
        flex-direction: column;
    }

    .bulk-btn {
        width: 100%;
    }
}
</style>

