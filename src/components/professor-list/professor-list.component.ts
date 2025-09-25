import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Professor, DragDropData } from '../../models/schedule.models';

@Component({
  selector: 'app-professor-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './professor-list.component.html',
  styleUrls: ['./professor-list.component.scss']
})
export class ProfessorListComponent {
  @Input() professors: Professor[] = [];
  @Input() slotDropListIds: string[] = [];
  @Input() professorDropListId = 'professorList';

  createDragData(professor: Professor): DragDropData {
    return {
      type: 'professor',
      data: professor
    };
  }
}