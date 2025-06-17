import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Key, Mic, Volume2 } from 'lucide-react';

const Instructions = () => {
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertCircle size={20} />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-orange-700 dark:text-orange-300">
        <div className="flex items-start gap-3">
          <Key size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">1. Add your Google API Key</p>
            <p>Click the settings button (⚙️) and enter your Google API key. Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google AI Studio</a></p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Mic size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">2. Allow Microphone Access</p>
            <p>Your browser will ask for microphone permission when you first click the microphone button.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Volume2 size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">3. Start Talking!</p>
            <p>Click the microphone, ask your question, and listen to the AI's voice response. Try asking about my background, skills, or growth areas!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Instructions;