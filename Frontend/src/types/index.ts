export interface Choice {
  id: number;
  preference_order: number;
  choice_organization: string;
}

export interface Examination {
  id: number;
  item_id: number;
  exam_type: string;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  reporting_time?: string | null;
  center_name?: string | null;
  center_address?: string | null;
  roll_range_start?: string | null;
  roll_range_end?: string | null;
  status: string;
  schedule_status: string;
  verified: boolean;
  source_notice_ref?: string | null;
}

export type ApplicationStatus =
  | 'Draft'
  | 'Applied'
  | 'Submitted'
  | 'Admit Available'
  | 'Admit Card Available'
  | 'Exam Scheduled'
  | 'Shortlisted'
  | 'Written Examination'
  | 'Viva'
  | 'Selected'
  | 'Rejected'
  | 'Waiting List';

export interface JobApplication {
  id: number;
  organization_name: string;
  post_name: string;
  job_id: string;
  grade?: string | null;
  tracking_id?: string | null;
  user_id?: string | null;
  ref_no?: string | null;
  roll_number?: string | null;
  applicant_name?: string | null;
  applicant_name_bn?: string | null;
  father_name?: string | null;
  father_name_bn?: string | null;
  mother_name?: string | null;
  mother_name_bn?: string | null;
  date_of_birth?: string | null;
  nid?: string | null;
  birth_reg?: string | null;
  passport_id?: string | null;
  gender?: string | null;
  religion?: string | null;
  marital_status?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  photo_url?: string | null;
  submit_pdf_url?: string | null;
  admit_pdf_url?: string | null;
  seat_plan_pdf_url?: string | null;
  seat_plan_status?: 'Included in Admit' | 'Seat Plan Ready' | 'Pending' | string | null;
  application_date?: string | null;
  deadline?: string | null;
  status: ApplicationStatus;
  admit_card_available: boolean;
  admit_card_url?: string | null;
  notes?: string | null;
  choices: Choice[];
  examinations?: Examination[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreatePayload {
  organization_name: string;
  post_name: string;
  job_id: string;
  grade?: string;
  tracking_id?: string | null;
  user_id?: string | null;
  ref_no?: string | null;
  roll_number?: string | null;
  applicant_name?: string | null;
  applicant_name_bn?: string | null;
  father_name?: string | null;
  father_name_bn?: string | null;
  mother_name?: string | null;
  mother_name_bn?: string | null;
  date_of_birth?: string | null;
  nid?: string | null;
  birth_reg?: string | null;
  passport_id?: string | null;
  gender?: string | null;
  religion?: string | null;
  marital_status?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  photo_url?: string | null;
  submit_pdf_url?: string | null;
  admit_pdf_url?: string | null;
  seat_plan_pdf_url?: string | null;
  seat_plan_status?: string | null;
  application_date?: string;
  deadline?: string;
  status?: string;
  admit_card_available?: boolean;
  admit_card_url?: string;
  notes?: string;
  choices?: string[];
}

export interface ApplicationUpdatePayload extends Partial<ApplicationCreatePayload> {}

export interface ApplicationListResponse {
  items: JobApplication[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface RecentActivity {
  id: number;
  title: string;
  job_id: string;
  status: string;
  date: string;
  action: string;
}

export interface DashboardStats {
  total_applications: number;
  submitted_count: number;
  upcoming_exams_count: number;
  shortlisted_count: number;
  rejected_count: number;
  pending_admit_cards: number;
  upcoming_deadlines_count: number;
  status_distribution: StatusDistribution[];
  recent_activities: RecentActivity[];
}
