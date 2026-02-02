/// <reference types="vite/client" />

import { neon } from '@neondatabase/serverless';

// Neon PostgreSQL Connection String
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('VITE_DATABASE_URL is not defined in environment variables');
}

// Initialize the Neon serverless SQL client
const sql = neon(DATABASE_URL);

export default sql;