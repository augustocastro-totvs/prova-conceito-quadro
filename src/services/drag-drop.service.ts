import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DragDropData, AllocationState } from '../models/schedule.models';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  private dragDataSubject = new BehaviorSubject<DragDropData | null>(null);
  public dragData$ = this.dragDataSubject.asObservable();

  private isDraggingSubject = new BehaviorSubject<boolean>(false);
  public isDragging$ = this.isDraggingSubject.asObservable();

  setDragData(data: DragDropData): void {
    this.dragDataSubject.next(data);
    this.isDraggingSubject.next(true);
  }

  clearDragData(): void {
    this.dragDataSubject.next(null);
    this.isDraggingSubject.next(false);
  }

  getDragData(): DragDropData | null {
    return this.dragDataSubject.value;
  }

  canDropInSlot(slotState: AllocationState, dragData: DragDropData): boolean {
    switch (dragData.type) {
      case 'discipline':
        // Disciplines can only be dropped in empty slots or replace existing disciplines
        return slotState === AllocationState.EMPTY || 
               slotState === AllocationState.DISCIPLINE_ONLY ||
               slotState === AllocationState.DISCIPLINE_WITH_PROFESSORS;
      
      case 'professor':
        // Professors can only be dropped in slots that already have a discipline
        return slotState === AllocationState.DISCIPLINE_ONLY ||
               slotState === AllocationState.DISCIPLINE_WITH_PROFESSORS;
      
      case 'allocation':
        // Allocations can be moved to any slot
        return true;
      
      default:
        return false;
    }
  }

  getDropEffect(slotState: AllocationState, dragData: DragDropData): 'copy' | 'move' | 'none' {
    if (!this.canDropInSlot(slotState, dragData)) {
      return 'none';
    }

    // For now, default to move for allocations and copy for disciplines/professors
    if (dragData.type === 'allocation' && dragData.sourceSlotId) {
      return 'move';
    }
    
    return 'copy';
  }
}