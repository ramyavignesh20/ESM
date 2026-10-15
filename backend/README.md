# Backend

## 1) MySQL
CREATE DATABASE scrum;

Edit `src/main/resources/application.properties` and set `spring.datasource.password`.

## 2) Run
mvn spring-boot:run

Set `app.delete-default-projects=true` in `src/main/resources/application.properties` to clear any existing default project records on startup.

Backend: http://localhost:8080

Default admin: admin / admin123

## API
POST /api/auth/register
POST /api/auth/login
GET  /api/admin/dashboard (ADMIN)
GET  /api/admin/projects (ADMIN)
POST /api/admin/projects (ADMIN)
GET  /api/admin/sprints (ADMIN)
POST /api/admin/sprints (ADMIN)
GET  /api/admin/tasks (ADMIN)
POST /api/admin/tasks (ADMIN)
GET  /api/admin/columns/{projectId} (ADMIN)
POST /api/admin/columns (ADMIN)
GET  /api/user/me (USER/ADMIN)
GET  /api/user/dashboard (USER/ADMIN)
