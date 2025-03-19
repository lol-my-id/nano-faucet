import { Layout } from "../components/Layout";

export default function HomePage() {
  return (
    <Layout />
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};