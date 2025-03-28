import { MongoClient, ObjectId } from 'mongodb';

// Get MongoDB client and database
async function getMongoConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(); // Uses the database from the connection string
    return { client, database };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Utility to directly update user verification fields
export async function updateUserVerificationFields(userId: string, verificationData: any) {
  let client;
  
  try {
    const { client: mongoClient, database } = await getMongoConnection();
    client = mongoClient;
    
    const usersCollection = database.collection('users');
    console.log(`Updating verification fields for user: ${userId}`);
    
    // Update the user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: verificationData }
    );
    
    console.log(`Updated user verification fields: ${result.modifiedCount} document(s) modified`);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user verification fields:', error);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Utility to get a user by verification token
export async function getUserByVerificationToken(token: string) {
  let client;
  
  try {
    const { client: mongoClient, database } = await getMongoConnection();
    client = mongoClient;
    
    const usersCollection = database.collection('users');
    console.log(`Looking for user with token: ${token?.substring(0, 10)}...${token?.substring(token.length - 10)}`);
    
    // Debug: Find any users with verification tokens
    const usersWithTokens = await usersCollection.find(
      { verificationToken: { $exists: true, $ne: null } }
    ).toArray();
    
    console.log(`Found ${usersWithTokens.length} users with verification tokens`);
    
    for (const user of usersWithTokens) {
      const storedToken = user.verificationToken;
      if (typeof storedToken === 'string' && storedToken.length > 0) {
        console.log(`User ${user.email} has token: ${storedToken.substring(0, 10)}...${storedToken.substring(storedToken.length - 10)}`);
        
        // Try exact match
        if (storedToken === token) {
          console.log(`Found exact match for user ${user.email}`);
          return user;
        }
      }
    }
    
    // If we get here, we didn't find an exact match
    console.log(`No exact token match found. Trying regex search...`);
    
    // Find user with regex (fuzzy) match as fallback
    const user = await usersCollection.findOne({ verificationToken: token });
    console.log(`Exact token query result: ${user ? 'found user' : 'no user found'}`);
    
    return user;
  } catch (error) {
    console.error('Error finding user by token:', error);
    return null;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Utility to get user verification status by email
export async function getUserVerificationStatus(email: string) {
  let client;
  
  try {
    const { client: mongoClient, database } = await getMongoConnection();
    client = mongoClient;
    
    const usersCollection = database.collection('users');
    console.log(`Getting verification status for ${email}`);
    
    // Find the user and get just the verification status
    const user = await usersCollection.findOne(
      { email: email.toLowerCase() },
      { projection: { isVerified: 1, email: 1 } }
    );
    
    console.log(`User verification status for ${email}:`, user ? user.isVerified : 'user not found');
    return user ? { isVerified: user.isVerified, email: user.email } : null;
  } catch (error) {
    console.error('Error getting user verification status:', error);
    return null;
  } finally {
    if (client) {
      await client.close();
    }
  }
} 