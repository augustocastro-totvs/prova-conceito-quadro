import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ScheduleGridComponent } from './components/schedule-grid/schedule-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScheduleGridComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">Prova de Conceito Quadro de Horários</h1>
          <p class="app-subtitle">Arraste e solte disciplinas para criar alocações</p>
        </div>
      </header>
      
      <main class="app-main">
        <app-schedule-grid></app-schedule-grid>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .app-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 24px 0;
    }
    
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      text-align: center;
    }
    
    .app-title {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .app-subtitle {
      margin: 0;
      color: #6b7280;
      font-size: 16px;
    }
    
    .app-main {
      padding-top: 0;
    }
    
    @media (max-width: 768px) {
      .app-title {
        font-size: 24px;
      }
      
      .app-subtitle {
        font-size: 14px;
      }
      
      .header-content {
        padding: 0 16px;
      }
    }
  `]
})
export class App {}

bootstrapApplication(App);