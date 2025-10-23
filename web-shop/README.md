# Web Shop

AI-powered e-commerce platform with intelligent agents for enhanced user experience.

## Features

- 🤖 **AI Agents**: Intelligent agents for customer service, recommendations, and automation
- 📊 **Smart Analytics**: Advanced analytics and insights for better business decisions  
- 🎯 **Personalization**: Personalized shopping experience for each customer
- ⚡ **Automation**: Automated workflows and intelligent task management
- 🛒 **E-commerce**: Full-featured online shopping platform

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Custom AI agents system
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)
- **Database**: PostgreSQL (planned)
- **Deployment**: Vercel (planned)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
web-shop/
├── ai-agents/           # AI agents system
│   └── agents/         # Individual agent implementations
├── app/                # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
├── src/                # Source code
│   ├── application/    # Application layer
│   ├── infrastructure/ # Infrastructure layer
│   ├── modules/        # Feature modules
│   └── shared/         # Shared utilities
└── docs/              # Documentation
```

## AI Agents

The platform includes several AI agents:

- **Developer Agent**: Code analysis, feature generation, performance optimization
- **QA Agent**: Testing and quality assurance
- **Analytics Agent**: Data analysis and insights
- **Customer Service Agent**: User support and recommendations


## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Testing Scripts
- `npm run test` - Run unit and integration tests (Vitest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

