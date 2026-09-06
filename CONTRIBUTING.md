# Contributing to KARMİS

Thank you for your interest in contributing to **KARMİS**! 

KARMİS is a privacy-first, open-source career intelligence and job application evaluation engine. We welcome contributions from developers worldwide.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- Git

### Local Setup
```bash
# Clone the repository
git clone https://github.com/itisbehrouz/karmis.git

# Navigate into project directory
cd karmis

# Install dependencies
npm install

# Run automated tests
npm test
```

---

## 🛠️ Development Workflow

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Write clean, modular, well-tested code.
3. Verify all tests pass:
   ```bash
   npm test
   ```
4. Commit your changes with clear commit messages:
   ```bash
   git commit -m "feat: add support for custom skill taxonomy rules"
   ```
5. Push to your branch and open a Pull Request.

---

## 🔒 Privacy & Data Rules

- **Zero Personal Data:** Never commit real candidate resumes, private phone numbers, or proprietary company databases to version control.
- All sample profiles must use generic templates located in `templates/` or `samples/`.
- Local SQLite database (`karmis.db`) is ignored by `.gitignore` and must remain local.

---

## 📬 Community & Support

For questions, feature ideas, bug reports, and contributions:
- **GitHub Issues:** [KARMİS Issues](https://github.com/itisbehrouz/karmis/issues)
- **GitHub Discussions:** [KARMİS Discussions](https://github.com/itisbehrouz/karmis/discussions)
