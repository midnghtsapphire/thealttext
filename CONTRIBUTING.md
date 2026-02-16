# Contributing to TheAltText

Thank you for your interest in contributing to TheAltText! This project aims to make the web more accessible for everyone.

## Development Process

We follow a **dev → test → live** deployment process:

1. **Development**: Create a feature branch from `develop`
2. **Testing**: Open a PR to `develop` — automated tests run via GitHub Actions
3. **Code Review**: All PRs are reviewed with [CodeRabbit](https://coderabbit.ai/) and manual review
4. **Production**: Merge to `main` only after thorough testing

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/thealttext.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Run tests: `cd backend && python -m pytest tests/ -v`
6. Commit: `git commit -m 'Add your feature'`
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request

## Code Standards

- **Backend**: Follow PEP 8, use type hints, write docstrings
- **Frontend**: TypeScript strict mode, functional components, proper ARIA attributes
- **Accessibility**: Every interactive element must have proper labels and keyboard support
- **Testing**: Write tests for new features

## Accessibility Requirements

Since TheAltText is an accessibility tool, we hold ourselves to the highest standards:

- All images must have descriptive alt text
- All interactive elements must be keyboard accessible
- All form inputs must have associated labels
- Color contrast must meet WCAG AAA (7:1 ratio)
- Support `prefers-reduced-motion` and `prefers-contrast`

---

*A GlowStarLabs project by Audrey Evans*
