module.exports = function (eleventyConfig) {
  eleventyConfig.setLiquidOptions({
    trimOutputLeft: true,
    trimOutputRight: true,
  });

  eleventyConfig.addFilter("unsafe", (value) => {
    if (value == null) return "";
    return value;
  });

  eleventyConfig.addPassthroughCopy("web/assets");

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = (content || "")
      .replace(/<[^>]*>/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("getSeries", (collection, series) => {
    if (!series) return [];
    return (collection || []).filter((item) => item.data.series === series);
  });

  eleventyConfig.addFilter("sortBySeriesPart", (collection) => {
    return [...(collection || [])].sort((a, b) => {
      const partA = Number(a.data.seriesPart || 0);
      const partB = Number(b.data.seriesPart || 0);
      if (partA !== partB) return partA - partB;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  });

  eleventyConfig.addFilter("filterByTopic", (collection, topic) => {
    if (!topic) return [];
    const slugify = (value) =>
      String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const topicSlug = slugify(topic);
    return (collection || []).filter((item) => {
      const topics = item.data.topics || [];
      return topics.map(slugify).includes(topicSlug);
    });
  });

  eleventyConfig.addFilter("slug", (value) => {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  });

  eleventyConfig.addCollection("articles", (collectionApi) => {
    return collectionApi.getFilteredByGlob("web/posts/*.md").sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  eleventyConfig.addCollection("topics", (collectionApi) => {
    const topics = new Set();
    collectionApi.getFilteredByGlob("web/posts/*.md").forEach((item) => {
      (item.data.topics || []).forEach((topic) => topics.add(topic));
    });
    return Array.from(topics).sort();
  });

  return {
    dir: {
      input: "web",
      output: "_site",
      includes: "_includes",
    },
    templateFormats: ["md", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};
