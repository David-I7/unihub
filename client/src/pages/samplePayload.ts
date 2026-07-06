import type { ContributionType } from '@/domain'

export function samplePayload(type: ContributionType) {
  const samples: Record<ContributionType, unknown> = {
    'add-material': { id: 'new-material', type: 'video', title: 'New Video Material', url: 'https://example.edu/material', addedAt: new Date().toISOString() },
    'update-material': { id: 'existing-material', type: 'video', title: 'Updated Video Material', url: 'https://example.edu/updated-material', updatedAt: new Date().toISOString() },
    'add-assignment-deadline': { id: 'new-assignment', title: 'New Assignment', dueAt: '2026-11-01T21:59:00.000Z', materialIds: [], gradeWeight: 10 },
    'add-exam': { id: 'new-exam', title: 'New Exam', materialIds: [], gradeWeight: 20 },
    'add-course-session': { id: 'new-session', title: 'New Lecture', startsAt: '2026-11-03T08:00:00.000Z', endsAt: '2026-11-03T10:00:00.000Z', status: 'scheduled' },
    'edit-course-metadata': { title: 'Updated Course Title', professors: ['Dr. Updated Professor'] },
    'add-new-course': { id: 'new-course', title: 'New Course', professors: ['Dr. New Professor'], materials: [], assignmentDeadlines: [], courseSessions: [], exams: [] },
    'add-academic-year': { academicYearId: '2026-2027', label: '2026-2027' },
    'add-study-year': { academicYearId: '2025-2026', studyYearId: 'year-1', label: 'Study Year 1' },
    'add-semester': { academicYearId: '2025-2026', studyYearId: 'year-1', semesterId: 'semester-1', label: 'Semester 1', courseId: 'new-course', courseTitle: 'New Course' },
  }
  return JSON.stringify(samples[type], null, 2)
}
