import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  ScheduleGridData, 
  Allocation, 
  AllocationRequest, 
  Discipline, 
  Professor, 
  Weekday, 
  TimeSlot, 
  AllocationState
} from '../models/schedule.models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  setAdditionalProperties(scheduleData: ScheduleGridData | null) {
    console.log('scheduleData', scheduleData);
    let timeSlotIds: string[] =  scheduleData?.allocations.map(allocation => allocation.timeSlotId) || [];

    scheduleData?.timeSlots.forEach(timeSlot => {
      timeSlot.slotState = timeSlotIds.includes(timeSlot.id) ? AllocationState.DISCIPLINE_ONLY : AllocationState.EMPTY;
      if(timeSlotIds.includes(timeSlot.id)) {
        let allocation = scheduleData.allocations.find(allocation => allocation.timeSlotId === timeSlot.id);
        timeSlot.slotState = (allocation?.professors?.length ?? 0) > 0 ? 
          AllocationState.DISCIPLINE_WITH_PROFESSORS 
        : AllocationState.DISCIPLINE_ONLY;
      }      
    });
  }
  private scheduleDataSubject = new BehaviorSubject<ScheduleGridData | null>(null);
  public scheduleData$ = this.scheduleDataSubject.asObservable();

  // Mock data - replace with actual API calls
  private mockWeekdays: Weekday[] = [
    { id: '1', name: 'Monday', shortName: 'Mon', order: 1 },
    { id: '2', name: 'Tuesday', shortName: 'Tue', order: 2 },
    { id: '3', name: 'Wednesday', shortName: 'Wed', order: 3 },
    { id: '4', name: 'Thursday', shortName: 'Thu', order: 4 },
    { id: '5', name: 'Friday', shortName: 'Fri', order: 5 }
  ];

  private mockTimeSlots: TimeSlot[] = [
    { id: '1', startTime: '08:00', endTime: '09:00', order: 1 },
    { id: '2', startTime: '09:00', endTime: '10:00', order: 2 },
    { id: '3', startTime: '10:00', endTime: '11:00', order: 3 },
    { id: '4', startTime: '11:00', endTime: '12:00', order: 4 },
    { id: '5', startTime: '14:00', endTime: '15:00', order: 5 },
    { id: '6', startTime: '15:00', endTime: '16:00', order: 6 }
  ];

  private mockDisciplines: Discipline[] = [
    { id: '1', name: 'Mathematics', code: 'MATH101', color: '#3B82F6', duration: 60 },
    { id: '2', name: 'Physics', code: 'PHYS101', color: '#EF4444', duration: 60 },
    { id: '3', name: 'Chemistry', code: 'CHEM101', color: '#10B981', duration: 60 },
    { id: '4', name: 'Biology', code: 'BIO101', color: '#F59E0B', duration: 60 }
  ];

  private mockProfessors: Professor[] = [
    { id: '1', name: 'Dr. John Smith', email: 'j.smith@university.edu', department: 'Mathematics' },
    { id: '2', name: 'Prof. Sarah Johnson', email: 's.johnson@university.edu', department: 'Physics' },
    { id: '3', name: 'Dr. Michael Brown', email: 'm.brown@university.edu', department: 'Chemistry' },
    { id: '4', name: 'Prof. Emily Davis', email: 'e.davis@university.edu', department: 'Biology' }
  ];

  private mockAllocations: Allocation[] = [];

  getScheduleData(): Observable<ScheduleGridData> {
    // Simulate API call
    const data: ScheduleGridData = {
      weekdays: this.mockWeekdays,
      timeSlots: this.mockTimeSlots,
      disciplines: this.mockDisciplines,
      professors: this.mockProfessors,
      allocations: this.mockAllocations
    };
    
    return of(data).pipe(
      delay(500),
      map(data => {
        this.scheduleDataSubject.next(data);
        return data;
      })
    );
  }

  createAllocation(request: AllocationRequest): Observable<Allocation> {
    // Simulate API call
    const allocation: Allocation = {
      id: Date.now().toString(),
      disciplineId: request.disciplineId || '',
      professorIds: request.professorIds || [],
      weekdayId: request.weekdayId,
      timeSlotId: request.timeSlotId
    };

    return of(allocation).pipe(
      delay(200),
      map(newAllocation => {
        this.mockAllocations.push(newAllocation);
        this.updateScheduleData();
        return newAllocation;
      })
    );
  }

  updateAllocation(id: string, request: AllocationRequest): Observable<Allocation> {
    // Simulate API call
    const allocationIndex = this.mockAllocations.findIndex(a => a.id === id);
    
    if (allocationIndex !== -1) {
      this.mockAllocations[allocationIndex] = {
        ...this.mockAllocations[allocationIndex],
        disciplineId: request.disciplineId || this.mockAllocations[allocationIndex].disciplineId,
        professorIds: request.professorIds || this.mockAllocations[allocationIndex].professorIds,
        weekdayId: request.weekdayId,
        timeSlotId: request.timeSlotId
      };
    }

    return of(this.mockAllocations[allocationIndex]).pipe(
      delay(200),
      map(updatedAllocation => {
        this.updateScheduleData();
        return updatedAllocation;
      })
    );
  }

  deleteAllocation(id: string): Observable<boolean> {
    // Simulate API call
    const index = this.mockAllocations.findIndex(a => a.id === id);
    
    if (index !== -1) {
      this.mockAllocations.splice(index, 1);
    }

    return of(true).pipe(
      delay(200),
      map(() => {
        this.updateScheduleData();
        return true;
      })
    );
  }

  private updateScheduleData(): void {
    const currentData = this.scheduleDataSubject.value;
    if (currentData) {
      this.scheduleDataSubject.next({
        ...currentData,
        allocations: this.mockAllocations
      });
    }
  }

  getAllocationBySlot(weekdayId: string, timeSlotId: string): Allocation | null {
    return this.mockAllocations.find(a => 
      a.weekdayId === weekdayId && a.timeSlotId === timeSlotId
    ) || null;
  }
}