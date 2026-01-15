.PHONY: dev-backend dev-db stop

# Start Backend (API + DB + Mail) in Docker
dev-backend:
	docker-compose -f docker-compose.dev.yml up --build app db mailhog

# Start only DB and Mail (if running Backend properly in IDE)
dev-db:
	docker-compose -f docker-compose.dev.yml up -d db mailhog

# Stop everything
stop:
	docker-compose -f docker-compose.dev.yml down
