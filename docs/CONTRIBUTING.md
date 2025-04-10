# Contributing Guide

## Introduction
Thank you for your interest in contributing to our cross-chain bridge project! This guide will help you understand how to contribute effectively and what we expect from contributors.

## Getting Started

### Prerequisites
- Basic understanding of blockchain technology
- Familiarity with smart contract development
- Knowledge of Solidity and/or Rust
- Git and GitHub basics

### Setting Up Your Development Environment
1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/contracts.git
cd contracts
```

3. Install dependencies:
```bash
npm install
```

4. Set up your development environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Contribution Workflow

### 1. Creating a Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Making Changes
- Follow our coding standards
- Write clear commit messages
- Add tests for new features
- Update documentation

### 3. Testing Your Changes
```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test/file
```

### 4. Submitting a Pull Request
1. Push your changes:
```bash
git push origin feature/your-feature-name
```

2. Create a pull request on GitHub
3. Fill out the PR template
4. Wait for review

## Coding Standards

### Solidity Standards
1. **Style Guide**
   - Use 4 spaces for indentation
   - Follow Solidity Style Guide
   - Use meaningful variable names

2. **Security Practices**
   - Implement access controls
   - Use SafeMath for arithmetic
   - Follow checks-effects-interactions pattern

3. **Documentation**
   - Add NatSpec comments
   - Document all public functions
   - Explain complex logic

### Rust Standards (for Solana)
1. **Style Guide**
   - Follow Rust Style Guide
   - Use clippy for linting
   - Format with rustfmt

2. **Security Practices**
   - Implement proper error handling
   - Use safe arithmetic
   - Validate inputs

3. **Documentation**
   - Add rustdoc comments
   - Document public APIs
   - Include examples

## Pull Request Process

### 1. PR Requirements
- Clear description of changes
- Related issue number (if applicable)
- Passing tests
- Updated documentation

### 2. Review Process
- Code review by maintainers
- Security review if needed
- Testing verification

### 3. Merge Process
- Squash and merge
- Delete feature branch
- Update version if needed

## Issue Reporting

### Creating an Issue
1. Check existing issues
2. Use the issue template
3. Provide detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

### Issue Labels
- bug: Something isn't working
- enhancement: New feature or request
- documentation: Documentation changes
- question: Further information is requested
- help wanted: Extra attention is needed

## Documentation

### Writing Documentation
1. Use clear, simple language
2. Include examples
3. Add diagrams when helpful
4. Keep it up to date

### Documentation Types
- API documentation
- User guides
- Development guides
- Security documentation

## Security

### Reporting Security Issues
1. Don't create a public issue
2. Email security@your-org.com
3. Include detailed information
4. Wait for response

### Security Best Practices
1. Never commit private keys
2. Use environment variables
3. Follow security guidelines
4. Regular security audits

## Community

### Getting Help
- Join our Discord
- Check documentation
- Search issues
- Ask questions

### Staying Updated
- Watch repository
- Join mailing list
- Follow on social media
- Attend community calls

## License
By contributing, you agree that your contributions will be licensed under the project's MIT License. 