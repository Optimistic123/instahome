# Assets Folder

This folder contains static assets (images, icons, etc.) that are imported in your React components.

## Folder Structure

```
src/assets/
├── icons/          # Icon files (SVG, PNG, etc.)
├── images/         # Image files
└── README.md       # This file
```

## Usage

### Option 1: Import from assets folder (Recommended for React)

```jsx
import logoIcon from '@/assets/icons/logo.svg';
import CustomIcon from '@/components/CustomIcon';

function MyComponent() {
  return <CustomIcon src={logoIcon} className="h-8 w-8" />;
}
```

**Benefits:**
- Assets are processed by webpack
- Better optimization and caching
- Type checking support
- Easier refactoring

### Option 2: Use from public folder (For static files)

Place files in `public/images/` and reference them:

```jsx
<CustomIcon src="/images/logo.svg" className="h-8 w-8" />
```

**Benefits:**
- Direct URL access
- No webpack processing
- Good for large files or files that change frequently

## Adding Your Icon

1. **Add your icon file:**
   ```bash
   # Copy your icon to assets folder
   cp /path/to/your/icon.svg instahome/frontend/src/assets/icons/logo.svg
   ```

2. **Use it in your component:**
   ```jsx
   import logoIcon from '@/assets/icons/logo.svg';
   <CustomIcon src={logoIcon} className="h-8 w-8" />
   ```

## Supported Formats

- SVG (recommended - scalable and small)
- PNG
- JPG/JPEG
- WebP
- Any image format supported by browsers

