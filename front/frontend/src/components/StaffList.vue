<template>
  <div class="staff-card">
<div class="card-header">
  <h2>Staff Management</h2>
  <button 
    @click="showAddForm = true" 
    class="add-btn" 
    v-if="isFullTime"
  >
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
          <th>Supervisor</th>
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
          <td>{{ staff.supervisorName || '—' }}</td>
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
          <div class="form-group">
            <label>Supervisor:</label>
              <select v-model="form.supervisorID">
                <option :value="null">None</option>
                  <option 
                    v-for="s in staffList" 
                    :key="s.staffID" 
                    :value="s.staffID"
                    :disabled="s.staffID === form.staffID"
                  >
                    {{ s.staffName }}
                </option>
              </select>
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
      staffType: 'F',
      supervisorID: null
    },
    staff: null // ✅ current logged-in staff
  };
},
computed: {
  filteredStaff() {
    let result = this.staffList;

    if (this.filterType !== 'all') {
      result = result.filter(staff => staff.staffType === this.filterType);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(staff =>
        staff.staffName.toLowerCase().includes(query) ||
        staff.staffRole.toLowerCase().includes(query) ||
        staff.staffContact.toLowerCase().includes(query)
      );
    }

    return result;
  },
  isFullTime() {
    return this.staff?.staffType === 'F';
  }
},
async mounted() {
  const saved = localStorage.getItem('staff');
  if (saved) {
    this.staff = JSON.parse(saved);
  }
  await this.fetchStaff();
},
  methods: {
    async fetchStaff() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:3001/api/staff');
        
        // Ensure consistent property casing
        this.staffList = response.data.map(staff => ({
  staffID: staff.STAFFID || staff.staffID,
  staffName: staff.STAFFNAME || staff.staffName,
  staffRole: staff.STAFFROLE || staff.staffRole,
  staffContact: staff.STAFFCONTACT || staff.staffContact,
  staffType: staff.STAFFTYPE || staff.staffType,
  supervisorID: staff.SUPERVISORID || staff.supervisorID,
  supervisorName: staff.SUPERVISORNAME || staff.supervisorName,
  employmentType: staff.EMPLOYMENTTYPE || staff.employmentType
        }));
        
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        this.loading = false;
      }
    },
    async submitStaff() {
      try {
        if (this.editing) {
          await axios.put(`http://localhost:3001/api/staff/${this.form.staffID}`, this.form);
        } else {
          const response = await axios.post('http://localhost:3001/api/staff', this.form);
          
          // Add the new staff directly to the list
          this.staffList.unshift({
            staffID: response.data.staffID,
            staffName: this.form.staffName,
            staffRole: this.form.staffRole,
            staffContact: this.form.staffContact,
            staffType: this.form.staffType,
            supervisorID: this.form.supervisorID
          });
        }
        
        this.closeModal();
        
        // No need to fetch again since we updated locally
        // But you can uncomment this if you want to ensure data consistency
        // await this.fetchStaff();
        
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
        staffType: 'F',
        supervisorID: null
      };
    }
  }
};
</script>

<style scoped>
.staff-card {
  background: rgb(217, 104, 104);
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
  color: rgb(238, 149, 149);
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
  background-color: #612333;
  color: #dbe8de;
}

.part-time {
  background-color: #612333;
  color: #fcde82;
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
  background: rgb(232, 141, 141);
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
  width: 90%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.radio-group {
  display: flex;
  gap: 15px;
  margin-top: 5px;
  margin-left: 99px;
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