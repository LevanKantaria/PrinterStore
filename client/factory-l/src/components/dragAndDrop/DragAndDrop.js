import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import classes from "./DragAndDrop.module.css";

function DragAndDrop(props) {
  const [dragIsValid, setDragIsValid] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ multiple: true });
  const [imageNames, setImageNames] = useState([]);

  const uploadHandler = (event) => {
    event.preventDefault();
  };

  let files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  useEffect(() => {
    const storedImageNames = localStorage.getItem("image-names");
    if (storedImageNames) {
      setImageNames(JSON.parse(storedImageNames));
    }
  }, []);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const newImageNames = acceptedFiles.map(file => file.name);
      setImageNames(newImageNames);
      setDragIsValid(true);

      const readFiles = acceptedFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.onerror = (error) => {
            reject(error);
          };
        });
      });

      Promise.all(readFiles)
        .then(images => {
          console.log("Read images:", images); // Debugging: Log the read images
          props.onChange(images, acceptedFiles.length > 0);
        })
        .catch(error => {
          console.log("Error reading files: ", error);
        });
    } else {
      setDragIsValid(false);
    }
  }, [acceptedFiles]);

  useEffect(() => {
    localStorage.setItem("image-names", JSON.stringify(imageNames));
  }, [imageNames]);

  let dragAndDropClass = classes.dragDrop;
  // if (dragIsValid && dragIsTouched) {
  //   dragAndDropClass = classes.dragDrop;
  // } else if(!dragIsValid && dragIsTouched) {
  //   dragAndDropClass = classes.dragDropInvalid;
  // }

  return (
    <section>
      <div
        {...getRootProps({ className: "dropzone" })}
        className={dragAndDropClass}
      >
        <input {...getInputProps()} />
        <div className={classes.dragText}>
          {props.text}
        </div>
        <div className={classes.buttonAndText}>
          <button className={classes.dragButton} onClick={uploadHandler}>
            Select
          </button>
          {imageNames.join(", ")}
        </div>
      </div>
      <ul>{files}</ul>
    </section>
  );
}

export default DragAndDrop;
