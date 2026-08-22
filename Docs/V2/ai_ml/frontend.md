# UI/UX Requirements & Wireframes
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Frontend Framework** | React 18+ (Vite SPA) + TailwindCSS + Lucide Icons |
| **Document Type** | Frontend UI Component Specification |

---

## 1. Overview & Integration Concept

The Falcon V2 AI user experience is delivered as a non-intrusive, floating assistant widget embedded directly into Falcon's primary React single-page application layout (`frontend/src/layouts/DashboardLayout.jsx`).

The widget is aware of active page routing, active tenant context, and user permissions, offering one-click voice transcription, context-aware prompt execution, and direct insertion of generated text into active forms.

---

## 2. Component Hierarchy (`frontend/src/components/ai/`)

```
frontend/src/
└── components/
    └── ai/
        ├── SpeechWidget.jsx            # Floating chat button & expandable drawer UI
        ├── AudioRecorderModal.jsx       # Waveform visualizer & microphone capture
        ├── PageContextBadge.jsx        # Pill showing current URL/page scope attached
        ├── MarkdownResponseViewer.jsx   # Formatted AI markdown response & action buttons
        └── AnomalyAlertBanner.jsx       # Real-time WebSocket security alert toast
```

---

## 3. UI Wireframe Mockups

### 3.1 Floating AI Widget Layout (Collapsed & Expanded)

```
+-------------------------------------------------------------------------------+
|  FALCON PMS DASHBOARD - /reviews/appraisal/104/                             |
|                                                                               |
|  [ Employee Appraisal: John Doe (Q3 Review) ]                                 |
|  +-------------------------------------------------------+                    |
|  | Performance Feedback Notes:                           |                    |
|  | [ Textarea: Line Manager Input...                   ] |                    |
|  +-------------------------------------------------------+                    |
|                                                                               |
|                                         +-----------------------------------+ |
|                                         | 🤖 Falcon Copilot        [X] [-]  | |
|                                         | --------------------------------- | |
|                                         | [📌 Active Context: Review #104]  | |
|                                         |                                   | |
|                                         | 👤 User: Summarize Q3 KPI delta   | |
|                                         |                                   | |
|                                         | 🤖 AI: Employee achieved 112% target| |
|                                         |    overall, led by Sales (+15%).  | |
|                                         |    [ Copy ] [ Insert to Review ]  | |
|                                         | --------------------------------- | |
|                                         | [ 🎤 Mic ] [ Type prompt... ] [Send]| |
|                                         +-----------------------------------+ |
|                                         | 🤖 (Floating Action Button)        | |
+-------------------------------------------------------------------------------+
```

---

## 4. Custom React Hooks

### 4.1 Page Context Tracker Hook (`usePageContext.js`)

```javascript
import { useLocation, useParams } from 'react-router-dom';

export const usePageContext = () => {
  const location = useLocation();
  const params = useParams();

  const getEntityType = (pathname) => {
    if (pathname.includes('/kpi')) return 'kpi';
    if (pathname.includes('/reviews')) return 'review';
    if (pathname.includes('/structure')) return 'structure';
    if (pathname.includes('/accounts')) return 'accounts';
    return 'general';
  };

  return {
    currentUrl: location.pathname,
    entityType: getEntityType(location.pathname),
    entityId: params.id || null,
    searchQuery: location.search
  };
};
```

### 4.2 Speech Recognition Hook (`useSpeechToText.js`)

```javascript
import { useState, useEffect } from 'react';

export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(text);
    };

    recognition.onend = () => setIsListening(false);
    return () => recognition.stop();
  }, []);

  return { isListening, setIsListening, transcript, setTranscript };
};
```
