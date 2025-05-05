const { Op } = require('sequelize');
const db = require('../models');
const Reservation = db.reservation;
const Room = db.room;

class SchedulerService {
  // Hủy đặt phòng nếu không check-in trong 30 phút
  async cancelMissedCheckins() {
    const now = new Date();
    
    try {
      // Tìm các đặt phòng "confirmed" đã quá 30 phút so với thời gian bắt đầu
      const overdueReservations = await Reservation.findAll({
        where: {
          status: 'confirmed',
          startTime: {
            [Op.lt]: new Date(now.getTime() - 30 * 60000) // 30 phút trước hiện tại
          }
        }
      });

      console.log(`Found ${overdueReservations.length} reservations to auto-cancel`);
      
      // Cập nhật trạng thái thành cancelled
      for (const reservation of overdueReservations) {
        await reservation.update({
          status: 'cancelled',
          notes: reservation.notes + "\nTự động hủy do không check-in trong 30 phút sau giờ bắt đầu."
        });
        
        console.log(`Auto-cancelled reservation #${reservation.id}`);
        
        // Cập nhật trạng thái phòng nếu cần
        const room = await Room.findByPk(reservation.roomId);
        if (room && room.status === 'occupied') {
          await room.update({ status: 'available' });
          console.log(`Updated room #${room.id} to available`);
        }
      }
      
      return overdueReservations.length;
    } catch (error) {
      console.error('Error in cancelMissedCheckins:', error);
      throw error;
    }
  }

  // Tự động check-out các đặt phòng đã quá giờ kết thúc
  async autoCheckout() {
    const now = new Date();
    
    try {
      // Tìm các đặt phòng "checked-in" đã quá thời gian kết thúc
      const overdueCheckouts = await Reservation.findAll({
        where: {
          status: 'checked-in',
          endTime: {
            [Op.lt]: now
          }
        }
      });

      console.log(`Found ${overdueCheckouts.length} reservations to auto-checkout`);
      
      // Cập nhật trạng thái thành completed
      for (const reservation of overdueCheckouts) {
        await reservation.update({
          status: 'completed',
          checkOutTime: now,
          notes: reservation.notes + "\nTự động check-out khi kết thúc thời gian."
        });
        
        console.log(`Auto-checked-out reservation #${reservation.id}`);
        
        // Cập nhật trạng thái phòng
        const room = await Room.findByPk(reservation.roomId);
        if (room) {
          await room.update({ status: 'available' });
          console.log(`Updated room #${room.id} to available`);
        }
      }
      
      return overdueCheckouts.length;
    } catch (error) {
      console.error('Error in autoCheckout:', error);
      throw error;
    }
  }

  // Chạy tất cả các công việc tự động
  async runAllTasks() {
    try {
      const cancelledCount = await this.cancelMissedCheckins();
      const checkedOutCount = await this.autoCheckout();
      
      return {
        cancelledCount,
        checkedOutCount
      };
    } catch (error) {
      console.error('Error running scheduled tasks:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService();