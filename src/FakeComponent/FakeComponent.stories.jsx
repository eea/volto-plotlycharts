import FakeComponent from './FakeComponent';

export default {
  title: 'FakeComponent',
  component: FakeComponent,
  argTypes: {
    label: {
      control: 'text',
      description: 'Text to display inside the FakeComponent box',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color of the box',
    },
  },
};

const Template = (args) => <FakeComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Hello from FakeComponent!',
  backgroundColor: '#007BFF',
};
