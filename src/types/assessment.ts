export interface AssessmentResponse {
  id: number;
  id_evaluator: number;
  id_course: number;
  id_period: number;
  status: 'pending' | 'completed';
  evaluator: Evaluator;
  course: Course;
  createdAt: string;
}

export interface Evaluator {
  id: number;
  name: string;
  image_url: string;
}

export interface Course {
  id: number;
  name: string;
  id_faculty: number;
  faculty: Faculty;
}

export interface Faculty {
  id: number;
  name: string;
}

export interface AssessmentsResponse {
  grouped: AssessmentGroupedResponse[];
  ungrouped: AssessmentResponse[];
}

export interface AssessmentGroupedResponse {
  course_name: string;
  period: Period;
  assessments: AssessmentResponse[];
}

export interface Period {
  id: number;
  date_start: string;
  date_end: string;
  semester: string;
  open: boolean;
}

export interface DimensionResult {
  name: string;
  description: string;
  score: number;
  totalPoint: number;
} 