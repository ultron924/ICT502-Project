<template>
  <div class="card">
    <h2>{{ showStock ? 'Current Stock' : 'Current Orders' }}</h2>

    <!-- Tabs -->
    <div class="tabs">
      <button @click="showStock = false">🧾 Orders</button>
      <button @click="showStock = true">📦 Stock</button>
    </div>

    <!-- Filter for Orders -->
    <div v-if="!showStock" style="margin-bottom: 1rem;">
      <label>🔍 Filter by Customer:</label>
      <input v-model="orderFilter" placeholder="Type customer name..." />
      <input type="date" v-model="dateFilter" />
    </div>

    <!-- Orders Table -->
    <table v-if="!showStock">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Product</th>
          <th>Qty (kg)</th>
          <th>Subtotal (RM)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredOrders" :key="item.ORDERID + '-' + item.PRODUCTID">
          <td>{{ item.ORDERID }}</td>
          <td>{{ item.CUSTNAME }}</td>
          <td>{{ item.ORDERDATE }}</td>
          <td>{{ item.PRODUCTNAME }}</td>
          <td>{{ item.QUANTITY }}</td>
          <td>{{ item.SUBTOTAL }}</td>
          <td>
            <button @click="editOrder(item)">✏️</button>
            <button @click="deleteOrder(item.ORDERID)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Stock Table -->
    <table v-else>
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Name</th>
          <th>Price/kg (RM)</th>
          <th>Stock Qty</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in stocks" :key="stock.PRODUCTID">
          <td>{{ stock.PRODUCTID }}</td>
          <td>{{ stock.PRODUCTNAME }}</td>
          <td>{{ stock.PRICEKG }}</td>
          <td>{{ stock.STOCKQUANT }}</td>
          <td>
            <button @click="editStock(stock)">✏️</button>
            <button @click="deleteStock(stock.PRODUCTID)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      showStock: false,
      orders: [],
      stocks: [],
      orderFilter: '',
      dateFilter: ''
    };
  },
  async mounted() {
    try {
      const [orderRes, stockRes] = await Promise.all([
        axios.get('http://localhost:3001/api/orders'),
        axios.get('http://localhost:3001/api/products')
      ]);
      this.orders = orderRes.data;
      this.stocks = stockRes.data;
    } catch (err) {
      console.error('❌ Failed to fetch data:', err);
    }
  },
  computed: {
    filteredOrders() {
      const seen = new Set();
      return this.orders.filter(order => {
        const key = `${order.ORDERID}-${order.PRODUCTID}`;
        if (seen.has(key)) return false;
        seen.add(key);

        const matchCustomer = order.CUSTNAME.toLowerCase().includes(this.orderFilter.toLowerCase());

        const matchDate = !this.dateFilter || new Date(order.ORDERDATE).toISOString().slice(0, 10) === this.dateFilter;

        return matchCustomer && matchDate;
      });
    }
  },
  methods: {
    async editOrder(order) {
      const newQty = prompt("Enter new quantity (kg):", order.QUANTITY);
      if (!newQty || isNaN(newQty)) return;

      try {
        await axios.put(`http://localhost:3001/api/orders/${order.ORDERID}`, {
          productID: order.PRODUCTID,
          quantity: Number(newQty)
        });
        alert("✅ Order updated!");
        location.reload();
      } catch (err) {
        console.error("❌ Failed to update order:", err);
      }
    },
    async deleteOrder(orderID) {
      if (!confirm("Are you sure you want to delete this order?")) return;

      try {
        await axios.delete(`http://localhost:3001/api/orders/${orderID}`);
        alert("🗑️ Order deleted.");
        this.orders = this.orders.filter(o => o.ORDERID !== orderID);
      } catch (err) {
        console.error("❌ Failed to delete order:", err);
      }
    },
    async editStock(prod) {
      const newPrice = prompt("Enter new price (RM):", prod.PRICEKG);
      const newStock = prompt("Enter new stock quantity:", prod.STOCKQUANT);
      if (!newPrice || !newStock || isNaN(newPrice) || isNaN(newStock)) return;

      try {
        await axios.put(`http://localhost:3001/api/products/${prod.PRODUCTID}`, {
          priceKg: Number(newPrice),
          stockQty: Number(newStock)
        });
        alert("✅ Stock updated!");
        location.reload();
      } catch (err) {
        console.error("❌ Failed to update stock:", err);
      }
    },
    async deleteStock(productID) {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        await axios.delete(`http://localhost:3001/api/products/${productID}`);
        alert("🗑️ Product deleted.");
        this.stocks = this.stocks.filter(p => p.PRODUCTID !== productID);
      } catch (err) {
        console.error("❌ Failed to delete product:", err);
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
  color: white;
}
.tabs button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  background: #ddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.tabs button:hover {
  background: #ccc;
}
</style>