# Testing Skill

## Framework hiện tại

Project chưa có test setup. Khi cần setup:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
```

Tạo `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

## Chạy Tests

```bash
# Unit tests
npx vitest run

# Watch mode (development)
npx vitest

# Coverage
npx vitest run --coverage
```

## Build Check (thay thế cho tests hiện tại)

```bash
# TypeScript type check + build
npm run build

# Lint
npm run lint
```

## Test Requirements

**New feature:** Viết tests TRƯỚC implementation (TDD).
**Bug fix:** Viết regression test trước.
**Component:** Test behavior, không test implementation chi tiết.
**API integration:** Test error states + loading states + success states.

## Pattern cho Component Tests

```tsx
// components/movie-grid.test.tsx
import { render, screen } from '@testing-library/react'
import MovieGrid from './movie-grid'

describe('MovieGrid', () => {
  it('renders movie cards', () => {
    render(<MovieGrid category="popular" />)
    expect(screen.getByText('Interstellar')).toBeInTheDocument()
  })
})
```

## Sau khi test

Report: "Build: ✓ | TypeScript: ✓ | Lint: ✓"
Nếu có lỗi: fix trước khi tiếp tục.
