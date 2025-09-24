import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDrag } from '@angular/cdk/drag-drop';
import { Discipline, DragDropData } from '../../models/schedule.models';

@Component({
  selector: 'app-discipline-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="discipline-list">
      <h3 class="list-title">Available Disciplines</h3>
      <div class="list-container">
        <div
          *ngFor="let discipline of disciplines"
          class="discipline-item"
          cdkDrag
          [cdkDragData]="createDragData(discipline)"
          [style.border-left-color]="discipline.color">
          
          <div class="discipline-info">
            <span class="discipline-name">{{ discipline.name }}</span>
            <span class="discipline-code">{{ discipline.code }}</span>
          </div>
          
          <div class="discipline-duration">
            {{ discipline.duration }}min
          </div>
          
          <div class="drag-handle">⋮⋮</div>
          
          <!-- Custom drag preview -->
          <div class="drag-preview" *cdkDragPreview>
            <div class="preview-discipline" [style.background-color]="discipline.color">
              <span class="preview-name">{{ discipline.name }}</span>
              <span class="preview-code">{{ discipline.code }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .discipline-list {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;
    }
    
    .list-title {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
    
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .discipline-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-left: 4px solid;
      border-radius: 6px;
      background: #fafafa;
      cursor: grab;
      transition: all 0.2s ease;
    }
    
    .discipline-item:hover {
      background: #f0f9ff;
      border-color: #3b82f6;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .discipline-item:active {
      cursor: grabbing;
    }
    
    .discipline-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .discipline-name {
      font-weight: 600;
      color: #111827;
      font-size: 14px;
    }
    
    .discipline-code {
      font-size: 12px;
      color: #6b7280;
    }
    
    .discipline-duration {
      font-size: 12px;
      color: #6b7280;
      margin-right: 12px;
    }
    
    .drag-handle {
      color: #9ca3af;
      font-weight: bold;
      cursor: grab;
    }
    
    .drag-preview {
      background: white;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      padding: 8px;
    }
    
    .preview-discipline {
      padding: 8px 12px;
      border-radius: 4px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-width: 180px;
    }
    
    .preview-name {
      font-weight: 600;
    }
    
    .preview-code {
      font-size: 12px;
      opacity: 0.9;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DisciplineListComponent {
  @Input() disciplines: Discipline[] = [];

  createDragData(discipline: Discipline): DragDropData {
    return {
      type: 'discipline',
      data: discipline
    };
  }
}