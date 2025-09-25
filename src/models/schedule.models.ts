export interface Discipline {
  id: string;
  name: string;
  code: string;
  color?: string;
  duration: number; // in minutes
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Weekday {
  id: string;
  name: string;
  shortName: string;
  order: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  order: number;
  weekdayId?: string;
  slotState?: AllocationState;
}

export interface Allocation {
  id: string;
  disciplineId: string;
  professorIds: string[];
  weekdayId: string;
  timeSlotId: string;
  discipline?: Discipline;
  professors?: Professor[];
}

export interface ScheduleGridData {
  weekdays: Weekday[];
  timeSlots: TimeSlot[];
  allocations: Allocation[];
  disciplines: Discipline[];
  professors: Professor[];
}

export interface AllocationRequest {
  disciplineId?: string;
  professorIds?: string[];
  weekdayId: string;
  timeSlotId: string;
}

export interface DragDropData {
  type: 'discipline' | 'professor' | 'allocation';
  data: Discipline | Professor | Allocation;
  sourceSlotId?: string;
}

export enum AllocationState {
  EMPTY = 'empty',
  DISCIPLINE_ONLY = 'discipline-only',
  DISCIPLINE_WITH_PROFESSORS = 'discipline-with-professors'
}