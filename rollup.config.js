import babel from "rollup-plugin-babel";

export default {
  entry: "lib/knockout-carousel.js",
  plugins: [babel()],
  dest: "dist/knockout-carousel.js",
  format: "cjs"
};
