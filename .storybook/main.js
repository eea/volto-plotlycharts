module.exports = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)', // să caute story-uri peste tot în src
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: '@storybook/react',
};
