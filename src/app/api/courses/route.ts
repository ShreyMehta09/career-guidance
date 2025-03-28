import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import Course from '@/models/Course';
import User from '@/models/User'; 


export async function POST(request: Request) {
  try {
    const { name, courseId, points, description, modules, createdBy } = await request.json();

    // Validate request data
    if (!name || !courseId || !points || !description || !modules || modules.length < 1 || !createdBy) {
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
    
    // Check if course with same ID already exists
    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      return NextResponse.json({ 
        error: 'A course with this ID already exists' 
      }, { status: 409 });
    }
    
    // Create new course
    const newCourse = new Course({
      name,
      courseId,
      points,
      description,
      modules,
      createdBy
    });
    
    await newCourse.save();
    
    return NextResponse.json({ 
      message: 'Course created successfully', 
      course: {
        id: newCourse._id,
        name: newCourse.name,
        courseId: newCourse.courseId,
        points: newCourse.points,
        description: newCourse.description,
        modules: newCourse.modules,
        createdAt: newCourse.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Course creation error:', error);
    
    // Specific error handling for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation error', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error creating course. Please try again later.' 
    }, { status: 500 });
  }
}

// Get all courses or filter by teacher
  export async function GET(request: Request) {
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
      
      // Get query parameters
      const { searchParams } = new URL(request.url);
      const teacherId = searchParams.get('teacherId');
      
      // Build query
      const query = teacherId ? { createdBy: teacherId } : {};
      
      // Fetch courses
      const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');
        
      const userIds = courses.map(course => course.createdBy);
      const users = await User.find({ _id: { $in: userIds } }, '_id name'); 
      const userMap = new Map(users.map(user => [user._id.toString(), user.name]));
      console.log("there there",userMap);
      const courUser = userMap.get(userIds);
      // Format the response
      const formattedCourses = courses.map(course => ({
        id: course._id,
        name: course.name,
        courseId: course.courseId,
        points: course.points,
        description: course.description || '',
        moduleCount: course.modules.length,
        createdBy: {
          id: course.createdBy,
          name: userMap.get(course.createdBy._id.toString()) || 'Unknown'
        },
        createdAt: course.createdAt
      }));
      
      return NextResponse.json({ courses: formattedCourses });
    } catch (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ 
        error: 'Error fetching courses. Please try again later.' 
      }, { status: 500 });
    }
  } 