import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { 
  ScheduleGridData, 
  Allocation, 
  DragDropData, 
  AllocationRequest,
  Discipline,
  Professor 
} from '../../models/schedule.models';
import { ScheduleService } from '../../services/schedule.service';
import { DragDropService } from '../../services/drag-drop.service';
import { TimeSlotComponent } from '../time-slot/time-slot.component';
import { DisciplineListComponent } from '../discipline-list/discipline-list.component';
import { ProfessorListComponent } from '../professor-list/professor-list.component';

@Component({
  selector: 'app-schedule-grid',
  standalone: true,
  imports: [
    CommonModule, 
    TimeSlotComponent, 
    DisciplineListComponent, 
    ProfessorListComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="schedule-container">
      <div class="controls-panel">
        <app-discipline-list [disciplines]="scheduleData?.disciplines || []"></app-discipline-list>
        <app-professor-list [professors]="scheduleData?.professors || []"></app-professor-list>
      </div>
      
      <div class="grid-panel">
        <div class="grid-header">
          <h2 class="grid-title">Weekly Schedule</h2>
          <div class="grid-actions">
            <button class="refresh-btn" (click)="loadScheduleData()">
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <div class="schedule-grid" *ngIf="scheduleData">
          <!-- Time column header -->
          <div class="time-header">Time</div>
          
          <!-- Weekday headers -->
          <div 
            *ngFor="let weekday of scheduleData.weekdays" 
            class="weekday-header"
            [attr.data-weekday-id]="weekday.id">
            <span class="weekday-name">{{ weekday.name }}</span>
            <span class="weekday-short">{{ weekday.shortName }}</span>
          </div>
          
          <!-- Time slot rows -->
          <ng-container *ngFor="let timeSlot of scheduleData.timeSlots">
            <!-- Time label -->
            <div class="time-label">
              <span class="start-time">{{ timeSlot.startTime }}</span>
              <span class="end-time">{{ timeSlot.endTime }}</span>
            </div>
            
            <!-- Time slots for each weekday -->
            <app-time-slot
              *ngFor="let weekday of scheduleData.weekdays"
              [weekdayId]="weekday.id"
              [timeSlotId]="timeSlot.id"
              [allocation]="getAllocation(weekday.id, timeSlot.id)"
              [disciplines]="scheduleData.disciplines"
              [professors]="scheduleData.professors"
              (dropRequested)="handleDropRequest($event)"
              (allocationChanged)="handleAllocationChanged($event)">
            </app-time-slot>
          </ng-container>
        </div>
        
        <!-- Loading state -->
        <div *ngIf="!scheduleData" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading schedule data...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      min-height: 100vh;
    }
    
    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .grid-panel {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f3f4f6;
    }
    
    .grid-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    
    .grid-actions {
      display: flex;
      gap: 12px;
    }
    
    .refresh-btn {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .refresh-btn:hover {
      background: #2563eb;
    }
    
    .schedule-grid {
      display: grid;
      grid-template-columns: 80px repeat(var(--weekdays-count, 5), 1fr);
      gap: 8px;
      align-items: stretch;
    }
    
    .time-header {
      grid-column: 1;
      padding: 12px 8px;
      font-weight: 600;
      color: #374151;
      text-align: center;
      background: #f9fafb;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .weekday-header {
      padding: 12px;
      background: #3b82f6;
      color: white;
      text-align: center;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .weekday-name {
      font-weight: 600;
      font-size: 14px;
    }
    
    .weekday-short {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .time-label {
      padding: 8px;
      background: #f9fafb;
      border-radius: 6px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-left: 3px solid #e5e7eb;
    }
    
    .start-time {
      font-weight: 600;
      color: #111827;
      font-size: 12px;
    }
    
    .end-time {
      color: #6b7280;
      font-size: 10px;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #6b7280;
    }
    
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 1024px) {
      .schedule-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .controls-panel {
        order: 2;
      }
      
      .grid-panel {
        order: 1;
      }
    }
    
    @media (max-width: 768px) {
      .schedule-container {
        padding: 16px;
      }
      
      .schedule-grid {
        font-size: 12px;
      }
      
      .grid-title {
        font-size: 20px;
      }
    }
  `]
})
export class ScheduleGridComponent implements OnInit, OnDestroy {
  scheduleData: ScheduleGridData | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private scheduleService: ScheduleService,
    private dragDropService: DragDropService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadScheduleData();
    
    // Subscribe to schedule data changes
    this.scheduleService.scheduleData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.scheduleData = data;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadScheduleData(): void {
    this.scheduleService.getScheduleData().subscribe();
  }

  getAllocation(weekdayId: string, timeSlotId: string): Allocation | null {
    if (!this.scheduleData) return null;
    
    const allocation = this.scheduleData.allocations.find(a => 
      a.weekdayId === weekdayId && a.timeSlotId === timeSlotId
    );
    
    if (!allocation) return null;
    
    // Enrich allocation with full objects
    const discipline = this.scheduleData.disciplines.find(d => d.id === allocation.disciplineId);
    const professors = this.scheduleData.professors.filter(p => 
      allocation.professorIds.includes(p.id)
    );
    
    return {
      ...allocation,
      discipline,
      professors
    };
  }

  handleDropRequest(event: {
    dragData: DragDropData;
    targetWeekdayId: string;
    targetTimeSlotId: string;
  }): void {
    const { dragData, targetWeekdayId, targetTimeSlotId } = event;
    
    switch (dragData.type) {
      case 'discipline':
        this.handleDisciplineDrop(dragData.data as Discipline, targetWeekdayId, targetTimeSlotId);
        break;
        
      case 'professor':
        this.handleProfessorDrop(dragData.data as Professor, targetWeekdayId, targetTimeSlotId);
        break;
        
      case 'allocation':
        this.handleAllocationMove(dragData.data as Allocation, targetWeekdayId, targetTimeSlotId, dragData.sourceSlotId);
        break;
    }
  }

  private handleDisciplineDrop(discipline: Discipline, weekdayId: string, timeSlotId: string): void {
    const existingAllocation = this.getAllocation(weekdayId, timeSlotId);
    
    if (existingAllocation) {
      // Update existing allocation
      const request: AllocationRequest = {
        disciplineId: discipline.id,
        professorIds: existingAllocation.professorIds,
        weekdayId,
        timeSlotId
      };
      
      this.scheduleService.updateAllocation(existingAllocation.id, request).subscribe();
    } else {
      // Create new allocation
      const request: AllocationRequest = {
        disciplineId: discipline.id,
        professorIds: [],
        weekdayId,
        timeSlotId
      };
      
      this.scheduleService.createAllocation(request).subscribe();
    }
  }

  private handleProfessorDrop(professor: Professor, weekdayId: string, timeSlotId: string): void {
    const existingAllocation = this.getAllocation(weekdayId, timeSlotId);
    
    if (!existingAllocation || !existingAllocation.disciplineId) {
      // Cannot drop professor without discipline
      return;
    }
    
    const updatedProfessorIds = [...existingAllocation.professorIds];
    if (!updatedProfessorIds.includes(professor.id)) {
      updatedProfessorIds.push(professor.id);
    }
    
    const request: AllocationRequest = {
      disciplineId: existingAllocation.disciplineId,
      professorIds: updatedProfessorIds,
      weekdayId,
      timeSlotId
    };
    
    this.scheduleService.updateAllocation(existingAllocation.id, request).subscribe();
  }

  private handleAllocationMove(
    allocation: Allocation, 
    targetWeekdayId: string, 
    targetTimeSlotId: string, 
    sourceSlotId?: string
  ): void {
    // Check if moving to the same slot
    if (allocation.weekdayId === targetWeekdayId && allocation.timeSlotId === targetTimeSlotId) {
      return;
    }
    
    // Check if target slot has existing allocation
    const targetAllocation = this.getAllocation(targetWeekdayId, targetTimeSlotId);
    
    if (targetAllocation) {
      // For now, we'll replace the target allocation
      // In a more sophisticated implementation, you might want to show a dialog
      this.scheduleService.deleteAllocation(targetAllocation.id).subscribe(() => {
        this.moveAllocation(allocation, targetWeekdayId, targetTimeSlotId);
      });
    } else {
      this.moveAllocation(allocation, targetWeekdayId, targetTimeSlotId);
    }
  }

  private moveAllocation(allocation: Allocation, targetWeekdayId: string, targetTimeSlotId: string): void {
    const request: AllocationRequest = {
      disciplineId: allocation.disciplineId,
      professorIds: allocation.professorIds,
      weekdayId: targetWeekdayId,
      timeSlotId: targetTimeSlotId
    };
    
    this.scheduleService.updateAllocation(allocation.id, request).subscribe();
  }

  handleAllocationChanged(event: {
    weekdayId: string;
    timeSlotId: string;
    allocation: Allocation | null;
  }): void {
    // Handle any additional allocation change logic if needed
    this.cdr.markForCheck();
  }
}