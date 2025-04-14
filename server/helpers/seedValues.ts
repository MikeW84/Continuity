import { storage } from '../storage';
import { InsertValue } from '@shared/schema';

// Helper function to add a set of core values for testing
export const seedDefaultValues = async () => {
  console.log('Checking if values need to be seeded...');
  const existingValues = await storage.getValues(1); // Use default user ID
  
  if (existingValues.length === 0) {
    console.log('Seeding default values...');
    
    const defaultValues: Omit<InsertValue, 'id'>[] = [
      {
        title: 'Continuous Growth',
        description: 'Commitment to lifelong learning and personal development',
        userId: 1
      },
      {
        title: 'Family Connection',
        description: 'Maintaining strong relationships with loved ones',
        userId: 1
      },
      {
        title: 'Health & Wellbeing',
        description: 'Prioritizing physical and mental health',
        userId: 1
      },
      {
        title: 'Service & Contribution',
        description: 'Making a positive impact in the world',
        userId: 1
      },
      {
        title: 'Integrity',
        description: 'Acting with honesty and adhering to moral principles',
        userId: 1
      }
    ];
    
    for (const value of defaultValues) {
      await storage.createValue(value);
    }
    
    console.log('Default values have been seeded.');
  } else {
    console.log(`Found ${existingValues.length} existing values. No need to seed.`);
  }
};