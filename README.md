# Veo 3 Gemini API Demo - Production Ready

A comprehensive Next.js application showcasing Google's Veo 3 video generation and Imagen 4 image generation capabilities with a professional three-tab interface, cinematography templates, and full Cloud Run deployment support.

🌐 **Live Demo**: [https://veo-app-jz3ep7ucoa-uc.a.run.app](https://veo-app-jz3ep7ucoa-uc.a.run.app)

## ✨ Features

### 🎬 Video Generation
- **Veo 3 Integration**: Generate high-quality videos from text prompts using Google's latest Veo-3 model
- **Image-to-Video**: Create videos from starting images + text prompts  
- **Professional Templates**: Pre-built cinematography templates (Boutique Showcase, Studio Spotlight, Dynamic Reveal)
- **Advanced Controls**: Camera movements (360° Orbit, Bullet Time, Dolly Zoom), aspect ratios, negative prompts

### 🖼️ Visual Generation  
- **Gemini 2.5 Flash Preview**: Generate stunning product visuals using Google's latest model
- **Professional Styles**: Multiple visual styles (Professional, Lifestyle, Artistic, Minimalist, Luxury, Social Media)
- **Product Integrity**: Enhanced prompts that preserve exact product characteristics
- **Server-Side Serving**: Optimized image display with fallback mechanisms
- **🤖 Agentic Chat Interface**: Conversational AI agents for iterative visual refinement
  - **Creative Director**: Focuses on artistic composition and brand aesthetics
  - **Product Photographer**: Expert in lighting, angles, and technical photography  
  - **Marketing Specialist**: Optimizes visuals for conversion and engagement
  - **Interactive Refinement**: Chat-based workflow for perfect visual creation

### 🖼️ Image Generation  
- **Imagen 4.0**: Generate images from text prompts using Google's Imagen model
- **Multiple Formats**: Support for various image formats and sizes

### 🎯 Enhanced User Experience
- **Three-Tab Interface**: Organized workflow with Product Selection, Prompt Management, and Review tabs
- **Automatic Navigation**: Smart tab switching when generating videos
- **Grid/List Views**: Flexible product browsing with advanced filtering
- **Rating System**: Thumbs up/down rating for generated content
- **Video History**: Track and manage generated videos
- **Download & Cut**: Play, download, and edit videos directly in the browser

### 🚀 Production Ready
- **Cloud Run Deployment**: Full containerization with Google Cloud Run support
- **Artifact Registry**: Modern container registry integration (GCR issues resolved)
- **Environment Management**: Secure API key handling and environment configuration
- **Error Handling**: Comprehensive error handling and logging
- **Cross-Platform**: Works in both browser and Node.js environments

## 🚀 Quick Start

### Option 1: One-Command Deployment (Recommended)
Deploy directly to Google Cloud Run with a single command:

```bash
# Clone the repository
git clone https://github.com/jayeshvpatil/veo3-demo.git
cd veo3-demo

# Deploy to Cloud Run (includes build, push, and deploy)
./deploy/deploy.sh
```

The script will:
1. ✅ Prompt for your GEMINI_API_KEY
2. ✅ Set up Artifact Registry automatically  
3. ✅ Build and deploy the containerized app
4. ✅ Provide you with the live URL

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+ and npm
- **GEMINI_API_KEY**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

> [!WARNING]  
> Google Veo 3 and Imagen 4 require the Gemini API **Paid tier**. You'll need to upgrade from the free tier to use these models.

**Setup:**

```bash
# Install dependencies
npm install

# Set up environment variables
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture

### Three-Tab Interface
1. **Product Selection**: Browse and filter products with grid/list views
2. **Prompt Management**: Create prompts with cinematography templates and camera controls  
3. **Review**: Rate, download, and manage generated videos

### API Routes
- `app/api/veo/generate/`: Video generation with Veo-3 model
- `app/api/veo/operation/`: Check video generation status
- `app/api/veo/download/`: Download generated videos  
- `app/api/imagen/generate/`: Image generation with Imagen 4.0
- `app/api/products/`: Product data management

## 🚀 Deployment Options

### Google Cloud Run (Recommended)

**One-Command Deploy:**
```bash
./deploy/deploy.sh
```

**Manual Deploy with Artifact Registry:**
```bash
# Set up environment
source ./setup-env-interactive.sh

# Deploy using Artifact Registry (fixes GCR 412 errors)
./deploy-artifact-registry.sh
```

**Cloud Build Deploy:**
```bash
# Deploy using Google Cloud Build
./deploy-cloudbuild.sh
```

**Alternative Scripts:**
- `deploy.sh` - Standard deployment script
- `quick-deploy.sh` - Minimal quick deployment
- `setup-env.sh` - Environment setup helper

### Other Platforms

The application is containerized and can be deployed to any platform that supports Docker containers:
- **Vercel**: Deploy the Next.js app directly
- **AWS ECS/Fargate**: Use the provided Dockerfile
- **Azure Container Instances**: Deploy the container image
- **Kubernetes**: Use the container image with your K8s cluster

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── veo/                  # Veo 3 video generation
│   │   ├── imagen/               # Imagen 4 image generation
│   │   └── products/             # Product data
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application (3-tab interface)
├── components/                   # React components
│   └── ui/                       # UI components
│       ├── Tabs.tsx              # Tab system
│       ├── ProductSelectionTab.tsx
│       ├── PromptManagementTab.tsx
│       ├── ReviewTab.tsx
│       ├── Composer.tsx          # Video generation form
│       ├── VideoPlayer.tsx       # Video playback
│       └── ...
├── contexts/                     # React contexts
│   └── ProductContext.tsx        # Product state management
├── lib/                          # Utilities
│   ├── products.ts               # Product data helpers
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── Dockerfile                    # Container configuration
├── cloudbuild.yaml              # Google Cloud Build config
├── one-command-deploy.sh         # One-command deployment
└── deploy-*.sh                   # Various deployment scripts
```

## 🛠️ Technologies Used

### Core Framework
- **[Next.js 15.3.5](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://reactjs.org/)** - Latest React with concurrent features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[rc-slider](https://github.com/react-component/slider)** - Advanced slider components

### APIs & Integration  
- **[Gemini API](https://ai.google.dev/gemini-api/docs)** - Google's AI API platform
- **[Veo 3](https://ai.google.dev/gemini-api/docs/video)** - Video generation model
- **[Imagen 4](https://ai.google.dev/gemini-api/docs/imagen)** - Image generation model

### Deployment & Infrastructure
- **[Google Cloud Run](https://cloud.google.com/run)** - Serverless container platform
- **[Artifact Registry](https://cloud.google.com/artifact-registry)** - Container image storage
- **[Cloud Build](https://cloud.google.com/build)** - CI/CD pipeline
- **[Docker](https://www.docker.com/)** - Containerization

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[PostCSS](https://postcss.org/)** - CSS processing
- **Node.js 18+** - Runtime environment

## 📖 User Guide

### Product Selection Tab
- **Grid/List View**: Toggle between visual layouts
- **Filtering**: Search and filter products by category
- **Selection**: Click products to use in video generation

### Prompt Management Tab  
- **Templates**: Choose from professional cinematography templates:
  - **Boutique Showcase**: Elegant product presentations
  - **Studio Spotlight**: Professional studio lighting
  - **Dynamic Reveal**: Dramatic product reveals
- **Camera Controls**: 360° Orbit, Bullet Time, Dolly Zoom, and more
- **Advanced Settings**: Aspect ratios, negative prompts, style controls

### Review Tab
- **Video Player**: Play generated videos with full controls
- **Rating System**: Rate videos with thumbs up/down
- **Download**: Save videos locally
- **History**: Browse previously generated content

## 🔧 Configuration

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional (for deployment)
GOOGLE_CLOUD_PROJECT=your-project-id
REGION=us-central1
```

### Docker Configuration
The application includes a multi-stage Dockerfile optimized for production:
- **Build Stage**: Installs dependencies and builds the app
- **Runtime Stage**: Minimal Alpine Linux container
- **Platform**: Supports linux/amd64 for Cloud Run compatibility

## 🐛 Troubleshooting

### Common Issues

**"412 Precondition Failed" during deployment:**
- ✅ **Fixed**: Use `./one-command-deploy.sh` which uses Artifact Registry instead of deprecated GCR

**"500 Internal Server Error" in deployed app:**
- ✅ **Fixed**: File instanceof checks replaced with cross-platform solutions

**"GEMINI_API_KEY environment variable is not set":**
- Set your API key in `.env` file or use the interactive setup script

**Build fails with ESLint errors:**
- ✅ **Fixed**: All TypeScript and ESLint issues resolved

### Getting Help
1. Check the error logs: `gcloud logs tail --project=your-project-id`
2. Review the deployment documentation in `DEPLOYMENT.md`
3. Use the troubleshooting guides in `FIXES.md`

## 📚 API Reference

### Video Generation API
```typescript
// POST /api/veo/generate
{
  prompt: string;
  model?: string;
  negativePrompt?: string;
  aspectRatio?: string;
  imageFile?: File;
  imageBase64?: string;
  imageMimeType?: string;
}
```

### Operation Status API
```typescript
// POST /api/veo/operation
{
  name: string; // Operation name from generation
}
```

### Download API
```typescript
// POST /api/veo/download
{
  uri: string; // Video URI from completed operation
}
```

### Image Generation API
```typescript
// POST /api/imagen/generate
{
  prompt: string;
  model?: string;
}
```

## 📋 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [Open an issue](https://github.com/jayeshvpatil/veo3-demo/issues) for bug reports or feature requests
- **Documentation**: Check the additional docs in the repository:
  - `DEPLOYMENT.md` - Detailed deployment guide
  - `FIXES.md` - Technical issues and solutions

---

Built with ❤️ using Google's Veo 3 and Imagen 4 APIs
