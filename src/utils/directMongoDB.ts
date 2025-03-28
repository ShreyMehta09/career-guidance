import { MongoClient, ObjectId } from 'mongodb';

// Get the database name from connection string
function getDatabaseName(uri: string): string {
  try {
    // Extract database name from URI
    const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/);
    return dbNameMatch ? dbNameMatch[1] : 'test';
  } catch (error) {
    console.error('Error extracting database name:', error);
    return 'test';
  }
}

// Utility to directly update user verification fields
export async function updateUserVerificationFields(userId: string, verificationData: any) {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const databaseName = getDatabaseName(uri);
    console.log(`Using database: ${databaseName}`);
    
    const database = client.db(databaseName);
    const usersCollection = database.collection('users');
    
    // Update the user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: verificationData }
    );
    
    console.log(`Updated user verification fields: ${result.modifiedCount} document(s) modified`);
    return result.modifiedCount > 0;
  } finally {
    await client.close();
  }
}

// Utility to get a user by verification token
export async function getUserByVerificationToken(token: string) {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const databaseName = getDatabaseName(uri);
    console.log(`Using database: ${databaseName}`);
    
    const database = client.db(databaseName);
    const usersCollection = database.collection('users');
    
    // Find the user
    const user = await usersCollection.findOne({ verificationToken: token });
    console.log(`Found user with token: ${user ? 'yes' : 'no'}`);
    return user;
  } finally {
    await client.close();
  }
}

// Utility to get user verification status by email
export async function getUserVerificationStatus(email: string) {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const databaseName = getDatabaseName(uri);
    console.log(`Getting verification status for ${email} from database: ${databaseName}`);
    
    const database = client.db(databaseName);
    const usersCollection = database.collection('users');
    
    // Find the user and get just the verification status
    const user = await usersCollection.findOne(
      { email: email.toLowerCase() },
      { projection: { isVerified: 1, email: 1 } }
    );
    
    console.log(`User verification status for ${email}:`, user ? user.isVerified : 'user not found');
    return user ? { isVerified: user.isVerified, email: user.email } : null;
  } finally {
    await client.close();
  }
} 