'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, CheckCircle2 } from 'lucide-react';

export default function AIPage() {
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
        <h1 className="text-3xl font-bold italic">AI Assistant</h1>
        <p className="text-gray-500 italic text-xl">Create and correct questions using advanced AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit for Correction</CardTitle>
          <CardDescription>Enter your question or code snippet for AI analysis</CardDescription>
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
            {loading ? 'Processing...' : (
              <>
                <Send className="mr-2 h-4 w-4" /> Analyze with AI
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
