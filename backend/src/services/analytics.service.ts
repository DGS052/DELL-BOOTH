export const trackAnalytics = (data: { industry: string; action: string; timestamp: string }) => {
  // Mock service layer - later we will connect a database here
  console.log('Analytics payload received:', data);
  return { success: true, message: 'Analytics tracked successfully', data };
};
