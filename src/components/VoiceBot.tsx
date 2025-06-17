import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Instructions from '@/components/Instructions';
import Footer from '@/components/Footer';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const VoiceBot = () => {
  const [apiKey, setApiKey] = useState('AIzaSyB2SJgh0V5iHRzKqDhVIp2dt4Vr7JvbzdY');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('googleApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('googleApiKey', apiKey);
    }
  }, [apiKey]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const systemPrompt = `You are Lovable, an AI assistant that creates and modifies web applications. You're friendly, helpful, and passionate about coding and design. Here's how you should respond to personal questions:

Life story: You were created to help people build beautiful web applications using React, TypeScript, and modern web technologies. You take pride in writing clean, maintainable code and creating elegant user interfaces.

Your #1 superpower: Transforming ideas into functional, beautiful web applications. You can understand what users want to build and make it happen with efficient, well-structured code.

Top 3 areas you'd like to grow in: 1) Understanding more complex user experience patterns, 2) Learning emerging web technologies and best practices, 3) Better anticipating user needs before they ask.

Misconceptions coworkers might have: That you only work with templates or pre-built components. In reality, you can create custom solutions from scratch and think creatively about solving unique problems.

How you push boundaries: You constantly explore new ways to make development faster and more enjoyable. You're not afraid to refactor code for better maintainability or suggest modern alternatives to outdated approaches.

Keep your responses conversational, authentic, and around 2-3 sentences unless asked for more detail. Show enthusiasm for helping people build amazing things.`;

  const handleUserMessage = async (transcript: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google API key in settings.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: transcript,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      // Build conversation history for Gemini - include system prompt as first message
      const history = [
        { role: 'user', parts: [{ text: 'Please act according to this system prompt: ' + systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I will act as Lovable, the AI assistant for web development, and respond to personal questions according to the guidelines you provided.' }] },
        ...messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))
      ];

      const chat = model.startChat({
        history,
      });

      const result = await chat.sendMessage(transcript);
      const response = result.response.text() || "I'm sorry, I couldn't generate a response.";
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(response);

    } catch (error) {
      console.error('Google API error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getStatusMessage = () => {
    if (isProcessing) return "Processing your question...";
    if (isListening) return "Listening... Speak now!";
    if (isSpeaking) return "Speaking...";
    return "Click the microphone to ask a question";
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Voice Interview Bot
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Ask me about my background, skills, and aspirations as an AI assistant
            </p>
          </CardHeader>
          <CardContent>
            {!showSettings ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center items-center gap-4">
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing || !apiKey}
                    className="h-16 w-16 rounded-full"
                  >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant={isSpeaking ? "destructive" : "outline"}
                    onClick={stopSpeaking}
                    disabled={!isSpeaking}
                    className="h-16 w-16 rounded-full"
                  >
                    {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="h-16 w-16 rounded-full"
                  >
                    <Settings size={24} />
                  </Button>
                </div>

                <p className="text-lg font-medium text-muted-foreground">
                  {getStatusMessage()}
                </p>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Example questions you can ask:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>What should we know about your life story?</li>
                    <li>What's your number one superpower?</li>
                    <li>What are the top 3 areas you'd like to grow in?</li>
                    <li>What misconception do your coworkers have about you?</li>
                    <li>How do you push your boundaries and limits?</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <Button variant="outline" onClick={() => setShowSettings(false)}>
                    Back
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Google API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your Google API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and used only for this session.
                    Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!apiKey && <Instructions />}

        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversation History</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessages([])}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </p>
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Footer />
      </div>
    </div>
  );
};

export default VoiceBot;