import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Discipline, DragDropData } from '../../models/schedule.models';

@Component({
  selector: 'app-discipline-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './discipline-list.component.html',
  styleUrls: ['./discipline-list.component.scss']
})
export class DisciplineListComponent {
  @Input() disciplines: Discipline[] = [];
  @Input() disciplineDropListId = 'disciplineList';
  @Input() slotDropListIds: string[] = [];

  createDragData(discipline: Discipline): DragDropData {
    return {
      type: 'discipline',
      data: discipline
    };
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    // Prevê disciplina ser removida d alistagem
    if(event.previousContainer === event.container) {
      return;
    }
  }


}