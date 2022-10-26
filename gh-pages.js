var ghpages = require("gh-pages");

ghpages.publish(
  "./gh-pages", // path to public directory
  {
    branch: "main",
    repo: "https://github.com/CshCyberhawks/MeanScout.git", // Update to point to your repository
  }
);
