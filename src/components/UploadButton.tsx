import { ChangeEvent, useState, useEffect } from "react";
import {
  Role,
  useDisclosureState,
  useDisclosureContent,
  useDisclosure,
} from "reakit";

const API_URL = process?.env.API_URL || "http://127.0.0.1:3001";

function UploadButton() {
  const state = useDisclosureState({ visible: true });
  const contentProps = useDisclosureContent(state);
  const disclosureProps = useDisclosure(state);
  const [imageFile, setImageFile] = useState<FormData>();
  const [imageSources, setImageSources] = useState<Array<string>>([]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("input");
    e.preventDefault();
    if (e.target.files) {
      const file = e.target.files[0];
      const data = new FormData();
      data.append("file", file);
      setImageFile(data);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    fetch(`${API_URL}/upload`, {
      method: "post",
      body: imageFile,
    })
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetch(`${API_URL}/files`, { method: "get" })
      .then((res) => res.json())
      .then((json) => setImageSources(json));
  }, []);

  return (
    <>
      <Role as="button" {...disclosureProps}>
        Upload
      </Role>
      <Role {...contentProps}>
        <input type="file" name="file" onChange={handleInput} />
        <button onClick={handleSubmit} disabled={!imageFile}>
          Gimme da pz
        </button>
      </Role>
      {imageSources.length > 0 &&
        imageSources.map((v) => {
          return <img key={v} src={`${API_URL}/public/` + v}></img>;
        })}
    </>
  );
}

export default UploadButton;
