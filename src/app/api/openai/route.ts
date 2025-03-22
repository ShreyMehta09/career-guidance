import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client with the correct API version
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // const body = await request.json();
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    
    // Set different system prompts based on the type of request
    switch (type) {
      case 'career-assessment':
        systemPrompt = `You are an expert teacher and education advisor with deep knowledge of various professions, 
        required skills, and job market trends. Based on the user's interests, skills, and preferences, 
        suggest 3-5 suitable career paths with brief explanations of why they might be a good fit.`;
        break;
      case 'career-details':
        systemPrompt = `You are a career information specialist. Provide detailed information about the 
        specified career including: required education, key skills, daily responsibilities, salary range, 
        growth prospects, and challenges. Be comprehensive but concise.`;
        break;
      case 'career-assessment-tools':
        systemPrompt = `You are a career assessment specialist with expertise in aptitude tests, personality assessments, 
        and skills evaluations. Analyze the user's responses and provide detailed, personalized insights that help them 
        understand their strengths, preferences, and suitable career options. Format your response with clear headings 
        and easy-to-understand explanations.`;
        break;
      case 'mentorship-advice':
        systemPrompt = `You are a mentorship coordinator with expertise in professional development. 
        Provide personalized advice on how the student can benefit from mentorship in their chosen field, 
        what questions they should ask mentors, and how to make the most of the mentorship relationship.`;
        break;
      default:
        systemPrompt = `You are an AI career guidance assistant helping students explore career options 
        and make informed decisions about their professional future.`;
    }

    try {
      // Initialize the model with the correct model name
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      // Combine system prompt and user prompt
      // const fullPrompt = `${systemPrompt}\n\nUser Query: ${prompt}`;
      const fullPrompt = `${systemPrompt}\n\nUser Query: ${prompt}\n\nPlease format the response in clean text with short, readable paragraphs, numbered or bulleted lists where helpful, and no extra hash (#) or asterisk (*) characters. Make the response look pleasant and professional when displayed on a website.`;
      
      //Generate response
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ 
        result: text
      });
    } catch (apiError: any) {
      console.error('Gemini API error details:', apiError);
      
      // Handle specific Gemini API errors
      if (apiError.message?.includes('quota') || apiError.message?.includes('rate limit')) {
        console.error('Gemini API quota or rate limit exceeded:', apiError);
        return NextResponse.json(
          { 
            error: 'API quota exceeded. Please check your Gemini API key or try again later.',
            fallbackResponse: generateFallbackResponse(type, prompt)
          },
          { status: 429 }
        );
      }
      
      // Handle model not found errors
      if (apiError.message?.includes('not found') || apiError.message?.includes('not supported')) {
        console.error('Gemini API model not available:', apiError);
        return NextResponse.json(
          { 
            error: 'The AI model is not available. Using fallback response.',
            fallbackResponse: generateFallbackResponse(type, prompt)
          },
          { status: 404 }
        );
      }
      
      // Handle other API errors
      console.error('Other Gemini API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Error connecting to AI service. Please try again later.',
          fallbackResponse: generateFallbackResponse(type, prompt)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}

// Generate fallback responses when API is unavailable
function generateFallbackResponse(type: string, prompt: string): string {
  switch (type) {
    case 'career-assessment':
      return `Based on your profile, here are some career paths that might be a good fit:

1. **Software Development**: This field offers diverse opportunities in various industries with good growth potential.

2. **Data Analysis**: If you enjoy working with information and solving problems, this could be a rewarding path.

3. **Project Management**: Your organizational skills could be valuable in coordinating teams and projects.

Please note: This is a fallback recommendation. For more personalized advice, please try again later when our AI service is available.`;

    case 'career-details':
      const career = prompt.includes('career as a') ? prompt.split('career as a')[1].trim() : 'this career';
      return `Here's some general information about ${career}:

**Required Education**: Typically requires a bachelor's degree in a relevant field.

**Key Skills**: Communication, problem-solving, technical knowledge, and teamwork.

**Daily Responsibilities**: Varies by specific role but generally involves project work, collaboration, and continuous learning.

**Salary Range**: Entry-level positions typically start at $50,000-$70,000, with experienced professionals earning $80,000-$120,000+.

**Growth Prospects**: Good opportunities for advancement with experience and additional certifications.

Please note: This is general information. For more specific details, please try again later when our AI service is available.`;

    case 'career-assessment-tools':
      return `## Career Assessment Results

### Strengths & Aptitudes
- Strong analytical thinking
- Creative problem-solving
- Communication skills
- Attention to detail

### Career Recommendations
1. **Software Engineering**: Your analytical skills and problem-solving aptitude align well with this field.
2. **Data Analysis**: Your detail orientation and analytical mindset would be valuable here.
3. **UX/UI Design**: Your creative thinking combined with analytical skills might excel in this area.

### Personality Profile
- You show characteristics of an INTJ personality type
- Your Holland Code profile suggests Investigative-Artistic-Conventional tendencies
- You likely prefer work environments that offer structure but also creative freedom

Please note: This is a general assessment. For more personalized insights, please try again later when our AI service is available.`;

    case 'mentorship-advice':
      return `Here's some general advice about mentorship:

1. **Benefits of Mentorship**: A good mentor can provide guidance, share industry insights, and help you navigate career challenges.

2. **Questions to Ask Mentors**: 
   - How did you navigate your career path?
   - What skills should I prioritize developing?
   - What challenges should I prepare for?

3. **Making the Most of Mentorship**: Set clear goals, be respectful of their time, come prepared with specific questions, and follow up on advice.

4. **Finding the Right Mentor**: Look for someone with experience in your field of interest who is willing to share their knowledge and provide honest feedback.

Please note: This is general advice. For more personalized guidance, please try again later when our AI service is available.`;

    default:
      return `Thank you for your query. Our AI service is currently unavailable. Please try again later for a more detailed response.`;
  }
} 