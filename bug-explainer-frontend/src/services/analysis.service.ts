import axios from "axios";

// Base URL for your backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Helper function to get the auth header
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const analysisService = {
  // Submit code for analysis - this matches what your frontend is calling
  async submitCode(data: { code: string; language: string }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/analysis/submit`,
        data,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          timeout: 300000, // 2-minute timeout for ML processing
        }
      );
      return response.data.result; // Extract the result from the backend response
    } catch (error) {
      console.error("Analysis API error:", error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  async analyzeCode(code: string, language: string) {
    return this.submitCode({ code, language });
  },

  // Check model loading status
  async getModelStatus() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analysis/model/status`,
        {
          headers: getAuthHeader(),
          timeout: 300000,
        }
      );
      return response;
    } catch (error) {
      console.error("Model status error:", error);
      throw error;
    }
  },

  // Fetch user's analysis history - fixed endpoint
  async getAnalysisHistory(params?: {
    page?: number;
    limit?: number;
    language?: string;
    status?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.language) queryParams.append("language", params.language);
      if (params?.status) queryParams.append("status", params.status);

      const url = `${API_BASE_URL}/analysis/user/history${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await axios.get(url, {
        headers: getAuthHeader(),
        timeout: 300000,
      });
      return response;
    } catch (error) {
      console.error("History API error:", error);
      throw error;
    }
  },

  // Get specific analysis by ID
  async getAnalysis(analysisId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analysis/${analysisId}`,
        {
          headers: getAuthHeader(),
          timeout: 300000,
        }
      );
      return response;
    } catch (error) {
      console.error("Get analysis error:", error);
      throw error;
    }
  },

  // Delete analysis by ID
  async deleteAnalysis(analysisId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/analysis/${analysisId}`,
        {
          headers: getAuthHeader(),
          timeout: 300000,
        }
      );
      return response;
    } catch (error) {
      console.error("Delete analysis error:", error);
      throw error;
    }
  },

  // Enhanced health check with model status
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/ml/health`, {
        headers: getAuthHeader(),
        timeout: 300000,
      });
      return response;
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  },

  // Poll model loading status until ready
  async waitForModelReady(maxWaitTime: number = 300000): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await this.getModelStatus();
        const status = response.data;

        if (status.loaded && status.ready) {
          return true; // Model is ready
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error("Error polling model status:", error);
        // Continue polling even if there's an error
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    return false; // Timeout reached
  },

  // Test the full pipeline (frontend -> backend -> ML service)
  async testPipeline() {
    try {
      // Test 1: Check model status
      console.log("🔍 Testing model status...");
      const modelStatus = await this.getModelStatus();
      console.log("✅ Model status:", modelStatus.data);

      // Test 2: Test ML service health
      console.log("🔍 Testing ML service health...");
      const health = await this.healthCheck();
      console.log("✅ ML service health:", health.data);

      // Test 3: Submit a simple test code
      console.log("🔍 Testing code submission...");
      const testResult = await this.submitCode({
        code: "function test() { return 1 + 1; }",
        language: "javascript",
      });
      console.log("✅ Code analysis result:", testResult);

      return {
        success: true,
        modelStatus: modelStatus.data,
        health: health.data,
        analysisTest: testResult,
      };
    } catch (error) {
      console.error("❌ Pipeline test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
