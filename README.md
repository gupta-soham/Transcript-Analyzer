# Transcript Analyzer

A Next.js web application that processes timestamped transcript files using Google's Gemini API to extract structured insights including summaries, highlights, lowlights, and named entities.

## Features

- 📁 **File Upload**: Drag-and-drop support for transcript files
- 🤖 **AI-Powered Analysis**: Real-time transcript analysis using Google Gemini AI
- 📊 **Structured Output**: Organized results with summaries, highlights, lowlights, and entity extraction
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🔒 **Type Safety**: Full TypeScript implementation
- ⚡ **Fast Processing**: Optimized for performance with progress indicators
- 🧪 **Comprehensive Testing**: Unit and integration tests included

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **UI Framework**: shadcn/ui, Tailwind CSS
- **AI Service**: Google Gemini API (@google/genai)
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
2. Upload a transcript file using the drag-and-drop interface
3. Or click "Try Sample" to use the included sample transcript
4. View the analysis results in the organized tabs:
   - **Summary**: Overall transcript summary
   - **Highlights**: Key positive points
   - **Lowlights**: Areas for improvement
   - **Named Entities**: Identified speakers and organizations

### Transcript Format

The application expects transcripts in the following format:

```
00:00:00 introduction Welcome to our quarterly meeting
00:00:15 speaker1 Let's review the project progress
00:02:30 speaker2 We've completed 80% of the tasks
00:05:45 speaker1 Great work team, let's discuss next steps
```

**Format Requirements:**

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
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── analysis-results.tsx
│   ├── transcript-uploader.tsx
│   └── ...
├── lib/                  # Utility functions and services
│   ├── gemini-service.ts # Gemini API integration
│   ├── transcript-parser.ts
│   └── ...
├── test/                 # Test files
└── public/               # Static assets
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

| Variable               | Description                  | Required |
| ---------------------- | ---------------------------- | -------- |
| `GEMINI_API_KEY`       | Your Google Gemini API key   | Yes      |

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
- Check file size limits (10MB maximum)

**Build Issues:**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
