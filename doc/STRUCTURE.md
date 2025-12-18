# Documentation Structure

This document explains the multilingual documentation structure of Walletino SDK.

## 📁 Directory Structure

```
/doc
├── README.md                    # Language selector (main entry point)
├── STRUCTURE.md                 # This file - explains the structure
│
├── /en                          # 🇬🇧 English documentation
│   ├── README.md                # English documentation index
│   ├── getting-started.md       # Step-by-step integration guide
│   ├── api-reference.md         # Complete API reference
│   ├── canton-integration.md    # Canton Network deep dive
│   ├── examples.md              # Real-world usage examples
│   └── jsdoc-examples.md        # JSDoc documentation standards
│
└── /ru                          # 🇷🇺 Russian documentation
    ├── README.md                # Russian documentation index
    ├── getting-started.md       # Пошаговое руководство
    ├── api-reference.md         # Полный API reference
    ├── canton-integration.md    # Подробно о Canton Network
    ├── examples.md              # Примеры использования
    └── jsdoc-examples.md        # Стандарты JSDoc
```

## 🌍 Language Versions

### English (`/en`)
- **Target audience**: International developers
- **Code examples**: English comments
- **Terminology**: Standard technical English
- **Status**: ✅ Complete

### Russian (`/ru`)
- **Target audience**: Russian-speaking developers
- **Code examples**: Russian comments where applicable
- **Terminology**: Russian technical terms
- **Status**: ✅ Complete

## 📄 File Descriptions

### README.md (in each language folder)
- Documentation index for that language
- Quick start guide
- Links to all documentation files
- Recommended reading order
- External resources

### getting-started.md
- Prerequisites and installation
- Environment setup
- Provider configuration
- First component creation
- Common issues and solutions
- Framework-specific guides (Vite, CRA, Next.js)

### api-reference.md
- Complete API documentation
- All hooks with signatures
- All utility functions
- TypeScript types
- Parameter descriptions
- Return value descriptions
- Usage examples for each method

### canton-integration.md
- What is Canton Network
- Why Stellar is used for Ed25519
- Public key conversion process
- Registration flow explained
- Transaction signing
- Devnet faucet usage
- Advanced usage patterns
- Troubleshooting Canton-specific issues

### examples.md
- Real-world usage examples
- Authentication patterns
- Canton Network workflows
- API integration examples
- UI components
- Framework integrations (Next.js, Redux)
- Complete application examples

### jsdoc-examples.md
- JSDoc documentation standards
- Function documentation format
- Hook documentation format
- Type documentation
- Best practices
- Good and bad examples
- Contribution guidelines

## 🔄 Keeping Documentation in Sync

### When Adding New Content

1. **Write in English first** (`/en` folder)
2. **Translate to Russian** (`/ru` folder)
3. **Update both README.md files** if adding new sections
4. **Verify all links work** in both languages

### When Updating Existing Content

1. **Update English version** first
2. **Update Russian version** to match
3. **Check cross-references** in both languages
4. **Test code examples** in both versions

### File Naming Convention

- **Same filenames** in both language folders
- **Lowercase** with hyphens (kebab-case)
- **Descriptive names** (e.g., `getting-started.md`, not `guide.md`)

## 📊 Documentation Metrics

### Coverage
- **English**: 6 files, ~75 pages, 100% complete
- **Russian**: 6 files, ~75 pages, 100% complete
- **Total**: 12 files, ~150 pages

### Content
- **Getting Started**: 11 KB, 440 lines
- **API Reference**: 16 KB, 722 lines
- **Canton Integration**: 18 KB, 588 lines
- **Examples**: 19 KB, 743 lines
- **JSDoc Standards**: 11 KB, 455 lines

## 🎯 Navigation

### From Root
```
/README.md → /doc/README.md → Choose language → Specific guide
```

### Within Documentation
```
/doc/en/README.md → Links to all English guides
/doc/ru/README.md → Links to all Russian guides
```

### Cross-Language Navigation
Each language's README includes a link to the other language version.

## 🤝 Contributing

### Adding a New Guide

1. Create file in `/doc/en/` (English)
2. Create matching file in `/doc/ru/` (Russian)
3. Add to both README.md files
4. Update this STRUCTURE.md
5. Update main DOCUMENTATION.md

### Translating Existing Content

1. Ensure English version is finalized
2. Translate content to Russian
3. Adapt code examples if needed
4. Verify technical terminology
5. Test all links and examples

### Quality Checklist

- [ ] Content exists in both languages
- [ ] File names match in both folders
- [ ] All links work in both versions
- [ ] Code examples are tested
- [ ] Technical terms are consistent
- [ ] README.md updated in both languages
- [ ] Cross-language links work

## 📞 Support

For documentation issues:
- **Missing translations**: Open GitHub issue
- **Outdated content**: Submit PR with updates
- **Broken links**: Report in issues
- **Suggestions**: Open GitHub discussion

---

**Maintained by**: Walletino Team  
**Last Updated**: December 2025  
**Version**: 1.0  
**Languages**: English, Russian

