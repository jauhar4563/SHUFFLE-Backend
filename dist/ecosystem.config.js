module.exports = {
  apps: [
    {
      name: "myApp",
      script: "./index.js",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        MONGO_URL: "mongodb://localhost:27017/SHUFFLE",
        JWT_SECRET: "SHUFFLE4563",
        SESSION_SECRET: "SHUFFLESsession",
        DOMAIN_NAME: "https://shufle.online",
        BUCKET_NAME: "shufle.online",
        REGION: "ap-south-1",
        AWS_ACCESS_KEY_ID: "AKIARCMS32USRDBIQYUQ",
        AWS_SECRET_ACCESS_KEY: "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",
        
        // Other environment variables
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        MONGO_URL:
          "mongodb+srv://jauharp02:7510529354Jauhar@cluster0.knvvzvs.mongodb.net/SHUFFLE",
        JWT_SECRET: "SHUFFLE4563",
        SESSION_SECRET: "SHUFFLESsession",
        DOMAIN_NAME: "https://shufle.online",
        BUCKET_NAME: "shufle.online",
        REGION: "ap-south-1",
        AWS_ACCESS_KEY_ID: "AKIARCMS32USRDBIQYUQ",
        AWS_SECRET_ACCESS_KEY: "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",
        // Other environment variables specific to production
      },
    },
  ],
};
