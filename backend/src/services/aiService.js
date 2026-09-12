export const callAIService = async (file) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob, file.originalname);

    const response = await fetch(`${aiServiceUrl}/detect`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`AI service responded with status ${response.status}: ${errorText}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      const timeoutErr = new Error("AI detection request timed out");
      timeoutErr.code = "ETIMEDOUT";
      throw timeoutErr;
    }
    throw error;
  }
};

export default callAIService;
