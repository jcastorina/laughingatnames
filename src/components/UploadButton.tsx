import { ChangeEvent, useState, useEffect } from "react";
import {
  Role,
  useDisclosureState,
  useDisclosureContent,
  useDisclosure,
} from "reakit";

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
    fetch("http://127.0.0.1:3001/upload", {
      method: "post",
      body: imageFile,
    })
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    // if (imageSources.length) {
    //   fetch("http://127.0.0.1:3001/public/");
    // }
  }, [imageSources.length]);

  useEffect(() => {
    fetch("http://127.0.0.1:3001/files", { method: "get" })
      .then((res) => res.json())
      .then((json) => setImageSources(json));
  }, []);

  useEffect(() => {
    console.log(imageFile, "this happened");
  }, [imageFile]);

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
      {imageSources.length &&
        imageSources.map((v) => {
          return <img key={v} src={"http://127.0.0.1:3001/public/" + v}></img>;
        })}
    </>
  );
}

export default UploadButton;
