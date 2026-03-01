variable "project_id" {
  description = "GCP プロジェクト ID"
  type        = string
}

variable "app_display_name" {
  description = "Firebase マイアプリの表示名"
  type        = string
}

variable "location" {
  description = "Firestore のリージョン"
  type        = string
  default     = "asia-northeast1"
}
