import { storage } from '../storage';
import { InsertDream } from '@shared/schema';

// Helper function to add a few dreams for testing
export const seedDefaultDreams = async () => {
  console.log('Checking if dreams need to be seeded...');
  const existingDreams = await storage.getDreams(1); // Use default user ID
  
  if (existingDreams.length === 0) {
    console.log('Seeding default dreams...');
    
    const defaultDreams: Omit<InsertDream, 'id'>[] = [
      {
        title: 'Start My Own Business',
        description: 'Build a purpose-driven company that solves meaningful problems',
        timeframe: 'medium-term',
        tags: ['career', 'passion', 'purpose'],
        userId: 1
      },
      {
        title: 'Visit 30 Countries',
        description: 'Explore different cultures and expand my worldview',
        timeframe: 'long-term',
        tags: ['travel', 'adventure', 'learning'],
        userId: 1
      },
      {
        title: 'Run a Marathon',
        description: 'Train and complete a full marathon',
        timeframe: 'short-term',
        tags: ['health', 'fitness', 'achievement'],
        userId: 1
      }
    ];
    
    for (const dream of defaultDreams) {
      await storage.createDream(dream);
    }
    
    console.log('Default dreams have been seeded.');
  } else {
    console.log(`Found ${existingDreams.length} existing dreams. No need to seed.`);
  }
};