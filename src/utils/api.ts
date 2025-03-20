export async function getCareerRecommendations(assessmentData: any) {
    try {
      const prompt = `
        Based on the following information about a student, suggest suitable career paths:
        
        Interests: ${assessmentData.interests.join(', ')}
        Skills: ${assessmentData.skills.join(', ')}
        Education Level: ${assessmentData.education || 'Not specified'}
        Preferred Work Style: ${assessmentData.workStyle || 'Not specified'}
        Career Goals: ${assessmentData.goals || 'Not specified'}
        
        Please provide 3-5 career recommendations with explanations of why they might be a good fit.
      `;
  
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'career-assessment',
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // If there's a fallback response, use it
        if (data.fallbackResponse) {
          console.warn('Using fallback response for career recommendations');
          return data.fallbackResponse;
        }
        throw new Error(data.error || 'Failed to get career recommendations');
      }
  
      return data.result;
    } catch (error) {
      console.error('Error getting career recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed information about a specific career
   */
  export async function getCareerDetails(careerTitle: string) {
    try {
      const prompt = `
        Please provide detailed information about a career as a ${careerTitle}, including:
        
        1. Required education and qualifications
        2. Essential skills and competencies
        3. Daily responsibilities and tasks
        4. Salary range and compensation expectations
        5. Career growth and advancement opportunities
        6. Challenges and demands of the role
      `;
  
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'career-details',
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // If there's a fallback response, use it
        if (data.fallbackResponse) {
          console.warn('Using fallback response for career details');
          return data.fallbackResponse;
        }
        throw new Error(data.error || 'Failed to get career details');
      }
  
      return data.result;
    } catch (error) {
      console.error('Error getting career details:', error);
      throw error;
    }
  }
  
  /**
   * Get career assessment tool results
   */
  export async function getCareerAssessmentResults(toolType: string, userResponses: Record<string, any>) {
    try {
      let prompt = '';
      
      switch (toolType) {
        case 'aptitude':
          prompt = `
            Analyze the following aptitude test responses and provide career path recommendations:
            
            ${Object.entries(userResponses).map(([question, answer]) => `${question}: ${answer}`).join('\n')}
            
            Please provide:
            1. An analysis of strengths and aptitudes revealed by the test
            2. 3-5 career recommendations based on these aptitudes
            3. Suggested next steps for exploring these careers
          `;
          break;
        
        case 'personality':
          prompt = `
            Analyze the following personality test responses and provide insights:
            
            ${Object.entries(userResponses).map(([question, answer]) => `${question}: ${answer}`).join('\n')}
            
            Please provide:
            1. A personality profile based on the MBTI framework or Holland Codes
            2. Strengths and potential work style preferences
            3. Career fields that typically match well with this personality type
            4. Potential challenges and growth areas
          `;
          break;
        
        case 'skills':
          prompt = `
            Analyze the following skills and interests survey responses:
            
            ${Object.entries(userResponses).map(([question, answer]) => `${question}: ${answer}`).join('\n')}
            
            Please provide:
            1. A summary of key skills and interests identified
            2. Potential career paths that align with these skills and interests
            3. Suggestions for skill development to enhance career readiness
            4. Resources or activities to further explore these career paths
          `;
          break;
        
        default:
          throw new Error('Invalid assessment tool type');
      }
  
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'career-assessment-tools',
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // If there's a fallback response, use it
        if (data.fallbackResponse) {
          console.warn('Using fallback response for career assessment tools');
          return data.fallbackResponse;
        }
        throw new Error(data.error || 'Failed to get career assessment results');
      }
  
      return data.result;
    } catch (error) {
      console.error('Error getting career assessment results:', error);
      throw error;
    }
  }
  
  /**
   * Get mentorship advice for a specific career interest
   */
  export async function getMentorshipAdvice(careerInterest: string, studentGoals: string) {
    try {
      const prompt = `
        A student is interested in pursuing a career in ${careerInterest} and has the following goals:
        
        "${studentGoals}"
        
        Please provide advice on:
        1. How mentorship can benefit them in this field
        2. What specific questions they should ask potential mentors
        3. How to make the most of the mentorship relationship
        4. What kind of mentor would be most helpful for their goals
      `;
  
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'mentorship-advice',
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // If there's a fallback response, use it
        if (data.fallbackResponse) {
          console.warn('Using fallback response for mentorship advice');
          return data.fallbackResponse;
        }
        throw new Error(data.error || 'Failed to get mentorship advice');
      }
  
      return data.result;
    } catch (error) {
      console.error('Error getting mentorship advice:', error);
      throw error;
    }
  } 