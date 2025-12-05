
const subjects = [
    { name: 'Fiqh', fullMarks: 100, studentMarks: 93 },
    { name: 'Nahw', fullMarks: 100, studentMarks: 100 },
    { name: 'Arabic', fullMarks: 100, studentMarks: 75 },
    { name: 'Math', fullMarks: 100, studentMarks: 60 },
    { name: 'English', fullMarks: 100, studentMarks: 96 },
    { name: 'Hadith', fullMarks: 30, studentMarks: 19.73 },
    { name: 'Sirah', fullMarks: 100, studentMarks: 75 }
];

// Current Logic
let totalMarks = 0;
let totalFullMarks = 0;

subjects.forEach(sub => {
    totalMarks += sub.studentMarks;
    totalFullMarks += sub.fullMarks;
});

const percentageOld = totalFullMarks > 0 ? Math.round((totalMarks / totalFullMarks) * 100) : 0;

console.log('Total Marks:', totalMarks);
console.log('Total Full Marks (Current):', totalFullMarks);
console.log('Percentage (Current):', percentageOld + '%');

// Proposed Logic
const totalFullMarksNew = subjects.length * 100;
const percentageNew = totalFullMarksNew > 0 ? ((totalMarks / totalFullMarksNew) * 100).toFixed(1) : 0;

console.log('Total Full Marks (New):', totalFullMarksNew);
console.log('Percentage (New):', percentageNew + '%');
