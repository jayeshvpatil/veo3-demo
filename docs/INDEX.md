# Documentation Index

Welcome to the Veo-3 Gemini API Quickstart documentation. This guide will help you navigate all available documentation.

## 📚 Quick Links

- **[Main README](../README.md)** - Project overview and setup
- **[Deployment Guide](../DEPLOYMENT.md)** - How to deploy to Cloud Run
- **[Authentication Setup](./AUTHENTICATION_SETUP.md)** - NextAuth configuration
- **[Deployment Consolidation](./DEPLOYMENT_CONSOLIDATION.md)** - Deployment strategies

## ✨ Features Documentation

All feature implementation docs are in [`docs/features/`](./features/)

- **[Collapsible Sidebar](./features/COLLAPSIBLE_SIDEBAR.md)** - Icon-only sidebar with hover expansion
- **[Radix UI Integration](./features/RADIX_UI_INTEGRATION.md)** - Component library setup
- **[Text Search](./features/TEXT_SEARCH_DOCS.md)** - Search functionality implementation
- **[Template Dialog](./features/TEMPLATE_DIALOG_FEATURE.md)** - Template selection workflow
- **[UX Redesign](./features/UX_REDESIGN.md)** - UI/UX improvements and Create tab

## 🐛 Bug Fixes Documentation

All bug fix docs are in [`docs/fixes/`](./fixes/)

- **[Bug Fixes](./fixes/BUG_FIXES.md)** - General bug fixes
- **[Tagging Fixes](./fixes/TAGGING_FIXES.md)** - Tag management fixes
- **[General Fixes](./fixes/FIXES.md)** - Miscellaneous fixes
- **[Project Selector Fix](./fixes/PROJECT_SELECTOR_FIX.md)** - Project dropdown fixes
- **[Product Selection Fix](./fixes/PRODUCT_SELECTION_FIX.md)** - Asset selection fixes
- **[Existing Screens Integration](./fixes/EXISTING_SCREENS_INTEGRATION.md)** - Image generation screen integration
- **[Image/Video Mode Fix](./fixes/IMAGE_VIDEO_MODE_FIX.md)** - Template routing fixes
- **[Image Display & UI Fixes](./fixes/IMAGE_DISPLAY_AND_UI_FIXES.md)** - Image persistence and UI cleanup

## 🏗️ Project Structure

```
veo-3-gemini-api-quickstart/
├── README.md                    # Main project documentation
├── DEPLOYMENT.md                # Deployment guide
├── docs/                        # Additional documentation
│   ├── INDEX.md                 # This file
│   ├── AUTHENTICATION_SETUP.md  # Auth configuration
│   ├── DEPLOYMENT_CONSOLIDATION.md
│   ├── features/                # Feature documentation
│   │   ├── COLLAPSIBLE_SIDEBAR.md
│   │   ├── RADIX_UI_INTEGRATION.md
│   │   ├── TEXT_SEARCH_DOCS.md
│   │   ├── TEMPLATE_DIALOG_FEATURE.md
│   │   └── UX_REDESIGN.md
│   └── fixes/                   # Bug fix documentation
│       ├── BUG_FIXES.md
│       ├── TAGGING_FIXES.md
│       ├── FIXES.md
│       ├── PROJECT_SELECTOR_FIX.md
│       ├── PRODUCT_SELECTION_FIX.md
│       ├── EXISTING_SCREENS_INTEGRATION.md
│       ├── IMAGE_VIDEO_MODE_FIX.md
│       └── IMAGE_DISPLAY_AND_UI_FIXES.md
├── app/                         # Next.js app directory
├── components/                  # React components
├── prisma/                      # Database schema
└── deploy/                      # Deployment scripts
    └── README.md                # Deployment README
```

## 🚀 Getting Started

1. Read the [Main README](../README.md) for project overview
2. Follow [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment setup
3. Configure authentication using [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
4. Browse feature docs to understand implementations
5. Check fix docs if you encounter issues

## 📝 Documentation Standards

All documentation follows these standards:

### Structure
- **Clear title** describing the topic
- **Problem statement** (for fixes)
- **Solution explanation** 
- **Code examples** with before/after
- **Testing steps**
- **Status and date**

### Naming Convention
- Features: `FEATURE_NAME.md`
- Fixes: `FIX_DESCRIPTION.md`
- Guides: `SETUP_GUIDE.md`

## 🔍 Finding Documentation

### By Topic

**Authentication & Security**
- [Authentication Setup](./AUTHENTICATION_SETUP.md)

**Deployment**
- [Deployment Guide](../DEPLOYMENT.md)
- [Deployment Consolidation](./DEPLOYMENT_CONSOLIDATION.md)

**UI/UX**
- [Collapsible Sidebar](./features/COLLAPSIBLE_SIDEBAR.md)
- [UX Redesign](./features/UX_REDESIGN.md)
- [Radix UI Integration](./features/RADIX_UI_INTEGRATION.md)

**Search & Navigation**
- [Text Search](./features/TEXT_SEARCH_DOCS.md)
- [Template Dialog](./features/TEMPLATE_DIALOG_FEATURE.md)

**Bug Fixes**
- [Image Display Fixes](./fixes/IMAGE_DISPLAY_AND_UI_FIXES.md)
- [Product Selection](./fixes/PRODUCT_SELECTION_FIX.md)
- [Tagging System](./fixes/TAGGING_FIXES.md)

### By Date (Newest First)

1. **Oct 3, 2025** - Collapsible Sidebar
2. **Oct 3, 2025** - Image Display & UI Fixes
3. **Oct 3, 2025** - Product Selection Fix
4. **Oct 3, 2025** - Existing Screens Integration
5. **Oct 3, 2025** - Template Dialog Feature
6. **Oct 3, 2025** - Project Selector Fix
7. **Earlier** - UX Redesign, Tagging Fixes, etc.

## 💡 Contributing

When adding new documentation:

1. Place feature docs in `docs/features/`
2. Place bug fix docs in `docs/fixes/`
3. Update this INDEX.md with links
4. Follow the documentation standards
5. Include code examples and testing steps

## 📧 Support

For questions or issues, refer to the relevant documentation section above.

---

**Last Updated:** October 3, 2025
**Version:** 1.0
