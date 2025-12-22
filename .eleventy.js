module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/wp-content": "wp-content" });
  eleventyConfig.addPassthroughCopy({ "src/wp-includes": "wp-includes" });

  return {
    dir: {
      input: "src",
      output: "dist",
    },
    htmlTemplateEngine: false,
    dataTemplateEngine: false,
    markdownTemplateEngine: false,
    passthroughFileCopy: true,
  };
};
