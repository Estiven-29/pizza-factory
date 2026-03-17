provider "aws" {
  region = "us-east-1"
}

# ---------------------------------------------------------------------------
# VPC & Subnets (Multi-AZ)
# ---------------------------------------------------------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "pizza-vpc"
  cidr = "10.0.0.0/16"
  azs  = ["us-east-1a", "us-east-1b"]

  public_subnets   = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets  = ["10.0.101.0/24", "10.0.102.0/24"] # Private App Subnets
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24"] # Private DB Subnets

  enable_nat_gateway     = true
  single_nat_gateway     = false # 1 NAT GW por AZ, tal como en el diagrama
  one_nat_gateway_per_az = true
}

# ---------------------------------------------------------------------------
# Security Groups
# ---------------------------------------------------------------------------
resource "aws_security_group" "sg_alb" {
  name        = "SG-ALB"
  description = "Allow 80/443 from 0.0.0.0/0"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "sg_front" {
  name        = "SG-Front"
  description = "Allow 80/443 from SG-ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_alb.id]
  }
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "sg_back" {
  name        = "SG-Back"
  description = "Allow 8080 from SG-Front"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_front.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "sg_db" {
  name        = "SG-DB"
  description = "Allow DB Port from SG-Back"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432 # Mantenemos PostgreSQL (5432) como pediste
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_back.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---------------------------------------------------------------------------
# ALB Público (Front-end)
# ---------------------------------------------------------------------------
resource "aws_lb" "public_alb" {
  name               = "pizza-public-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_alb.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_target_group" "front_tg" {
  name     = "pizza-front-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  
  health_check {
    path = "/"
    port = "80"
  }
}

resource "aws_lb_listener" "front_listener" {
  load_balancer_arn = aws_lb.public_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.front_tg.arn
  }
}

# ---------------------------------------------------------------------------
# ALB Interno (Regla: SG-Front a SG-Back en puerto 8080)
# ---------------------------------------------------------------------------
# Usamos SG-Front para el ALB interno así respetamos el diagrama "Allow 8080 from SG-Front" en el DB backend
resource "aws_lb" "internal_alb" {
  name               = "pizza-internal-alb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_front.id] # El ALB asume identidad front
  subnets            = module.vpc.private_subnets
}

resource "aws_lb_target_group" "back_tg" {
  name     = "pizza-back-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  
  health_check {
    path = "/docs" # FastAPI Docs usualmente responde 200
    port = "8080"
  }
}

resource "aws_lb_listener" "back_listener" {
  load_balancer_arn = aws_lb.internal_alb.arn
  port              = "8080"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.back_tg.arn
  }
}

# ---------------------------------------------------------------------------
# ASG Front-end
# ---------------------------------------------------------------------------
resource "aws_launch_template" "frontend" {
  name_prefix   = "pizza-frontend-"
  image_id      = "ami-0c02fb55956c7d316" # Amazon Linux 2023
  instance_type = "t3.micro"
  vpc_security_group_ids = [aws_security_group.sg_front.id]
  
  user_data = base64encode(templatefile("${path.module}/../scripts/userdata-frontend.sh", {
    backend_url = aws_lb.internal_alb.dns_name
  }))
}

resource "aws_autoscaling_group" "frontend_asg" {
  name                = "ASG Front-end"
  desired_capacity    = 2
  max_size            = 6
  min_size            = 2
  target_group_arns   = [aws_lb_target_group.front_tg.arn]
  vpc_zone_identifier = module.vpc.private_subnets
  
  launch_template {
    id      = aws_launch_template.frontend.id
    version = "$Latest"
  }
}

# ---------------------------------------------------------------------------
# ASG Back-end
# ---------------------------------------------------------------------------
resource "aws_launch_template" "backend" {
  name_prefix   = "pizza-backend-"
  image_id      = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  vpc_security_group_ids = [aws_security_group.sg_back.id]
  
  user_data = base64encode(templatefile("${path.module}/../scripts/userdata-backend.sh", {
    db_endpoint = module.rds.db_instance_endpoint
    db_name     = "pizza"
    db_user     = "pizzauser"
    db_pass     = "SecurePass2026!"
  }))
}

resource "aws_autoscaling_group" "backend_asg" {
  name                = "ASG Back-end"
  desired_capacity    = 2
  max_size            = 8
  min_size            = 2
  target_group_arns   = [aws_lb_target_group.back_tg.arn]
  vpc_zone_identifier = module.vpc.private_subnets
  
  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }
}

# ---------------------------------------------------------------------------
# RDS Multi-AZ (PostgreSQL mantenido)
# ---------------------------------------------------------------------------
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"
  
  identifier           = "pizza-db-primary"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.medium" # Match the diagram size!
  allocated_storage    = 20
  multi_az             = true           # Replicación Síncrona a Standby
  
  db_name  = "pizza"
  username = "pizzauser"
  password = "SecurePass2026!"
  port     = "5432"
  
  vpc_security_group_ids = [aws_security_group.sg_db.id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  
  skip_final_snapshot = true
}

output "alb_public_dns" {
  value = aws_lb.public_alb.dns_name
  description = "The public URL for the Pizza Factory"
}
