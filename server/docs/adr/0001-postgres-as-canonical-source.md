# Postgres as canonical source for UniHub data

UniHub stores its canonical course, material, user, permission, review, and notification data in Postgres. This gives the Spring Boot backend one authoritative write model for enforcing permissions, auditing material changes, and generating notifications.
