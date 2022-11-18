interface Props {
  toto: string;
}

const Home = ({ toto }: Props) => {
  return <div>{toto}</div>;
};

export const getServerSideProps = () => {
  console.log({ test: "log ssr" });
  return { props: { toto: "toto" } };
};

export default Home;
