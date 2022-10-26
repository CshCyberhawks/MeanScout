var ghpages = require("gh-pages");

ghpages.publish(
  "./public", // path to public directory
  {
    branch: "main",
    repo: "https://github.com/CshCyberhawks/MeanScout.git", // Update to point to your repository
  }
);
