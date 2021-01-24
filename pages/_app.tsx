import { AppProps } from "next/app";
import "../styles/globals.css";
import "antd/dist/antd.css";

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default App;
