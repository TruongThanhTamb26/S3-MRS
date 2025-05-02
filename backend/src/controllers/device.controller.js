const { Room } = require('../models');
const roomService = require('../services/room.service');

class DeviceController {
  constructor() {
    // Bind methods để bảo toàn context
    this.getDevicesByRoomId = this.getDevicesByRoomId.bind(this);
    this.updateDeviceByRoomId = this.updateDeviceByRoomId.bind(this);
  }  

  async getDevicesByRoomId(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng học'
        });
      }
      
      // Trả về trực tiếp trường equipment từ room
      let equipment = room.equipment;
      
      // Chuyển đổi từ chuỗi JSON nếu cần
      if (typeof equipment === 'string') {
        equipment = JSON.parse(equipment);
      }
      
      res.status(200).json({
        success: true,
        data: equipment
      });
    } catch (error) {
      console.error('Error fetching devices by room ID:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi truy vấn thiết bị'
      });
    }
  }

  async updateDeviceByRoomId(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);

      const deviceUpdates = req.body;

      if (!deviceUpdates || Object.keys(deviceUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Thông tin thiết bị không được để trống'
        });
      }
    
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng học'
        });
      }
      
      // Lấy và chuẩn bị dữ liệu equipment
      let equipment = room.equipment;
      if (typeof equipment === 'string') {
        equipment = JSON.parse(equipment);
      }
      
      // Cập nhật số lượng cho từng thiết bị
      for (const [deviceName, quantity] of Object.entries(deviceUpdates)) {
        equipment[deviceName] = quantity;
      }
      
      // Cập nhật lại trường equipment trong cơ sở dữ liệu
      await roomService.updateRoom(roomId, {equipment});
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật số lượng thiết bị thành công',
        data: equipment
      });
    } catch (error) {
      console.error('Error updating devices by room ID:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật thiết bị'
      });
    }
  }
}

module.exports = new DeviceController();