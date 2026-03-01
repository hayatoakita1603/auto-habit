output "project_id" {
  description = "Firebase プロジェクト ID"
  value       = google_firebase_project.default.project
}

output "firestore_location" {
  description = "Firestore リージョン"
  value       = google_firestore_database.default.location_id
}

output "web_app_id" {
  description = "Firebase Web アプリ ID"
  value       = google_firebase_web_app.default.app_id
}

output "firebase_config" {
  description = "Firebase Web SDK 設定値（.env に使用）"
  value = {
    api_key             = data.google_firebase_web_app_config.default.api_key
    auth_domain         = data.google_firebase_web_app_config.default.auth_domain
    project_id          = var.project_id
    storage_bucket      = data.google_firebase_web_app_config.default.storage_bucket
    messaging_sender_id = data.google_firebase_web_app_config.default.messaging_sender_id
    app_id              = google_firebase_web_app.default.app_id
  }
  sensitive = true
}
