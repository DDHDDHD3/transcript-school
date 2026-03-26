import sql from './src/db.js';

async function countStudents() {
    try {
        const counts = await sql`SELECT class_level, count(*) FROM students GROUP BY class_level`;
        console.log("Students per class:");
        console.log(counts);
        
        const attendances = await sql`SELECT student_id, count(*) as count FROM attendance GROUP BY student_id`;
        console.log("Attendance per student:");
        console.log(attendances.slice(0, 10)); // just look at a few

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
countStudents();
