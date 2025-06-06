import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'student',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  verificationToken: {
    type: String,
    sparse: true
  },
  verificationTokenExpires: {
    type: Date,
    sparse: true
  }
}, { timestamps: true });

// Create indexes for verification fields
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ verificationTokenExpires: 1 });

// Encrypt password before saving
UserSchema.pre<IUser>('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 