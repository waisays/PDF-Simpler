# Contributing to PDF Simpler

Thank you for your interest in contributing to PDF Simpler! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- Git
- npm or yarn

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/pdf-simpler.git
   cd pdf-simpler
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Set up database**
   ```bash
   mysql -u root -p < database_schema.sql
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write code following our coding standards**
2. **Add tests for new functionality**
3. **Update documentation**
4. **Commit changes with descriptive messages**

### Commit Message Format

Follow conventional commits:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(upload): resolve file size validation issue"
git commit -m "docs(api): update authentication endpoints"
```

## Coding Standards

### JavaScript/Node.js

#### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use const/let instead of var
- Follow Airbnb JavaScript Style Guide

#### Example:
```javascript
// Good
const userService = require('../services/userService');

async function getUserById(id) {
  try {
    const user = await userService.findById(id);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

// Bad
var userService = require('../services/userService')

function getUserById(id){
  try{
    var user = await userService.findById(id)
    return user
  }catch(error){
    console.log("error",error)
    throw "error"
  }
}
```

#### Error Handling
- Always handle errors appropriately
- Use try-catch for async operations
- Provide meaningful error messages
- Log errors for debugging

#### Security
- Never commit sensitive data
- Validate all user inputs
- Use parameterized queries
- Sanitize data before storage

### Frontend (HTML/CSS/JavaScript)

#### HTML
- Use semantic HTML5 elements
- Include proper meta tags
- Use ARIA labels for accessibility
- Optimize for SEO

#### CSS
- Use CSS variables for theming
- Follow BEM naming convention
- Ensure responsive design
- Optimize for performance

#### JavaScript
- Use modern ES6+ features
- Implement proper error handling
- Add loading states
- Optimize for performance

### Database

#### SQL
- Use uppercase for SQL keywords
- Add comments for complex queries
- Use proper indexing
- Follow naming conventions

#### Example:
```sql
-- Good
SELECT u.id, u.name, u.email, COUNT(t.id) as task_count
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
WHERE u.plan = 'pro'
GROUP BY u.id, u.name, u.email
ORDER BY task_count DESC;

-- Bad
select * from users where plan='pro'
```

## Testing Guidelines

### Unit Tests

```javascript
// Example unit test
describe('UserService', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      const user = await userService.findById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should throw error when user not found', async () => {
      await expect(userService.findById(999))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

### Integration Tests

```javascript
// Example integration test
describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});
```

### Testing Checklist

- [ ] Unit tests for new functions
- [ ] Integration tests for API endpoints
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Ensure all tests pass
- [ ] Test on different browsers (for frontend)

## Documentation

### Code Documentation

```javascript
/**
 * Process a PDF file with the specified tool
 * @param {string} toolSlug - The tool identifier
 * @param {Express.Multer.File} file - The uploaded file
 * @param {Object} options - Tool-specific options
 * @returns {Promise<string>} Path to processed file
 * @throws {Error} If processing fails
 */
async function processPdf(toolSlug, file, options) {
  // Implementation
}
```

### API Documentation

- Update API.md for new endpoints
- Include request/response examples
- Document error responses
- Add authentication requirements

### README Updates

- Update features list
- Add new configuration options
- Update installation instructions
- Add new examples

## Pull Request Process

### Before Submitting

1. **Test your changes**
   ```bash
   npm test
   ```

2. **Lint your code**
   ```bash
   npm run lint
   ```

3. **Update documentation**
   - Update relevant documentation files
   - Add comments to complex code
   - Update README if needed

4. **Ensure clean history**
   ```bash
   git rebase -i HEAD~n  # Interactive rebase
   ```

### Creating Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request on GitHub**
   - Use descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #123, #456
```

### Review Process

1. **Automated checks**
   - CI/CD pipeline runs
   - Code quality checks
   - Security scans

2. **Peer review**
   - At least one approval required
   - Address review comments
   - Make requested changes

3. **Merge**
   - Squash commits if needed
   - Merge to main branch
   - Delete feature branch

## Issue Reporting

### Bug Reports

**Bug Report Template:**

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 100, Safari 15]
- Node.js version: [e.g. 20.0.0]
- PDF Simpler version: [e.g. 1.0.0]

## Additional Context
Any other relevant information
```

### Feature Requests

**Feature Request Template:**

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What alternatives have you considered?

## Additional Context
Any other relevant information or examples
```

## Getting Help

### Resources
- [README.md](README.md) - Project overview
- [API.md](API.md) - API documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

### Communication
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and ideas
- Email - support@pdfsimpler.com

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## License

By contributing to PDF Simpler, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PDF Simpler! 🎉