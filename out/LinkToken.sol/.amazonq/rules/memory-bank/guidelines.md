# Development Guidelines

## Code Quality Standards

### Code Formatting and Structure
- **Strict TypeScript**: All code uses TypeScript with strict type checking enabled
- **Explicit Type Annotations**: Function parameters and return types are explicitly typed
- **Type Imports**: Use `type` keyword for type-only imports: `import type { Address, Hash } from 'viem'`
- **Const Assertions**: Use `as const` for literal types and readonly arrays
- **Template Literals**: Use backtick template literals for addresses: `` `0x{string}` ``

### Naming Conventions
- **React Components**: PascalCase with descriptive names (e.g., `StVaultDemo`, `Web3Provider`)
- **Hooks**: camelCase prefixed with `use` (e.g., `useWeb3`, `useLidoSDK`, `useCustomRpc`)
- **Constants**: UPPER_SNAKE_CASE for global constants (e.g., `L2_CHAINS`, `DEFAULT_VALUE`)
- **Variables**: camelCase for local variables and function parameters
- **Type Definitions**: PascalCase with descriptive suffixes (e.g., `ActionProps`, `ReducerState`, `CustomRpcContextValue`)
- **Generic Types**: Single capital letter or descriptive PascalCase (e.g., `<TResult>`)

### File Organization
- **One Component Per File**: Each React component in its own file
- **Index Files**: Use index.tsx for main exports from directories
- **Styles Separation**: Separate style files (e.g., `styles.ts`) for styled components
- **Type Definitions**: Co-locate types with their usage or in dedicated type files

## Semantic Patterns and Best Practices

### React Patterns

#### Context Pattern for Shared State
```typescript
// Create context with explicit type and null check
const CustomRpcContext = createContext<CustomRpcContextValue | null>(null);
CustomRpcContext.displayName = 'CustomRpcContext';

// Custom hook with invariant check
export const useCustomRpc = () => {
  const context = useContext(CustomRpcContext);
  invariant(context);
  return context;
};
```

#### State Management with useReducer
- Use `useReducer` for complex state logic with multiple sub-values
- Define discriminated union types for actions
- Implement type-safe reducer functions with generic types
```typescript
type ReducerAction<TResult> =
  | { type: 'loading' }
  | { type: 'error'; error: SDKError }
  | { type: 'success'; result: TResult }
  | { type: 'reset' };
```

#### Memoization Pattern
- Use `useMemo` for expensive computations and object creation
- Memoize context values to prevent unnecessary re-renders
- Memoize configuration objects (e.g., Wagmi config, wallet data lists)

### SDK Integration Patterns

#### SDK Initialization
```typescript
// Create public client with Viem
const rpcProvider = createPublicClient({
  chain: holesky,
  transport: http(),
});

// Initialize SDK with provider
const lidoSDK = new LidoSDK({
  chainId: holesky.id,
  rpcProvider,
});
```

#### Module Access Pattern
- Access SDK modules through destructuring: `const { stVaultModule, core } = useLidoSDK()`
- Chain module methods for related operations
- Use optional chaining for nullable values: `currentVault?.fund()`

#### Transaction Handling
- All transaction methods return promises with result objects
- Extract relevant data from transaction results: `const { stethReceived, sharesReceived } = stakeTx.result`
- Handle errors with try-catch and proper error typing

### Error Handling

#### SDK Error Pattern
<!-- cspell:ignore lidofinance -->
```typescript
import { SDKError, ERROR_CODE } from '@lidofinance/lido-ethereum-sdk';

// Throw SDK errors with proper error codes
throw new SDKError({
  code: ERROR_CODE.INVALID_ARGUMENT,
  message: 'Role and address required',
});
```

#### Async Error Handling
- Wrap async operations in try-catch blocks
- Log errors to console for debugging: `console.error(err)`
- Display user-friendly error messages in UI
- Use error boundaries for React component errors

### Event Handling Patterns

