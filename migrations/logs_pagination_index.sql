-- migrations/004_logs_pagination_index.sql
CREATE INDEX IF NOT EXISTS idx_logs_student_date ON logs (students_id, date_read DESC, log_id DESC);
CREATE INDEX IF NOT EXISTS idx_logs_student_logid ON logs (students_id, log_id DESC);

