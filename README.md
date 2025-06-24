# React Flow Interactive Canvas

A modern, interactive drag-and-drop canvas application built with React Flow, featuring draggable blocks, connection management, and context menus.

[preview](./public/images/preview.png)

## 🎯 Features

- **Drag & Drop Interface**: Intuitive block placement from sidebar to canvas
- **Connection Management**: Smart connection system (Block A → Block B only)
- **Context Menus**: Right-click blocks to access "Hello World" context menu
- **Visual Feedback**: Color-coded blocks and connection states
- **Responsive Design**: Works seamlessly across different screen sizes
- **Modern UI**: Clean, professional interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Built With

- **React 18** - UI library
- **React Flow** - Interactive node-based interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React patterns

## 🎮 How to Use

1. **Drag Blocks**: Drag "Block A" (green) or "Block B" (yellow) from the sidebar to the canvas
2. **Create Connections**: Click and drag from Block A to Block B to create connections
3. **Context Menu**: Right-click any block to see the "Hello World" context menu
4. **Navigate**: Use mouse wheel to zoom, click and drag to pan around the canvas

## 🏗️ Project Structure

```
src/
├── App.js          # Main application component
├── index.js        # React entry point
├── index.css       # Global styles and Tailwind imports
└── ...
```

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run deploy` - Deploys to GitHub Pages (if configured)

## 🎨 Customization

### Adding New Block Types

1. Add new block type to `blockTypes` array in App.js
2. Update the styling in the `CustomBlock` component
3. Modify connection logic in `onConnect` function if needed

### Styling

The app uses Tailwind CSS for styling. You can customize:

- Colors in `tailwind.config.js`
- Block appearance in the `CustomBlock` component
- Canvas styling in the main ReactFlow component

## 🚀 Deployment

### Vercel

```bash
npx vercel
```

## License and Credits

- Aakash Rajbhar
