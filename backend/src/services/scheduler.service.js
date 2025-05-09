const ReservationService = require('./reservation.service');
const RoomService = require('./room.service');
const models = require('../models');
const { Op } = require('sequelize');



class SchedulerService {
  // Hủy đặt phòng nếu không check-in trong 30 phút
  async cancelMissedCheckins() {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

    try {
      // Sử dụng phương thức mới để lấy các đặt phòng quá hạn check-in
      const overdueReservations = await ReservationService.getReservationsByStatusAndStartTime(
        'confirmed',
        null,  // Không cần startTimeFrom
        thirtyMinutesAgo,  // Lấy những đặt phòng đã bắt đầu cách đây hơn 30 phút
        {
          include: [{ model: models.Room, as: 'room' }]
        }
      );

      // Cập nhật trạng thái thành cancelled
      for (const reservation of overdueReservations) {
        // Cập nhật trạng thái reservation
        await ReservationService.updateReservation(reservation.id, {
          status: 'cancelled',
          notes: (reservation.notes ? reservation.notes + "\n" : "") + "Tự động hủy do không check-in trong 30 phút sau giờ bắt đầu."
        });
        
        
        // Cập nhật trạng thái phòng nếu cần
        if (reservation.roomId) {
          const room = await RoomService.getRoomById(reservation.roomId);
          if (room && room.status === 'occupied') {
            await RoomService.updateRoom(room.id, { status: 'available' });
            console.log(`Updated room #${room.id} to available`);
          }
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
    try {
      // Sử dụng phương thức mới để lấy các đặt phòng cần tự động check-out
      const overdueCheckouts = await ReservationService.getOverdueCheckedInReservations({
        include: [{ model: models.Room, as: 'room' }]
      });
  
      console.log(`Found ${overdueCheckouts.length} reservations to auto-checkout`);
      
      // Cập nhật trạng thái thành completed
      for (const reservation of overdueCheckouts) {
        // Sử dụng service để cập nhật
        await ReservationService.updateReservation(reservation.id, {
          status: 'completed',
          checkOutTime: new Date(),
          notes: (reservation.notes ? reservation.notes + "\n" : "") + "Tự động check-out khi kết thúc thời gian."
        });
        
        console.log(`Auto-checked-out reservation #${reservation.id}`);
        
        // Cập nhật trạng thái phòng
        if (reservation.roomId) {
          await RoomService.updateRoom(reservation.roomId, { status: 'available' });
          console.log(`Updated room #${reservation.roomId} to available`);
        }
      }
      
      return overdueCheckouts.length;
    } catch (error) {
      console.error('Error in autoCheckout:', error);
      throw error;
    }
  }

  // Phần còn lại của mã giữ nguyên
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