# State bootstrap status

The shared Terraform state bucket has already been created:

`fitness-tracker-622004253908-ca-central-1-tfstate`

The development configuration in `../envs/dev` uses this bucket and S3 lock files. Do not recreate the bootstrap infrastructure during normal application work.
