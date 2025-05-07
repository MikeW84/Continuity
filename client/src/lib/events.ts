// Simple event system for client-side communication

// Define section visibility interface
export interface SectionVisibility {
  dashboard: boolean;
  today: boolean;
  projects: boolean;
  ideas: boolean;
  learning: boolean;
  habits: boolean;
  exercise: boolean;
  family: boolean;
  values: boolean;
}

// Define the event types we support
export type AppEvent = 
  | { type: 'VISIBILITY_SETTINGS_CHANGED', settings: SectionVisibility };

// Event listeners
type EventListener = (event: AppEvent) => void;
const listeners: EventListener[] = [];

// Subscribe to events
export const subscribeToEvents = (listener: EventListener): (() => void) => {
  listeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

// Publish an event
export const publishEvent = (event: AppEvent): void => {
  listeners.forEach(listener => listener(event));
};