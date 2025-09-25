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
  Professor,
  AllocationState
} from '../../models/schedule.models';
import { ScheduleService } from '../../services/schedule.service';
import { DragDropService } from '../../services/drag-drop.service';
import { TimeSlotComponent } from '../time-slot/time-slot.component';
import { DisciplineListComponent } from '../discipline-list/discipline-list.component';
import { ProfessorListComponent } from '../professor-list/professor-list.component';
import { CdkDropList } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-schedule-grid',
  standalone: true,
  imports: [
    CommonModule,
    TimeSlotComponent,
    DisciplineListComponent,
    ProfessorListComponent,
    CdkDropList
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-grid.component.html',
  styleUrls: ['./schedule-grid.component.scss']
})
export class ScheduleGridComponent implements OnInit, OnDestroy {
  scheduleData: ScheduleGridData | null = null;

  private destroy$ = new Subject<void>();
  public disciplineDropListId = 'disciplineDropList';
  public professorDropListId = 'professorDropList';

  constructor(
    private scheduleService: ScheduleService,
    private dragDropService: DragDropService,
    private cdr: ChangeDetectorRef
  ) { }

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

  public getDisciplinesDropListIds(): string[]{
    let possibleDropIds: string[] = [];

    this.scheduleData?.timeSlots.forEach(timeSlot => {
      timeSlot.slotState === AllocationState.EMPTY ? possibleDropIds.push(`timeSlot_${timeSlot!.id}_${timeSlot!.weekdayId}`) : null;
    });
    console.log(possibleDropIds);
    return possibleDropIds;
  }

  public getProfessorsDropListIds(): string[]{
    let possibleDropIds: string[] = [];

    this.scheduleData?.timeSlots.forEach(timeSlot => {
      timeSlot.slotState !== AllocationState.EMPTY ? possibleDropIds.push(`timeSlot_${timeSlot!.id}_${timeSlot!.weekdayId}`) : null;
    });
    return possibleDropIds;
  }
  
  public getTimeSlotDropListIds(): string[]{
    let possibleDropIds: string[] = []; 
    possibleDropIds = [...'professorList', ...'disciplineList'];
    return possibleDropIds;
  }
}