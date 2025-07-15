<template>
  <div class="staff-card">
    <div class="card-header">
      <h2>Staff Management</h2>
      <button @click="showAddForm = true" class="add-btn">
        <i class="fas fa-plus"></i> Add Staff
      </button>
    </div>

    <div class="filters">
      <select v-model="filterType" class="filter-select">
        <option value="all">All Staff</option>
        <option value="F">Full-time</option>
        <option value="P">Part-time</option>
      </select>
      <input v-model="searchQuery" placeholder="Search staff..." class="search-input">
    </div>

    <div v-if="loading" class="loading">Loading staff data...</div>

    <table v-else class="staff-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Contact</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="staff in filteredStaff" :key="staff.staffID">
          <td>{{ staff.staffID }}</td>
          <td>{{ staff.staffName }}</td>
          <td>{{ staff.staffRole }}</td>
          <td>{{ staff.staffContact }}</td>
          <td>
            <span :class="['type-badge', staff.staffType === 'F' ? 'full-time' : 'part-time']">
              {{ staff.staffType === 'F' ? 'Full-time' : 'Part-time' }}
            </span>
          </td>
          <td>
            <button @click="editStaff(staff)" class="action-btn edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="confirmDelete(staff.staffID)" class="action-btn delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Staff Modal -->
    <div v-if="showAddForm" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h3>{{ editing ? 'Edit Staff' : 'Add New Staff' }}</h3>
        <form @submit.prevent="submitStaff">
          <div class="form-group">
            <label>Name:</label>
            <input v-model="form.staffName" required>
          </div>
          <div class="form-group">
            <label>Role:</label>
            <input v-model="form.staffRole" required>
          </div>
          <div class="form-group">
            <label>Contact:</label>
            <input v-model="form.staffContact" required>
          </div>
          <div class="form-group">
            <label>Employment Type:</label>
            <div class="radio-group">
              <label>
                <input type="radio" v-model="form.staffType" value="F" required> Full-time
              </label>
              <label>
                <input type="radio" v-model="form.staffType" value="P"> Part-time
              </label>
            </div>
          </div>
          <button type="submit" class="submit-btn">
            {{ editing ? 'Update' : 'Add' }} Staff
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      staffList: [],
      loading: true,
      showAddForm: false,
      editing: false,
      filterType: 'all',
      searchQuery: '',
      form: {
        staffID: null,
        staffName: '',
        staffRole: '',
        staffContact: '',
        staffType: 'F'
      }
    };
  },
  computed: {
    filteredStaff() {
      return this.staffList.filter(staff => {
        const matchesType = this.filterType === 'all' || staff.staffType === this.filterType;
        const matchesSearch = staff.staffName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             staff.staffRole.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      });
    }
  },
  async mounted() {
    await this.fetchStaff();
  },
  methods: {
    async fetchStaff() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:3001/api/staff');
        this.staffList = response.data;
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        this.loading = false;
      }
    },
    editStaff(staff) {
      this.form = { ...staff };
      this.editing = true;
      this.showAddForm = true;
    },
    async submitStaff() {
      try {
        if (this.editing) {
          await axios.put(`http://localhost:3001/api/staff/${this.form.staffID}`, this.form);
        } else {
          await axios.post('http://localhost:3001/api/staff', this.form);
        }
        this.closeModal();
        await this.fetchStaff();
      } catch (error) {
        console.error('Error saving staff:', error);
      }
    },
    confirmDelete(staffID) {
      if (confirm('Are you sure you want to delete this staff member?')) {
        this.deleteStaff(staffID);
      }
    },
    async deleteStaff(staffID) {
      try {
        await axios.delete(`http://localhost:3001/api/staff/${staffID}`);
        await this.fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    },
    closeModal() {
      this.showAddForm = false;
      this.editing = false;
      this.form = {
        staffID: null,
        staffName: '',
        staffRole: '',
        staffContact: '',
        staffType: 'F'
      };
    }
  }
};
</script>

<style scoped>
.staff-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background: #6b3232;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-select, .search-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.staff-table {
  width: 100%;
  border-collapse: collapse;
}

.staff-table th, .staff-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.staff-table th {
  background-color: #6b3232;
  color: white;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.full-time {
  background-color: #d4edda;
  color: #155724;
}

.part-time {
  background-color: #fff3cd;
  color: #856404;
}

.action-btn {
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.edit {
  background-color: #ffc107;
  color: white;
}

.delete {
  background-color: #dc3545;
  color: white;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.radio-group {
  display: flex;
  gap: 15px;
  margin-top: 5px;
}

.submit-btn {
  background: #6b3232;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>