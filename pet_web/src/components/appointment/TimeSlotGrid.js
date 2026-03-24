import React, { useMemo, useEffect, useState } from 'react';
import { Card, Badge, Empty, Spin } from 'antd';
import styled from 'styled-components';
import dayjs from '../../utils/dayjs';

// Simple styled components
const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const TimeSlot = styled.div`
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  border: 2px solid;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  
  /* Enhanced color logic - Order: Selected > Being Selected by Others > Pet Busy > Staff Busy > Past > Available */
  border-color: ${props => 
    props.selected ? '#1890ff' :
    props.beingSelectedByOthers ? '#722ed1' :
    props.petBusy ? '#ff4d4f' :
    props.staffBusy && !props.petBusy ? '#fa8c16' :
    props.past ? '#d9d9d9' : '#52c41a'
  };
  
  background-color: ${props => 
    props.selected ? '#e6f7ff' :
    props.beingSelectedByOthers ? '#f9f0ff' :
    props.petBusy ? '#fff1f0' :
    props.staffBusy && !props.petBusy ? '#fff7e6' :
    props.past ? '#f5f5f5' : '#f6ffed'
  };
  
  color: ${props => 
    props.selected ? '#1890ff' :
    props.beingSelectedByOthers ? '#722ed1' :
    props.petBusy ? '#ff4d4f' :
    props.staffBusy && !props.petBusy ? '#fa8c16' :
    props.past ? '#bfbfbf' : '#52c41a'
  };
  
  &:hover {
    opacity: ${props => props.disabled ? 0.7 : 0.8};
  }
  
  /* Pulsing animation for slots being selected by others */
  ${props => props.beingSelectedByOthers && `
    animation: pulse 2s infinite;
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `}
`;

const OtherUserIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #722ed1;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const TimeSlotGrid = ({
  selectedDate,
  selectedService,
  selectedSlot,
  petBusyTimeSlots = [],
  petAppointments = [],
  selectedStaffId,
  appointments = [],
  availableSlots = [],
  onSelectTimeSlot,
  loading = false,
  // New SignalR props
  signalRConnection = null,
  currentUserId = null,
  onSlotHover = null, // Optional: for hover effects
}) => {
  // State để track những slot đang được người khác chọn
  const [otherUsersSelections, setOtherUsersSelections] = useState({});
  
  // State để track SignalR connection status
  const [signalRStatus, setSignalRStatus] = useState('disconnected');
  
  // Debug staff data on component render
  console.log('🎯 [TimeSlotGrid] Received props:');
  console.log('   - selectedStaffId:', selectedStaffId);
  console.log('   - appointments.length:', appointments.length);
  console.log('   - availableSlots.length:', availableSlots.length);
  console.log('   - signalRConnection:', !!signalRConnection);
  console.log('   - signalRConnection state:', signalRConnection?.state);
  console.log('   - currentUserId:', currentUserId);
  console.log('   - selectedService:', selectedService);
  console.log('   - selectedDate:', selectedDate);
  
  // Debug: Make signalRService available globally for testing
  if (typeof window !== 'undefined') {
    try {
      const signalRServiceModule = require('../../services/signalrService');
      window.signalRService = signalRServiceModule.default || signalRServiceModule;
      console.log('🔧 [TimeSlotGrid] SignalR service attached to window:', !!window.signalRService);
    } catch (error) {
      console.error('❌ [TimeSlotGrid] Failed to attach SignalR service to window:', error);
    }
  }
  
  // Get service duration
  const serviceDuration = selectedService?.duration || 30;

  // SignalR Effect - Setup real-time listeners
  useEffect(() => {
    console.log('🔄 [TimeSlotGrid] SignalR useEffect triggered');
    
    if (!signalRConnection || !selectedService) {
      console.log('🔌 [TimeSlotGrid] Missing required props for SignalR:', {
        hasConnection: !!signalRConnection,
        hasService: !!selectedService,
        connectionState: signalRConnection?.state
      });
      return;
    }

    // ⚠️ NEW: SignalR chỉ hoạt động khi có chọn nhân viên cụ thể
    if (!selectedStaffId) {
      console.log('🔌 [TimeSlotGrid] No specific staff selected - SignalR disabled for general booking');
      return;
    }

    // Check connection state
    const connectionState = signalRConnection.state;
    console.log('🔌 [TimeSlotGrid] SignalR connection state:', connectionState);
    
    // ✅ IMPROVED: Better connection state handling
    const setupSignalRListeners = () => {
      console.log('🔌 [TimeSlotGrid] Setting up SignalR listeners');

      // Join room cho dịch vụ và nhân viên cụ thể
      const roomKey = `service_${selectedService.id || selectedService.serviceId}_staff_${selectedStaffId}_date_${selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}`;
      
      console.log('🏠 [TimeSlotGrid] Joining room:', roomKey);
      
      // ✅ IMPROVED: Add timeout and retry logic for room joining
      const joinRoom = async (retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            if (signalRConnection.state === 'Connected') {
              await signalRConnection.invoke('JoinTimeSlotRoom', roomKey);
              console.log(`✅ [SignalR] Joined room: ${roomKey} (attempt ${attempt})`);
              return true;
            } else {
              console.log(`⚠️ [SignalR] Connection not ready on attempt ${attempt}, state: ${signalRConnection.state}`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
          } catch (err) {
            console.error(`❌ [SignalR] Failed to join room attempt ${attempt}:`, err);
            if (attempt === retries) {
              console.error('❌ [SignalR] All join room attempts failed');
              return false;
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
        return false;
      };
      
      joinRoom();

      // Listen for other users selecting time slots
      const handleTimeSlotSelected = (data) => {
        console.log('📡 [SignalR] Received timeSlotSelected:', data);
        console.log('📡 [SignalR] Current userId:', currentUserId, 'Event userId:', data.userId);
        
        // ✅ FIXED: Ensure we have the data fields we need
        if (!data || !data.timeSlot || !data.userId) {
          console.error('❌ [SignalR] Invalid timeSlotSelected data:', data);
          return;
        }
        
        if (data.userId !== currentUserId) {
          console.log('✅ [SignalR] Adding other user selection:', data.timeSlot);
          
          setOtherUsersSelections(prev => {
            const newState = {
              ...prev,
              [data.timeSlot]: {
                userId: data.userId,
                timestamp: new Date()
              }
            };
            console.log('📊 [STATE] Updated otherUsersSelections:', newState);
            console.log('📊 [STATE] Total active selections:', Object.keys(newState).length);
            return newState;
          });

          // Auto-clear sau 15 giây để tránh slot bị "stuck" (increased from 10s)
          const clearTimeout = setTimeout(() => {
            console.log('⏰ [SignalR] Auto-clearing slot:', data.timeSlot, 'after 15 seconds');
            setOtherUsersSelections(prev => {
              const newState = { ...prev };
              delete newState[data.timeSlot];
              console.log('📊 [STATE] Auto-cleared otherUsersSelections:', newState);
              return newState;
            });
          }, 15000);
          
          // Store timeout ID for potential cleanup
          window.timeSlotTimeouts = window.timeSlotTimeouts || {};
          window.timeSlotTimeouts[data.timeSlot] = clearTimeout;
        } else {
          console.log('⚠️ [SignalR] Ignoring own selection event');
        }
      };

      // Listen for other users clearing selections
      const handleTimeSlotCleared = (data) => {
        console.log('📡 [SignalR] Received timeSlotCleared:', data);
        console.log('📡 [SignalR] Current userId:', currentUserId, 'Event userId:', data.userId);
        
        if (data.userId !== currentUserId) {
          console.log('🧹 [SignalR] Clearing other user selection:', data.timeSlot);
          
          setOtherUsersSelections(prev => {
            const newState = { ...prev };
            delete newState[data.timeSlot];
            console.log('📊 [STATE] Cleared otherUsersSelections:', newState);
            return newState;
          });
        } else {
          console.log('⚠️ [SignalR] Ignoring own clear event');
        }
      };

      // ✅ IMPROVED: Handle connection state changes
      const handleReconnected = () => {
        console.log('🔄 [SignalR] Reconnected - rejoining room');
        joinRoom(); // Rejoin room after reconnection
      };

      const handleReconnecting = () => {
        console.log('🔄 [SignalR] Reconnecting...');
        // Clear other user selections during reconnection
        setOtherUsersSelections({});
      };

      const handleClose = (error) => {
        console.log('🔌 [SignalR] Connection closed:', error);
        // Clear other user selections when connection closes
        setOtherUsersSelections({});
      };

      // Register SignalR event handlers
      signalRConnection.on('TimeSlotSelected', handleTimeSlotSelected);
      signalRConnection.on('TimeSlotCleared', handleTimeSlotCleared);
      signalRConnection.onreconnected(handleReconnected);
      signalRConnection.onreconnecting(handleReconnecting);
      signalRConnection.onclose(handleClose);

      console.log('✅ [SignalR] All event handlers registered');

      // Cleanup function
      return () => {
        console.log('🧹 [TimeSlotGrid] Cleaning up SignalR listeners');
        
        try {
          signalRConnection.off('TimeSlotSelected', handleTimeSlotSelected);
          signalRConnection.off('TimeSlotCleared', handleTimeSlotCleared);
          signalRConnection.off('onreconnected', handleReconnected);
          signalRConnection.off('onreconnecting', handleReconnecting);
          signalRConnection.off('onclose', handleClose);
          
          // Leave room
          if (signalRConnection.state === 'Connected') {
            signalRConnection.invoke('LeaveTimeSlotRoom', roomKey)
              .catch(err => console.error('❌ [SignalR] Failed to leave room:', err));
          }
        } catch (error) {
          console.error('❌ [SignalR] Error during cleanup:', error);
        }
      };
    };
    
    if (connectionState === 'Connected') {
      console.log('✅ [TimeSlotGrid] SignalR connected, setting up listeners immediately');
      return setupSignalRListeners();
    } else if (connectionState === 'Connecting' || connectionState === 'Reconnecting') {
      console.log('⚠️ [TimeSlotGrid] SignalR still connecting, waiting...');
      
      // ✅ IMPROVED: Better wait for connection logic
      let cleanup = null;
      
      const handleConnectionReady = () => {
        if (signalRConnection.state === 'Connected') {
          console.log('✅ [TimeSlotGrid] SignalR connection established, setting up listeners');
          cleanup = setupSignalRListeners();
        }
      };
      
      signalRConnection.onreconnected(handleConnectionReady);
      
      // Also check periodically in case we missed the event
      const checkInterval = setInterval(() => {
        if (signalRConnection.state === 'Connected') {
          console.log('✅ [TimeSlotGrid] SignalR connection detected via polling');
          clearInterval(checkInterval);
          signalRConnection.off('onreconnected', handleConnectionReady);
          cleanup = setupSignalRListeners();
        }
      }, 1000);
      
      return () => {
        console.log('🧹 [TimeSlotGrid] Cleaning up connection wait handlers');
        clearInterval(checkInterval);
        signalRConnection.off('onreconnected', handleConnectionReady);
        if (cleanup) cleanup();
      };
    } else {
      console.log('❌ [TimeSlotGrid] SignalR in bad state:', connectionState);
      return;
    }
  }, [signalRConnection, selectedStaffId, selectedService, selectedDate, currentUserId]);

  // Effect để broadcast khi user chọn slot
  useEffect(() => {
    if (!signalRConnection || !selectedStaffId || !selectedService || !selectedSlot) {
      return;
    }

    // Check connection state before broadcasting
    if (signalRConnection.state !== 'Connected') {
      console.log('⚠️ [TimeSlotGrid] Cannot broadcast - SignalR not connected, state:', signalRConnection.state);
      return;
    }

    const roomKey = `service_${selectedService.id || selectedService.serviceId}_staff_${selectedStaffId}_date_${selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}`;
    const timeSlot = selectedSlot.startTime instanceof Date 
      ? dayjs(selectedSlot.startTime).format('HH:mm')
      : selectedSlot.startTime || selectedSlot.startTimeString;

    if (timeSlot) {
      console.log('📤 [SignalR] Broadcasting slot selection:', timeSlot, 'to room:', roomKey);
      
      // ✅ IMPROVED: Add retry logic for broadcasting
      const broadcastWithRetry = async (retries = 2) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            if (signalRConnection.state === 'Connected') {
              await signalRConnection.invoke('NotifyTimeSlotSelected', {
                roomKey,
                timeSlot,
                userId: currentUserId,
                serviceId: selectedService.id || selectedService.serviceId,
                staffId: selectedStaffId,
                date: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
              });
              console.log(`✅ [SignalR] Slot selection broadcasted successfully (attempt ${attempt})`);
              return;
            } else {
              console.log(`⚠️ [SignalR] Connection not ready for broadcast attempt ${attempt}, state: ${signalRConnection.state}`);
            }
          } catch (err) {
            console.error(`❌ [SignalR] Failed to broadcast slot selection attempt ${attempt}:`, err);
            if (attempt === retries) {
              console.error('❌ [SignalR] All broadcast attempts failed');
            } else {
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
            }
          }
        }
      };
      
      broadcastWithRetry();
    }
  }, [selectedSlot, signalRConnection, selectedStaffId, selectedService, selectedDate, currentUserId]);

  // Effect để broadcast khi user deselect (clear) slot
  const [previousSelectedSlot, setPreviousSelectedSlot] = useState(null);
  
  useEffect(() => {
    // Nếu slot trước đó có chọn và slot hiện tại là null/undefined, thì user đã deselect
    if (previousSelectedSlot && !selectedSlot && signalRConnection && signalRConnection.state === 'Connected' && selectedStaffId && selectedService) {
      const roomKey = `service_${selectedService.id || selectedService.serviceId}_staff_${selectedStaffId}_date_${selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}`;
      const timeSlot = previousSelectedSlot.startTime instanceof Date 
        ? dayjs(previousSelectedSlot.startTime).format('HH:mm')
        : previousSelectedSlot.startTime || previousSelectedSlot.startTimeString;

      if (timeSlot) {
        console.log('📤 [SignalR] Broadcasting slot clear:', timeSlot, 'to room:', roomKey);
        
        // ✅ IMPROVED: Add retry logic for clear broadcasting
        const broadcastClearWithRetry = async (retries = 2) => {
          for (let attempt = 1; attempt <= retries; attempt++) {
            try {
              if (signalRConnection.state === 'Connected') {
                await signalRConnection.invoke('NotifyTimeSlotCleared', {
                  roomKey,
                  timeSlot,
                  userId: currentUserId,
                  serviceId: selectedService.id || selectedService.serviceId,
                  staffId: selectedStaffId,
                  date: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
                });
                console.log(`✅ [SignalR] Slot clear broadcasted successfully (attempt ${attempt})`);
                return;
              } else {
                console.log(`⚠️ [SignalR] Connection not ready for clear broadcast attempt ${attempt}, state: ${signalRConnection.state}`);
              }
            } catch (err) {
              console.error(`❌ [SignalR] Failed to broadcast slot clear attempt ${attempt}:`, err);
              if (attempt === retries) {
                console.error('❌ [SignalR] All clear broadcast attempts failed');
              } else {
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
              }
            }
          }
        };
        
        broadcastClearWithRetry();
      }
    }
    
    // Update previous slot để track changes
    setPreviousSelectedSlot(selectedSlot);
  }, [selectedSlot, previousSelectedSlot, signalRConnection, selectedStaffId, selectedService, selectedDate, currentUserId]);

  // Debug effect to log when staff is selected
  React.useEffect(() => {
    if (selectedStaffId && appointments.length > 0) {
      console.log(`🚨 STAFF SELECTED: ${selectedStaffId}`);
      console.log(`📋 Staff appointments:`, appointments.filter(apt => apt.staffId === selectedStaffId));
      console.log(`🐕 Pet busy slots:`, petBusyTimeSlots);
      console.log(`🐕 Pet appointments:`, petAppointments.length);
    }
  }, [selectedStaffId, appointments, petBusyTimeSlots, petAppointments]);

  // Debug effect để track otherUsersSelections changes
  React.useEffect(() => {
    console.log('👥 [STATE CHANGE] otherUsersSelections updated:', otherUsersSelections);
    console.log('👥 [STATE CHANGE] Active selections count:', Object.keys(otherUsersSelections).length);
    Object.entries(otherUsersSelections).forEach(([slot, info]) => {
      console.log(`  - ${slot}: being selected (${info.userId})`);
    });
    
    // ✅ NEW: Force UI update to show changes
    if (Object.keys(otherUsersSelections).length > 0) {
      console.log('🔄 [UI UPDATE] Forcing re-render for other user selections');
    }
  }, [otherUsersSelections]);

  // ✅ FIXED: Sử dụng availableSlots từ props thay vì tự tạo slots
  const timeSlots = useMemo(() => {
    if (availableSlots && availableSlots.length > 0) {
      console.log(`📦 [TimeSlotGrid] Using ${availableSlots.length} slots from props`);
      return availableSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime, 
        duration: slot.duration,
        available: slot.available,
        isPetBusy: slot.isPetBusy,
        isStaffBusy: slot.isStaffBusy,
        busyReason: slot.busyReason,
        isCurrentAppointment: slot.isCurrentAppointment
      }));
    }
    
    // Fallback: generate basic slots if no availableSlots provided
    console.log(`🔄 [TimeSlotGrid] No availableSlots provided, generating fallback slots`);
    const slots = [];
    const startHour = 8;
    const endHour = 21;
    const interval = serviceDuration + 10; // duration + buffer
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = dayjs(`2023-01-01T${timeStr}`).add(serviceDuration, 'minute').format('HH:mm');
        
        slots.push({
          startTime: timeStr,
          endTime: endTime,
          duration: serviceDuration,
          available: true,
          isPetBusy: false,
          isStaffBusy: false
        });
      }
    }
    
    return slots;
  }, [availableSlots, serviceDuration]);

  // Check functions
  const isPastSlot = (timeStr) => {
    if (!selectedDate) return false;
    const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD');
    const todayStr = dayjs().format('YYYY-MM-DD');
    
    if (selectedDateStr < todayStr) return true;
    if (selectedDateStr === todayStr) {
      return dayjs().isAfter(dayjs(`${selectedDateStr}T${timeStr}`));
    }
    return false;
  };

  // ✅ IMPROVED: Use slot data first, then fallback to prop checks
  const isPetBusy = (timeStr, slot) => {
    // First check: use slot data if available (prioritize this for edit mode)
    if (slot && slot.isPetBusy !== undefined) {
      console.log(`🐕 [TimeSlotGrid] Slot ${timeStr} - using slot.isPetBusy: ${slot.isPetBusy}`);
      return slot.isPetBusy;
    }
    
    // Fallback: check petBusyTimeSlots and petAppointments
    if (petBusyTimeSlots.includes(timeStr)) {
      console.log(`🐕 [TimeSlotGrid] Slot ${timeStr} - found in petBusyTimeSlots`);
      return true;
    }
    
    // Simple check: if slot start time falls within any appointment time range
    return petAppointments.some(apt => {
      const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
      const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
      const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
      
      // Simple logic: slot is busy if it starts within appointment time range
      const slotTime = dayjs(`2023-01-01T${timeStr}`);
      const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
      const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
      
      // Check if slot start time is within appointment time range [start, end)
      const isWithinRange = slotTime.isSameOrAfter(aptStart) && slotTime.isBefore(aptEnd);
      
      if (isWithinRange) {
        console.log(`🐕 [TimeSlotGrid] Pet busy - slot ${timeStr} falls within appointment ${aptStartTime}-${aptEndTime}`);
      }
      
      return isWithinRange;
    });
  };

  const isStaffBusy = (timeStr, slot) => {
    // First check: use slot data if available
    if (slot && slot.isStaffBusy !== undefined) {
      console.log(`👤 [TimeSlotGrid] Slot ${timeStr} - using slot.isStaffBusy: ${slot.isStaffBusy}`);
      return slot.isStaffBusy;
    }
    
    // Fallback: check appointments
    if (!selectedStaffId || !appointments.length) {
      return false;
    }
    
    const busyResult = appointments.some(apt => {
      if (apt.staffId !== selectedStaffId) return false;
      
      const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
      const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
      const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
      
      // Simple logic: slot is busy if it starts within appointment time range
      const slotTime = dayjs(`2023-01-01T${timeStr}`);
      const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
      const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
      
      // Check if slot start time is within appointment time range [start, end)
      const isWithinRange = slotTime.isSameOrAfter(aptStart) && slotTime.isBefore(aptEnd);
      
      if (isWithinRange) {
        console.log(`👤 [TimeSlotGrid] Staff busy - slot ${timeStr} falls within appointment ${aptStartTime}-${aptEndTime} (staff: ${apt.staffId})`);
      }
      
      return isWithinRange;
    });
    
    if (busyResult) {
      console.log(`👤 [TimeSlotGrid] Slot ${timeStr} - staff ${selectedStaffId} is BUSY (from appointments check)`);
    }
    
    return busyResult;
  };

  // NEW: Check if slot is being selected by other users
  const isBeingSelectedByOthers = (timeStr) => {
    return otherUsersSelections[timeStr] !== undefined;
  };

  // Get other user info for a slot
  const getOtherUserInfo = (timeStr) => {
    return otherUsersSelections[timeStr];
  };

  const isSelected = (timeStr) => {
    if (!selectedSlot) return false;
    const selectedTime = selectedSlot.startTime instanceof Date 
      ? dayjs(selectedSlot.startTime).format('HH:mm')
      : selectedSlot.startTime || selectedSlot.startTimeString;
    return selectedTime === timeStr;
  };

  // Handle slot click
  const handleSlotClick = (slot) => {
    const isPast = isPastSlot(slot.startTime);
    const petBusy = isPetBusy(slot.startTime, slot);
    const staffBusy = isStaffBusy(slot.startTime, slot);
    const beingSelectedByOthers = isBeingSelectedByOthers(slot.startTime);
    
    // Allow clicking on current appointment slot even if it appears busy
    if (slot.isCurrentAppointment) {
      console.log(`✅ [TimeSlotGrid] Current appointment slot ${slot.startTime} clicked - always allowed`);
    } else if (isPast || petBusy || staffBusy || beingSelectedByOthers) {
      console.log(`🚫 [TimeSlotGrid] Slot ${slot.startTime} clicked but blocked: past=${isPast}, petBusy=${petBusy}, staffBusy=${staffBusy}, beingSelectedByOthers=${beingSelectedByOthers}`);
      
      // Show warning if slot is being selected by others
      if (beingSelectedByOthers) {
        console.log(`⚠️ Slot ${slot.startTime} is being selected by another user`);
      }
      return;
    }
    
    const selectedDateStr = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    
    const slotData = {
      startTime: slot.startTime,
      startTimeString: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      appointmentDate: `${selectedDateStr}T${slot.startTime}:00`,
      date: selectedDateStr
    };
    
    console.log(`✅ [TimeSlotGrid] Slot ${slot.startTime} clicked and selected:`, slotData);
    
    if (onSelectTimeSlot) {
      onSelectTimeSlot(slotData);
    }
  };

  // Enhanced getBadgeInfo - Priority: Selected > Current Appointment > Being Selected by Others > Pet Busy > Staff Busy > Past > Available  
  const getBadgeInfo = (timeStr, slot) => {
    if (isSelected(timeStr)) return { status: 'success', text: 'Đã chọn' };
    if (slot && slot.isCurrentAppointment) return { status: 'processing', text: 'Lịch hiện tại' };
    if (isBeingSelectedByOthers(timeStr)) {
      return { status: 'warning', text: 'Đang được chọn' };
    }
    if (isPetBusy(timeStr, slot)) return { status: 'error', text: 'Thú cưng bận' };
    if (isStaffBusy(timeStr, slot)) return { status: 'warning', text: 'Nhân viên bận' };
    if (isPastSlot(timeStr)) return { status: 'default', text: 'Đã qua' };
    return { status: 'success', text: 'Khả dụng' };
  };

  // ✅ NEW: Log thêm thông tin SignalR status
  React.useEffect(() => {
    if (signalRConnection && selectedStaffId && selectedService) {
      console.log('🔔 [SignalR STATUS] Real-time ENABLED:', {
        connectionState: signalRConnection.state,
        userId: currentUserId,
        staffId: selectedStaffId,
        serviceId: selectedService?.id || selectedService?.serviceId,
        serviceName: selectedService?.name,
        roomKey: `service_${selectedService?.id || selectedService?.serviceId}_staff_${selectedStaffId}_date_${selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}`
      });
    } else {
      console.log('🔕 [SignalR STATUS] Real-time DISABLED:', {
        hasConnection: !!signalRConnection,
        connectionState: signalRConnection?.state,
        hasStaffId: !!selectedStaffId,
        hasService: !!selectedService,
        userId: currentUserId
      });
    }
  }, [signalRConnection, selectedStaffId, selectedService, currentUserId, selectedDate]);

  // Effect để monitor SignalR connection status
  React.useEffect(() => {
    if (!signalRConnection) {
      setSignalRStatus('unavailable');
      return;
    }
    
    const updateStatus = () => {
      setSignalRStatus(signalRConnection.state.toLowerCase());
    };
    
    // Initial status
    updateStatus();
    
    // Monitor connection state changes
    const handleReconnected = () => {
      console.log('🔄 [SignalR Monitor] Reconnected');
      setSignalRStatus('connected');
    };
    
    const handleReconnecting = () => {
      console.log('🔄 [SignalR Monitor] Reconnecting...');
      setSignalRStatus('reconnecting');
    };
    
    const handleClose = () => {
      console.log('🔌 [SignalR Monitor] Connection closed');
      setSignalRStatus('disconnected');
    };
    
    signalRConnection.onreconnected(handleReconnected);
    signalRConnection.onreconnecting(handleReconnecting);
    signalRConnection.onclose(handleClose);
    
    // Periodic status check
    const statusInterval = setInterval(updateStatus, 2000);
    
    return () => {
      clearInterval(statusInterval);
      signalRConnection.off('onreconnected', handleReconnected);
      signalRConnection.off('onreconnecting', handleReconnecting);
      signalRConnection.off('onclose', handleClose);
    };
  }, [signalRConnection]);
  
  // Helper function to get status display
  const getSignalRStatusDisplay = () => {
    if (!signalRConnection || !selectedStaffId || !selectedService) {
      return { color: '#faad14', icon: '🟡', text: !selectedStaffId ? 'Chọn nhân viên để bật' : 'Tắt' };
    }
    
    switch (signalRStatus) {
      case 'connected':
        return { color: '#52c41a', icon: '🟢', text: 'Real-time: Hoạt động' };
      case 'connecting':
      case 'reconnecting':
        return { color: '#1890ff', icon: '🔵', text: 'Real-time: Đang kết nối...' };
      case 'disconnected':
        return { color: '#ff4d4f', icon: '🔴', text: 'Real-time: Mất kết nối' };
      default:
        return { color: '#faad14', icon: '🟡', text: 'Real-time: Không khả dụng' };
    }
  };

  if (loading) {
    return (
      <Card title="Chọn khung giờ">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải khung giờ...</div>
        </div>
      </Card>
    );
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <Card title="Chọn khung giờ">
        <Empty 
          description="Không có khung giờ nào khả dụng"
          style={{ padding: '40px' }}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Chọn khung giờ"
      extra={
        <div style={{ fontSize: '12px', color: '#666' }}>
          {timeSlots.length} khung giờ
          {Object.keys(otherUsersSelections).length > 0 && (
            <div style={{ color: '#722ed1', marginTop: 4 }}>
              {Object.keys(otherUsersSelections).length} khung giờ đang được chọn
            </div>
          )}
          {/* Hiển thị trạng thái SignalR */}
          {(() => {
            const statusInfo = getSignalRStatusDisplay();
            return (
              <div>
                <div style={{ color: statusInfo.color, marginTop: 4, fontSize: '11px' }}>
                  {statusInfo.icon} {statusInfo.text}
                </div>
              </div>
            );
          })()}
        </div>
      }
    >
      <SlotGrid>
        {timeSlots.map((slot, index) => {
          const timeStr = slot.startTime;
          const isPast = isPastSlot(timeStr);
          const petBusy = isPetBusy(timeStr, slot);
          const staffBusy = isStaffBusy(timeStr, slot);
          const selected = isSelected(timeStr);
          const beingSelectedByOthers = isBeingSelectedByOthers(timeStr);
          const otherUserInfo = getOtherUserInfo(timeStr);
          
          // Allow current appointment slot to be clickable even if busy, but block if being selected by others
          const disabled = slot.isCurrentAppointment ? beingSelectedByOthers : (isPast || petBusy || staffBusy || beingSelectedByOthers);
          const badgeInfo = getBadgeInfo(timeStr, slot);
          
          // ✅ ENHANCED: Debug log for slots being selected by others
          if (beingSelectedByOthers) {
            console.log(`🔍 [RENDER] Slot ${timeStr} being selected by another user`);
          }
          
          return (
            <TimeSlot
              key={`${timeStr}-${index}`}
              selected={selected}
              petBusy={petBusy}
              staffBusy={staffBusy}
              past={isPast}
              beingSelectedByOthers={beingSelectedByOthers}
              disabled={disabled}
              onClick={() => handleSlotClick(slot)}
              title={beingSelectedByOthers ? 'Đang được chọn bởi người khác' : ''}
            >
              {/* Other user indicator */}
              {beingSelectedByOthers && (
                <OtherUserIndicator>
                  •
                </OtherUserIndicator>
              )}
              
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {timeStr}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {slot.endTime}
              </div>
              <Badge 
                status={badgeInfo.status}
                text={badgeInfo.text}
                style={{ 
                  fontSize: '10px',
                  marginTop: '4px'
                }}
              />
            </TimeSlot>
          );
        })}
      </SlotGrid>
    </Card>
  );
};

export default TimeSlotGrid; 