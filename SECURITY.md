# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in TheAltText, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email security concerns to the repository maintainer
3. Include a detailed description of the vulnerability
4. Allow 48 hours for an initial response

## Security Measures

TheAltText implements the following security measures:

- JWT-based authentication with bcrypt password hashing
- API key authentication with hashed storage
- Rate limiting on all endpoints
- Input validation with Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Environment-based secret management

---

*A GlowStarLabs project by Audrey Evans*
