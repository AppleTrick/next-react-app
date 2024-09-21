/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

// tailwind 문법을 순수 css 문법이 만들어진 번들링 과정이 있고, 브라우저 마다 css 후처리 기능을 설정을 해주기 위한 파일이다.
