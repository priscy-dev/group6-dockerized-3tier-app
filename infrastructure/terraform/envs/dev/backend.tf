terraform {
  backend "s3" {
    bucket       = "fitness-tracker-622004253908-ca-central-1-tfstate"
    key          = "environments/dev/terraform.tfstate"
    region       = "ca-central-1"
    encrypt      = true
    use_lockfile = true
  }
}
