import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';


// Module interface
export interface IModule {
  title: string;
  type: 'text' | 'video';
  content: string;
  order: number;
}

// Course interface
export interface ICourse extends Document {
  name: string;
  courseId: string;
  points: number;
  description: string;
  createdBy: IUser['_id'];
  modules: IModule[];
  createdAt: Date;
  updatedAt: Date;
}

// Module schema
const ModuleSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'video'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
});

// Course schema
const CourseSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  courseId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    default: "Default course description"
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modules: {
    type: [ModuleSchema],
    validate: {
      validator: function(modules: IModule[]) {
        return modules.length >= 1 && modules.length <= 10;
      },
      message: 'A course must have between 1 and 10 modules'
    }
  }
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
