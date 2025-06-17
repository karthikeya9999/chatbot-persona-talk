import { Card, CardContent } from '@/components/ui/card';
import { Github, Globe, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <Card className="mt-8 border-t">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart size={14} className="text-red-500" />
            <span>using React, TypeScript, OpenAI API & Web Speech API</span>
          </div>
          
          <div className="flex justify-center items-center gap-6 text-sm">
            <a
              href="https://platform.openai.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe size={14} />
              OpenAI Docs
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe size={14} />
              Web Speech API
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Your conversations are not stored. API key is kept locally in your browser session.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Footer;