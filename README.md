# Progressify React

Progressify React is a powerful React library for implementing progressive image loading using Sizeable. It provides easy-to-use components to enhance the image loading experience in your React applications.

## Features

- Progressive image loading
- Lazy loading support
- Thumbnail support
- Easy integration with React applications
- Customizable placeholder and image styles

## Installation

Install Progressify React using npm or yarn:

```sh
npm install progressify-react
# or
yarn add progressify-react
```

## Usage

## Process Your Images

Use [Sizeable](https://web-size.web.app/progressify) To generate your images folder and index.json, which are _REQUIRED_ to use progressify-react

Copy the contents of the generated zip to your apps public folder

### ImageProvider

Wrap your application with the `ImageProvider` to provide the image context to your components:

```jsx
import React from "react";
import { ImageProvider } from "progressify-react";
import App from "./App";

const Main = () => (
  <ImageProvider>
    <App />
  </ImageProvider>
);

export default Main;
```

### ProgressiveImage

Use the `ProgressiveImage` component to display progressive images:

```jsx
import React from "react";
import { ProgressiveImage } from "progressify-react";

const YourComponent = () => (
  <ProgressiveImage
    src="image-name"
    placeholderClassName="blur-lg"
    className="any-old-class"
    alt="Description of the image"
    thumb
    lazy
  />
);

export default YourComponent;
```

## API Reference

### ProgressiveImage

The `ProgressiveImage` component accepts the following props:

| Prop                   | Type    | Default    | Description                                                              |
| ---------------------- | ------- | ---------- | ------------------------------------------------------------------------ |
| `src`                  | string  | (required) | The source name of the image (as defined in your Sizeable configuration) |
| `className`            | string  | `''`       | CSS class name for the image element                                     |
| `placeholderClassName` | string  | `''`       | CSS class name for the placeholder element                               |
| `alt`                  | string  | `''`       | Alternative text for the image                                           |
| `thumb`                | boolean | `false`    | Whether to use the thumbnail version of the image                        |
| `lazy`                 | boolean | `false`    | Whether to enable lazy loading for the image                             |

## Usage Tips

- Use the `thumb` prop for smaller images or in list views to improve initial load times.
- Enable `lazy` loading for images that are not immediately visible on page load.
- Provide meaningful `alt` text for all images to improve accessibility.

## Contributing

We welcome contributions to Progressify React! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/wilkbob/progressify-react/issues).
