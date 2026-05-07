###############################################################
# GCP Project Planner — Cloud Run Hosting
# Provisions: Artifact Registry, Cloud Build trigger,
#             Cloud Run service, IAM, custom domain (optional)
###############################################################

terraform {
  required_version = ">= 1.7"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    # Override with -backend-config="bucket=YOUR_TF_STATE_BUCKET"
    bucket = "REPLACE_WITH_YOUR_TF_STATE_BUCKET"
    prefix = "gcp-planner/cloud-run"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

###############################################################
# Artifact Registry — container image repository
###############################################################
resource "google_artifact_registry_repository" "planner" {
  repository_id = "gcp-planner"
  location      = var.region
  format        = "DOCKER"
  description   = "GCP Project Planner container images"

  labels = {
    app = "gcp-planner"
    env = var.env
  }
}

###############################################################
# Cloud Build — CI trigger (GitHub push → build → push)
###############################################################
resource "google_cloudbuild_trigger" "planner_push" {
  name        = "gcp-planner-push-${var.env}"
  description = "Build & push on push to ${var.github_branch}"

  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = "^${var.github_branch}$"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "-t", "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app:$COMMIT_SHA",
        "-t", "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app:latest",
        "."
      ]
    }
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app:$COMMIT_SHA"
      ]
    }
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = [
        "run", "deploy", google_cloud_run_v2_service.planner.name,
        "--image", "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app:$COMMIT_SHA",
        "--region", var.region,
        "--platform", "managed"
      ]
    }
    images = [
      "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app:$COMMIT_SHA"
    ]
  }
}

###############################################################
# Cloud Run v2 Service
###############################################################
resource "google_cloud_run_v2_service" "planner" {
  name     = "gcp-planner-${var.env}"
  location = var.region

  template {
    service_account = google_service_account.planner_runner.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/gcp-planner/app:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = true  # scale to zero when no traffic
      }

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = var.env
      }

      # Health check
      liveness_probe {
        http_get {
          path = "/healthz"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = {
    app = "gcp-planner"
    env = var.env
  }
}

###############################################################
# IAM — allow unauthenticated access (public app)
# Replace with Identity-Aware Proxy for internal-only access
###############################################################
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.planner.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

###############################################################
# Service Account for Cloud Run
###############################################################
resource "google_service_account" "planner_runner" {
  account_id   = "sa-gcp-planner-runner"
  display_name = "GCP Planner Cloud Run SA"
}

# Minimal permissions — only what Cloud Run needs
resource "google_project_iam_member" "runner_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.planner_runner.email}"
}

resource "google_project_iam_member" "runner_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.planner_runner.email}"
}

###############################################################
# Cloud Armor — optional WAF (toggle with var.enable_armor)
###############################################################
resource "google_compute_security_policy" "planner" {
  count = var.enable_armor ? 1 : 0
  name  = "gcp-planner-waf"

  rule {
    action   = "deny(403)"
    priority = 1000
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-stable')"
      }
    }
    description = "Block XSS attacks"
  }

  rule {
    action   = "deny(403)"
    priority = 1001
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-stable')"
      }
    }
    description = "Block SQLi attacks"
  }

  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config { src_ip_ranges = ["*"] }
    }
    description = "Default allow"
  }
}
