# Project Structure

## Directory Organization

### Root Level Structure
```
/Users/elmz/base-token/out/LinkToken.sol/
├── .amazonq/                    # Amazon Q configuration and memory bank
├── .codex/                      # Codex environment configurations
├── evm-opcodes/                 # EVM opcodes reference documentation
├── staking_deposit-cli-fdab65d-darwin-amd64/
│   └── validator_keys/
│       └── scripts/
│           └── swarm/
│               └── lido-ethereum-sdk/  # Main SDK monorepo
└── [various config files]
```

### Lido Ethereum SDK Monorepo Structure

#### Core Directories

**packages/** - Core SDK packages
- `sdk/` - Main Lido Ethereum SDK package with staking, wrapping, withdrawals modules
- `lido-pulse/` - Event monitoring and notification service

**playground/** - Interactive demo application
- Next.js application demonstrating SDK usage
- Components for testing all SDK features
- Provider setup examples (Web3, SDK initialization)
- Demo sections for each SDK module

**examples/** - Real-world implementation examples
- `rewards/` - Reward tracking and calculation examples
- `erlang-bridge/` - Cross-language integration patterns

**docs/** - Documentation site (Docusaurus)
- SDK API documentation
- Getting started guides
- Migration guides
- Examples and tutorials

#### Supporting Directories

**.github/** - CI/CD workflows and repository configuration
- Automated testing and publishing workflows
- Dependabot configuration
- Pull request templates

**.yarn/** - Yarn 3 package manager files
- Plugin system
- Release binaries

**assets/** - Static assets (logos, images)

## Core Components and Relationships

### SDK Architecture

```
LidoSDK (Main Entry Point)
├── Core Module - Balance queries, contract views
├── Stake Module - ETH staking operations
├── Wrap Module - stETH ↔ wstETH conversions
├── Withdrawals Module - Withdrawal requests and claims
├── Shares Module - Share calculations
├── Rewards Module - APR and rewards tracking
├── Events Module - Contract event subscriptions
├── Statistics Module - Protocol statistics
└── L2 Module - Layer 2 integrations
```

### Component Relationships

1. **SDK Core** → Provides base functionality for all modules
2. **Playground** → Consumes SDK packages for demonstration
3. **Examples** → Show real-world SDK usage patterns
4. **Docs** → Documents SDK API and usage
5. **Lido Pulse** → Independent service using SDK for monitoring

### Key Integration Points

- **Viem Integration**: All modules use Viem for Ethereum interactions
- **Web3 Provider**: Optional Web3Provider for wallet connections
- **RPC Provider**: Required PublicClient for read operations
- **Contract ABIs**: Centralized contract definitions

## Architectural Patterns

### Monorepo Pattern
- Yarn workspaces for package management
- Shared TypeScript configuration
- Unified linting and formatting rules
- Coordinated versioning with semantic-release

### Module Pattern
- Each SDK feature is a separate module
- Tree-shakeable imports for bundle optimization
- Consistent API design across modules

### Provider Pattern
- SDK initialization with provider injection
- Support for multiple provider types (Viem, Web3)
- Chain-specific configuration

### Factory Pattern
- SDK instance creation with configuration
- Module instantiation on demand
- Shared dependencies across modules

### Observer Pattern
- Event subscription system
- Callback-based notifications
- Real-time updates for contract events
