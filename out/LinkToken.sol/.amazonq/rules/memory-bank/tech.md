# Technology Stack

## Programming Languages and Versions

### Primary Languages
- **TypeScript 5.4.5+** - Primary development language for all packages
- **JavaScript (ES6+)** - Runtime target and some configuration files
- **Solidity** - Smart contract interactions (via ABIs)

### Language Requirements
- Node.js >= 20 (specified in package.json engines)
- TypeScript with strict mode enabled
- ES2020+ target for compilation

## Build Systems and Tools

### Package Management
- **Yarn 3.6.3** - Monorepo package manager (Berry)
- Yarn workspaces for multi-package management
- Plug'n'Play (PnP) installation strategy

### Build Tools
- **TypeScript Compiler (tsc)** - Type checking and compilation
- **Next.js 14+** - Playground application framework
- **Docusaurus** - Documentation site generator
- **Rollup/Webpack** - Module bundling (via Next.js)

### Testing Framework
- **Jest** - Unit and integration testing
- Test configuration in jest.config.ts

### Code Quality Tools
- **ESLint 8.46.0** - Linting with @lidofinance/eslint-config
- **Prettier 3.0.1** - Code formatting
- **Husky 8.0.3** - Git hooks
- **Commitlint** - Commit message validation (conventional commits)

### CI/CD
- **GitHub Actions** - Automated workflows
  - checks.yml - Linting and testing
  - publish.yml - NPM publishing
  - publish-alpha.yml - Alpha releases
  - deploy-pages.yml - Documentation deployment

## Core Dependencies

### Ethereum Libraries
- **Viem** - Modern Ethereum library (primary)
- **Web3.js** - Optional Web3 provider support
- **ethers.js** - Legacy support (being phased out)

### React Ecosystem (Playground)
- **React 18+** - UI framework
- **Next.js 14+** - React framework
- **@lido-sdk/react** - Lido-specific React hooks

### Development Dependencies
- **@typescript-eslint/parser** - TypeScript ESLint support
- **@typescript-eslint/eslint-plugin** - TypeScript linting rules
- **eslint-plugin-react** - React-specific linting
- **eslint-plugin-react-hooks** - React hooks linting
- **ts-node** - TypeScript execution for scripts

### Release Management
- **@qiwi/multi-semantic-release** - Automated versioning and publishing
- Semantic versioning with conventional commits

## Development Commands

### Workspace Commands
```bash
# Install dependencies
yarn install

# Development mode (runs playground)
yarn dev

# Build all packages
yarn build

# Build only publishable packages
yarn build:packages

# Run tests across all packages
yarn test

# Lint all packages
yarn lint

# Type checking
yarn types

# Workspace information
yarn w-info
```

### Package-Specific Commands
Each package (sdk, lido-pulse, playground, docs, examples) has:
- `yarn build` - Build the package
- `yarn test` - Run tests
- `yarn lint` - Lint code
- `yarn types` - Type checking

### Playground Commands
```bash
# Development server
yarn dev

# Production build
yarn build

# Start production server
yarn start
```

### Documentation Commands
```bash
# Development server
yarn start

# Build static site
yarn build

# Serve built site
yarn serve
```

## Configuration Files

### TypeScript Configuration
- `tsconfig.base.json` - Base configuration for all packages
- `tsconfig.json` - Package-specific overrides
- `tsconfig.build.json` - Build-specific settings

### Linting Configuration
- `.eslintrc.base.json` - Base ESLint rules
- `.eslintrc.cjs` - Package-specific overrides
- `.prettierrc` - Prettier formatting rules
- `.editorconfig` - Editor configuration

### Git Configuration
- `.gitignore` - Ignored files
- `.gitattributes` - Git attributes
- `commitlint.config.js` - Commit message rules

### Yarn Configuration
- `.yarnrc.yml` - Yarn 3 settings
- `yarn.lock` - Dependency lock file

### Environment Configuration
- `.env.example` - Environment variable templates
- Various packages have their own .env.example files

## Deployment and Publishing

### NPM Publishing
- Automated via GitHub Actions
- Multi-package semantic release
- Alpha channel for develop branch
- Main channel for production releases

### Documentation Deployment
- GitHub Pages deployment
- Automated via deploy-pages.yml workflow

### Playground Deployment
- Docker support (Dockerfile included)
- Environment-based configuration
- Static export capability
