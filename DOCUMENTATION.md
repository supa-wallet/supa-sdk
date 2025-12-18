# Walletino SDK Documentation Guide

Complete guide to Walletino SDK documentation structure and code standards.

## 📁 Documentation Structure

```
/supa-sdk
├── README.md                 # Main SDK documentation
├── CHANGELOG.md              # Version history and changes
├── DOCUMENTATION.md          # This file - documentation guide
│
├── /doc                      # Detailed documentation folder
│   ├── README.md             # Language selector
│   │
│   ├── /en                   # 🇬🇧 English documentation
│   │   ├── README.md         # English index
│   │   ├── getting-started.md
│   │   ├── api-reference.md
│   │   ├── canton-integration.md
│   │   ├── examples.md
│   │   └── jsdoc-examples.md
│   │
│   └── /ru                   # 🇷🇺 Russian documentation
│       ├── README.md         # Russian index
│       ├── getting-started.md
│       ├── api-reference.md
│       ├── canton-integration.md
│       ├── examples.md
│       └── jsdoc-examples.md
│
├── /demo                     # Demo application
│   └── README.md             # Demo-specific documentation
│
└── /src                      # Source code (with JSDoc)
    ├── /hooks                # React hooks
    ├── /utils                # Utility functions
    ├── /services             # Business logic services
    └── /providers            # React providers
```

## 📖 Documentation Files

### Root Level

#### [README.md](./README.md)
Main SDK documentation for end users
- Features overview
- Quick start guide
- Installation instructions
- Basic usage examples
- API overview
- Troubleshooting

#### [CHANGELOG.md](./CHANGELOG.md)
Version history and release notes
- New features per version
- Bug fixes
- Breaking changes
- Migration guides

#### [DOCUMENTATION.md](./DOCUMENTATION.md) (This file)
Meta-documentation explaining the docs structure
- Where to find specific information
- Documentation standards
- How to contribute to docs

### `/doc` Folder - Multilingual Documentation

#### [doc/README.md](./doc/README.md)
Language selector and main entry point
- Links to English documentation
- Links to Russian documentation
- Quick installation guide

#### English Documentation (`/doc/en`)

**[doc/en/README.md](./doc/en/README.md)** - English documentation index

**[doc/en/getting-started.md](./doc/en/getting-started.md)** - Complete integration guide
- Prerequisites
- Step-by-step setup
- Environment configuration
- First component creation
- Common pitfalls

**[doc/en/api-reference.md](./doc/en/api-reference.md)** - Complete API documentation
- All hooks with full signatures
- All utility functions
- TypeScript types
- Parameter descriptions
- Return value descriptions
- Usage examples for each method

**[doc/en/canton-integration.md](./doc/en/canton-integration.md)** - Canton Network guide
- What is Canton Network
- Why Stellar is used
- Key conversion process
- Registration flow
- Transaction signing
- Troubleshooting Canton-specific issues

**[doc/en/examples.md](./doc/en/examples.md)** - Real-world examples
- Authentication patterns
- Canton workflows
- API usage patterns
- UI components
- Integration with frameworks

**[doc/en/jsdoc-examples.md](./doc/en/jsdoc-examples.md)** - JSDoc standards
- Function documentation format
- Hook documentation format
- Type documentation
- Best practices
- Examples of good/bad docs

#### Russian Documentation (`/doc/ru`)

**[doc/ru/README.md](./doc/ru/README.md)** - Русский индекс документации

Same structure as English documentation, but in Russian:
- getting-started.md
- api-reference.md
- canton-integration.md
- examples.md
- jsdoc-examples.md

## 🎯 Where to Find Information

### For New Users

**"How do I get started?"**
→ [doc/en/getting-started.md](./doc/en/getting-started.md) (English)
→ [doc/ru/getting-started.md](./doc/ru/getting-started.md) (Русский)

**"What can this SDK do?"**
→ [README.md](./README.md) → Features section

**"Show me a complete example"**
→ [demo/README.md](./demo/README.md) or [doc/en/examples.md](./doc/en/examples.md)

### For Developers

**"What hooks are available?"**
→ [doc/en/api-reference.md](./doc/en/api-reference.md) → Hooks section

**"How do I call backend APIs?"**
→ [doc/en/api-reference.md](./doc/en/api-reference.md) → useAPI section

**"How do I work with Canton Network?"**
→ [doc/en/canton-integration.md](./doc/en/canton-integration.md)

**"What utilities are available?"**
→ [doc/en/api-reference.md](./doc/en/api-reference.md) → Utilities section

### For Contributors

**"How should I document my code?"**
→ [doc/en/jsdoc-examples.md](./doc/en/jsdoc-examples.md)

**"What changed in each version?"**
→ [CHANGELOG.md](./CHANGELOG.md)

**"Where do I add documentation?"**
→ This file (DOCUMENTATION.md) → Code Documentation Standards

### For Troubleshooting

**"My code isn't working"**
→ [doc/en/getting-started.md](./doc/en/getting-started.md) → Troubleshooting section
→ [README.md](./README.md) → Troubleshooting section

**"Canton-specific errors"**
→ [doc/en/canton-integration.md](./doc/en/canton-integration.md) → Troubleshooting Canton section

**"I found a bug"**
→ GitHub Issues (link in README)

## ✍️ Code Documentation Standards

All SDK code follows these standards:

### 1. Language
- **English only** for all documentation
- Clear, concise descriptions
- American English spelling

### 2. Function Documentation

Every exported function must have:

