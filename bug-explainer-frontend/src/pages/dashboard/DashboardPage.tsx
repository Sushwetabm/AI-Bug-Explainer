import { useAuth } from "@/hooks/useAuth";
import { analysisService } from "@/services/analysis.service";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalysisItem {
  id: string;
  createdAt?: string;
  code?: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const navigate = useNavigate(); // ✅ useNavigate for back

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await analysisService.getAnalysisHistory();
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load analysis history:", error);
        setHistory([]);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="space-y-4 px-4 py-6 max-w-4xl mx-auto">
      {/* ✅ Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p>No analysis history yet</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg">
                  <p className="font-medium">Analysis #{item.id}</p>
                  {item.createdAt && (
                    <p className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
