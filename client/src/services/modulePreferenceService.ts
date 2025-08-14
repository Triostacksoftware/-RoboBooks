import { apiClient } from "./apiClient";

export interface ModulePreference {
  name: string;
  label: string;
  description: string;
  isEnabled: boolean;
}

export interface SavePreferencesRequest {
  preferences: ModulePreference[];
}

class ModulePreferenceService {
  // Get user's module preferences
  async getUserModulePreferences(): Promise<ModulePreference[]> {
    try {
      const response = await apiClient.get("/api/module-preferences/test");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.data as any).data;
    } catch (error) {
      console.error("Error fetching module preferences:", error);
      throw error;
    }
  }

  // Save user's module preferences
  async saveUserModulePreferences(
    preferences: ModulePreference[]
  ): Promise<void> {
    try {
      // Get user ID from localStorage or session
      let userId = null;
      if (typeof window !== "undefined") {
        // Try to get user ID from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            userId = user._id || user.id;
          } catch (e) {
            console.warn("Could not parse user data from localStorage");
          }
        }
      }

      await apiClient.post("/api/module-preferences/preferences", {
        preferences,
        userId, // Send user ID in request body
      });
    } catch (error) {
      console.error("Error saving module preferences:", error);
      throw error;
    }
  }
}

export default new ModulePreferenceService();
