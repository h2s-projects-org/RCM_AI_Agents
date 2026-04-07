import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ConfigSchema = z.object({
  // GCP and Firebase
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  
  // APIs
  GEMINI_API_KEY: z.string({
    message: "GEMINI_API_KEY is required for the application to function."
  })
});

// Create a typed, validated config object
let config: z.infer<typeof ConfigSchema>;

try {
  config = ConfigSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment configuration:');
    error.issues.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { config };