```typescript
/**
 * Brief one-line description of what the function does
 * More detailed explanation if needed (optional)
 * 
 * @param paramName - Description of parameter
 * @param optionalParam - Description (optional)
 * @returns Description of return value
 * @throws {ErrorType} When this error is thrown
 * 
 * @example
 * ```ts
 * const result = myFunction('value');
 * console.log(result); // Expected output
 * ```
 */
export const myFunction = (paramName: string, optionalParam?: number): ReturnType => {
  // Implementation
};
```

### 3. Hook Documentation

Every React hook must have:

```typescript
/**
 * Hook description and purpose
 * Explain what the hook does and when to use it
 * 
 * @returns Object containing hook methods and state
 * 
 * @example
 * Basic usage
 * ```tsx
 * function Component() {
 *   const { method, state } = useMyHook();
 *   return <div>{state}</div>;
 * }
 * ```
 * 
 * @example
 * Advanced usage (if applicable)
 * ```tsx
 * // More complex example
 * ```
 */
export const useMyHook = (): UseMyHookReturn => {
  // Implementation
};
```

### 4. Interface/Type Documentation

Every exported interface must have:

```typescript
/**
 * Description of what this interface represents
 */
export interface MyInterface {
  /** Description of this property */
  propertyName: string;
  
  /** Description of optional property */
  optionalProp?: number;
  
  /** 
   * Description of method
   * @param param - Parameter description
   * @returns Return value description
   */
  method: (param: string) => void;
}
```

### 5. Service/Class Documentation

```typescript
/**
 * Service class description
 * Explain purpose and main functionality
 */
export class MyService {
  /**
   * Method description
   * @param param - Parameter description
   * @returns Promise resolving to result
   * @throws {Error} When operation fails
   * 
   * @example
   * ```ts
   * const result = await service.myMethod('value');
   * ```
   */
  async myMethod(param: string): Promise<Result> {
    // Implementation
  }
}
```

## 📝 Documentation Update Workflow

### When Adding a New Feature

1. **Update Code**
   - Add JSDoc to all new functions/hooks
   - Include @example blocks

2. **Update API Reference**
   - Add to [doc/api-reference.md](./doc/api-reference.md)
   - Include full signature and examples

3. **Add Examples**
   - Add real-world example to [doc/examples.md](./doc/examples.md)

4. **Update Changelog**
   - Add feature to [CHANGELOG.md](./CHANGELOG.md)

5. **Update Main README** (if major feature)
   - Update feature list
   - Add to Quick Start if relevant

### When Fixing a Bug

1. **Update Code**
   - Fix the bug
   - Add/update tests

2. **Update Changelog**
   - Add to "Bug Fixes" section

3. **Update Troubleshooting** (if common issue)
   - Add to appropriate troubleshooting section

### When Making Breaking Changes

1. **Update Code**
   - Implement changes
   - Update all JSDoc

2. **Update Changelog**
   - Mark as BREAKING CHANGE
   - Add migration guide

3. **Update Getting Started**
   - Update setup instructions if needed

4. **Add Migration Example**
   - Show before/after code

## 🔍 Documentation Review Checklist

Before committing documentation changes:

- [ ] All new code has JSDoc comments
- [ ] JSDoc is in English
- [ ] All functions have @param and @returns
- [ ] Complex functions have @example blocks
- [ ] API Reference is updated
- [ ] Examples are added (if applicable)
- [ ] Changelog is updated
- [ ] No broken links in markdown
- [ ] Code examples are tested
- [ ] TypeScript types are correct

## 🤝 Contributing to Documentation

### Improving Existing Docs

1. Find the relevant file in `/doc` or root
2. Make improvements
3. Test any code examples
4. Submit PR with clear description

### Adding New Documentation

1. Decide where it belongs (see structure above)
2. Follow existing format and style
3. Add links from relevant sections
4. Update this DOCUMENTATION.md if adding new file

### Reporting Documentation Issues

If you find:
- Outdated information
- Broken examples
- Unclear explanations
- Typos or errors

Please open a GitHub issue with:
- Link to the problem
- What's wrong
- Suggestion for improvement (optional)

## 📊 Documentation Metrics

Current documentation coverage:

- **Core Hooks**: ✅ 100% documented with examples
- **Utility Functions**: ✅ 100% documented with examples
- **Services**: ✅ 100% documented
- **Types/Interfaces**: ✅ 100% documented
- **Guides**: ✅ All major topics covered
- **Examples**: ✅ Comprehensive collection

## 🎓 Learning Path

### Beginner

1. Read [README.md](./README.md) → Features
2. Follow [doc/en/getting-started.md](./doc/en/getting-started.md)
3. Study [demo/src/App.tsx](./demo/src/App.tsx)
4. Try [doc/en/examples.md](./doc/en/examples.md) → Basic examples

### Intermediate

1. Read [doc/en/api-reference.md](./doc/en/api-reference.md) → All hooks
2. Read [doc/en/canton-integration.md](./doc/en/canton-integration.md)
3. Study [doc/en/examples.md](./doc/en/examples.md) → Advanced examples
4. Explore SDK source code with JSDoc

### Advanced

1. Read [doc/en/canton-integration.md](./doc/en/canton-integration.md) → Advanced usage
2. Study service implementations
3. Read [doc/en/jsdoc-examples.md](./doc/en/jsdoc-examples.md)
4. Contribute to SDK

## 📞 Documentation Support

For documentation-specific questions:
- Check this DOCUMENTATION.md first
- Search through `/doc` folder
- Open a GitHub Discussion
- Submit a documentation issue

---

**Last Updated**: December 19, 2025  
**SDK Version**: 0.1.0  
**Documentation Version**: 1.0

**Maintainers**: Walletino Team  
**License**: MIT

