const reservationService = require('../services/reservation.service');

class ReservationController {
  async createReservation(req, res) {
    try {
      const reservationData = {
        ...req.body,
        userId: req.user.id // Lấy ID người dùng từ token
      };
      
      const reservation = await reservationService.createReservation(reservationData);
      
      res.status(201).json({
        success: true,
        message: 'Đặt phòng thành công',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(id);
      
      res.status(200).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateReservation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      const reservationData = req.body;
      
      const reservation = await reservationService.updateReservation(id, userId, reservationData, isAdmin);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật đặt phòng thành công',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelReservation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      await reservationService.cancelReservation(id, userId, isAdmin);
      
      res.status(200).json({
        success: true,
        message: 'Hủy đặt phòng thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserReservations(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      
      const reservations = await reservationService.getUserReservations(userId, status);
      
      res.status(200).json({
        success: true,
        data: reservations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async checkIn(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      const reservation = await reservationService.checkIn(id, userId, isAdmin);
      
      res.status(200).json({
        success: true,
        message: 'Check-in thành công',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async checkOut(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      const reservation = await reservationService.checkOut(id, userId, isAdmin);
      
      res.status(200).json({
        success: true,
        message: 'Check-out thành công',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin endpoints
  async getAllReservations(req, res) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        roomId: req.query.roomId
      };
      
      const reservations = await reservationService.getAllReservations(filters);
      
      res.status(200).json({
        success: true,
        data: reservations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReservationController();