const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: false },
  price: { type: Number },
  promoPercent: { type: Number, default: 0 },
  images: [{ type: String }],
  videos: [{ type: String }],
  isActive: { type: Boolean, default: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { 
    type: String, 
    enum: [
      'Điện Lạnh', 
      'Máy Giặt', 
      'Điện Gia Dụng', 
      'Hệ Thống Điện', 
      'Sửa Xe Đạp', 
      'Sửa Xe Máy', 
      'Sửa Xe Oto', 
      'Sửa Xe Điện',
      'Dịch Vụ Vận Chuyển'
    ], 
    default: 'Điện Lạnh' 
  },
  // Vehicle specifications for drivers (Dịch Vụ Vận Chuyển)
  vehicleSpecs: {
    loadCapacity: { type: Number }, // Tải trọng (kg)
    truckBedDimensions: {
      length: { type: Number }, // Chiều dài thùng xe (m)
      width: { type: Number },  // Chiều rộng thùng xe (m)
      height: { type: Number }  // Chiều cao thùng xe (m)
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
