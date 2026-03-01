terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # リモートステートを使う場合は以下のコメントを解除して設定する
  # backend "gcs" {
  #   bucket = "<GCS バケット名>"
  #   prefix = "terraform/prd"
  # }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
}

provider "google-beta" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
}

module "firebase" {
  source = "../../modules/firebase"

  project_id       = var.project_id
  location         = var.firestore_location
  app_display_name = var.app_display_name
}

output "firebase_config" {
  description = "Firebase Web SDK 設定値（.env に使用）"
  value       = module.firebase.firebase_config
  sensitive   = true
}
