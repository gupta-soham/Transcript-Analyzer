# Transcript Analyzer

A Next.js web application that processes timestamped transcript files using Google's Gemini API to extract structured insights including summaries, highlights, lowlights, and named entities.

## Features

- 📁 **File Upload**: Drag-and-drop support for transcript files (TXT, MP3, WAV, OGG, M4A)
- 🤖 **AI-Powered Analysis**: Real-time transcript analysis using Google Gemini AI
- 📊 **Structured Output**: Organized results with summaries, highlights, lowlights, and entity extraction
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- ✨ **Smooth Animations**: Hardware-accelerated animations using Motion.dev
- 🎯 **Theme-Aware Design**: Automatic dark/light mode support with theme-aware logo
- 🔒 **Type Safety**: Full TypeScript implementation
- ⚡ **Fast Processing**: Optimized for performance with progress indicators
- 🧪 **Comprehensive Testing**: Unit and integration tests included
- 📱 **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15+, React, TypeScript
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Animations**: Motion.dev (hardware-accelerated animations)
- **AI Service**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Theme**: CSS custom properties with dark/light mode
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint
- **Build Tool**: Next.js with Turbopack

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Google Gemini API key

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd transcript-analyzer
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Usage

1. Open the application in your browser
2. Upload a transcript file using the drag-and-drop interface (supports TXT, MP3, WAV, OGG, M4A)
3. Or click "Try Sample" to use the included sample transcript
4. View the analysis results in the organized tabs:
   - **Summary**: Overall transcript summary
   - **Highlights**: Key positive points with smooth expand/collapse animations
   - **Lowlights**: Areas for improvement with animated interactions
   - **Named Entities**: Identified speakers and organizations with collapsible details

### New Features

- **🎭 Smooth Animations**: All collapsible cards feature hardware-accelerated animations using Motion.dev
- **🌙 Theme Support**: Automatic dark/light mode with theme-aware logo that inverts colors
- **📱 Enhanced Mobile**: Optimized responsive design with larger touch targets
- **⚡ Performance**: Optimized SVG logo and smooth 60fps animations
- **🎨 Modern UI**: Compact navbar with prominent, theme-aware branding

### Transcript Format

The application supports multiple file formats:

**Text Files (.txt):**

```text
00:00:00 introduction Welcome to our quarterly meeting
00:00:15 speaker1 Let's review the project progress
00:02:30 speaker2 We've completed 80% of the tasks
00:05:45 speaker1 Great work team, let's discuss next steps
```

**Audio Files (.mp3, .wav, .ogg, .m4a):**
Upload audio files directly - the AI will automatically transcribe and timestamp them.

**Format Requirements for Text Files:**

- Timestamp: `HH:MM:SS` format
- Section: Descriptive section name (e.g., introduction, speaker1, speaker2)
- Content: The actual transcript text

## API Documentation

### POST /api/analyze-transcript

Analyzes a transcript file and returns structured insights.

**Endpoint:** `POST /api/analyze-transcript`

**Request:**

- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing the transcript file

**Response:**

```json
{
  "summary": "Overall transcript summary...",
  "highlights": [
    {
      "content": "Key highlight text",
      "timestamp": "00:02:30",
      "relevanceScore": 0.95
    }
  ],
  "lowlights": [
    {
      "content": "Area for improvement",
      "timestamp": "00:05:45",
      "issueType": "timeline"
    }
  ],
  "namedEntities": [
    {
      "name": "Speaker 1",
      "type": "speaker",
      "mentions": [
        {
          "content": "Let's review the project",
          "timestamp": "00:00:15",
          "context": "Opening discussion"
        }
      ]
    }
  ],
  "metadata": {
    "totalDuration": "00:10:00",
    "wordCount": 250,
    "processedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response:**

```json
{
  "error": {
    "code": "INVALID_FORMAT",
    "message": "Transcript format is invalid",
    "details": "Expected format: HH:MM:SS section content"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── analyze-transcript/
│   │       └── route.ts   # Main analysis endpoint
│   ├── globals.css        # Global styles with theme variables
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Main page with logo and analysis UI
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── logo.tsx          # Reusable, theme-aware logo component
│   ├── analysis-results.tsx # Animated results with Motion.dev
│   ├── transcript-uploader.tsx
│   ├── copy-button.tsx
│   ├── entity-editor.tsx
│   └── ...
├── lib/                  # Utility functions and services
│   ├── gemini-service.ts # Gemini API integration (text + audio)
│   ├── transcript-parser.ts # Robust parsing with fallbacks
│   ├── types.ts          # TypeScript interfaces
│   └── ...
├── test/                 # Test files
│   ├── api-route.test.ts
│   ├── gemini-service.test.ts
│   └── ...
└── public/               # Static assets
    └── logo.svg          # Optimized SVG logo
```

## Testing

The project includes a comprehensive test suite:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API endpoint and service integration
- **E2E Tests**: Complete user workflow testing

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `GEMINI_API_KEY`
3. **Deploy**: Vercel will automatically build and deploy

### Other Platforms

For other Node.js hosting platforms:

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set environment variables** in your hosting platform

3. **Deploy the `.next` folder** and required files

### Environment Variables

| Variable         | Description                | Required |
| ---------------- | -------------------------- | -------- |
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes      |

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**

   ```bash
   npm test
   ```

6. **Commit your changes**

   ```bash
   git commit -m "Add your feature description"
   ```

7. **Push to your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for all new code
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## Security

- API keys are stored securely in environment variables
- File uploads are validated and processed in memory
- No sensitive data is persisted
- Rate limiting is implemented for API endpoints

## Performance

- Optimized bundle size with Next.js
- Lazy loading for components
- Efficient file processing with streaming
- Progress indicators for long operations

## Troubleshooting

### Common Issues

**API Key Issues:**

- Ensure your Gemini API key is valid and has proper permissions
- Check that the key is correctly set in `.env.local`

**File Upload Issues:**

- Verify the transcript format matches the expected structure
- Check file size limits (20MB maximum)

**Build Issues:**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

## Recent Updates

### v2.0.0 - Enhanced UI & Animations

- ✨ **Motion.dev Integration**: Hardware-accelerated animations for all collapsible cards
- 🎨 **Theme-Aware Logo**: Automatic dark/light mode support with color inversion
- 📱 **Responsive Logo**: Optimized logo sizing for desktop and mobile
- 🎭 **Smooth Interactions**: Spring physics and fade effects throughout the UI
- 🔊 **Audio File Support**: Direct upload support for MP3, WAV, OGG, and M4A files
- ⚡ **Optimized SVG**: Reduced logo file size by 80% while making it bigger
- 🎯 **Compact Navbar**: Streamlined header design with better space utilization

### Key Improvements

- **Animations**: All expand/collapse interactions now use smooth, hardware-accelerated animations
- **Logo**: Reusable component with theme awareness and responsive sizing
- **Audio Processing**: Automatic transcription and timestamping for audio files
- **UI Polish**: Consistent spacing, better touch targets, and improved accessibility
- **Performance**: Optimized SVG and reduced bundle size with better code splitting
