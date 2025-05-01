import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import Course from '@/models/Course';

// Get a single course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const id = params.id;
  try {
    // Connect to MongoDB
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 503 });
    }
    
    // Fetch course
    const course = await Course.findById(id).populate('createdBy', 'name email');
      
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Format the response
    const formattedCourse = {
      id: course._id,
      name: course.name,
      courseId: course.courseId,
      points: course.points,
      description: course.description || '',
      modules: course.modules,
      createdBy: {
        id: course.createdBy._id,
        name: course.createdBy.name
      },
      createdAt: course.createdAt
    };
    
    return NextResponse.json({ course: formattedCourse });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ 
      error: 'Error fetching course. Please try again later.' 
    }, { status: 500 });
  }
}

// Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const id = params.id;
  try {
    const { name, courseId, points, description, modules } = await request.json();

    // Validate request data
    if (!name || !courseId || !points || !description || !modules || modules.length < 1) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 503 });
    }
    
    // Find the course
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Check if updating courseId would conflict with an existing course
    if (courseId !== course.courseId) {
      const existingCourse = await Course.findOne({ courseId });
      if (existingCourse && existingCourse._id.toString() !== id) {
        return NextResponse.json({ 
          error: 'A course with this ID already exists' 
        }, { status: 409 });
      }
    }
    
    // Update course fields
    course.name = name;
    course.courseId = courseId;
    course.points = points;
    course.description = description;
    course.modules = modules;
    
    await course.save();
    
    // Format the response
    const updatedCourse = {
      id: course._id,
      name: course.name,
      courseId: course.courseId,
      points: course.points,
      description: course.description,
      modules: course.modules,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    return NextResponse.json({ 
      message: 'Course updated successfully', 
      course: updatedCourse
    });
  } catch (error: any) {
    console.error('Course update error:', error);
    
    // Specific error handling for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation error', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error updating course. Please try again later.' 
    }, { status: 500 });
  }
}