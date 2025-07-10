<template>
  <div class="card">
    <h2>Purchase Stock</h2>

    <form @submit.prevent="submitPurchase">
      <label>Supplier:</label>
      <select v-model="selectedSupplier" required>
        <option v-for="sup in suppliers" :key="sup.SUPPLIERID" :value="sup.SUPPLIERID">
          {{ sup.SUPPNAME }}
        </option>
      </select>

      <label>Product:</label>
      <select v-model="selectedProduct" required>
        <option v-for="prod in products" :key="prod.PRODUCTID" :value="prod.PRODUCTID">
          {{ prod.PRODUCTNAME }}
        </option>
      </select>

      <label>Quantity (kg):</label>
      <input type="number" v-model.number="quantity" required min="1" />

      <label>Cost/kg (RM):</label>
      <input type="number" v-model.number="cost" required min="0.01" step="0.01" />

      <button type="submit">Submit Purchase</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      suppliers: [],
      products: [],
      selectedSupplier: '',
      selectedProduct: '',
      quantity: 1,
      cost: 0,
      message: ''
    };
  },
  async mounted() {
    const [supRes, prodRes] = await Promise.all([
      axios.get('http://localhost:3001/api/suppliers'),
      axios.get('http://localhost:3001/api/products')
    ]);
    this.suppliers = supRes.data;
    this.products = prodRes.data;
  },
  methods: {
    async submitPurchase() {
  try {
    const staff = JSON.parse(localStorage.getItem('staff')) || {};

    await axios.post('http://localhost:3001/api/purchase', {
      supplierID: this.selectedSupplier,
      productID: this.selectedProduct,
      quantity: this.quantity,
      cost: this.cost
    }, {
      headers: {
        'x-user': JSON.stringify(staff)
      }
    });

    this.message = '✅ Purchase successful!';
  } catch (err) {
    this.message = '❌ Failed to record purchase.';
  }
}
  }
};
</script>

<style scoped>
.card {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f27d7d;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
button {
  background: #3498db;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
