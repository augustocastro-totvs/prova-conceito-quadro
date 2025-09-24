import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Professor, DragDropData } from '../../models/schedule.models';

@Component({
  selector: 'app-professor-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="professor-list">
      <h3 class="list-title">Available Professors</h3>
      <div class="list-container">
        <div
          *ngFor="let professor of professors"
          class="professor-item"
          cdkDrag
          [cdkDragData]="createDragData(professor)">
          
          <div class="professor-info">
            <span class="professor-name">{{ professor.name }}</span>
            <span class="professor-department">{{ professor.department }}</span>
            <span class="professor-email">{{ professor.email }}</span>
          </div>
          
          <div class="drag-handle">⋮⋮</div>
          
          <!-- Custom drag preview -->
          <div class="drag-preview" *cdkDragPreview>
            <div class="preview-professor">
              <span class="preview-name">{{ professor.name }}</span>
              <span class="preview-department">{{ professor.department }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .professor-list {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    
    .professor-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #fafafa;
      cursor: grab;
      transition: all 0.2s ease;
    }
    
    .professor-item:hover {
      background: #f0f9ff;
      border-color: #3b82f6;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .professor-item:active {
      cursor: grabbing;
    }
    
    .professor-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .professor-name {
      font-weight: 600;
      color: #111827;
      font-size: 14px;
    }
    
    .professor-department {
      font-size: 12px;
      color: #3b82f6;
      font-weight: 500;
    }
    
    .professor-email {
      font-size: 11px;
      color: #6b7280;
    }
    
    .drag-handle {
      color: #9ca3af;
      font-weight: bold;
      cursor: grab;
    }
    
    .drag-preview {
      background: white;
      border: 1px solid #3b82f6;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      padding: 12px;
    }
    
    .preview-professor {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 160px;
    }
    
    .preview-name {
      font-weight: 600;
      color: #111827;
    }
    
    .preview-department {
      font-size: 12px;
      color: #3b82f6;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class ProfessorListComponent {
  @Input() professors: Professor[] = [];

  createDragData(professor: Professor): DragDropData {
    return {
      type: 'professor',
      data: professor
    };
  }
}