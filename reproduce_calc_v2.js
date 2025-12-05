
const subjects = [
    { name: 'Fiqh', fullMarks: 100, studentMarks: 93 },
    { name: 'Nahw', fullMarks: 100, studentMarks: 100 },
    { name: 'Arabic', fullMarks: 100, studentMarks: 75 },
    { name: 'Math', fullMarks: 100, studentMarks: 60 },
    { name: 'English', fullMarks: 100, studentMarks: 96 },
    { name: 'Hadith', fullMarks: 30, studentMarks: 19.73 },
    { name: 'Sirah', fullMarks: 100, studentMarks: 75 }
];

// New Logic from AdminStudents.tsx
let totalMarks = 0;
subjects.forEach(sub => {
    totalMarks += Number(sub.studentMarks);
});

const standardizedFullMarks = subjects.length * 100;
const percentageRaw = standardizedFullMarks > 0 ? (totalMarks / standardizedFullMarks) * 100 : 0;
const percentage = Number(percentageRaw.toFixed(1));

console.log('Total Marks:', Number(totalMarks.toFixed(2)));
console.log('Standardized Full Marks:', standardizedFullMarks);
console.log('Percentage:', percentage + '%');

if (percentage === 74.1) {
    console.log('SUCCESS: Calculation matches expected result.');
} else {
    console.log('FAILURE: Calculation does not match.');
}
