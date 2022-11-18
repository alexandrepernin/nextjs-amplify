interface Props {
  toto: string;
}

const Home = ({ toto }: Props) => {
  return <div>{toto}</div>;
};

export const getServerSideProps = () => {
  const os = require("os");

  console.log({ test: "log ssr" });
  const info = {
    arch: os.arch(),
    cpus: os.cpus(),
    endianness: os.endianness(),
    freemem: os.freemem(),
    homedir: os.homedir(),
    hostname: os.hostname(),
    loadavg: os.loadavg(),
    networkInterfaces: os.networkInterfaces(),
    platform: os.platform(),
    release: os.release(),
    type: os.type(),
    uptime: os.uptime(),
    userInfo: os.userInfo(),
    version: os.version(),
  };
  console.log("system info", info);
  return { props: { toto: "toto" } };
};

export default Home;
