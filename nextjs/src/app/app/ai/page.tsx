'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AIPage() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setResult('This is an AI-generated correction based on your input. In a production environment, this would call an OpenAI or Anthropic API.');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-2">
        <Brain className="h-12 w-12 text-primary-600 mx-auto" />
        <h1 className="text-3xl font-bold italic">{t('ai_assistant')}</h1>
        <p className="text-gray-500 italic text-xl">{t('ai_desc_page')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('submit_correction')}</CardTitle>
          <CardDescription>{t('ai_desc_page')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your question here..."
            className="min-h-[200px]"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={loading || !question}
          >
            {loading ? '...' : (
              <>
                <Send className="mr-2 h-4 w-4" /> {t('analyze_ai')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" /> AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 leading-relaxed italic">{result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
