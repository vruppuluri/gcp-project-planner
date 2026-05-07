###############################################################
# Outputs
###############################################################

output "cloud_run_url" {
  description = "Public URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.planner.uri
}

output "artifact_registry_repo" {
  description = "Full Artifact Registry repository path"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app"
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.planner_runner.email
}

output "cloud_build_trigger_id" {
  description = "Cloud Build trigger ID"
  value       = google_cloudbuild_trigger.planner_push.id
}
