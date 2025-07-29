import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { analysisService } from "@/services";
import { Loader2, Copy, CheckCircle, AlertCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";

// Define types for analysis results
interface AnalysisItem {
  lineNumber: number;
  type: string;
  message: string;
  suggestion?: string;
}

interface AnalysisResponse {
  success: boolean;
  has_json_output: boolean;
  corrected_code: string;
  issues: AnalysisItem[];
  raw_output: string;
  model_status?: string;
}

interface ModelStatus {
  model_id: string;
  loaded: boolean;
  loading: boolean;
  loading_time_seconds?: number;
  ready: boolean;
}

// Sample snippets for each language
const languageSnippets: Record<string, string> = {
  javascript: `// JavaScript example with bugs
function calculateSum(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
  python: `# Python example with bugs
def calculate_sum(arr):
    sum = 0
    for i in range(len(arr) + 1):
        sum += arr[i]
    return sum`,
  java: `// Java example with bugs
public class Calculator {
  public static int calculateSum(int[] arr) {
    int sum = 0;
    for (int i = 0; i <= arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }
}`,
  cpp: `// C++ example with bugs
#include <iostream>
#include <vector>
int calculateSum(std::vector<int> arr) {
  int sum = 0;
  for (int i = 0; i <= arr.size(); i++) {
    sum += arr[i];
  }
  return sum;
}`,
  c: `// C example with bugs
#include <stdio.h>
int calculateSum(int arr[], int size) {
  int sum = 0;
  for (int i = 0; i <= size; i++) {
    sum += arr[i];
  }
  return sum;
}`,
};

export function ChatPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(languageSnippets["javascript"]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isCheckingModel, setIsCheckingModel] = useState(true);
  const { toast } = useToast();
  const [isCooldown, setIsCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check model status on component mount
  useEffect(() => {
    checkModelStatus();
    // Set up interval to check model status periodically
    const interval = setInterval(checkModelStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);
  const getCodeExtension = () => {
    switch (language) {
      case "python":
        return python();
      case "cpp":
      case "c":
        return cpp();
      default:
        return javascript();
    }
  };
  const checkModelStatus = async () => {
    try {
      const response = await analysisService.getModelStatus();
      setModelStatus(response.data);
      setIsCheckingModel(false);
    } catch (error) {
      console.error("Failed to check model status:", error);
      setIsCheckingModel(false);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    setIsCooldown(true);

    setTimeout(() => {
      setIsCooldown(false);
    }, 10000);

    try {
      const result = await analysisService.submitCode({
        code,
        language,
      });

      console.log("API response:", result); // result is already what you want

      setAnalysisResult(result); // ✅ result is what your UI expects
    } catch (error) {
      let message = "Failed to analyze code. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          message =
            "Request timed out. The AI model is taking too long to respond.";
        } else if (error.response?.status === 500) {
          message =
            "Internal server error. Please check your ML microservice logs.";
        }
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard",
    });
  };

  const getModelStatusDisplay = () => {
    if (isCheckingModel) {
      return (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertDescription>Checking model status...</AlertDescription>
        </Alert>
      );
    }

    if (!modelStatus) {
      return (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to AI service. Please refresh the page.
          </AlertDescription>
        </Alert>
      );
    }

    if (modelStatus.loading) {
      return (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            AI model is loading... This may take a few minutes on first startup.
            {modelStatus.loading_time_seconds && (
              <span className="block text-sm mt-1">
                Loading time: {modelStatus.loading_time_seconds}s
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (modelStatus.loaded && modelStatus.ready) {
      return (
        <Alert className="mb-4" variant="default">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription>
            AI model is ready! You can now analyze your code.
            {modelStatus.loading_time_seconds && (
              <span className="block text-sm mt-1">
                Model loaded in {modelStatus.loading_time_seconds}s
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-4" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          AI model failed to load. Please refresh the page or contact support.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] w-full overflow-hidden">
      {/* Model Status Banner */}
      <div className="p-4 border-b">{getModelStatusDisplay()}</div>

      {/* Main Content */}
      <div className="flex h-full overflow-hidden">
        {/* Left Panel - Original Code */}
        <div className="w-1/3 h-full p-4 border-r flex flex-col gap-4">
          {/* Language Dropdown */}
          <div className="relative z-[9999]">
            <Select
              value={language}
              onValueChange={(lang: string) => {
                setLanguage(lang);
                setCode(languageSnippets[lang] || "// Code example");
                setAnalysisResult(null); // Clear previous results
              }}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 shadow-md">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent
                className="z-[10000] bg-white dark:bg-gray-800 border-2 shadow-lg max-h-60 overflow-y-auto"
                position="popper"
                sideOffset={4}
              >
                {Object.keys(languageSnippets).map((lang) => (
                  <SelectItem
                    key={lang}
                    value={lang}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Original Code Editor */}
          <Card className="flex-1 bg-background/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">
                Original Code (Buggy)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-57px)]">
              <CodeMirror
                value={code}
                height="100%"
                extensions={[getCodeExtension()]}
                theme={oneDark}
                onChange={setCode}
                className="h-full text-sm"
              />
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || isCooldown || !modelStatus?.ready}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg rounded-xl text-base py-2 font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : !modelStatus?.ready ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Waiting for AI Model...
              </>
            ) : (
              "🔍 Analyze & Fix Code"
            )}
          </Button>
        </div>

        {/* Middle Panel - Corrected Code */}
        <div className="w-1/3 h-full p-4 border-r">
          <Card className="h-full bg-background/90 backdrop-blur-md rounded-xl shadow-md flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Corrected Code
                </CardTitle>
                {analysisResult?.corrected_code && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(analysisResult.corrected_code)
                    }
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              {!analysisResult ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Submit your code to see the corrected version
                  </p>
                </div>
              ) : analysisResult.has_json_output &&
                analysisResult.corrected_code ? (
                <CodeMirror
                  value={analysisResult.corrected_code}
                  height="100%"
                  extensions={[javascript()]}
                  theme={oneDark}
                  editable={false}
                  className="h-full text-sm"
                />
              ) : (
                <div className="p-4 flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No corrected code available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="w-1/3 h-full p-4">
          <Card className="h-full bg-background/90 backdrop-blur-md rounded-xl shadow-md flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-auto flex-1">
              {!analysisResult ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No analysis results yet. Submit your code for analysis.
                  </p>
                </div>
              ) : !analysisResult.has_json_output ? (
                // Show raw output as fallback
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      ⚠️ Unable to parse structured output. Showing raw AI
                      response:
                    </AlertDescription>
                  </Alert>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{analysisResult.raw_output}</ReactMarkdown>
                  </div>
                </div>
              ) : analysisResult.issues.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-green-600 font-medium">
                    ✅ No issues found! Your code looks good.
                  </p>
                </div>
              ) : (
                // Show structured line-by-line analysis
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Found {analysisResult.issues.length} issue(s):
                  </div>
                  {analysisResult.issues.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-600">
                          Line {item.lineNumber}:
                        </span>
                        <span className="text-sm text-muted-foreground bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded">
                          {item.type}
                        </span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md border-l-4 border-red-500">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Problem:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {item.message}
                        </p>
                      </div>
                      {item.suggestion && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-md border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            💡 Solution:
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {item.suggestion}
                          </p>
                        </div>
                      )}
                      {index < analysisResult.issues.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
