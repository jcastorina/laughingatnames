import styled from "styled-components";
import UploadButton from "./components/UploadButton";

const Layout = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: blue;

  nav {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

const App = () => {
  return (
    <Layout>
      <nav>
        <UploadButton />
      </nav>
    </Layout>
  );
};

export default App;
