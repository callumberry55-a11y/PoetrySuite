# AI-Enhanced Tracking Features

## Overview

The eye tracking and hand gesture systems have been enhanced with Google Generative AI (Gemini) for significantly improved accuracy and reliability.

## Eye Tracking

### AI Enhancements
- **Computer Vision Analysis**: Uses Gemini 1.5 Flash model to analyze video frames
- **Improved Accuracy**: AI can detect eye gaze direction with better precision than basic pixel analysis
- **Adaptive Processing**: AI processing runs every 3 frames to balance performance and accuracy
- **Fallback Support**: Automatically falls back to basic tracking if AI is unavailable

### How It Works
1. Camera captures video frames
2. Every 3rd frame is analyzed by Gemini AI
3. AI returns normalized gaze coordinates (0-1 range)
4. Coordinates are mapped to screen position
5. Smoothing and calibration offsets are applied
6. Between AI frames, basic pixel detection runs for continuity

### Configuration
- Requires `VITE_GEMINI_API_KEY` environment variable
- Falls back to basic tracking if API key is missing
- Processing interval: Every 3 frames (configurable via `aiProcessingInterval`)

## Hand Gesture Recognition

### AI Enhancements
- **Gesture Classification**: AI identifies specific hand gestures from video
- **Multiple Gesture Support**: Recognizes fist, open palm, thumbs up/down, peace sign, pointing, swipes, and pinch
- **Context Awareness**: AI understands hand position and shape in context
- **Adaptive Processing**: AI processing runs every 5 frames to optimize performance

### Supported Gestures
- **fist**: Closed fist
- **open_palm**: All fingers extended
- **thumbs_up**: Thumb up gesture
- **thumbs_down**: Thumb down gesture
- **peace**: V sign (index + middle finger)
- **pointing**: Index finger pointing
- **swipe_left/right/up/down**: Hand motion gestures
- **pinch**: Thumb and index finger touching

### How It Works
1. Camera captures video frames
2. Every 5th frame is sent to Gemini AI
3. AI analyzes and identifies hand gesture
4. Gesture is mapped to configured action
5. Action is executed (click, scroll, navigate, etc.)
6. Between AI frames, basic skin-tone detection runs

### Configuration
- Requires `VITE_GEMINI_API_KEY` environment variable
- Falls back to basic detection if API key is missing
- Processing interval: Every 5 frames (configurable via `aiProcessingInterval`)
- Gesture delay: 500ms minimum between detections (prevents spam)

## Performance Considerations

### Frame Processing Strategy
- **Eye Tracking**: AI every 3 frames, basic every frame
- **Hand Gestures**: AI every 5 frames, basic every frame
- This hybrid approach balances accuracy with performance

### Resource Usage
- AI processing is more CPU intensive but significantly more accurate
- Basic processing runs continuously for smooth real-time feedback
- Camera stream runs at 640x480 resolution
- JPEG compression at 70% quality for AI frames reduces bandwidth

### Battery Impact
- AI processing increases CPU usage
- Camera usage is the primary battery drain
- Recommend limiting usage sessions to 15-20 minutes
- Take regular breaks

## API Key Setup

Add your Gemini API key to `.env`:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Get a free API key at: https://makersuite.google.com/app/apikey

## Privacy & Security

- All video processing happens locally in the browser
- Video frames are only sent to Google Gemini API for analysis
- No video is stored or recorded
- API calls use HTTPS encryption
- No personal data is transmitted beyond the video frame

## Limitations

- Requires active internet connection for AI features
- API rate limits apply (check Google AI Studio for limits)
- Basic fallback has reduced accuracy
- Performance varies by device capabilities
- Not suitable for production accessibility needs (experimental only)

## Future Improvements

- Local AI models (TensorFlow.js, MediaPipe)
- WebGL acceleration for basic tracking
- Improved calibration algorithms
- Multi-hand tracking
- Custom gesture training
- Offline AI model support
