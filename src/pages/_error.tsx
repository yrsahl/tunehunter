import type { NextPage } from "next";
import type { ErrorProps } from "next/error";
import NextErrorComponent from "next/error";

const CustomErrorComponent: NextPage<ErrorProps> = ({ statusCode }) => {
  return <NextErrorComponent statusCode={statusCode} />;
};

CustomErrorComponent.getInitialProps = async (context) => {
  return NextErrorComponent.getInitialProps(context);
};

export default CustomErrorComponent;