#### Contract Event Subscription
```typescript
const unwatch = rpcProvider.watchContractEvent({
  address: stethContract.address,
  abi: stethContract.abi,
  eventName: 'TokenRebased',
  onLogs: callback,
});

// Return unwatch function for cleanup
return unwatch;
```

#### Callback Pattern
- Define typed callback functions for event handlers
- Process event logs in batches when available
- Extract event arguments with destructuring

### Data Transformation Patterns

#### BigInt Handling
- Use `BigInt()` constructor for numeric conversions
- Perform arithmetic operations directly on BigInt values
- Convert to string for JSON serialization: `JSON.stringify(result, (_, value) => typeof value === 'bigint' ? value.toString() : value)`
- Use nullish coalescing for default values: `value ?? BigInt(0)`

#### Address Type Safety
- Cast addresses to proper types: `e.currentTarget.value as Address`
- Use Viem's `Address` and `Hash` types for type safety
- Default to zero address for initialization: `'0x0'`

### Component Composition Patterns

#### Render Props Pattern
```typescript
type ActionProps<TResult> = {
  renderResult?: (result: TResult) => React.JSX.Element;
  renderError?: (error: SDKError) => React.JSX.Element;
};
```

#### Children as Configuration
- Pass form inputs as children to action components
- Use compound component pattern for related UI elements
- Provide default implementations for optional render functions

### Dynamic Imports for SSR
```typescript
// Use Next.js dynamic imports for client-only libraries
const ReactJSON = dynamic(() => import('react-json-view'), {
  ssr: false,
});
```

## Configuration Patterns

### Multi-Chain Support
- Define chain configurations in centralized config files
- Support custom RPC URLs per chain
- Use chain IDs from standard libraries (Viem, Wagmi)
- Implement RPC fallback mechanisms

### Environment Configuration
- Use `.env.example` files to document required variables
- Access environment variables through config modules
- Support runtime configuration changes (e.g., custom RPC)

### Wagmi Configuration Pattern
```typescript
const config = useMemo(() => {
  return createConfig({
    chains: supportedChains,
    ssr: true,
    multiInjectedProviderDiscovery: false,
    transports: supportedChains.reduce(
      (res, curr) => ({
        ...res,
        [curr.id]: http(activeRpc[curr.id], { batch: true }),
      }),
      {},
    ),
  });
}, [activeRpc]);
```

## Testing and Validation

### Type Safety
- Enable strict TypeScript checks
- Use type guards and assertions (e.g., `invariant()`)
- Avoid `any` types; use `unknown` when type is truly unknown
- Use `satisfies` operator for type validation without widening

### Async Operations
- Always await promises in async functions
- Use `void` operator for fire-and-forget: `void fetchDataAsync()`
- Handle promise .rejections explicitly
- Use `Promise.all()` for parallel operations

## Documentation Standards

### Code Comments
- Minimize inline comments by writing self-documenting code
- Use JSDoc for public API documentation
- Document complex algorithms and business logic
- Add TODO comments for future improvements

### Component Documentation
- Use descriptive component names that explain purpose
- Document props with TypeScript types
- Provide usage examples in playground/examples
- Include error scenarios in documentation

## Linting and Code Quality

### ESLint Rules
- Follow @lidofinance/eslint-config base configuration
- Disable rules sparingly with inline comments and justification
- Common exceptions: `/* eslint-disable sonarjs/no-identical-functions */`
- Use `@typescript-eslint/ban-ts-comment` for necessary type assertions

### Code Review Standards
- No unused variables or imports
- Consistent formatting via Prettier
- All async operations properly handled
- Type safety maintained throughout
- Accessibility compliance for UI components

## Performance Optimization

### Bundle Size Optimization
`- Use tree-shakeable imports: `import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake'`
`- Lazy load heavy dependencies with dynamic imports
- Memoize expensive computations
- Avoid unnecessary re-renders with proper dependency arrays

### Network Optimization
- Batch RPC calls when possible: `{ batch: true }`
- Use multicall patterns for multiple contract reads
- Cache contract instances and configurations
- Implement proper loading states for async operations
