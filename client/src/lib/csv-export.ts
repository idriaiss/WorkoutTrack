export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportWorkoutsToCSV(workouts: any[]) {
  const csvData: any[] = [];
  
  workouts.forEach(workout => {
    workout.exercises.forEach((exercise: any) => {
      exercise.sets.forEach((set: any) => {
        csvData.push({
          date: new Date(workout.startTime).toISOString().split('T')[0],
          workout: workout.name,
          exercise: exercise.exercise.name,
          bodyPart: exercise.exercise.bodyPart,
          set: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          volume: parseFloat(set.weight) * set.reps
        });
      });
    });
  });

  exportToCSV(csvData, 'workout-data.csv');
}
