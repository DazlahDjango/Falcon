variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS deployment region"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment (production, staging, dev)"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block"
}

variable "db_instance_class" {
  type        = string
  default     = "db.r6g.xlarge"
  description = "PostgreSQL RDS instance class"
}

variable "db_allocated_storage" {
  type        = number
  default     = 100
  description = "Allocated storage for DB in GB"
}

variable "redis_node_type" {
  type        = string
  default     = "cache.t4g.medium"
  description = "ElastiCache Redis node type"
}
