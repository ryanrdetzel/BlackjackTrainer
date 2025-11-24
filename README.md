# Blackjack Strategy Trainer

A web-based blackjack trainer to help you practice and learn basic strategy. The app deals hands and immediately tells you whether you made the correct decision according to basic strategy.

## Features

- Practice basic blackjack strategy decisions (Hit, Stand, Double, Split)
- Instant feedback on whether your choice was correct
- Shows the correct play when you make a mistake
- Tracks your accuracy statistics
- Uses standard 6-deck shoe basic strategy

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4

## Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the main branch.

## Basic Strategy

The trainer uses standard basic strategy for a 4-8 deck game where the dealer stands on soft 17. This includes:

- **Hard hands**: When to hit, stand, or double based on your total vs dealer's upcard
- **Soft hands**: Strategy for hands containing an Ace counted as 11
- **Pairs**: When to split pairs vs play them as regular hands
