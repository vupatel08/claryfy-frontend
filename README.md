# Canvas Assistant Frontend

A Next.js frontend for the Canvas Assistant application that provides a clean, ChatGPT-like interface for viewing Canvas course data.

## 🚀 **Phase 1 Complete: Frontend/Backend Separation**

### **What's Working:**
- ✅ **Separated frontend** from MCP backend
- ✅ **Next.js with TypeScript** and Tailwind CSS
- ✅ **API communication** between frontend and backend
- ✅ **Collapsible sections** for assignments, announcements, and files
- ✅ **Favorite courses only** functionality
- ✅ **CORS enabled** backend for cross-origin requests

### **Architecture:**
```
Frontend (Next.js)     Backend (Express)
├── localhost:3001     ├── localhost:3000
├── Dashboard UI       ├── Canvas API calls
├── Course selection   ├── MCP functionality
└── Collapsible data   └── JSON API responses
```

## 🏃‍♂️ **Running the Application**

### **Backend (Terminal 1):**
```bash
cd /Users/vrajpatel/Downloads/mcp-canvas-lms-main
node src/simple-server.js
```
- Runs on `http://localhost:3000`
- Health check: `http://localhost:3000/health`

### **Frontend (Terminal 2):**
```bash
cd /Users/vrajpatel/Downloads/mcp-canvas-lms-main/frontend
npm run dev
```
- Runs on `http://localhost:3001`
- Auto-redirects to `/dashboard`