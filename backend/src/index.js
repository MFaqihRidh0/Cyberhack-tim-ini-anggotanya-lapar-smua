require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() }, message: 'Server berjalan' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/suppliers', require('./routes/suppliers.routes'));
app.use('/api/materials', require('./routes/materials.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/delivery-orders', require('./routes/deliveryOrders.routes'));
app.use('/api/raw-lots', require('./routes/rawLots.routes'));
app.use('/api/qc-inspections', require('./routes/qcInspections.routes'));
app.use('/api/production-orders', require('./routes/productionOrders.routes'));
app.use('/api/finished-lots', require('./routes/finishedLots.routes'));
app.use('/api/sample-dispatches', require('./routes/sampleDispatches.routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SimaTrack backend berjalan di port ${PORT}`);
});

module.exports = app;
