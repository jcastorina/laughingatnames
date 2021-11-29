import styled from "styled-components";
import UploadButton from "./components/UploadButton";
import WebRTCButton from "./components/WebRTCButton";

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
`;

const LeftPane = styled.div`
  width: 50vw;
  border: 1px solid green;
  height: 100vh;
`;

const RightPane = styled.div`
  width: 50vw;
  max-width: 50vw;
  height: 100vh;
  max-height: 100vh;
  border: 1px solid black;
  overflow: scroll;
`;

const App = () => {
  return (
    <Layout>
      <LeftPane>
        <WebRTCButton />
      </LeftPane>
      <RightPane>
        <UploadButton />
      </RightPane>
    </Layout>
  );
};

export default App;
