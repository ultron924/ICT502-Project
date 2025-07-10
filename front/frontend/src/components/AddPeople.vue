<template>
  <div class="card">
    <h2>Add New Customer</h2>
    <form @submit.prevent="addCustomer">
      <input v-model="custName" placeholder="Name" required />
      <input v-model="custPhone" placeholder="Phone" required />
      <input v-model="custAddress" placeholder="Address" required />
      <button type="submit">Add Customer</button>
      <p v-if="custMessage">{{ custMessage }}</p>
    </form>

    <hr style="margin: 20px 0;" />

    <h2>Add New Staff</h2>
    <form @submit.prevent="addStaff">
      <input v-model="staffName" placeholder="Name" required />
      <input v-model="staffRole" placeholder="Role" required />
      <input v-model="staffContact" placeholder="Contact" required />
      <button type="submit">Add Staff</button>
      <p v-if="staffMessage">{{ staffMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Customer form
      custName: '',
      custPhone: '',
      custAddress: '',
      custMessage: '',

      // Staff form
      staffName: '',
      staffRole: '',
      staffContact: '',
      staffMessage: ''
    };
  },
  methods: {
    async addCustomer() {
      try {
        const id = Date.now();
        await axios.post('http://localhost:3001/api/customer', {
          custName: this.custName,
          custPhone: this.custPhone,
          custAddress: this.custAddress
        });
        this.custMessage = '✅ Customer added!';
        this.custName = this.custPhone = this.custAddress = '';
      } catch (err) {
        console.error(err);
        this.custMessage = '❌ Failed to add customer.';
      }
    },

    async addStaff() {
      try {
        const id = Date.now();
        await axios.post('http://localhost:3001/api/staff', {
          staffName: this.staffName,
          staffRole: this.staffRole,
          staffContact: this.staffContact
        });
        this.staffMessage = '✅ Staff added!';
        this.staffName = this.staffRole = this.staffContact = '';
      } catch (err) {
        console.error(err);
        this.staffMessage = '❌ Failed to add staff.';
      }
    }
  }
};
</script>

<style>
.card {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f27d7d;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ccc;
}
thead {
  background-color: #493030;
}
</style>