# TypeScript Coding Standards

## Type Safety

- Use explicit types - never use 'any' or 'unknown'
- Avoid type assertions (the 'as' keyword)
- Prefer interfaces over types for object shapes
- Use strict null checks

## Design Principles

- Follow SOLID principles
- Keep functions small and focused (single responsibility)
- Favor composition over inheritance
- Write pure functions where possible (no side effects)

## Code Quality

- Keep code simple and readable - avoid over-engineering
- Use meaningful, descriptive variable and function names
- Avoid deep nesting (max 3 levels)
- Keep files under 300 lines when possible
- Extract magic numbers/strings into named constants

## Error Handling

- Handle errors explicitly - no silent failures
- Use custom error types for different error cases
- Avoid empty catch blocks
- Validate inputs at boundaries

## Testing

- Write testable code (avoid tight coupling)
- Each function should have a clear, testable purpose
- Avoid mocking when possible - prefer dependency injection

## Modern Practices

- Use async/await over raw Promises
- Prefer const over let, never use var
- Use optional chaining (?.) and nullish coalescing (??)
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.)
- Use discriminated unions for type-safe state management

## Comments & Documentation

- Write self-documenting code (clear names over comments)
- Add JSDoc for public APIs
- Explain "why" not "what" in comments
- Keep comments up to date with code changes
