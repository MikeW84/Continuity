import dotenv from 'dotenv';
dotenv.config();
console.log('[env-load] DATABASE_URL:', process.env.DATABASE_URL);
console.log('[env-load] NODE_ENV:', process.env.NODE_ENV);
console.log('[env-load] Partial process.env:', Object.fromEntries(Object.entries(process.env).filter(([k]) => k.includes('DATABASE') || k.includes('PORT'))));
