# BazaarBuddy Deployment Instructions

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at https://www.mongodb.com/atlas
2. **Environment Variables**: Already configured in Replit Secrets
   - `JWT_SECRET`: For authentication tokens
   - `MONGODB_URI`: MongoDB Atlas connection string

## Step 1: Configure MongoDB Atlas

### Create MongoDB Cluster
1. Log into MongoDB Atlas
2. Create a new project (if needed)
3. Build a new cluster (select FREE M0 tier)
4. Choose your preferred cloud provider and region
5. Wait for cluster creation (2-3 minutes)

### Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is for development; restrict for production
4. Click "Confirm"

### Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password
4. Set permissions to "Read and write to any database"
5. Click "Add User"

### Get Connection String
1. Go to "Clusters" and click "Connect"
2. Select "Connect your application"
3. Choose "Node.js" driver
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your details
6. Example: `mongodb+srv://username:password@cluster0.abcde.mongodb.net/bazaarbuddy`

## Step 2: Update Environment Variables

1. In Replit, the MONGODB_URI secret should be updated with your Atlas connection string
2. Ensure the connection string includes:
   - Your database username and password
   - The database name (suggested: `bazaarbuddy`)

## Step 3: Test the Application

### Start the Server
1. Run the server: `cd server && node index.js`
2. Look for: "✅ Connected to MongoDB" and "🚀 BazaarBuddy server running on port 5000"
3. If successful, the API will be available at `http://localhost:5000`

### Test API Endpoints
- Health check: `GET /api/health`
- Categories: `GET /api/products/categories`
- Register user: `POST /api/auth/register`

## Step 4: Deploy to Production

### Option 1: Replit Deployment
1. Click the "Deploy" button in Replit
2. Configure deployment settings
3. Your app will be available at `yourusername-bazaarbuddy.replit.app`

### Option 2: External Deployment (Vercel)
1. Connect your Replit to GitHub
2. Deploy the repository on Vercel
3. Add environment variables in Vercel dashboard
4. Your app will be available at your Vercel domain

## Troubleshooting

### MongoDB Connection Issues
- **Error**: "Could not connect to any servers"
  - **Solution**: Check IP whitelist in MongoDB Atlas
  - Ensure 0.0.0.0/0 is added for development

- **Error**: "Authentication failed"
  - **Solution**: Verify username/password in connection string
  - Check database user permissions

- **Error**: "MongooseServerSelectionError"
  - **Solution**: Check connection string format
  - Ensure cluster is running and accessible

### Application Issues
- **Port conflicts**: Application uses port 5000, ensure it's available
- **CORS errors**: Server includes CORS middleware for cross-origin requests
- **JWT errors**: Verify JWT_SECRET is set in environment variables

## Production Considerations

1. **Security**:
   - Restrict MongoDB IP whitelist to specific IPs in production
   - Use strong JWT secret (32+ characters)
   - Enable HTTPS in production

2. **Performance**:
   - Enable MongoDB connection pooling
   - Add database indexes for frequently queried fields
   - Implement caching for static data

3. **Monitoring**:
   - Monitor MongoDB Atlas metrics
   - Set up error logging and alerts
   - Track API response times

## Support

If you encounter issues:
1. Check MongoDB Atlas status page
2. Verify environment variables are correctly set
3. Review server logs for specific error messages
4. Ensure network connectivity to MongoDB Atlas