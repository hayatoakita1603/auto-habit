variable "project_id" {
  description = "GCP プロジェクト ID（staging）"
  type        = string
}

variable "region" {
  description = "GCP リージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "firestore_location" {
  description = "Firestore のリージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "app_display_name" {
  description = "Firebase マイアプリの表示名"
  type        = string
  default     = "auto-habit-app"
}
