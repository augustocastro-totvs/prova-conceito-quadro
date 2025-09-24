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
  DragDropData 
} from '../../models/schedule.models';
import { DragDropService } from '../../services/drag-drop.service';

@Component({
  selector: 'app-time-slot',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="time-slot"
      [class]="getSlotClasses()"
      cdkDropList
      [cdkDropListData]="{ weekdayId, timeSlotId }"
      (cdkDropListDropped)="onDrop($event)"
      (cdkDropListEntered)="onDragEnter($event)"
      (cdkDropListExited)="onDragExit($event)">
      
      <!-- Empty State -->
      <div *ngIf="slotState === AllocationState.EMPTY" class="empty-slot">
        <span class="empty-text">Drop discipline here</span>
      </div>
      
      <!-- Discipline Only State -->
      <div *ngIf="slotState === AllocationState.DISCIPLINE_ONLY && allocation?.discipline" 
           class="discipline-only"
           cdkDrag
           [cdkDragData]="createDragData('allocation', allocation)">
        <div class="discipline-header" [style.background-color]="allocation.discipline.color">
          <span class="discipline-name">{{ allocation.discipline.name }}</span>
          <span class="discipline-code">{{ allocation.discipline.code }}</span>
        </div>
        <div class="professor-placeholder">
          <span class="placeholder-text">Drop professors here</span>
        </div>
      </div>
      
      <!-- Discipline with Professors State -->
      <div *ngIf="slotState === AllocationState.DISCIPLINE_WITH_PROFESSORS && allocation?.discipline" 
           class="discipline-with-professors"
           cdkDrag
           [cdkDragData]="createDragData('allocation', allocation)">
        <div class="discipline-header" [style.background-color]="allocation.discipline.color">
          <span class="discipline-name">{{ allocation.discipline.name }}</span>
          <span class="discipline-code">{{ allocation.discipline.code }}</span>
        </div>
        <div class="professors-list">
          <div *ngFor="let professor of allocation.professors" class="professor-item">
            <span class="professor-name">{{ professor.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- Drag Preview -->
      <div class="drag-preview" *cdkDragPreview>
        <div class="preview-content">
          <span *ngIf="allocation?.discipline">{{ allocation.discipline.name }}</span>
          <span *ngIf="allocation?.professors?.length" class="professor-count">
            +{{ allocation.professors?.length }} professor(s)
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .time-slot {
      min-height: 80px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px;
      transition: all 0.2s ease;
      position: relative;
      background: white;
    }
    
    .time-slot.drag-over {
      border-color: #3b82f6;
      background-color: #f0f9ff;
      transform: scale(1.02);
    }
    
    .time-slot.drag-invalid {
      border-color: #ef4444;
      background-color: #fef2f2;
    }
    
    .empty-slot {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
    }
    
    .empty-text, .placeholder-text {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    
    .discipline-only, .discipline-with-professors {
      height: 100%;
      cursor: grab;
    }
    
    .discipline-only:active, .discipline-with-professors:active {
      cursor: grabbing;
    }
    
    .discipline-header {
      padding: 4px 8px;
      border-radius: 4px;
      color: white;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .discipline-name {
      font-weight: 600;
      font-size: 12px;
    }
    
    .discipline-code {
      font-size: 10px;
      opacity: 0.8;
    }
    
    .professor-placeholder {
      padding: 4px;
      border: 1px dashed #d1d5db;
      border-radius: 4px;
      text-align: center;
      min-height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .professors-list {
      max-height: 40px;
      overflow-y: auto;
    }
    
    .professor-item {
      padding: 2px 4px;
      background: #f3f4f6;
      border-radius: 3px;
      margin-bottom: 2px;
      font-size: 10px;
    }
    
    .professor-name {
      color: #374151;
    }
    
    .drag-preview {
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .professor-count {
      font-size: 10px;
      color: #6b7280;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .cdk-drop-list-dragging .time-slot:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TimeSlotComponent implements OnInit, OnDestroy {
  @Input() weekdayId!: string;
  @Input() timeSlotId!: string;
  @Input() allocation: Allocation | null = null;
  @Input() disciplines: Discipline[] = [];
  @Input() professors: Professor[] = [];

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
    this.dragDropService.dragData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dragData = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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