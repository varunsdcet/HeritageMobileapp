import { Routes, RouteName } from './routes';
import type { IconName } from '../components/Icon';
import type { Capability } from '../domain/types';

export interface MenuItem {
  key: string;
  label: string;
  description?: string;
  icon: IconName;
  route: RouteName;
  params?: Record<string, unknown>;
  capability?: Capability;
  group: string;
  /** Marks screens that are inferred supporting screens, not supplied designs. */
  inferred?: boolean;
  liveOnly?: boolean;
}

/** Student Profile / services hub. Every supplied student module is reachable here. */
export const studentServicesMenu: MenuItem[] = [
  { key: 'myCourses', label: 'My Courses', description: 'Enrolled courses & timetables', icon: 'BookOpen', route: Routes.StudentMyCourses, group: 'Academics' },
  { key: 'assignments', label: 'Assignments', description: 'Upcoming, graded and drafts', icon: 'ClipboardList', route: Routes.StudentAssignments, group: 'Academics' },
  { key: 'attendance', label: 'Attendance', description: 'Session records & corrections', icon: 'CalendarCheck', route: Routes.StudentAttendance, group: 'Academics' },
  { key: 'workshops', label: 'My Workshops', description: 'Browse & register for sessions', icon: 'Users', route: Routes.StudentWorkshops, group: 'Academics' },
  { key: 'programPlan', label: 'Program Plan', description: 'Curriculum pathway', icon: 'Route', route: Routes.StudentProgramPlan, group: 'Records' },
  { key: 'finalMarks', label: 'Final Marks / Grades', description: 'Results & credits', icon: 'GraduationCap', route: Routes.StudentFinalMarks, group: 'Records' },
  { key: 'badges', label: 'Accomplishments & Badges', description: 'Earned & available', icon: 'Award', route: Routes.StudentBadges, group: 'Records' },
  { key: 'extracurricular', label: 'Extracurricular Records', description: 'Leadership, volunteer, athletics', icon: 'Trophy', route: Routes.StudentExtracurricular, group: 'Records' },
  { key: 'certificates', label: 'Certificates', description: 'Self-paced programme certificates', icon: 'ScrollText', route: Routes.StudentMyLearning, group: 'Records' },
  { key: 'evaluations', label: 'Course Evaluations', description: 'Rate your courses', icon: 'MessageSquareText', route: Routes.StudentCourseEvaluation, group: 'Academics', liveOnly: true },
  { key: 'career', label: 'Career Services', description: 'Co-op, jobs & coaching', icon: 'BriefcaseBusiness', route: Routes.StudentCareer, group: 'Services', liveOnly: true },
  { key: 'tasks', label: 'Required Tasks', description: 'Pending & completed', icon: 'ListChecks', route: Routes.StudentRequiredTasks, group: 'Services' },
  { key: 'documents', label: 'My Documents', description: 'Official documents', icon: 'FileText', route: Routes.StudentDocuments, group: 'Services' },
  { key: 'tax', label: 'Tax Documents / Forms', description: 'T2202 tuition slips', icon: 'Receipt', route: Routes.StudentTaxDocuments, group: 'Services' },
  { key: 'finance', label: 'Financial Statements', description: 'Fees, payments, balance', icon: 'Wallet', route: Routes.StudentFinance, group: 'Services' },
  { key: 'leave', label: 'Leave of Absence', description: 'Requests & history', icon: 'CalendarOff', route: Routes.StudentLeave, group: 'Services' },
  { key: 'englishTest', label: 'HCC English Test', description: 'Placement registration', icon: 'Languages', route: Routes.StudentEnglishTest, group: 'Services' },
  { key: 'askHeritage', label: 'Ask Campus One', description: 'Read-only records assistant', icon: 'Sparkles', route: Routes.AskHeritage, group: 'Help' },
  { key: 'support', label: 'Student Support', description: 'Contact & help', icon: 'LifeBuoy', route: Routes.StudentSupport, group: 'Help', inferred: true },
  { key: 'personalDetails', label: 'Update Personal Details', description: 'Contact & emergency info', icon: 'UserPen', route: Routes.StudentSecurity, params: { next: 'personalDetails' }, group: 'Settings' },
  { key: 'security', label: 'Security Settings', description: 'Verify & change password', icon: 'ShieldCheck', route: Routes.StudentSecurity, params: { next: 'changePassword' }, group: 'Settings' },
  { key: 'timezone', label: 'Time Zone', description: 'Display time zone', icon: 'Globe', route: Routes.TimeZone, group: 'Settings' },
  { key: 'notifications', label: 'Notifications', description: 'All, unread, read', icon: 'Bell', route: Routes.Notifications, group: 'Settings' },
];

