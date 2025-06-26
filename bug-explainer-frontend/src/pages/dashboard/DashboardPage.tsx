import { useAuth } from "@/hooks/useAuth";
import { analysisService } from "@/services/analysis.service";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisItem {
  id: string;
  // Add other properties you expect from the API
  createdAt?: string;
  code?: string;
  // ... include any other fields your API returns
}

export function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await analysisService.getAnalysisHistory();
        // Ensure data is always an array
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load analysis history:", error);
        setHistory([]); // Reset to empty array on error
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="space-y-4">
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
                  {/* Add more item details here as needed */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
