
import { neon } from '@neondatabase/serverless';

// Neon PostgreSQL Connection String
// Note: Parameters like sslmode are handled automatically by the driver/platform
const DATABASE_URL = 'postgresql://neondb_owner:npg_URAWtT5zMhP8@ep-sparkling-wave-a4zj5ldb-pooler.us-east-1.aws.neon.tech/neondb';

// Initialize the Neon serverless SQL client
const sql = neon(DATABASE_URL);

export default sql;