/** Instructor More tab – exposes every remaining supplied module. */
export const instructorMoreMenu: MenuItem[] = [
  { key: 'aiDraft', label: 'AI Draft', description: 'Lessons, quizzes & narrated video', icon: 'Sparkles', route: Routes.InstructorAiDraft, group: 'Teaching' },
  { key: 'aiCourse', label: 'AI Course Builder', description: 'Blueprint, generate & publish a course', icon: 'Wand', route: Routes.InstructorAiCourse, group: 'Teaching', liveOnly: true },
  { key: 'students', label: 'Student List', description: 'Students in your sections', icon: 'Users', route: Routes.InstructorStudentList, capability: 'students.directory', group: 'Teaching' },
  { key: 'courseAttendance', label: 'Course Attendance', description: 'Daily roll across courses', icon: 'CalendarCheck', route: Routes.InstructorCourseAttendance, group: 'Teaching' },
  { key: 'evaluations', label: 'Course Evaluations Results', description: 'Ratings & comments', icon: 'MessageSquareText', route: Routes.InstructorEvaluations, group: 'Teaching' },
  { key: 'history', label: 'Course History', description: 'Past offerings', icon: 'History', route: Routes.InstructorCourseHistory, group: 'Teaching' },
  { key: 'workshops', label: 'Workshop Enrolments', description: 'Approve, decline, drop', icon: 'ClipboardCheck', route: Routes.InstructorWorkshopEnrolments, capability: 'workshops.approve', group: 'Operations' },
  { key: 'repository', label: 'Course Content Repository', description: 'Packages, push/pull', icon: 'Database', route: Routes.InstructorRepository, capability: 'repository.manage', group: 'Operations' },
  { key: 'schedules', label: 'Pending Course Schedules', description: 'Conflicts & decisions', icon: 'CalendarClock', route: Routes.InstructorPendingSchedules, capability: 'schedules.review', group: 'Operations' },
  { key: 'faculties', label: 'Faculties & Programs', description: 'Faculty & program registry', icon: 'Building2', route: Routes.InstructorFaculties, capability: 'registry.faculties', group: 'Registry' },
  { key: 'programTypes', label: 'Program Types', description: 'Credential tiers', icon: 'Layers', route: Routes.InstructorProgramTypes, capability: 'registry.programTypes', group: 'Registry' },
  { key: 'terms', label: 'Manage Terms', description: 'Academic terms & campuses', icon: 'CalendarRange', route: Routes.InstructorManageTerms, capability: 'registry.terms', group: 'Registry' },
  { key: 'profile', label: 'My Profile', description: 'Biography, topics, accomplishments', icon: 'UserRound', route: Routes.InstructorProfile, group: 'Account' },
  { key: 'askHeritage', label: 'Ask Campus One', description: 'Read-only records assistant', icon: 'MessageCircleQuestion', route: Routes.AskHeritage, group: 'Account' },
  { key: 'notifications', label: 'Notifications', description: 'All, unread, read', icon: 'Bell', route: Routes.Notifications, group: 'Account' },
  { key: 'timezone', label: 'Change Your Time Zone', description: 'Display time zone', icon: 'Globe', route: Routes.TimeZone, group: 'Account' },
  { key: 'security', label: 'Security Settings', description: 'Verify & change password', icon: 'ShieldCheck', route: Routes.StudentSecurity, params: { next: 'changePassword' }, group: 'Account' },
];

export const studentTabs = [
  { route: Routes.StudentHomeTab, label: 'Home', icon: 'House' as IconName },
  { route: Routes.StudentCoursesTab, label: 'Courses', icon: 'BookOpen' as IconName },
  { route: Routes.StudentScheduleTab, label: 'Schedule', icon: 'CalendarDays' as IconName },
  { route: Routes.StudentMessagesTab, label: 'Messages', icon: 'Mail' as IconName },
  { route: Routes.StudentProfileTab, label: 'Profile', icon: 'UserRound' as IconName },
] as const;

export const instructorTabs = [
  { route: Routes.InstructorHomeTab, label: 'Home', icon: 'House' as IconName },
  { route: Routes.InstructorCoursesTab, label: 'Courses', icon: 'BookOpen' as IconName },
  { route: Routes.InstructorGradesTab, label: 'Grades', icon: 'ClipboardList' as IconName },
  { route: Routes.InstructorMessagesTab, label: 'Messages', icon: 'Mail' as IconName },
  { route: Routes.InstructorMoreTab, label: 'More', icon: 'LayoutGrid' as IconName },
] as const;

export const applicantTabs = [
  { route: Routes.ApplicantHomeTab, label: 'Home', icon: 'House' as IconName },
  { route: Routes.ApplicantApplicationTab, label: 'Application', icon: 'ClipboardList' as IconName },
  { route: Routes.ApplicantDocumentsTab, label: 'Documents', icon: 'FileText' as IconName },
  { route: Routes.ApplicantMessagesTab, label: 'Messages', icon: 'Mail' as IconName },
  { route: Routes.ApplicantMoreTab, label: 'More', icon: 'LayoutGrid' as IconName },
] as const;
