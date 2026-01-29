.PHONY: dev-backend dev-db stop start

# Start Backend (API + DB + Mail + Frontend) in Docker
dev-backend:
	docker-compose up --build

# Start only DB and Mail (if running Backend properly in IDE)
dev-db:
	docker-compose up -d db mailhog

# Stop everything
stop:
	docker-compose down

# Alias for dev-backend
start: dev-backend
