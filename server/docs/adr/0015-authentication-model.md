# UniHub supports email password and Google OAuth2 login

UniHub authenticates users with first-party email/password login and Google OAuth2 login. The backend issues short-lived JWT access tokens and stores refresh token records so sessions can be rotated, revoked, and audited server-side.

