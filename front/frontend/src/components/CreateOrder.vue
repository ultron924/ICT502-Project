<template>
  <div class="card">
    <h2>Create Customer Order</h2>

    <form @submit.prevent="submitOrder">
      <label>Customer:</label>
      <select v-model="selectedCustomer" required>
        <option v-for="cust in customers" :key="cust.CUSTID" :value="cust.CUSTID">
          {{ cust.CUSTNAME }}
        </option>
      </select>

      <label>Product:</label>
      <select v-model="selectedProduct" required>
        <option v-for="prod in products" :key="prod.PRODUCTID" :value="prod.PRODUCTID">
          {{ prod.PRODUCTNAME }} (RM{{ prod.PRICEKG }}/kg)
        </option>
      </select>

      <label>Quantity (kg):</label>
      <input type="number" v-model.number="quantity" required min="1" />

      <button type="submit">Place Order</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      customers: [],
      products: [],
      selectedCustomer: '',
      selectedProduct: '',
      quantity: 1,
      message: ''
    };
  },
  async mounted() {
    const [custRes, prodRes] = await Promise.all([
      axios.get('http://localhost:3001/api/customer'),
      axios.get('http://localhost:3001/api/products')
    ]);
    this.customers = custRes.data;
    this.products = prodRes.data;
  },
  methods: {
    async submitOrder() {
      try {
        await axios.post('http://localhost:3001/api/order', {
          custID: this.selectedCustomer,
          productID: this.selectedProduct,
          quantity: this.quantity
          
        });
        this.message = '✅ Order placed successfully!';
      } catch (err) {
        this.message = '❌ Failed to place order.';
      }
    }
  }
};
</script>

<style scoped>
.card {
  padding: 1.5rem;
  border: 1px solid #6b3434;
  border-radius: 10px;
  background: #f27d7d;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
button {
  background: #27ae60;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
