export interface Certificate {
  id: number;
  student_name: string;
  usn: string;
  course: string;
  certificate_id: string;
  issue_date: string;
  pdf_url: string;
  qr_url: string;
  sha256_hash: string;
  block_index: number;
  is_revoked: boolean;
  created_at: string;
}

export interface Verification {
  certificate_id: string;
  student_name: string;
  usn: string;
  course: string;
  issue_date: string;
  is_revoked: boolean;
  ledger_valid: boolean;
  ledger_message: string;
  database_matches_ledger: boolean;
  registered_hash: string;
  block_index: number;
  status: string;
}
