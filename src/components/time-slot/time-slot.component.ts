import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  CdkDragDrop, 
  CdkDropList, 
  CdkDrag, 
  DragDropModule,
  CdkDragEnter,
  CdkDragExit
} from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';

import { 
  Allocation, 
  Discipline, 
  Professor, 
  AllocationState,
  DragDropData, 
  TimeSlot
} from '../../models/schedule.models';
import { DragDropService } from '../../services/drag-drop.service';

@Component({
  selector: 'app-time-slot',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-slot.component.html',
  styleUrls: ['./time-slot.component.scss']
})
export class TimeSlotComponent implements OnInit, OnDestroy {
  @Input() weekdayId!: string;
  @Input() timeSlotId!: string;
  @Input() allocation: Allocation | null = null;
  @Input() disciplines: Discipline[] = [];
  @Input() professors: Professor[] = [];
  @Input() timeSlot: TimeSlot | null = null;
  @Input() dropListIds: string[] = [];

  @Output() allocationChanged = new EventEmitter<{
    weekdayId: string;
    timeSlotId: string;
    allocation: Allocation | null;
  }>();

  @Output() dropRequested = new EventEmitter<{
    dragData: DragDropData;
    targetWeekdayId: string;
    targetTimeSlotId: string;
  }>();

  AllocationState = AllocationState;
  
  private destroy$ = new Subject<void>();
  private isDragOver = false;
  private dragData: DragDropData | null = null;

  constructor(private dragDropService: DragDropService) {}

  ngOnInit(): void {
    this.setTimeSlotState();
    this.dragDropService.dragData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dragData = data;
        this.setTimeSlotState();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public setTimeSlotState() {
    this.timeSlot!.slotState = this.slotState;
  }

  get slotState(): AllocationState {
    if (!this.allocation) {
      return AllocationState.EMPTY;
    }
    
    if (this.allocation.professorIds.length === 0) {
      return AllocationState.DISCIPLINE_ONLY;
    }
    
    return AllocationState.DISCIPLINE_WITH_PROFESSORS;
  }

  getSlotClasses(): string {
    const classes = ['time-slot'];
    
    if (this.isDragOver) {
      if (this.dragData && this.dragDropService.canDropInSlot(this.slotState, this.dragData)) {
        classes.push('drag-over');
      } else {
        classes.push('drag-invalid');
      }
    }
    
    classes.push(`state-${this.slotState}`);
    
    return classes.join(' ');
  }

  createDragData(type: 'allocation', data: Allocation): DragDropData {
    return {
      type,
      data,
      sourceSlotId: `${this.weekdayId}-${this.timeSlotId}`
    };
  }

  onDragEnter(event: CdkDragEnter): void {
    this.isDragOver = true;
    console.log(event.item);
  }

  onDragExit(event: CdkDragExit): void {
    this.isDragOver = false;
  }

  onDrop(event: CdkDragDrop<any>): void {
    this.isDragOver = false;
    
    if (event.previousContainer === event.container) {
      return; // Same container, no action needed
    }

    const dragData = event.item.data as DragDropData;
    
    if (this.dragDropService.canDropInSlot(this.slotState, dragData)) {
      this.dropRequested.emit({
        dragData,
        targetWeekdayId: this.weekdayId,
        targetTimeSlotId: this.timeSlotId
      });
    }
  }
}