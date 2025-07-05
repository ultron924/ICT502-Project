<template>
  <div class="container">
    <h1>📋 Oracle Table Viewer</h1>

    <div class="buttons">
      <button @click="loadTable('staff')">Show Staff</button>
      <button @click="loadTable('customer')">Show Customer</button>
      <button @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '➕ Add Record' }}
      </button>
    </div>

    <div v-if="showForm" class="form-section">
      <label>
        Type:
        <select v-model="formType">
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </label>

      <!-- Staff Form -->
      <div v-if="formType === 'staff'" class="form-group">
        <input v-model="form.staffID" placeholder="Staff ID" />
        <input v-model="form.staffName" placeholder="Staff Name" />
        <input v-model="form.staffRole" placeholder="Staff Role" />
        <input v-model="form.staffContact" placeholder="Staff Contact" />
      </div>

      <!-- Customer Form -->
      <div v-if="formType === 'customer'" class="form-group">
        <input v-model="form.custID" placeholder="Customer ID" />
        <input v-model="form.custName" placeholder="Customer Name" />
        <input v-model="form.custPhone" placeholder="Customer Phone" />
        <input v-model="form.custAddress" placeholder="Customer Address" />
      </div>

      <button @click="submitForm">Submit</button>
    </div>

    <div v-if="loading">⏳ Loading...</div>

    <table v-else-if="data.length">
      <thead>
        <tr>
          <th v-for="(val, key) in data[0]" :key="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in data" :key="i">
          <td v-for="(val, key) in row" :key="key">{{ val }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>No data loaded</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const data = ref([])
const loading = ref(false)
const showForm = ref(false)
const formType = ref('staff')
const form = ref({})

async function loadTable(type) {
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:3001/api/${type}`)
    data.value = res.data
  } catch (err) {
    console.error('Fetch failed:', err)
    data.value = []
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  try {
    await axios.post(`http://localhost:3001/api/${formType.value}`, form.value)
    alert(`${formType.value} added successfully!`)
    form.value = {}  // clear form
    showForm.value = false
    loadTable(formType.value) // reload table
  } catch (err) {
    console.error('Insert failed:', err)
    alert('Insert failed. See console for error.')
  }
}
</script>

<style>
.container {
  padding: 2rem;
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: auto;
}
.buttons button {
  margin-right: 10px;
  margin-bottom: 1rem;
  padding: 0.6rem 1.2rem;
}
input, select {
  display: block;
  margin: 0.5rem 0;
  padding: 0.6rem;
  width: 100%;
  max-width: 400px;
}
.form-section {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #e47171;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  padding: 0.75rem;
  border: 1px solid #ccc;
  text-align: left;
}
th {
  background-color: #6b8bf4;
}
</style>