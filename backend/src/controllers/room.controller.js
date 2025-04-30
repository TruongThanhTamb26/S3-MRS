const roomService = require('../services/room.service');

class RoomController {
  async getAllRooms(req, res) {
    try {
      const filters = {
        status: req.query.status,
        capacity: req.query.capacity ? parseInt(req.query.capacity) : null,
        roomType: req.query.roomType
      };
      
      const rooms = await roomService.getAllRooms(filters);
      
      res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);
      
      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createRoom(req, res) {
    try {
      const roomData = req.body;
      const room = await roomService.createRoom(roomData);
      
      res.status(201).json({
        success: true,
        message: 'Tạo phòng học thành công',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const roomData = req.body;
      const room = await roomService.updateRoom(id, roomData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật phòng học thành công',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      const result = await roomService.deleteRoom(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateRoomStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const room = await roomService.updateRoomStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái phòng thành công',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async findAvailableRooms(req, res) {
    try {
      const { startTime, endTime, capacity } = req.query;
      
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin thời gian'
        });
      }
      
      const rooms = await roomService.findAvailableRooms(
        startTime,
        endTime,
        capacity ? parseInt(capacity) : 1
      );
      
      res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RoomController();